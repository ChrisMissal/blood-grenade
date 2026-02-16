const execa = require("execa");
const fs = require("fs/promises");
const os = require("os");
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");

async function makeFixture() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "bg-inspect-"));
  await fs.mkdir(path.join(root, "repo-a"), { recursive: true });
  await fs.writeFile(
    path.join(root, "repo-a", "package.json"),
    JSON.stringify({ name: "repo-a-service" }, null, 2),
    "utf8",
  );

  await fs.mkdir(path.join(root, "repo-b", "service"), { recursive: true });
  await fs.writeFile(path.join(root, "repo-b", "service", "pyproject.toml"), "[project]\nname='svc'\n", "utf8");
  await fs.writeFile(path.join(root, "repo-b", "terraform.tf"), "terraform {}", "utf8");

  return root;
}

describe("inspect command", () => {
  it("returns structured JSON output", async () => {
    const fixtureRoot = await makeFixture();
    const { stdout, exitCode } = await execa("node", [
      CLI_PATH,
      "inspect",
      fixtureRoot,
      "--format",
      "json",
      "--max-depth",
      "3",
    ]);

    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed).toHaveProperty("results");
    expect(Array.isArray(parsed.results)).toBe(true);
    expect(parsed.results[0]).toHaveProperty("integrationName", "filesystem");
    expect(parsed.results[0]).toHaveProperty("target");
    expect(parsed.results[0]).toHaveProperty("detectedApplications");

    const apps = parsed.results[0].detectedApplications;
    expect(apps.some(app => app.name === "repo-a-service")).toBe(true);
    expect(apps.some(app => app.descriptorFile === "pyproject.toml")).toBe(true);
    expect(apps.some(app => app.descriptorFile === "terraform.tf")).toBe(true);
    expect(apps.every(app => Array.isArray(app.architecturalTaxonomy))).toBe(true);
    expect(apps.every(app => Array.isArray(app.componentStereotypeMatrix))).toBe(true);
  });

  it("prints table output by default", async () => {
    const fixtureRoot = await makeFixture();
    const { stdout, exitCode } = await execa("node", [CLI_PATH, "inspect", fixtureRoot]);
    expect(exitCode).toBe(0);
    expect(stdout).toMatch(/Integration: filesystem/i);
    expect(stdout).toMatch(/Name \| Type \| Runtime \| Build \| Status \| Taxonomy \| Stereotype \| Path/i);
  });

  it("supports stub integrations safely", async () => {
    const fixtureRoot = await makeFixture();
    const { stdout, exitCode } = await execa("node", [
      CLI_PATH,
      "inspect",
      fixtureRoot,
      "--integration",
      "aws",
      "--format",
      "json",
    ]);
    expect(exitCode).toBe(0);
    const parsed = JSON.parse(stdout);
    expect(parsed.results[0].warnings[0]).toMatch(/stub/i);
  });
});
