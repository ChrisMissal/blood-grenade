import { Command } from "commander";
import path from "node:path";
import { resolveInspectorIntegration } from "../application/inspect/inspector-registry.js";
import type { InspectionResult } from "../domain/inspect/models.js";

interface InspectCommandFlags {
  format: "json" | "table";
  includeHidden: boolean;
  maxDepth: string;
  detectApps: boolean;
  overrideType?: string;
  integration: string;
  config?: string;
}

export function registerInspectCommand(program: Command) {
  program
    .command("inspect [paths...]")
    .description("Inspect repositories or applications using pluggable integrations")
    .option("--format <format>", "Output format: json|table", "table")
    .option("--include-hidden", "Include hidden directories and files")
    .option("--max-depth <number>", "Maximum traversal depth", "4")
    .option("--detect-apps", "Enable app detection heuristics", true)
    .option("--override-type <type>", "Override detected type")
    .option("--integration <name>", "Inspector integration to use", "filesystem")
    .option("--config <file>", "Future integration-specific config file path")
    .action(async (paths: string[] | undefined, flags: InspectCommandFlags) => {
      const outputFormat = flags.format === "json" ? "json" : "table";
      const maxDepth = Number.parseInt(flags.maxDepth, 10);

      if (Number.isNaN(maxDepth) || maxDepth < 0) {
        throw new Error("--max-depth must be a non-negative integer.");
      }

      const integration = resolveInspectorIntegration(flags.integration);
      const targets = (paths && paths.length > 0 ? paths : ["."]).map(targetPath => ({
        sourcePath: path.resolve(targetPath),
        includeHidden: Boolean(flags.includeHidden),
        maxDepth,
        detectApps: Boolean(flags.detectApps),
        overrideType: flags.overrideType,
      }));

      const results: InspectionResult[] = await Promise.all(targets.map(target => integration.inspect(target)));

      if (outputFormat === "json") {
        console.log(JSON.stringify({ results }, null, 2));
        return;
      }

      printTable(results);
    });
}

function printTable(results: InspectionResult[]) {
  for (const result of results) {
    console.log(`\nIntegration: ${result.integrationName}`);
    console.log(`Target: ${result.target.sourcePath}`);
    if (result.repositoryRoot) {
      console.log(`Repository root: ${result.repositoryRoot}`);
    }

    if (result.warnings.length > 0) {
      for (const warning of result.warnings) {
        console.log(`Warning: ${warning}`);
      }
    }

    if (result.errors.length > 0) {
      for (const error of result.errors) {
        console.log(`Error: ${error.targetPath} - ${error.message}`);
      }
    }

    if (result.detectedApplications.length === 0) {
      console.log("No applications detected.");
      continue;
    }

    console.log("Name | Type | Runtime | Build | Status | Path");
    console.log("--- | --- | --- | --- | --- | ---");

    for (const application of result.detectedApplications) {
      console.log(
        `${application.name} | ${application.type} | ${application.languageRuntimeGuess} | ${application.buildSystemGuess} | ${application.statusHint} | ${application.rootPath}`,
      );
    }
  }
}
