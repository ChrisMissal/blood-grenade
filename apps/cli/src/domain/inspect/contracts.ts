import type { InspectionResult, InspectionTarget } from "./models.js";

export interface InspectorIntegration {
  name: string;
  inspect(target: InspectionTarget): Promise<InspectionResult>;
}
