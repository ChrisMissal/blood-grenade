import { Command } from "commander";
import { registerBuildCommand } from "./commands/build.js";
import { registerTestCommand } from "./commands/test.js";
import { registerTypecheckCommand } from "./commands/typecheck.js";
import { registerDepcruiseCommand } from "./commands/depcruise.js";

export function buildProgram(): Command {
  const program = new Command();
  program.name("repo").description("Monorepo management CLI");
  registerBuildCommand(program);
  registerTestCommand(program);
  registerTypecheckCommand(program);
  registerDepcruiseCommand(program);
  return program;
}
