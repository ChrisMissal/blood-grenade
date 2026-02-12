import { execa } from "execa";
import { Command } from "commander";

export function registerDepcruiseCommand(program: Command) {
  program
    .command("depcruise <app>")
    .description("Run dependency-cruiser on a specific app workspace")
    .action(async (app: string) => {
      await execa("npm", ["run", "depcruise", "--workspace", `apps/${app}`], { stdio: "inherit" });
    });
}
