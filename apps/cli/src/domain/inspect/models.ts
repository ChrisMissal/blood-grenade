export type InspectionOutputFormat = "table" | "json";

export interface ArchitecturalTaxonomyMapping {
  dimension: "architecture-style" | "layer" | "component-archetype" | "domain-role";
  value: string;
  confidence: number;
  evidence: string[];
}

export interface ComponentStereotypeMatrixEntry {
  stereotype: string;
  componentName: string;
  source: string;
  confidence: number;
  notes: string[];
}

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
  architecturalTaxonomy: ArchitecturalTaxonomyMapping[];
  componentStereotypeMatrix: ComponentStereotypeMatrixEntry[];
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
