import { Command } from "commander";
import { registerBuildCommand } from "./commands/build.js";
import { registerTestCommand } from "./commands/test.js";
import { registerTypecheckCommand } from "./commands/typecheck.js";

import { registerDepcruiseCommand } from "./commands/depcruise.js";
import { registerDockerComposeCommand } from "./commands/docker-compose.js";
import { registerTransformCommand } from "./commands/transform.js";

export function buildProgram(): Command {
  const program = new Command();
  // TODO(rename): replace `bg` binary name when blood-grenade is rebranded.
  program.name("bg").description("Monorepo management CLI");
  registerBuildCommand(program);
  registerTestCommand(program);
  registerTypecheckCommand(program);
  registerDepcruiseCommand(program);
  registerDockerComposeCommand(program);
  registerTransformCommand(program);
  return program;
}
