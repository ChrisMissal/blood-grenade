import { Milestone, TransformationModel } from "./model.js";

function milestoneCheckbox(milestone: Milestone): string {
  if (milestone.status === "done") return "[x]";
  if (milestone.status === "in-progress") return "[~]";
  return "[ ]";
}

function blockers(model: TransformationModel): string[] {
  return model.streams
    .filter(stream => stream.status !== "completed")
    .flatMap(stream => stream.milestones.filter(m => m.status !== "done").map(m => `${stream.name}: ${m.title}`));
}

export function generateTransformationMarkdown(model: TransformationModel): string {
  const streamSections = model.streams
    .map(stream => {
      const milestones = stream.milestones.map(ms => `  - ${milestoneCheckbox(ms)} ${ms.title}`).join("\n");
      return [`## ${stream.name}`, `- Description: ${stream.description}`, `- Owner: ${stream.owner}`, "- Milestones checklist:", milestones || "  - _No milestones defined_"].join("\n");
    })
    .join("\n\n");

  const convergenceCriteria = [
    "- All active streams have no remaining `todo` milestones.",
    "- Quality gates pass for stream-related repositories.",
    "- Governance rules are applied consistently across stream branches.",
  ];

  const blockList = blockers(model);

  return [
    "# Transformation Overview",
    `Current State: ${model.currentState}`,
    `Target State: ${model.targetState}`,
    `Current Phase: ${model.phase}`,
    "",
    "# Active Streams",
    streamSections || "No streams defined.",
    "",
    "# Governance Rules",
    "## Automation Rules",
    ...model.governance.automationRules.map(rule => `- ${rule}`),
    "## Source Control Rules",
    ...model.governance.sourceControlRules.map(rule => `- ${rule}`),
    "## Quality Gates",
    ...model.governance.qualityGates.map(rule => `- ${rule}`),
    "",
    "# Convergence Criteria",
    ...convergenceCriteria,
    "",
    "# Checklist Summary",
    `- Streams completed: ${model.streams.filter(s => s.status === "completed").length}/${model.streams.length}`,
    `- Milestones completed: ${model.streams.flatMap(s => s.milestones).filter(m => m.status === "done").length}/${model.streams.flatMap(s => s.milestones).length}`,
    `- Remaining blockers: ${blockList.length}`,
    ...blockList.map(item => `  - ${item}`),
    "",
  ].join("\n");
}

export function generateGovernanceMarkdown(model: TransformationModel): string {
  return [
    "# Governance",
    "",
    "## Automation Rules",
    ...model.governance.automationRules.map(rule => `- ${rule}`),
    "",
    "## Source Control Rules",
    ...model.governance.sourceControlRules.map(rule => `- ${rule}`),
    "",
    "## Quality Gates",
    ...model.governance.qualityGates.map(rule => `- ${rule}`),
    "",
  ].join("\n");
}
