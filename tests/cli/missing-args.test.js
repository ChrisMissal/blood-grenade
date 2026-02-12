const execa = require("execa");
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");

describe("CLI missing required args", () => {
  const commands = ["build", "test", "typecheck", "depcruise"];
  for (const cmd of commands) {
    it(`should error if <app> arg is missing for '${cmd}'`, async () => {
      try {
        await execa("node", [CLI_PATH, cmd], { reject: true });
        throw new Error("Expected error for missing <app> argument");
      } catch (err) {
        expect(err.stderr || err.message).toMatch(/error: missing required argument '?<??app>?'/i);
      }
    });
  }
});
