import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { JobDescriptionSourceType } from '../constants/interview-prep.constants';
import { ResolvedJobDescription } from '../domain/jd-resolver.types';

const URL_PATTERN = /^https?:\/\//i;

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
      const response = await fetch(apiUrl);
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
      const response = await fetch(apiUrl);
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
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'ResumateBot/1.0 (+https://resumate.app)',
        Accept: 'text/html,application/xhtml+xml',
      },
    });
    if (!response.ok) {
      this.logger.warn(`JD fetch failed ${response.status} for ${url}`);
      throw new BadRequestException('Could not fetch job posting URL');
    }
    return response.text();
  }

  private extractMainText($: Awaited<ReturnType<JdUrlResolverService['loadHtml']>>): string {
    $('script, style, nav, footer, header').remove();
    return $('body').text().replace(/\s+/g, ' ').trim().slice(0, 12000);
  }

  private stripHtmlTags(html: string): string {
    return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  }

  private async loadHtml(html: string) {
    const { load } = await import('cheerio');
    return load(html);
  }
}
