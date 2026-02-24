import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import { THIRD_PARTY_CATALOG } from "./third-party-catalog.js";
import { inferArbCategory } from "../shared/arb-categories.js";
import { inferC4ContainerStereotype } from "../shared/c4-container-stereotypes.js";
import type {
  ArchitecturalTaxonomyMapping,
  ComponentStereotypeMatrixEntry,
  DetectedApplication,
  InspectionResult,
  InspectionTarget,
  ThirdPartyIntegration,
} from "../../domain/inspect/models.js";

interface DetectionRule {
  pattern: RegExp;
  type: string;
  runtime: string;
  buildSystem: string;
  confidence: number;
}

interface FallbackWorkloadDetection {
  descriptorFile: string;
  type: "sql-job" | "data-job";
  runtime: string;
  buildSystem: string;
  confidence: number;
  notes: string[];
}

const TYPE_TO_ARCHITECTURE_STYLE: Record<string, string> = {
  "node-app": "modular-monolith",
  "dotnet-solution": "layered",
  "java-app": "layered",
  "go-app": "modular",
  "rust-app": "modular",
  "python-app": "modular",
  "ruby-app": "layered",
  "php-app": "layered",
  "container-compose": "distributed-system",
  "container-image": "distributed-system",
  "terraform-stack": "infrastructure-as-code",
  "sql-job": "data-pipeline",
  "data-job": "data-pipeline",
};

const DETECTION_RULES: DetectionRule[] = [
  { pattern: /^package\.json$/i, type: "node-app", runtime: "nodejs", buildSystem: "npm", confidence: 0.95 },
  { pattern: /^go\.mod$/i, type: "go-app", runtime: "go", buildSystem: "go", confidence: 0.9 },
  { pattern: /^Cargo\.toml$/i, type: "rust-app", runtime: "rust", buildSystem: "cargo", confidence: 0.9 },
  { pattern: /^Gemfile$/i, type: "ruby-app", runtime: "ruby", buildSystem: "bundler", confidence: 0.86 },
  { pattern: /^composer\.json$/i, type: "php-app", runtime: "php", buildSystem: "composer", confidence: 0.86 },
  { pattern: /\.sln$/i, type: "dotnet-solution", runtime: "dotnet", buildSystem: "msbuild", confidence: 0.9 },
  { pattern: /\.csproj$/i, type: "dotnet-solution", runtime: "dotnet", buildSystem: "msbuild", confidence: 0.88 },
  { pattern: /^pom\.xml$/i, type: "java-app", runtime: "jvm", buildSystem: "maven", confidence: 0.9 },
  { pattern: /^build\.gradle(\.kts)?$/i, type: "java-app", runtime: "jvm", buildSystem: "gradle", confidence: 0.88 },
  { pattern: /^pyproject\.toml$/i, type: "python-app", runtime: "python", buildSystem: "pip/poetry", confidence: 0.9 },
  { pattern: /^requirements\.txt$/i, type: "python-app", runtime: "python", buildSystem: "pip", confidence: 0.82 },
  { pattern: /^docker-compose\.ya?ml$/i, type: "container-compose", runtime: "containers", buildSystem: "docker-compose", confidence: 0.7 },
  { pattern: /^Dockerfile$/i, type: "container-image", runtime: "containers", buildSystem: "docker", confidence: 0.74 },
  { pattern: /\.tf$/i, type: "terraform-stack", runtime: "terraform", buildSystem: "terraform", confidence: 0.8 },
];

const THIRD_PARTY_METADATA_FILES = [
  "integration-metadata.json",
  "integration-metadata.yaml",
  "integration-metadata.yml",
  "third-party-integrations.json",
  "third-party-integrations.yaml",
  "third-party-integrations.yml",
] as const;

export class FilesystemInspectorIntegration implements InspectorIntegration {
  name = "filesystem";

  async inspect(target: InspectionTarget): Promise<InspectionResult> {
    const result: InspectionResult = {
      integrationName: this.name,
      target,
      inspectedAt: new Date().toISOString(),
      repositoryRoot: undefined,
      detectedApplications: [],
      warnings: [],
      errors: [],
    };

    const rootPath = path.resolve(target.sourcePath);
    result.repositoryRoot = await this.resolveRepositoryRoot(rootPath);

    const seenRoots = new Set<string>();
    await this.walk(rootPath, 0, target, result, seenRoots);
    return result;
  }

  private async walk(
    currentPath: string,
    depth: number,
    target: InspectionTarget,
    result: InspectionResult,
    seenRoots: Set<string>,
  ): Promise<void> {
    if (depth > target.maxDepth) {
      return;
    }

    let stat;
    try {
      stat = await fs.stat(currentPath);
    } catch (error) {
      result.errors.push({
        targetPath: currentPath,
        message: `Unable to stat path: ${String(error)}`,
      });
      return;
    }

    if (!stat.isDirectory()) {
      return;
    }

    let entries;
    try {
      entries = await fs.readdir(currentPath, { withFileTypes: true });
    } catch (error) {
      result.errors.push({
        targetPath: currentPath,
        message: `Unable to read directory: ${String(error)}`,
      });
      return;
    }

    const visibleEntries = entries.filter(entry => target.includeHidden || !entry.name.startsWith("."));

    if (target.detectApps) {
      const app = await this.detectApplication(currentPath, visibleEntries, target);
      if (app && !seenRoots.has(app.rootPath)) {
        result.detectedApplications.push(app);
        seenRoots.add(app.rootPath);
      }
    }

    await Promise.all(
      visibleEntries
        .filter(entry => entry.isDirectory())
        .map(entry => this.walk(path.join(currentPath, entry.name), depth + 1, target, result, seenRoots)),
    );
  }

  private async detectApplication(
    rootPath: string,
    entries: Array<{ name: string; isDirectory: () => boolean }>,
    target: InspectionTarget,
  ): Promise<DetectedApplication | undefined> {
    const matched = DETECTION_RULES.find(rule => entries.some(entry => rule.pattern.test(entry.name)));
    const fallback = !matched ? await this.detectFallbackWorkload(rootPath, entries) : undefined;
    if (!matched && !fallback) {
      return undefined;
    }

    const descriptor = matched ? entries.find(entry => matched.pattern.test(entry.name)) : undefined;
    if (matched && !descriptor) {
      return undefined;
    }

    const descriptorFile = descriptor?.name ?? fallback?.descriptorFile;
    if (!descriptorFile) {
      return undefined;
    }

    const descriptorPath = path.join(rootPath, descriptorFile);
    const appType = target.overrideType ?? matched?.type ?? fallback?.type ?? "unknown";
    const runtimeGuess = matched?.runtime ?? fallback?.runtime ?? "unknown";
    const buildSystemGuess = matched?.buildSystem ?? fallback?.buildSystem ?? "unknown";
    const confidence = matched?.confidence ?? fallback?.confidence ?? 0.5;

    let appName = path.basename(rootPath);
    let statusHint: "active" | "halted" | "unknown" = "unknown";
    let lastModifiedAt: string | undefined;

    try {
      const descriptorStat = await fs.stat(descriptorPath);
      lastModifiedAt = descriptorStat.mtime.toISOString();
      const ageInDays = (Date.now() - descriptorStat.mtime.getTime()) / (1000 * 60 * 60 * 24);
      if (ageInDays <= 90) {
        statusHint = "active";
      } else if (ageInDays > 365) {
        statusHint = "halted";
      }
    } catch {
      statusHint = "unknown";
    }

    if (descriptorFile === "package.json") {
      try {
        const pkgRaw = await fs.readFile(descriptorPath, "utf8");
        const pkg = JSON.parse(pkgRaw) as { name?: string };
        if (pkg.name) {
          appName = pkg.name;
        }
      } catch {
        // Ignore package.json parse issues and keep folder fallback.
      }
    }

    const thirdPartyIntegrations = await this.detectThirdPartyIntegrations(rootPath, descriptorPath, entries);

    const componentStereotypeMatrix = this.buildStereotypeMatrix(
      appName,
      descriptorFile,
      appType,
      confidence,
    );
    const arbCategory = inferArbCategory(
      appName,
      appType,
      componentStereotypeMatrix.map(entry => entry.stereotype),
    );

    return {
      rootPath,
      name: appName,
      descriptorFile,
      type: appType,
      languageRuntimeGuess: runtimeGuess,
      buildSystemGuess,
      statusHint,
      lastModifiedAt,
      confidence,
      notes: [
        `Detected via ${descriptorFile}`,
        ...(fallback?.notes ?? []),
        target.overrideType ? `Type overridden to ${target.overrideType}` : "Type inferred from heuristics",
      ],
      architecturalTaxonomy: this.buildTaxonomy(appType, descriptorFile, confidence),
      componentStereotypeMatrix,
      thirdPartyIntegrations,
      arbCategory,
    };
  }

  private async detectFallbackWorkload(
    rootPath: string,
    entries: Array<{ name: string; isDirectory: () => boolean }>,
  ): Promise<FallbackWorkloadDetection | undefined> {
    const files = entries.filter(entry => !entry.isDirectory());
    const entryNames = entries.map(entry => entry.name.toLowerCase());

    const sqlFile = files.find(entry => entry.name.toLowerCase().endsWith(".sql"));
    if (sqlFile) {
      return {
        descriptorFile: sqlFile.name,
        type: "sql-job",
        runtime: "sql",
        buildSystem: "sql-runner",
        confidence: 0.72,
        notes: ["No standard app descriptor found; inferred SQL workload from .sql source files."],
      };
    }

    const hasSqlInSource = await this.hasSqlInSourceCode(rootPath, files);
    if (hasSqlInSource) {
      return {
        descriptorFile: hasSqlInSource,
        type: "sql-job",
        runtime: "sql",
        buildSystem: "sql-runner",
        confidence: 0.68,
        notes: ["No standard app descriptor found; inferred SQL workload from SQL-like source content."],
      };
    }

    const hasDataSignal =
      entryNames.some(name => /(^|[-_])(etl|pipeline|ingest|transform|dataset|warehouse|analytics|dbt)($|[-_.])/.test(name))
      || files.some(entry => /\.(csv|tsv|parquet|avro|orc|jsonl)$/i.test(entry.name));

    if (!hasDataSignal) {
      return undefined;
    }

    const dataDescriptor = files.find(entry => /\.(csv|tsv|parquet|avro|orc|jsonl)$/i.test(entry.name))
      ?? entries.find(entry => /(^|[-_])(etl|pipeline|ingest|transform|dataset|warehouse|analytics|dbt)($|[-_.])/.test(entry.name.toLowerCase()));

    return {
      descriptorFile: dataDescriptor?.name ?? "source-heuristic",
      type: "data-job",
      runtime: "data-platform",
      buildSystem: "orchestrated-job",
      confidence: 0.6,
      notes: ["No standard app descriptor found; inferred data workload from file/directory naming signals."],
    };
  }

  private async hasSqlInSourceCode(
    rootPath: string,
    files: Array<{ name: string; isDirectory: () => boolean }>,
  ): Promise<string | undefined> {
    const sourceFiles = files
      .filter(entry => /\.(js|mjs|cjs|ts|tsx|py|java|cs|go|rb|php)$/i.test(entry.name))
      .slice(0, 10);

    for (const sourceFile of sourceFiles) {
      try {
        const sourcePath = path.join(rootPath, sourceFile.name);
        const raw = await fs.readFile(sourcePath, "utf8");
        const snippet = raw.slice(0, 12_000);
        if (/\b(select|insert|update|delete|create\s+table|drop\s+table|with)\b/i.test(snippet)) {
          return sourceFile.name;
        }
      } catch {
        // Ignore unreadable source files and continue.
      }
    }

    return undefined;
  }

  private async detectThirdPartyIntegrations(
    rootPath: string,
    descriptorPath: string,
    entries: Array<{ name: string; isDirectory: () => boolean }>,
  ): Promise<ThirdPartyIntegration[]> {
    const matches = new Map<string, ThirdPartyIntegration>();
    await this.collectFromDescriptor(descriptorPath, matches);
    await this.collectFromMetadataFiles(rootPath, entries, matches);
    return Array.from(matches.values()).sort((a, b) => a.productName.localeCompare(b.productName));
  }

  private async collectFromDescriptor(
    descriptorPath: string,
    matches: Map<string, ThirdPartyIntegration>,
  ): Promise<void> {
    if (path.basename(descriptorPath).toLowerCase() !== "package.json") {
      return;
    }

    try {
      const raw = await fs.readFile(descriptorPath, "utf8");
      const pkg = JSON.parse(raw) as {
        dependencies?: Record<string, string>;
        devDependencies?: Record<string, string>;
      };
      const dependencyNames = [
        ...Object.keys(pkg.dependencies ?? {}),
        ...Object.keys(pkg.devDependencies ?? {}),
      ];

      for (const dependencyName of dependencyNames) {
        this.addCatalogMatch(matches, dependencyName, {
          source: "descriptor-dependency",
          evidence: `Matched dependency '${dependencyName}' in package.json`,
        });
      }
    } catch {
      // Ignore malformed descriptors; inspection should continue.
    }
  }

  private async collectFromMetadataFiles(
    rootPath: string,
    entries: Array<{ name: string; isDirectory: () => boolean }>,
    matches: Map<string, ThirdPartyIntegration>,
  ): Promise<void> {
    const metadataFiles = entries
      .filter(entry => !entry.isDirectory() && THIRD_PARTY_METADATA_FILES.includes(entry.name as (typeof THIRD_PARTY_METADATA_FILES)[number]))
      .map(entry => entry.name);

    for (const metadataFile of metadataFiles) {
      const metadataPath = path.join(rootPath, metadataFile);
      try {
        const raw = await fs.readFile(metadataPath, "utf8");
        const parsed = metadataFile.endsWith(".json") ? JSON.parse(raw) : YAML.parse(raw);
        this.collectFromMetadataPayload(parsed, metadataFile, matches);
      } catch {
        // Ignore invalid metadata and continue scanning.
      }
    }
  }

  private collectFromMetadataPayload(
    payload: unknown,
    metadataFile: string,
    matches: Map<string, ThirdPartyIntegration>,
  ): void {
    if (Array.isArray(payload)) {
      for (const entry of payload) {
        this.collectFromMetadataPayload(entry, metadataFile, matches);
      }
      return;
    }

    if (typeof payload === "string") {
      this.addCatalogMatch(matches, payload, {
        source: "metadata-file",
        evidence: `Matched metadata token '${payload}' in ${metadataFile}`,
      });
      return;
    }

    if (!payload || typeof payload !== "object") {
      return;
    }

    const record = payload as Record<string, unknown>;
    const productCandidate = typeof record.product === "string" ? record.product.trim() : undefined;
    const categoryCandidate = typeof record.category === "string" ? record.category.trim() : undefined;

    if (productCandidate) {
      this.addCatalogMatch(matches, productCandidate, {
        source: "metadata-file",
        evidence: `Matched product '${productCandidate}' in ${metadataFile}`,
        categoryOverride: categoryCandidate,
      });
    }

    for (const [key, value] of Object.entries(record)) {
      if (key === "product" || key === "category") {
        continue;
      }
      this.collectFromMetadataPayload(value, metadataFile, matches);
    }
  }

  private addCatalogMatch(
    matches: Map<string, ThirdPartyIntegration>,
    rawToken: string,
    options: {
      source: ThirdPartyIntegration["source"];
      evidence: string;
      categoryOverride?: string;
    },
  ): void {
    const token = rawToken.trim();
    if (!token) {
      return;
    }

    const catalogEntry = THIRD_PARTY_CATALOG[token.toLowerCase()];
    const productName = catalogEntry?.productName ?? token;
    const category = options.categoryOverride || catalogEntry?.category || "uncategorized";
    const key = `${productName.toLowerCase()}::${category.toLowerCase()}`;
    if (matches.has(key)) {
      return;
    }

    matches.set(key, {
      productName,
      category,
      source: options.source,
      evidence: options.evidence,
    });
  }

  private buildTaxonomy(type: string, descriptor: string, confidence: number): ArchitecturalTaxonomyMapping[] {
    return [
      {
        dimension: "component-archetype",
        value: type,
        confidence,
        evidence: [`Detected from descriptor ${descriptor}`],
      },
      {
        dimension: "architecture-style",
        value: TYPE_TO_ARCHITECTURE_STYLE[type] ?? "unknown",
        confidence: Math.max(0.5, confidence - 0.1),
        evidence: [`Mapped from inferred type ${type}`],
      },
    ];
  }

  private buildStereotypeMatrix(
    appName: string,
    descriptor: string,
    appType: string,
    confidence: number,
  ): ComponentStereotypeMatrixEntry[] {
    return [
      {
        stereotype: "application-shell",
        componentName: appName,
        source: descriptor,
        confidence,
        notes: ["Top-level descriptor indicates deployable application boundary."],
      },
      {
        stereotype: inferC4ContainerStereotype(appName, appType),
        componentName: appName,
        source: descriptor,
        confidence: Math.max(0.6, confidence - 0.05),
        notes: [`Mapped to C4 container stereotype from inferred type ${appType}.`],
      },
    ];
  }

  private async resolveRepositoryRoot(inputPath: string): Promise<string> {
    let currentPath = inputPath;
    while (currentPath !== path.dirname(currentPath)) {
      try {
        const gitPath = path.join(currentPath, ".git");
        await fs.access(gitPath);
        return currentPath;
      } catch {
        currentPath = path.dirname(currentPath);
      }
    }
    return inputPath;
  }
}
