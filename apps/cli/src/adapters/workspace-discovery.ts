import { promises as fs } from "fs";
import path from "path";

export async function getWorkspacePackages(rootDir: string): Promise<string[]> {
  const appsDir = path.join(rootDir, "apps");
  const entries = await fs.readdir(appsDir, { withFileTypes: true });
  return entries.filter(e => e.isDirectory()).map(e => e.name);
}
