export type InspectionOutputFormat = "table" | "json";

export interface InspectionTarget {
  sourcePath: string;
  includeHidden: boolean;
  maxDepth: number;
  detectApps: boolean;
  overrideType?: string;
}

export interface DetectedApplication {
  rootPath: string;
  name: string;
  descriptorFile: string;
  type: string;
  languageRuntimeGuess: string;
  buildSystemGuess: string;
  statusHint: "active" | "halted" | "unknown";
  lastModifiedAt?: string;
  confidence: number;
  notes: string[];
}

export interface InspectionError {
  targetPath: string;
  message: string;
}

export interface InspectionResult {
  integrationName: string;
  target: InspectionTarget;
  inspectedAt: string;
  repositoryRoot?: string;
  detectedApplications: DetectedApplication[];
  warnings: string[];
  errors: InspectionError[];
}

export interface InspectCommandOptions {
  format: InspectionOutputFormat;
  includeHidden: boolean;
  maxDepth: number;
  detectApps: boolean;
  overrideType?: string;
  integration: string;
  config?: string;
}
