import { BadRequestException, Logger } from '@nestjs/common';
import { lookup } from 'dns/promises';
import { BlockList, isIP } from 'net';

const logger = new Logger('SafeOutboundUrl');

const BLOCKED_HOST_NAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.goog',
]);

const BLOCKED_HOST_SUFFIXES = ['.localhost', '.local', '.internal'];

const privateAddresses = new BlockList();
privateAddresses.addSubnet('0.0.0.0', 8, 'ipv4');
privateAddresses.addSubnet('10.0.0.0', 8, 'ipv4');
privateAddresses.addSubnet('100.64.0.0', 10, 'ipv4');
privateAddresses.addSubnet('127.0.0.0', 8, 'ipv4');
privateAddresses.addSubnet('169.254.0.0', 16, 'ipv4');
privateAddresses.addSubnet('172.16.0.0', 12, 'ipv4');
privateAddresses.addSubnet('192.0.0.0', 24, 'ipv4');
privateAddresses.addSubnet('192.0.2.0', 24, 'ipv4');
privateAddresses.addSubnet('192.168.0.0', 16, 'ipv4');
privateAddresses.addSubnet('198.18.0.0', 15, 'ipv4');
privateAddresses.addSubnet('198.51.100.0', 24, 'ipv4');
privateAddresses.addSubnet('203.0.113.0', 24, 'ipv4');
privateAddresses.addSubnet('224.0.0.0', 4, 'ipv4');
privateAddresses.addSubnet('240.0.0.0', 4, 'ipv4');
privateAddresses.addAddress('::', 'ipv6');
privateAddresses.addAddress('::1', 'ipv6');
privateAddresses.addSubnet('fc00::', 7, 'ipv6');
privateAddresses.addSubnet('fe80::', 10, 'ipv6');
privateAddresses.addSubnet('ff00::', 8, 'ipv6');

const REJECTION = 'Job posting URL is not allowed';

/**
 * Allow only public http(s) URLs. Rejects loopback, link-local (cloud metadata),
 * private, and uniquely local addresses, including names that resolve to them.
 */
export async function assertPublicHttpUrl(input: string): Promise<URL> {
  let parsed: URL;
  try {
    parsed = new URL(input);
  } catch {
    throw new BadRequestException('Invalid job posting URL');
  }

  if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
    throw reject(parsed.hostname);
  }
  if (parsed.username || parsed.password) {
    throw reject(parsed.hostname);
  }
  if (parsed.port && parsed.port !== '80' && parsed.port !== '443') {
    throw reject(parsed.hostname);
  }

  const hostname = parsed.hostname.replace(/^\[|\]$/g, '').replace(/\.$/, '');
  if (!hostname) {
    throw reject(parsed.hostname);
  }

  const normalizedName = hostname.toLowerCase();
  if (
    BLOCKED_HOST_NAMES.has(normalizedName) ||
    BLOCKED_HOST_SUFFIXES.some((suffix) => normalizedName.endsWith(suffix))
  ) {
    throw reject(hostname);
  }

  if (isIP(hostname)) {
    if (isDisallowedAddress(hostname)) {
      throw reject(hostname);
    }
    return parsed;
  }

  let records: { address: string }[];
  try {
    records = await lookup(hostname, { all: true, verbatim: true });
  } catch {
    throw reject(hostname);
  }

  if (
    records.length === 0 ||
    records.some((record) => isDisallowedAddress(record.address))
  ) {
    throw reject(hostname);
  }

  return parsed;
}

function isDisallowedAddress(address: string): boolean {
  const ip = address.replace(/^\[|\]$/g, '').toLowerCase();
  const family = isIP(ip);
  if (family === 0) {
    return true;
  }
  return privateAddresses.check(ip, family === 6 ? 'ipv6' : 'ipv4');
}

function reject(hostname: string): BadRequestException {
  logger.warn(`Blocked outbound job URL host=${hostname || '(empty)'}`);
  return new BadRequestException(REJECTION);
}
