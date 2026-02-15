const { spawnSync } = require("child_process");
const fs = require("fs");
const dotenv = require('dotenv');
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");
const GOLDEN_PATH = path.resolve(__dirname, "fixtures/github/expected/inspect-repos.json");

function loadGolden() {
  return JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8"));
}

describe("inspect command github integration golden output", () => {
  beforeAll(() => {
    // Load test GitHub token if present
    dotenv.config({ path: path.resolve(__dirname, '../../.env.test.github') });
  });
  it("matches expected mappings for github repositories", () => {
    const run = spawnSync(
      "node",
      [CLI_PATH, "inspect", "chrismissal", "--integration", "github", "--format", "json"],
      {
        env: {
          ...process.env,
          GITHUB_INSPECT_FIXTURE: JSON.stringify({
            owner: { login: "chrismissal", type: "User" },
            repositories: [],
          }),
          HTTP_PROXY: "",
          HTTPS_PROXY: "",
          http_proxy: "",
          https_proxy: "",
        },
        encoding: "utf8",
      },
    );

    expect(run.status).toBe(0);
    const parsed = JSON.parse(run.stdout);
    parsed.results[0].inspectedAt = "<INSPECTED_AT>";
    expect(parsed).toEqual(loadGolden());
  });
});
