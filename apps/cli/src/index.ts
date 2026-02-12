import { buildProgram } from "./program.js";

async function main() {
  const program = buildProgram();
  await program.parseAsync(process.argv);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
