const execa = require("execa");
const path = require("path");

const APP_PATH = path.resolve(__dirname, "../../apps/hello-world/src/index.js");

describe("hello-world help output", () => {
  it("should print help or usage", async () => {
    const { stdout, exitCode } = await execa("node", [APP_PATH, "--help"], { reject: false });
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/help|usage/i);
  });
});
