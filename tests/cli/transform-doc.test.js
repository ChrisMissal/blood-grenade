const execa = require("execa");
const path = require("path");
const fs = require("fs");
const os = require("os");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");
const SPEC_PATH = path.resolve(__dirname, "../../transformation.yaml");

describe("CLI transform doc command", () => {
  it("generates markdown and diagram artifacts", async () => {
    // TODO(rename): replace `bg` temp prefix when blood-grenade naming is finalized.
    const outDir = fs.mkdtempSync(path.join(os.tmpdir(), "bg-transform-"));
    const { exitCode, stderr } = await execa("node", [CLI_PATH, "transform", "doc", SPEC_PATH, "--out-dir", outDir], {
      reject: false,
    });

    expect(exitCode).toBe(0);
    expect(stderr).toBe("");

    const readme = fs.readFileSync(path.join(outDir, "README.transformation.md"), "utf8");
    const mermaid = fs.readFileSync(path.join(outDir, "transformation.mmd"), "utf8");
    const dsl = fs.readFileSync(path.join(outDir, "structurizr.dsl"), "utf8");

    expect(readme).toMatch(/# Transformation Overview/);
    expect(readme).toMatch(/Current Phase: active/);
    expect(mermaid).toMatch(/flowchart TD/);
    expect(mermaid).toMatch(/classDef completed/);
    expect(dsl).toMatch(/workspace/);
    expect(dsl).toMatch(/CurrentSystem -> TargetSystem/);
  });
});
