import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { TransformationModel } from "./model.js";
import { generateTransformationMarkdown, generateGovernanceMarkdown } from "./markdown.js";
import { generateMermaid } from "./mermaid.js";
import { generateStructurizrDsl } from "./structurizr.js";

export interface GeneratedOutputs {
  readmePath: string;
  mermaidPath: string;
  governancePath: string;
  structurizrPath: string;
}

export async function generateDocumentation(model: TransformationModel, outDir: string): Promise<GeneratedOutputs> {
  await mkdir(outDir, { recursive: true });
  const readmePath = path.join(outDir, "README.transformation.md");
  const mermaidPath = path.join(outDir, "transformation.mmd");
  const governancePath = path.join(outDir, "governance.md");
  const structurizrPath = path.join(outDir, "structurizr.dsl");

  await writeFile(readmePath, generateTransformationMarkdown(model), "utf8");
  await writeFile(mermaidPath, generateMermaid(model), "utf8");
  await writeFile(governancePath, generateGovernanceMarkdown(model), "utf8");
  await writeFile(structurizrPath, generateStructurizrDsl(model), "utf8");

  return { readmePath, mermaidPath, governancePath, structurizrPath };
}
