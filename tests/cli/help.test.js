const execa = require("execa");
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");

describe("CLI help output", () => {
  it("should print top-level help", async () => {
    const { stdout, exitCode } = await execa("node", [CLI_PATH, "--help"]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/monorepo management cli/i);
    expect(stdout).toMatch(/build <app>/i);
    expect(stdout).toMatch(/test <app>/i);
    expect(stdout).toMatch(/typecheck <app>/i);
    expect(stdout).toMatch(/depcruise <app>/i);
    expect(stdout).toMatch(/inspect \[options\] \[paths\.\.\./i);
    expect(stdout).toMatch(/transform/i);
  });

  ["build", "test", "typecheck", "depcruise"].forEach(cmd => {
    it(`should print help for '${cmd}'`, async () => {
      const { stdout, exitCode } = await execa("node", [CLI_PATH, cmd, "--help"]);
      expect(exitCode).toBe(0);
      expect(stdout).toMatch(new RegExp(`${cmd} (\\[options\\] )?<app>`, "i"));
      expect(stdout).toMatch(/options?/i);
    });
  });

  it("should print help for 'inspect'", async () => {
    const { stdout, exitCode } = await execa("node", [CLI_PATH, "inspect", "--help"]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/inspect \[options\] \[paths\.\.\./i);
    expect(stdout).toMatch(/--format <format>/i);
    expect(stdout).toMatch(/--integration <name>/i);
  });
});
