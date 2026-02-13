import { Command } from "commander";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import { generateDocumentation } from "../transform/generate.js";
import { TransformationModel, TransformationPhase } from "../transform/model.js";
import { createTransformationPr } from "../transform/pr.js";
import { loadTransformationSpec, saveTransformationSpec } from "../transform/yaml.js";

async function prompt(question: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(question);
  rl.close();
  return answer.trim();
}

async function runInit(filePath: string) {
  const name = await prompt("Transformation name: ");
  const currentState = await prompt("Current state: ");
  const targetState = await prompt("Target state: ");
  const phaseInput = await prompt("Phase (current|active|convergence|completed): ");
  const streamName = await prompt("First stream name: ");
  const streamOwner = await prompt("First stream owner: ");

  const phase = (phaseInput || "current") as TransformationPhase;

  const model: TransformationModel = {
    name,
    currentState,
    targetState,
    phase,
    streams: [
      {
        id: streamName.toLowerCase().replace(/\s+/g, "-"),
        name: streamName,
        description: "Initial transformation stream",
        owner: streamOwner,
        status: "proposed",
        milestones: [{ title: "Kickoff", status: "todo" }],
      },
    ],
    governance: {
      automationRules: ["Automate tests for each stream"],
      sourceControlRules: ["All changes via pull requests"],
      qualityGates: ["Typecheck + tests must pass"],
    },
  };

  await saveTransformationSpec(filePath, model);
  output.write(`Created ${filePath}\n`);
}

export function registerTransformCommand(program: Command) {
  const transform = program.command("transform").description("Transformation-as-Code workflows");

  transform
    .command("init")
    .description("Interactive wizard to generate transformation.yaml")
    .option("--file <path>", "Output YAML file", "transformation.yaml")
    .action(async (options: { file: string }) => {
      await runInit(options.file);
    });

  transform
    .command("doc <file>")
    .description("Generate transformation docs and diagrams from YAML")
    .option("--out-dir <path>", "Output directory", ".")
    .action(async (file: string, options: { outDir: string }) => {
      const model = await loadTransformationSpec(file);
      const outputs = await generateDocumentation(model, options.outDir);
      output.write(`Generated:\n- ${outputs.readmePath}\n- ${outputs.mermaidPath}\n- ${outputs.governancePath}\n- ${outputs.structurizrPath}\n`);
    });

  transform
    .command("pr <file>")
    .description("Open a transformation update PR for a target repo")
    .requiredOption("--repo <path>", "Path to target repository")
    .action(async (file: string, options: { repo: string }) => {
      const model = await loadTransformationSpec(file);
      await createTransformationPr(model, path.resolve(options.repo));
      output.write("Transformation PR created.\n");
    });
}
