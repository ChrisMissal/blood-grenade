import fs from "node:fs/promises";
import path from "node:path";
import ts from "typescript";

type Layer = "core" | "domain" | "application" | "unknown";

interface LayerRoots {
  core: string[];
  domain: string[];
  application: string[];
}

interface LayerImportPrefixes {
  core: string[];
  domain: string[];
  application: string[];
}

interface AuditorConfig {
  scanDirs: string[];
  layerRoots: LayerRoots;
  layerImportPrefixes?: LayerImportPrefixes;
  domainKeywords?: string[];
  applicationSuffixes?: string[];
  ignoreDirs?: string[];
  reportTitle?: string;
}

interface ExportedType {
  name: string;
  kind: string;
  filePath: string;
  layer: Layer;
}

interface DependencyFinding {
  filePath: string;
  fileLayer: Layer;
  importSpecifier: string;
  importLayer: Layer;
}

interface CliOptions {
  configPath: string;
  outputPath: string;
  help: boolean;
}

const DEFAULT_CONFIG_PATH = "config/archetype-auditor.config.json";
const DEFAULT_OUTPUT_PATH = "archetype-auditor-report.md";

const DEFAULT_SUFFIXES = ["Handler", "Command", "Workflow", "Controller"];

const DEFAULT_DOMAIN_KEYWORDS = ["Pig", "Farm", "Game"];

const DEFAULT_LAYER_PREFIXES: LayerImportPrefixes = {
  core: [],
  domain: [],
  application: [],
};

const DEFAULT_IGNORE_DIRS = ["node_modules", "dist", "build", "coverage", ".git"];

const TYPE_KINDS: Record<
  ts.SyntaxKind,
  "class" | "interface" | "type alias" | "enum"
> = {
  [ts.SyntaxKind.ClassDeclaration]: "class",
  [ts.SyntaxKind.InterfaceDeclaration]: "interface",
  [ts.SyntaxKind.TypeAliasDeclaration]: "type alias",
  [ts.SyntaxKind.EnumDeclaration]: "enum",
};

const projectRoot = process.cwd();

const parseArgs = (args: string[]): CliOptions => {
  const options: CliOptions = {
    configPath: DEFAULT_CONFIG_PATH,
    outputPath: DEFAULT_OUTPUT_PATH,
    help: false,
  };

  for (let index = 0; index < args.length; index += 1) {
    const arg = args[index];
    if (arg === "--config") {
      options.configPath = args[index + 1] ?? options.configPath;
      index += 1;
    } else if (arg === "--output") {
      options.outputPath = args[index + 1] ?? options.outputPath;
      index += 1;
    } else if (arg === "--help" || arg === "-h") {
      options.help = true;
    }
  }

  return options;
};

const printHelp = (): void => {
  console.log(`
Archetype Auditor

Usage:
  ts-node src/archetypeAuditor.ts --config <path> --output <path>

Options:
  --config  Path to config JSON (default: ${DEFAULT_CONFIG_PATH})
  --output  Report output path (default: ${DEFAULT_OUTPUT_PATH})
  -h, --help  Show help
`);
};

const loadConfig = async (configPath: string): Promise<AuditorConfig> => {
  const raw = await fs.readFile(configPath, "utf8");
  const parsed = JSON.parse(raw) as AuditorConfig;
  return parsed;
};

const normalizePath = (filePath: string): string =>
  path.resolve(filePath).replace(/\\/g, "/");

const collectSourceFiles = async (
  scanDirs: string[],
  ignoreDirs: Set<string>,
): Promise<string[]> => {
  const files: string[] = [];

  const walk = async (dir: string): Promise<void> => {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const entryPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (ignoreDirs.has(entry.name)) {
          continue;
        }
        await walk(entryPath);
        continue;
      }

      if (!entry.isFile()) {
        continue;
      }

      if (entry.name.endsWith(".d.ts")) {
        continue;
      }

      if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
        files.push(entryPath);
      }
    }
  };

  for (const dir of scanDirs) {
    await walk(dir);
  }

  return files;
};

const resolveLayerRoots = (roots: LayerRoots): LayerRoots => ({
  core: roots.core.map((root) => normalizePath(path.resolve(projectRoot, root))),
  domain: roots.domain.map((root) =>
    normalizePath(path.resolve(projectRoot, root)),
  ),
  application: roots.application.map((root) =>
    normalizePath(path.resolve(projectRoot, root)),
  ),
});

const layerFromPath = (filePath: string, roots: LayerRoots): Layer => {
  const normalized = normalizePath(filePath);
  const matchesRoot = (root: string) =>
    normalized === root || normalized.startsWith(`${root}/`);

  if (roots.core.some(matchesRoot)) {
    return "core";
  }
  if (roots.domain.some(matchesRoot)) {
    return "domain";
  }
  if (roots.application.some(matchesRoot)) {
    return "application";
  }
  return "unknown";
};

const classifyExport = (
  exportType: Omit<ExportedType, "layer">,
  roots: LayerRoots,
  domainKeywords: string[],
  applicationSuffixes: string[],
): ExportedType => {
  const pathLayer = layerFromPath(exportType.filePath, roots);
  if (pathLayer !== "unknown") {
    return { ...exportType, layer: pathLayer };
  }

  const matchesSuffix = applicationSuffixes.some((suffix) =>
    exportType.name.endsWith(suffix),
  );
  if (matchesSuffix) {
    return { ...exportType, layer: "application" };
  }

  const lowerName = exportType.name.toLowerCase();
  const matchesDomain = domainKeywords.some((keyword) =>
    lowerName.includes(keyword.toLowerCase()),
  );
  if (matchesDomain) {
    return { ...exportType, layer: "domain" };
  }

  return { ...exportType, layer: "unknown" };
};

const collectExportedTypes = (
  program: ts.Program,
  filesSet: Set<string>,
): Omit<ExportedType, "layer">[] => {
  const checker = program.getTypeChecker();
  const exports: Omit<ExportedType, "layer">[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    const sourcePath = normalizePath(sourceFile.fileName);
    if (!filesSet.has(sourcePath)) {
      continue;
    }

    const sourceSymbol = checker.getSymbolAtLocation(sourceFile);
    if (!sourceSymbol) {
      continue;
    }

    const moduleExports = checker.getExportsOfModule(sourceSymbol);
    for (const exported of moduleExports) {
      const declarations = exported.getDeclarations() ?? [];
      for (const declaration of declarations) {
        if (!ts.isClassDeclaration(declaration) &&
            !ts.isInterfaceDeclaration(declaration) &&
            !ts.isTypeAliasDeclaration(declaration) &&
            !ts.isEnumDeclaration(declaration)) {
          continue;
        }

        const kind = TYPE_KINDS[declaration.kind] ?? "type";
        exports.push({
          name: exported.getName(),
          kind,
          filePath: sourcePath,
        });
      }
    }
  }

  return exports;
};

const collectImportSpecifiers = (sourceFile: ts.SourceFile): string[] => {
  const specifiers: string[] = [];

  const visit = (node: ts.Node): void => {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifiers.push(node.moduleSpecifier.text);
      }
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);
  return specifiers;
};

const resolveImportLayer = (
  specifier: string,
  fromFile: string,
  roots: LayerRoots,
  prefixes: LayerImportPrefixes,
): Layer => {
  if (specifier.startsWith(".")) {
    const resolved = normalizePath(
      path.resolve(path.dirname(fromFile), specifier),
    );
    return layerFromPath(resolved, roots);
  }

  for (const prefix of prefixes.core) {
    if (specifier.startsWith(prefix)) {
      return "core";
    }
  }

  for (const prefix of prefixes.domain) {
    if (specifier.startsWith(prefix)) {
      return "domain";
    }
  }

  for (const prefix of prefixes.application) {
    if (specifier.startsWith(prefix)) {
      return "application";
    }
  }

  const normalizedSpecifier = specifier.replace(/\\/g, "/");
  const matchesRoot = (root: string) =>
    normalizedSpecifier.includes(root.replace(/\\/g, "/"));

  if (roots.core.some(matchesRoot)) {
    return "core";
  }
  if (roots.domain.some(matchesRoot)) {
    return "domain";
  }
  if (roots.application.some(matchesRoot)) {
    return "application";
  }

  return "unknown";
};

const analyzeDependencies = (
  program: ts.Program,
  filesSet: Set<string>,
  roots: LayerRoots,
  prefixes: LayerImportPrefixes,
): DependencyFinding[] => {
  const findings: DependencyFinding[] = [];

  for (const sourceFile of program.getSourceFiles()) {
    const sourcePath = normalizePath(sourceFile.fileName);
    if (!filesSet.has(sourcePath)) {
      continue;
    }

    const fileLayer = layerFromPath(sourcePath, roots);
    if (fileLayer !== "core" && fileLayer !== "domain") {
      continue;
    }

    const specifiers = collectImportSpecifiers(sourceFile);
    for (const specifier of specifiers) {
      const importLayer = resolveImportLayer(
        specifier,
        sourcePath,
        roots,
        prefixes,
      );

      if (
        fileLayer === "core" &&
        (importLayer === "domain" || importLayer === "application")
      ) {
        findings.push({
          filePath: sourcePath,
          fileLayer,
          importSpecifier: specifier,
          importLayer,
        });
      }

      if (fileLayer === "domain" && importLayer === "application") {
        findings.push({
          filePath: sourcePath,
          fileLayer,
          importSpecifier: specifier,
          importLayer,
        });
      }
    }
  }

  return findings;
};

const groupByLayer = (exports: ExportedType[]): Record<Layer, ExportedType[]> =>
  exports.reduce(
    (accumulator, exportType) => {
      accumulator[exportType.layer].push(exportType);
      return accumulator;
    },
    {
      core: [],
      domain: [],
      application: [],
      unknown: [],
    } as Record<Layer, ExportedType[]>,
  );

const formatRelativePath = (filePath: string): string =>
  path.relative(projectRoot, filePath).replace(/\\/g, "/");

const renderExportList = (title: string, items: ExportedType[]): string => {
  if (items.length === 0) {
    return `## ${title}\n\n_No entries found._\n`;
  }

  const lines = items
    .sort((a, b) => a.name.localeCompare(b.name))
    .map(
      (item) =>
        `- \`${item.name}\` (${item.kind}) — \`${formatRelativePath(
          item.filePath,
        )}\``,
    );

  return `## ${title}\n\n${lines.join("\n")}\n`;
};

const renderDependencyFindings = (findings: DependencyFinding[]): string => {
  if (findings.length === 0) {
    return "## Cross-layer dependency findings\n\n_No cross-layer dependency issues found._\n";
  }

  const lines = findings.map(
    (finding) =>
      `- \`${formatRelativePath(
        finding.filePath,
      )}\` (${finding.fileLayer}) imports \`${finding.importSpecifier}\` (${finding.importLayer})`,
  );

  return `## Cross-layer dependency findings\n\n${lines.join("\n")}\n`;
};

const buildReport = (
  exports: ExportedType[],
  findings: DependencyFinding[],
  title: string,
): string => {
  const grouped = groupByLayer(exports);

  const summaryRows: [Layer, number][] = [
    ["core", grouped.core.length],
    ["domain", grouped.domain.length],
    ["application", grouped.application.length],
    ["unknown", grouped.unknown.length],
  ];

  const summaryTable = [
    "| Layer | Count |",
    "| --- | --- |",
    ...summaryRows.map(([layer, count]) => `| ${layer} | ${count} |`),
  ].join("\n");

  return `# ${title}

Generated: ${new Date().toISOString()}

## Summary

${summaryTable}

${renderExportList("Core exports", grouped.core)}

${renderExportList("Domain exports", grouped.domain)}

${renderExportList("Application exports", grouped.application)}

${renderExportList("Unknown / smells", grouped.unknown)}

${renderDependencyFindings(findings)}
`;
};

const main = async (): Promise<void> => {
  const options = parseArgs(process.argv.slice(2));
  if (options.help) {
    printHelp();
    return;
  }

  const configPath = path.resolve(projectRoot, options.configPath);
  const outputPath = path.resolve(projectRoot, options.outputPath);
  const config = await loadConfig(configPath);

  const scanDirs = config.scanDirs.map((dir) =>
    path.resolve(projectRoot, dir),
  );

  const ignoreDirs = new Set(config.ignoreDirs ?? DEFAULT_IGNORE_DIRS);
  const files = await collectSourceFiles(scanDirs, ignoreDirs);
  const filesSet = new Set(files.map(normalizePath));

  const program = ts.createProgram(files, {
    allowJs: false,
    target: ts.ScriptTarget.ES2020,
    module: ts.ModuleKind.CommonJS,
    moduleResolution: ts.ModuleResolutionKind.NodeJs,
  });

  const roots = resolveLayerRoots(config.layerRoots);
  const domainKeywords = config.domainKeywords ?? DEFAULT_DOMAIN_KEYWORDS;
  const applicationSuffixes = config.applicationSuffixes ?? DEFAULT_SUFFIXES;
  const prefixes = config.layerImportPrefixes ?? DEFAULT_LAYER_PREFIXES;

  const exportedTypes = collectExportedTypes(program, filesSet).map((entry) =>
    classifyExport(entry, roots, domainKeywords, applicationSuffixes),
  );

  const findings = analyzeDependencies(program, filesSet, roots, prefixes);
  const reportTitle = config.reportTitle ?? "Archetype Auditor Report";
  const report = buildReport(exportedTypes, findings, reportTitle);

  await fs.writeFile(outputPath, report, "utf8");
  console.log(`Report written to ${outputPath}`);
};

main().catch((error) => {
  console.error("Archetype Auditor failed:", error);
  process.exitCode = 1;
});
