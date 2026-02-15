import { GithubInspectorIntegration } from "../../apps/cli/dist/integrations/github/inspector.js";

const assert = (cond, msg) => { if (!cond) throw new Error(msg); };

(async () => {
  const integration = new GithubInspectorIntegration();
  const testTarget = {
    sourcePath: "chrismissal", // or your GitHub username
    includeHidden: false,
    maxDepth: 2,
    detectApps: true,
    overrideType: undefined,
  };

  console.log("Running GithubInspectorIntegration integration test...");
  const result = await integration.inspect(testTarget);

  // Output counts by languageRuntimeGuess
  const languageCounts = {};
  for (const app of result.detectedApplications) {
    const lang = app.languageRuntimeGuess || "unknown";
    languageCounts[lang] = (languageCounts[lang] || 0) + 1;
  }
  console.log("Detected applications by language:");
  for (const [lang, count] of Object.entries(languageCounts)) {
    console.log(`  ${lang}: ${count}`);
  }

  assert(result.integrationName === "github", "integrationName should be 'github'");
  assert(result.target.sourcePath === "chrismissal", "target.sourcePath should be 'chrismissal'");
  assert(Array.isArray(result.detectedApplications), "detectedApplications should be an array");
  assert(result.errors.length === 0, "errors should be empty");
  assert(result.detectedApplications.length > 0, "detectedApplications should not be empty");

  for (const app of result.detectedApplications) {
    assert(typeof app.name === "string" && app.name.length > 0, "Each app should have a name");
    assert(typeof app.rootPath === "string" && app.rootPath.startsWith("https://github.com/"), "Each app should have a valid rootPath");
    assert(typeof app.descriptorFile === "string", "Each app should have a descriptorFile");
    assert(typeof app.type === "string", "Each app should have a type");
    assert(typeof app.languageRuntimeGuess === "string", "Each app should have a languageRuntimeGuess");
    assert(typeof app.buildSystemGuess === "string", "Each app should have a buildSystemGuess");
    assert(["active", "halted"].includes(app.statusHint), "Each app should have a valid statusHint");
    assert(typeof app.lastModifiedAt === "string", "Each app should have lastModifiedAt");
    assert(typeof app.confidence === "number", "Each app should have a confidence score");
    assert(Array.isArray(app.notes), "Each app should have notes array");
    assert(Array.isArray(app.architecturalTaxonomy), "Each app should have architecturalTaxonomy array");
    assert(Array.isArray(app.componentStereotypeMatrix), "Each app should have componentStereotypeMatrix array");
    // Taxonomy checks
    for (const tax of app.architecturalTaxonomy) {
      assert(typeof tax.dimension === "string", "Taxonomy should have dimension");
      assert(typeof tax.value === "string", "Taxonomy should have value");
      assert(typeof tax.confidence === "number", "Taxonomy should have confidence");
      assert(Array.isArray(tax.evidence), "Taxonomy should have evidence array");
    }
    // Stereotype checks
    for (const stereo of app.componentStereotypeMatrix) {
      assert(typeof stereo.stereotype === "string", "Stereotype should have stereotype");
      assert(typeof stereo.componentName === "string", "Stereotype should have componentName");
      assert(typeof stereo.source === "string", "Stereotype should have source");
      assert(typeof stereo.confidence === "number", "Stereotype should have confidence");
      assert(Array.isArray(stereo.notes), "Stereotype should have notes array");
    }
  }

  console.log("All assertions passed!");
})();
