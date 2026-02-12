const execa = require("execa");
const path = require("path");

const APP_PATH = path.resolve(__dirname, "../../apps/web-app/src/index.js");

describe("web-app help output", () => {
  it("should print help or usage", async () => {
    const { stdout, exitCode } = await execa("node", [APP_PATH, "--help"], { reject: false });
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/help|usage/i);
  });
});
