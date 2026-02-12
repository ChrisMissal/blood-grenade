import { Command } from "commander";
import { registerBuildCommand } from "./commands/build.command";
import { registerDoctorCommand } from "./commands/doctor.command";

export function buildProgram() {
  const program = new Command();

  program
    .name("ep")
    .description("Enterprise Platform CLI")
    .version("1.0.0");

  registerBuildCommand(program);
  registerDoctorCommand(program);

  return program;
}
