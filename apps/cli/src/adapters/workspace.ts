import execa from "execa";

export async function runWorkspaceScript(script: string, args: string[] = []) {
  await execa("npm", ["run", script, ...args], { stdio: "inherit" });
}

export async function runWorkspaceForAll(script: string, args: string[] = []) {
  await execa("npm", ["run", "repo", "--", script, ...args], { stdio: "inherit" });
}
