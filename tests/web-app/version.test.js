const execa = require("execa");
const path = require("path");

const APP_PATH = path.resolve(__dirname, "../../apps/web-app/src/index.js");

describe("web-app version output", () => {
  it("should print version and exit", async () => {
    const { stdout, exitCode } = await execa("node", [APP_PATH, "--version"], { reject: false });
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/version/i);
  });
});
