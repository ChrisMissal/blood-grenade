import { promises as fs } from "node:fs";
import path from "node:path";
import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import type {
  ArchitecturalTaxonomyMapping,
  ComponentStereotypeMatrixEntry,
  DetectedApplication,
  InspectionResult,
  InspectionTarget,
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
      componentStereotypeMatrix: this.buildStereotypeMatrix(appName, descriptor.name, matched.confidence),
    };
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

  private buildStereotypeMatrix(appName: string, descriptor: string, confidence: number): ComponentStereotypeMatrixEntry[] {
    return [
      {
        stereotype: "application-shell",
        componentName: appName,
        source: descriptor,
        confidence,
        notes: ["Top-level descriptor indicates deployable application boundary."],
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
