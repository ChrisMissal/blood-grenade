import { Command } from "commander";
import execa from "execa";

export function registerBuildCommand(program: Command) {
  program
    .command("build <app>")
    .description("Build a specific app workspace")
    .action(async (app: string) => {
      await execa("npm", ["run", "build", "--workspace", `apps/${app}`], { stdio: "inherit" });
    });
}
