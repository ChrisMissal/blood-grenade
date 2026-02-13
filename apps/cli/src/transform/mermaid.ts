import { Stream, TransformationModel } from "./model.js";

function streamNodeId(stream: Stream): string {
  return `S_${stream.id.replace(/[^a-zA-Z0-9]/g, "_")}`;
}

function statusClass(status: Stream["status"]): string {
  if (status === "completed") return "completed";
  if (status === "active") return "active";
  if (status === "proposed") return "proposed";
  return "paused";
}

export function generateMermaid(model: TransformationModel): string {
  const edges = model.streams
    .flatMap(stream => {
      const node = streamNodeId(stream);
      return [
        `    Current --> ${node}[${stream.name}]`,
        `    ${node} --> Target`,
        `    Governance -. enforces .-> ${node}`,
        `    class ${node} ${statusClass(stream.status)}`,
      ];
    })
    .join("\n");

  return [
    "flowchart TD",
    "    Current[Current]",
    "    Target[Target]",
    "    Governance{Governance}",
    edges,
    "",
    "    classDef active fill:#fff3cd,stroke:#ff9800,stroke-width:2px",
    "    classDef completed fill:#d1fae5,stroke:#10b981,stroke-width:2px",
    "    classDef proposed fill:#ffffff,stroke:#64748b,stroke-dasharray: 5 5",
    "    classDef paused fill:#e5e7eb,stroke:#6b7280,stroke-dasharray: 2 6",
  ].join("\n");
}
