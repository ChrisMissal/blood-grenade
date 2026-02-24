import { promises as fs } from "node:fs";
import path from "node:path";
import type { ExternalHostDependency } from "../../domain/inspect/models.js";

const CONFIG_FILE_PATTERNS = [
  /^\.env(\..+)?$/i,
  /\.(json|yaml|yml|toml|ini|conf|properties)$/i,
];

const SOURCE_FILE_PATTERNS = [
  /\.(js|mjs|cjs|ts|tsx|py|java|go|cs|rb|php|sh|sql)$/i,
];

const SKIP_DIRECTORIES = new Set(["node_modules", ".git", "dist", "build", ".next", "coverage"]);
const MAX_SCAN_FILES = 300;
const MAX_FILE_SIZE_BYTES = 512 * 1024;

const THIRD_PARTY_HOSTS: Record<string, string> = {
  "api.stripe.com": "Stripe",
  "sentry.io": "Sentry",
  "ingest.sentry.io": "Sentry",
  "api.segment.io": "Segment",
  "api.mixpanel.com": "Mixpanel",
  "app.posthog.com": "PostHog",
  "api.auth0.com": "Auth0",
  "api.twilio.com": "Twilio",
  "api.sendgrid.com": "SendGrid",
  "hooks.slack.com": "Slack",
  "api.contentful.com": "Contentful",
  "cdn.contentful.com": "Contentful",
  "graphql.contentful.com": "Contentful",
  "api.prismic.io": "Prismic",
  "api.storyblok.com": "Storyblok",
  "api.hygraph.com": "Hygraph",
  "graphql.hygraph.com": "Hygraph",
  "arcxp.com": "Arc XP",
  "townnews.com": "BLOX CMS",
  "bloxcms.com": "BLOX CMS",
};

const THIRD_PARTY_SUFFIXES: Array<[string, string]> = [
  [".stripe.com", "Stripe"],
  [".sentry.io", "Sentry"],
  [".segment.io", "Segment"],
  [".mixpanel.com", "Mixpanel"],
  [".posthog.com", "PostHog"],
  [".auth0.com", "Auth0"],
  [".twilio.com", "Twilio"],
  [".sendgrid.com", "SendGrid"],
  [".slack.com", "Slack"],
  [".contentful.com", "Contentful"],
  [".prismic.io", "Prismic"],
  [".storyblok.com", "Storyblok"],
  [".hygraph.com", "Hygraph"],
  [".arcxp.com", "Arc XP"],
  [".townnews.com", "BLOX CMS"],
  [".bloxcms.com", "BLOX CMS"],
];

const FIRST_PARTY_HOST_SUFFIXES = [
  ".local",
  ".internal",
  ".cluster.local",
];

const URL_PATTERN = /\bhttps?:\/\/[^\s"'`<>)\]}]+/gi;
const HOST_ASSIGNMENT_PATTERN = /\b(?:host|hostname|endpoint|baseurl|base_url|url|dsn|connection|jdbc)[:=]\s*["']?([a-z0-9.-]+\.[a-z]{2,})(?::\d+)?(?:\/[^\s"'`]*)?/gi;

export async function sniffExternalHosts(rootPath: string): Promise<ExternalHostDependency[]> {
  const files = await collectCandidateFiles(rootPath);
  const findings = new Map<string, ExternalHostDependency>();

  for (const file of files) {
    let raw = "";
    try {
      const stat = await fs.stat(file.absolutePath);
      if (!stat.isFile() || stat.size > MAX_FILE_SIZE_BYTES) {
        continue;
      }
      raw = await fs.readFile(file.absolutePath, "utf8");
    } catch {
      continue;
    }

    const urlMatches = raw.match(URL_PATTERN) ?? [];
    for (const url of urlMatches) {
      const host = extractHost(url);
      if (!host || shouldSkipHost(host)) {
        continue;
      }
      const resolved = resolveClassification(host);
      findings.set(`${host}::${file.relativePath}`, {
        host,
        url,
        sourceFile: file.relativePath,
        sourceType: file.sourceType,
        classification: resolved.classification,
        productHint: resolved.productHint,
      });
    }

    let hostMatch: RegExpExecArray | null;
    HOST_ASSIGNMENT_PATTERN.lastIndex = 0;
    while ((hostMatch = HOST_ASSIGNMENT_PATTERN.exec(raw)) !== null) {
      const rawHost = hostMatch[1]?.trim().toLowerCase();
      if (!rawHost || shouldSkipHost(rawHost)) {
        continue;
      }
      const resolved = resolveClassification(rawHost);
      findings.set(`${rawHost}::${file.relativePath}`, {
        host: rawHost,
        sourceFile: file.relativePath,
        sourceType: file.sourceType,
        classification: resolved.classification,
        productHint: resolved.productHint,
      });
    }
  }

  return Array.from(findings.values()).sort((a, b) => a.host.localeCompare(b.host));
}

async function collectCandidateFiles(rootPath: string): Promise<Array<{ absolutePath: string; relativePath: string; sourceType: "config" | "source" }>> {
  const queue = [rootPath];
  const collected: Array<{ absolutePath: string; relativePath: string; sourceType: "config" | "source" }> = [];

  while (queue.length > 0 && collected.length < MAX_SCAN_FILES) {
    const current = queue.shift();
    if (!current) {
      break;
    }

    let entries;
    try {
      entries = await fs.readdir(current, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const absolutePath = path.join(current, entry.name);
      const relativePath = path.relative(rootPath, absolutePath) || entry.name;
      if (entry.isDirectory()) {
        if (!SKIP_DIRECTORIES.has(entry.name)) {
          queue.push(absolutePath);
        }
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      const isConfig = CONFIG_FILE_PATTERNS.some(pattern => pattern.test(entry.name));
      const isSource = SOURCE_FILE_PATTERNS.some(pattern => pattern.test(entry.name));
      if (!isConfig && !isSource) {
        continue;
      }

      collected.push({
        absolutePath,
        relativePath,
        sourceType: isConfig ? "config" : "source",
      });

      if (collected.length >= MAX_SCAN_FILES) {
        break;
      }
    }
  }

  return collected;
}

function extractHost(url: string): string | undefined {
  try {
    const parsed = new URL(url);
    return parsed.hostname.toLowerCase();
  } catch {
    return undefined;
  }
}

function shouldSkipHost(host: string): boolean {
  if (host === "localhost" || host === "127.0.0.1" || host === "0.0.0.0") {
    return true;
  }
  return false;
}

function resolveClassification(host: string): { classification: ExternalHostDependency["classification"]; productHint?: string } {
  const exactThirdParty = THIRD_PARTY_HOSTS[host];
  if (exactThirdParty) {
    return { classification: "third-party", productHint: exactThirdParty };
  }

  for (const [suffix, product] of THIRD_PARTY_SUFFIXES) {
    if (host.endsWith(suffix)) {
      return { classification: "third-party", productHint: product };
    }
  }

  if (FIRST_PARTY_HOST_SUFFIXES.some(suffix => host.endsWith(suffix))) {
    return { classification: "first-party" };
  }

  return { classification: "unknown" };
}
