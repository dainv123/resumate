import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { load } from 'cheerio';
import { Agent } from 'undici';
import { JobDescriptionSourceType } from '../constants/interview-prep.constants';
import { ResolvedJobDescription } from '../domain/jd-resolver.types';

const URL_PATTERN = /^https?:\/\//i;
const MAX_REDIRECTS = 3;

interface ResolvedAddress {
  address: string;
  family: 4 | 6;
}
const BLOCKED_HOST_SUFFIXES = [
  '.localhost',
  '.local',
  '.internal',
  '.localdomain',
];

@Injectable()
export class JdUrlResolverService {
  private readonly logger = new Logger(JdUrlResolverService.name);

  isUrl(input: string): boolean {
    return URL_PATTERN.test(input.trim());
  }

  async resolve(inputUrl: string): Promise<ResolvedJobDescription> {
    const sourceUrl = inputUrl.trim();
    let parsed: URL;
    try {
      parsed = new URL(sourceUrl);
    } catch {
      throw new BadRequestException('Invalid job posting URL');
    }

    await this.assertSafeUrl(parsed);

    const sourceType = this.detectSourceType(parsed);
    const resolved = await this.resolveBySource(sourceUrl, parsed, sourceType);
    if (!resolved.description.trim()) {
      throw new BadRequestException('Could not extract job description from URL');
    }
    return resolved;
  }

  detectSourceType(url: URL): JobDescriptionSourceType {
    const host = url.hostname.toLowerCase();
    if (host.includes('greenhouse.io')) return JobDescriptionSourceType.GREENHOUSE;
    if (host.includes('lever.co')) return JobDescriptionSourceType.LEVER;
    if (host.includes('itviec.com')) return JobDescriptionSourceType.ITVIEC;
    if (host.includes('topcv.vn')) return JobDescriptionSourceType.TOPCV;
    if (host.includes('linkedin.com')) return JobDescriptionSourceType.LINKEDIN;
    if (host.includes('indeed.com')) return JobDescriptionSourceType.INDEED;
    return JobDescriptionSourceType.OTHER;
  }

  private async resolveBySource(
    sourceUrl: string,
    url: URL,
    sourceType: JobDescriptionSourceType,
  ): Promise<ResolvedJobDescription> {
    switch (sourceType) {
      case JobDescriptionSourceType.GREENHOUSE:
        return this.resolveGreenhouse(sourceUrl, url);
      case JobDescriptionSourceType.LEVER:
        return this.resolveLever(sourceUrl, url);
      case JobDescriptionSourceType.ITVIEC:
        return this.resolveItviec(sourceUrl);
      default:
        return this.resolveGenericHtml(sourceUrl, sourceType);
    }
  }

  private async resolveGreenhouse(
    sourceUrl: string,
    url: URL,
  ): Promise<ResolvedJobDescription> {
    const match = url.pathname.match(/\/([^/]+)\/jobs\/(\d+)/);
    if (match) {
      const [, board, jobId] = match;
      const apiUrl = `https://boards-api.greenhouse.io/v1/boards/${board}/jobs/${jobId}`;
      const response = await this.fetchPublic(apiUrl);
      if (response.ok) {
        const data = (await response.json()) as {
          title?: string;
          content?: string;
          company_name?: string;
          location?: { name?: string };
        };
        return {
          sourceUrl,
          sourceType: JobDescriptionSourceType.GREENHOUSE,
          title: data.title ?? 'Job posting',
          company: data.company_name,
          location: data.location?.name,
          description: this.stripHtmlTags(data.content ?? ''),
        };
      }
    }
    return this.resolveGenericHtml(sourceUrl, JobDescriptionSourceType.GREENHOUSE);
  }

  private async resolveLever(
    sourceUrl: string,
    url: URL,
  ): Promise<ResolvedJobDescription> {
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      const company = parts[0];
      const postingId = parts[1];
      const apiUrl = `https://api.lever.co/v0/postings/${company}/${postingId}`;
      const response = await this.fetchPublic(apiUrl);
      if (response.ok) {
        const data = (await response.json()) as {
          text?: string;
          title?: string;
          categories?: { location?: string; team?: string };
          descriptionPlain?: string;
        };
        return {
          sourceUrl,
          sourceType: JobDescriptionSourceType.LEVER,
          title: data.text ?? data.title ?? 'Job posting',
          company,
          location: data.categories?.location,
          description:
            data.descriptionPlain ?? this.stripHtmlTags(data.text ?? ''),
        };
      }
    }
    return this.resolveGenericHtml(sourceUrl, JobDescriptionSourceType.LEVER);
  }

  private async resolveItviec(sourceUrl: string): Promise<ResolvedJobDescription> {
    const html = await this.fetchHtml(sourceUrl);
    const $ = await this.loadHtml(html);
    const title =
      $('h1').first().text().trim() ||
      $('meta[property="og:title"]').attr('content')?.trim() ||
      'Job posting';
    const company =
      $('.employer-name').first().text().trim() ||
      $('[data-employer-name]').first().text().trim() ||
      undefined;
    const description =
      $('.job-description').text().trim() ||
      $('.content-post').text().trim() ||
      $('article').text().trim() ||
      this.extractMainText($);
    return {
      sourceUrl,
      sourceType: JobDescriptionSourceType.ITVIEC,
      title,
      company,
      description,
    };
  }

  private async resolveGenericHtml(
    sourceUrl: string,
    sourceType: JobDescriptionSourceType,
  ): Promise<ResolvedJobDescription> {
    const html = await this.fetchHtml(sourceUrl);
    const $ = await this.loadHtml(html);
    const title =
      $('meta[property="og:title"]').attr('content')?.trim() ||
      $('h1').first().text().trim() ||
      'Job posting';
    const company =
      $('meta[property="og:site_name"]').attr('content')?.trim() || undefined;
    const description =
      $('meta[property="og:description"]').attr('content')?.trim() ||
      $('[class*="job-description"], [class*="description"], article, main')
        .first()
        .text()
        .trim() ||
      this.extractMainText($);
    return {
      sourceUrl,
      sourceType,
      title,
      company,
      description,
    };
  }

  private async fetchHtml(url: string): Promise<string> {
    const response = await this.fetchPublic(url);
    if (!response.ok) {
      this.logger.warn(`JD fetch failed ${response.status} for ${url}`);
      throw new BadRequestException('Could not fetch job posting URL');
    }
    return response.text();
  }

  /**
   * Follow redirects one hop at a time so a public job URL cannot bounce
   * the server onto link-local metadata or another private host.
   */
  private async fetchPublic(url: string, hops = 0): Promise<Response> {
    if (hops > MAX_REDIRECTS) {
      throw new BadRequestException('Could not fetch job posting URL');
    }

    let parsed: URL;
    try {
      parsed = new URL(url);
    } catch {
      throw new BadRequestException('Invalid job posting URL');
    }

    const addresses = await this.assertSafeUrl(parsed);
    const dispatcher = new Agent({
      connect: {
        lookup: (_hostname, options, callback) => {
          if (options.all) {
            callback(null, addresses);
            return;
          }
          const first = addresses[0];
          callback(null, first.address, first.family);
        },
      },
    });

    try {
      const response = await fetch(parsed.toString(), {
        redirect: 'manual',
        headers: {
          'User-Agent': 'ResumateBot/1.0 (+https://resumate.app)',
          Accept: 'text/html,application/xhtml+xml,application/json',
        },
        dispatcher,
      } as RequestInit & { dispatcher: Agent });

      if (response.status >= 300 && response.status < 400) {
        const location = response.headers.get('location');
        if (!location) {
          throw new BadRequestException('Could not fetch job posting URL');
        }
        return this.fetchPublic(new URL(location, parsed).toString(), hops + 1);
      }

      return response;
    } finally {
      await dispatcher.close();
    }
  }

  private async assertSafeUrl(url: URL): Promise<ResolvedAddress[]> {
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new BadRequestException(
        'Only http and https job posting URLs are allowed',
      );
    }
    if (url.username || url.password) {
      throw new BadRequestException('Job posting URL is not allowed');
    }

    const hostname = url.hostname
      .replace(/^\[|\]$/g, '')
      .replace(/\.$/, '')
      .toLowerCase();
    if (this.isBlockedHostname(hostname)) {
      throw new BadRequestException('Job posting URL is not allowed');
    }

    if (isIP(hostname)) {
      if (this.isPrivateAddress(hostname)) {
        throw new BadRequestException('Job posting URL is not allowed');
      }
      return [
        {
          address: hostname,
          family: isIP(hostname) === 6 ? 6 : 4,
        },
      ];
    }

    let addresses: ResolvedAddress[];
    try {
      const records = await lookup(hostname, { all: true, verbatim: true });
      addresses = records.map((entry) => ({
        address: entry.address,
        family: entry.family === 6 ? 6 : 4,
      }));
    } catch {
      throw new BadRequestException('Could not fetch job posting URL');
    }

    if (
      addresses.length === 0 ||
      addresses.some((entry) => this.isPrivateAddress(entry.address))
    ) {
      throw new BadRequestException('Job posting URL is not allowed');
    }

    return addresses;
  }

  private isBlockedHostname(hostname: string): boolean {
    if (
      hostname === 'localhost' ||
      hostname === 'metadata' ||
      hostname === 'metadata.google.internal'
    ) {
      return true;
    }
    if (BLOCKED_HOST_SUFFIXES.some((suffix) => hostname.endsWith(suffix))) {
      return true;
    }
    if (/^\d+$/.test(hostname) || /^0x[0-9a-f]+$/i.test(hostname)) {
      return true;
    }
    if (
      hostname.includes('.') &&
      hostname.split('.').every((part) => /^\d+$/.test(part))
    ) {
      return (
        this.ipv4ToInt(hostname) === null || this.isPrivateIPv4(hostname)
      );
    }
    return false;
  }

  private isPrivateAddress(address: string): boolean {
    const ip = address.toLowerCase().replace(/^\[|\]$/g, '');
    if (ip.startsWith('::ffff:')) {
      const mapped = ip.slice('::ffff:'.length);
      if (isIP(mapped) === 4) return this.isPrivateIPv4(mapped);
    }

    const version = isIP(ip);
    if (version === 4) return this.isPrivateIPv4(ip);
    if (version === 6) return this.isPrivateIPv6(ip);
    return true;
  }

  private isPrivateIPv4(ip: string): boolean {
    const value = this.ipv4ToInt(ip);
    if (value === null) return true;
    const inRange = (base: number, mask: number) =>
      (value & mask) === (base & mask);
    return (
      inRange(0x00000000, 0xff000000) ||
      inRange(0x0a000000, 0xff000000) ||
      inRange(0x7f000000, 0xff000000) ||
      inRange(0xa9fe0000, 0xffff0000) ||
      inRange(0xac100000, 0xfff00000) ||
      inRange(0xc0a80000, 0xffff0000) ||
      inRange(0x64400000, 0xffc00000) ||
      inRange(0xe0000000, 0xf0000000) ||
      inRange(0xf0000000, 0xf0000000)
    );
  }

  private isPrivateIPv6(ip: string): boolean {
    const normalized = ip.toLowerCase();
    if (normalized === '::1' || normalized === '::') return true;

    const dotted = normalized.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
    if (dotted) return this.isPrivateIPv4(dotted[1]);

    const hexMapped = normalized.match(
      /^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/,
    );
    if (hexMapped) {
      const hi = Number.parseInt(hexMapped[1], 16);
      const lo = Number.parseInt(hexMapped[2], 16);
      return this.isPrivateIPv4(
        `${hi >> 8}.${hi & 0xff}.${lo >> 8}.${lo & 0xff}`,
      );
    }

    const first = normalized.split(':').find((part) => part.length > 0) ?? '0';
    const head = Number.parseInt(first, 16);
    if (!Number.isFinite(head)) return true;
    if ((head & 0xfe00) === 0xfc00) return true;
    if ((head & 0xffc0) === 0xfe80) return true;
    if ((head & 0xffc0) === 0xfec0) return true;
    if ((head & 0xff00) === 0xff00) return true;
    return false;
  }

  private ipv4ToInt(ip: string): number | null {
    const parts = ip.split('.');
    if (parts.length !== 4) return null;
    let value = 0;
    for (const part of parts) {
      if (!/^\d+$/.test(part) || (part.length > 1 && part.startsWith('0'))) {
        return null;
      }
      const n = Number(part);
      if (!Number.isInteger(n) || n > 255) return null;
      value = (value * 256 + n) >>> 0;
    }
    return value;
  }

  private extractMainText($: Awaited<ReturnType<JdUrlResolverService['loadHtml']>>): string {
    $('script, style, nav, footer, header').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 12000);
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private loadHtml(html: string) {
    return load(html);
  }
}
