import { execa } from "execa";
import { Command } from "commander";

export function registerTestCommand(program: Command) {
  program
    .command("test <app>")
    .description("Run tests for a specific app workspace")
    .action(async (app: string) => {
      await execa("npm", ["run", "test", "--workspace", `apps/${app}`], { stdio: "inherit" });
    });
}
