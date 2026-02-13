export type TransformationPhase = "current" | "active" | "convergence" | "completed";
export type StreamStatus = "proposed" | "active" | "paused" | "completed";
export type MilestoneStatus = "todo" | "in-progress" | "done";

export interface Milestone {
  title: string;
  status: MilestoneStatus;
}

export interface Stream {
  id: string;
  name: string;
  description: string;
  milestones: Milestone[];
  owner: string;
  status: StreamStatus;
}

export interface GovernanceLayer {
  automationRules: string[];
  sourceControlRules: string[];
  qualityGates: string[];
}

export interface TransformationModel {
  name: string;
  currentState: string;
  targetState: string;
  phase: TransformationPhase;
  streams: Stream[];
  governance: GovernanceLayer;
}
