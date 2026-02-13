import { readFile, writeFile } from "node:fs/promises";
import YAML from "yaml";
import { TransformationModel } from "./model.js";

export async function loadTransformationSpec(filePath: string): Promise<TransformationModel> {
  const raw = await readFile(filePath, "utf8");
  const doc = YAML.parse(raw) as TransformationModel;
  return doc;
}

export async function saveTransformationSpec(filePath: string, model: TransformationModel): Promise<void> {
  const rendered = YAML.stringify(model);
  await writeFile(filePath, rendered, "utf8");
}
