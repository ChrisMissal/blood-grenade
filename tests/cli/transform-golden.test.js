const execa = require("execa");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");
const FIXTURE_DIR = path.resolve(__dirname, "fixtures/bowling-center");
const SPEC_PATH = path.join(FIXTURE_DIR, "transformation.yaml");
const EXPECTED_DIR = path.join(FIXTURE_DIR, "expected");

function readExpected(fileName) {
  return fs.readFileSync(path.join(EXPECTED_DIR, fileName), "utf8");
}

describe("CLI transform golden output", () => {
  it("matches golden files for bowling center system deployment", async () => {
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "transform-golden-"));

    const run = async () => execa("node", [CLI_PATH, "transform", "doc", SPEC_PATH, "--out-dir", outDir], { reject: false });

    const first = await run();
    expect(first.exitCode).toBe(0);

    const second = await run();
    expect(second.exitCode).toBe(0);

    const files = ["README.transformation.md", "transformation.mmd", "governance.md", "structurizr.dsl"];

    for (const fileName of files) {
      const actual = fs.readFileSync(path.join(outDir, fileName), "utf8");
      const expected = readExpected(fileName);
      expect(actual).toBe(expected);
    }
  });
});
