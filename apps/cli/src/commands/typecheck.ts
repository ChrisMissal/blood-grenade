import { execa } from "execa";
import { Command } from "commander";

export function registerTypecheckCommand(program: Command) {
  program
    .command("typecheck <app>")
    .description("Typecheck a specific app workspace")
    .action(async (app: string) => {
      await execa("npm", ["run", "typecheck", "--workspace", `apps/${app}`], { stdio: "inherit" });
    });
}
