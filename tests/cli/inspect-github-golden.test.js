const { spawnSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");
const GOLDEN_PATH = path.resolve(__dirname, "fixtures/github/expected/inspect-user.json");

function loadGolden() {
  return JSON.parse(fs.readFileSync(GOLDEN_PATH, "utf8"));
}

describe("inspect command github integration golden output", () => {
  it("matches expected mappings for github repositories", () => {
    const run = spawnSync(
      "node",
      [CLI_PATH, "inspect", "test-profile", "--integration", "github", "--format", "json"],
      {
        env: {
          ...process.env,
          GITHUB_INSPECT_FIXTURE: JSON.stringify({
            owner: { login: "test-profile", type: "User" },
            repositories: [
              {
                name: "node-service",
                html_url: "https://github.com/test-profile/node-service",
                language: "TypeScript",
                pushed_at: "2026-01-01T12:00:00.000Z",
                archived: false,
                default_branch: "main",
                visibility: "public",
                stargazers_count: 13,
              },
              {
                name: "infra-stack",
                html_url: "https://github.com/test-profile/infra-stack",
                language: "HCL",
                pushed_at: "2025-12-12T08:30:00.000Z",
                archived: true,
                default_branch: "main",
                visibility: "private",
                stargazers_count: 0,
              },
            ],
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
