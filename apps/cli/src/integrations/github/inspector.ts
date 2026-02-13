import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import type { DetectedApplication, InspectionResult, InspectionTarget } from "../../domain/inspect/models.js";

interface GithubOwnerResponse {
  login: string;
  type: "User" | "Organization";
}

interface GithubRepoResponse {
  name: string;
  html_url: string;
  language: string | null;
  pushed_at: string;
  archived: boolean;
  default_branch: string;
  visibility?: string;
  stargazers_count?: number;
}

interface GithubInspectionFixture {
  owner: GithubOwnerResponse;
  repositories: GithubRepoResponse[];
}

const LANGUAGE_MAPPINGS: Record<string, { type: string; runtime: string; buildSystem: string; confidence: number }> = {
  TypeScript: { type: "node-app", runtime: "nodejs", buildSystem: "npm", confidence: 0.88 },
  JavaScript: { type: "node-app", runtime: "nodejs", buildSystem: "npm", confidence: 0.85 },
  Python: { type: "python-app", runtime: "python", buildSystem: "pip/poetry", confidence: 0.82 },
  Java: { type: "java-app", runtime: "jvm", buildSystem: "maven/gradle", confidence: 0.8 },
  Go: { type: "go-app", runtime: "go", buildSystem: "go", confidence: 0.8 },
  Rust: { type: "rust-app", runtime: "rust", buildSystem: "cargo", confidence: 0.8 },
  HCL: { type: "terraform-stack", runtime: "terraform", buildSystem: "terraform", confidence: 0.78 },
  Dockerfile: { type: "container-image", runtime: "containers", buildSystem: "docker", confidence: 0.75 },
};

export class GithubInspectorIntegration implements InspectorIntegration {
  name = "github";

  async inspect(target: InspectionTarget): Promise<InspectionResult> {
    const owner = this.normalizeOwner(target.sourcePath);
    const result: InspectionResult = {
      integrationName: this.name,
      target,
      inspectedAt: new Date().toISOString(),
      repositoryRoot: `https://github.com/${owner}`,
      detectedApplications: [],
      warnings: ["GitHub inspection uses repository metadata heuristics and may not reflect full build/runtime requirements."],
      errors: [],
    };

    try {
      const fixture = this.loadFixture();
      const ownerResponse = fixture?.owner ?? (await this.fetchOwner(owner, result));
      const repositories = fixture?.repositories ?? (await this.fetchRepositories(ownerResponse, result));
      result.detectedApplications = repositories.map(repo => this.mapRepositoryToDetectedApplication(target, repo));
      if (repositories.length === 0) {
        result.warnings.push(`No repositories found for ${ownerResponse.login}.`);
      }
    } catch (error) {
      result.errors.push({
        targetPath: target.sourcePath,
        message: error instanceof Error ? error.message : String(error),
      });
    }

    return result;
  }

  private loadFixture(): GithubInspectionFixture | undefined {
    const raw = process.env.GITHUB_INSPECT_FIXTURE;
    if (!raw) {
      return undefined;
    }
    return JSON.parse(raw) as GithubInspectionFixture;
  }

  private normalizeOwner(rawSourcePath: string): string {
    const normalized = rawSourcePath.trim().replace(/\\/g, "/");
    const githubUrlMatch = normalized.match(/^https?:\/\/github\.com\/([^/]+)\/?/i);
    if (githubUrlMatch) {
      return githubUrlMatch[1];
    }

    const segments = normalized.split("/").filter(Boolean);
    return segments[segments.length - 1] ?? normalized;
  }

  private mapRepositoryToDetectedApplication(target: InspectionTarget, repo: GithubRepoResponse): DetectedApplication {
    const mapping = repo.language ? LANGUAGE_MAPPINGS[repo.language] : undefined;
    return {
      rootPath: repo.html_url,
      name: repo.name,
      descriptorFile: "github-repository",
      type: target.overrideType ?? mapping?.type ?? "unknown-repo",
      languageRuntimeGuess: mapping?.runtime ?? "unknown",
      buildSystemGuess: mapping?.buildSystem ?? "unknown",
      statusHint: repo.archived ? "halted" : "active",
      lastModifiedAt: repo.pushed_at,
      confidence: mapping?.confidence ?? 0.55,
      notes: [
        `Detected from primary language ${repo.language ?? "unknown"}`,
        `Default branch: ${repo.default_branch}`,
        `Visibility: ${repo.visibility ?? "unknown"}`,
        `Stars: ${repo.stargazers_count ?? 0}`,
      ],
    };
  }

  private async fetchOwner(owner: string, result: InspectionResult): Promise<GithubOwnerResponse> {
    const headers = this.createHeaders(result);
    return this.fetchJson<GithubOwnerResponse>(`/users/${owner}`, headers);
  }

  private async fetchRepositories(owner: GithubOwnerResponse, result: InspectionResult): Promise<GithubRepoResponse[]> {
    const headers = this.createHeaders(result);
    const collectionPath = owner.type === "Organization" ? `/orgs/${owner.login}/repos` : `/users/${owner.login}/repos`;
    return this.fetchPaginated<GithubRepoResponse>(collectionPath, headers);
  }

  private createHeaders(result: InspectionResult): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: "application/vnd.github+json",
      "User-Agent": "blood-grenade-inspector",
    };

    if (process.env.GITHUB_TOKEN) {
      headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
    } else {
      result.warnings.push("GITHUB_TOKEN is not set; API rate limits for anonymous requests may be lower.");
    }

    return headers;
  }

  private async fetchPaginated<T>(resourcePath: string, headers: Record<string, string>): Promise<T[]> {
    const collected: T[] = [];
    let page = 1;
    while (page <= 5) {
      const connector = resourcePath.includes("?") ? "&" : "?";
      const pagePath = `${resourcePath}${connector}per_page=100&page=${page}`;
      const response = await this.fetchRaw(pagePath, headers);
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`GitHub API request failed (${response.status}): ${errorText}`);
      }

      const payload = (await response.json()) as T[];
      if (payload.length === 0) {
        break;
      }

      collected.push(...payload);
      if (payload.length < 100) {
        break;
      }

      page += 1;
    }

    return collected;
  }

  private async fetchJson<T>(resourcePath: string, headers: Record<string, string>): Promise<T> {
    const response = await this.fetchRaw(resourcePath, headers);
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`GitHub API request failed (${response.status}): ${errorText}`);
    }
    return (await response.json()) as T;
  }

  private async fetchRaw(resourcePath: string, headers: Record<string, string>): Promise<Response> {
    const baseUrl = process.env.GITHUB_API_BASE_URL?.replace(/\/$/, "") ?? "https://api.github.com";
    return fetch(`${baseUrl}${resourcePath}`, { headers });
  }
}
