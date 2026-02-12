const execa = require("execa");
const path = require("path");

const APP_PATH = path.resolve(__dirname, "../../apps/hello-world/src/index.js");

describe("hello-world missing args", () => {
  it("should not throw for --help", async () => {
    const { exitCode } = await execa("node", [APP_PATH, "--help"], { reject: false });
    expect(exitCode).toBe(0);
  });
  // Add more argument validation tests here if hello-world supports required args
});
