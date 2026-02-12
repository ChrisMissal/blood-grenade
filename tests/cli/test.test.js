const execa = require("execa");
const path = require("path");
const fs = require("fs");

const CLI_PATH = path.resolve(__dirname, "../../apps/cli/dist/index.js");
const APPS_DIR = path.resolve(__dirname, "../../apps");

function getAppNames() {
  return fs.readdirSync(APPS_DIR).filter((f) => fs.statSync(path.join(APPS_DIR, f)).isDirectory());
}

describe("CLI test command for all apps", () => {
  getAppNames().forEach(app => {
    it(`should test app '${app}' without error`, async () => {
      const { stderr, exitCode } = await execa("node", [CLI_PATH, "test", app], { reject: false });
      if (exitCode !== 0 || /error/i.test(stderr)) {
        // eslint-disable-next-line no-console
        console.error(`\n[test] app: ${app}\nexit: ${exitCode}\nstderr:\n${stderr}`);
      }
      expect(exitCode).toBe(0);
      expect(stderr).not.toMatch(/error/i);
    });
  });
});
