const execa = require("execa");
const path = require("path");

const APP_PATH = path.resolve(__dirname, "../../apps/daemon/src/index.js");

describe("daemon missing args", () => {
  it("should not throw for --help", async () => {
    const { exitCode } = await execa("node", [APP_PATH, "--help"], { reject: false });
    expect(exitCode).toBe(0);
  });
  // Add more argument validation tests here if daemon supports required args
});
