export default {
  testEnvironment: "node",
  testMatch: [
    "**/*.test.js",
    "**/*.test.mjs",
    "!**/cli/github-inspector.integration.test.mjs"
  ],
  verbose: true
};
