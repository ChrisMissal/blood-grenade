import { promises as fs } from "node:fs";
import path from "node:path";
import YAML from "yaml";
import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import { THIRD_PARTY_CATALOG } from "./third-party-catalog.js";
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

const TYPE_TO_ARCHITECTURE_STYLE: Record<string, string> = {
  "node-app": "modular-monolith",
  "dotnet-solution": "layered",
  "java-app": "layered",
  "python-app": "modular",
  "container-compose": "distributed-system",
  "terraform-stack": "infrastructure-as-code",
};

const DETECTION_RULES: DetectionRule[] = [
  { pattern: /^package\.json$/i, type: "node-app", runtime: "nodejs", buildSystem: "npm", confidence: 0.95 },
  { pattern: /\.sln$/i, type: "dotnet-solution", runtime: "dotnet", buildSystem: "msbuild", confidence: 0.9 },
  { pattern: /^pom\.xml$/i, type: "java-app", runtime: "jvm", buildSystem: "maven", confidence: 0.9 },
  { pattern: /^pyproject\.toml$/i, type: "python-app", runtime: "python", buildSystem: "pip/poetry", confidence: 0.9 },
  { pattern: /^docker-compose\.ya?ml$/i, type: "container-compose", runtime: "containers", buildSystem: "docker-compose", confidence: 0.7 },
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
    if (!matched) {
      return undefined;
    }

    const descriptor = entries.find(entry => matched.pattern.test(entry.name));
    if (!descriptor) {
      return undefined;
    }

    const descriptorPath = path.join(rootPath, descriptor.name);
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

    if (descriptor.name === "package.json") {
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

    return {
      rootPath,
      name: appName,
      descriptorFile: descriptor.name,
      type: target.overrideType ?? matched.type,
      languageRuntimeGuess: matched.runtime,
      buildSystemGuess: matched.buildSystem,
      statusHint,
      lastModifiedAt,
      confidence: matched.confidence,
      notes: [
        `Detected via ${descriptor.name}`,
        target.overrideType ? `Type overridden to ${target.overrideType}` : "Type inferred from heuristics",
      ],
      architecturalTaxonomy: this.buildTaxonomy(target.overrideType ?? matched.type, descriptor.name, matched.confidence),
      componentStereotypeMatrix: this.buildStereotypeMatrix(
        appName,
        descriptor.name,
        target.overrideType ?? matched.type,
        matched.confidence,
      ),
      thirdPartyIntegrations,
    };
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
        stereotype: this.inferC4ContainerStereotype(appType),
        componentName: appName,
        source: descriptor,
        confidence: Math.max(0.6, confidence - 0.05),
        notes: [`Mapped to C4 container stereotype from inferred type ${appType}.`],
      },
    ];
  }

  private inferC4ContainerStereotype(appType: string): string {
    if (appType === "terraform-stack") {
      return "c4-container:infrastructure";
    }
    if (appType === "container-compose") {
      return "c4-container:orchestrator";
    }
    return "c4-container:application";
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
