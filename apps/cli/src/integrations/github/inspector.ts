import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import type { InspectionResult, InspectionTarget } from "../../domain/inspect/models.js";

export class GithubInspectorIntegrationStub implements InspectorIntegration {
  name = "github";

  async inspect(target: InspectionTarget): Promise<InspectionResult> {
    return {
      integrationName: this.name,
      target,
      inspectedAt: new Date().toISOString(),
      detectedApplications: [],
      warnings: ["GitHub integration is a stub and is not implemented yet."],
      errors: [],
    };
  }
}
