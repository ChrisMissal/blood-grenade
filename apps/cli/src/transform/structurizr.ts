import { TransformationModel } from "./model.js";

export function generateStructurizrDsl(model: TransformationModel): string {
  const streamSystems = model.streams
    .map((stream, index) => {
      const id = `Stream${index + 1}`;
      return [
        `    softwareSystem ${id} "${stream.name}"`,
        `    CurrentSystem -> ${id} "${stream.description}"`,
        `    ${id} -> TargetSystem "Contributes to target"`,
      ].join("\n");
    })
    .join("\n\n");

  return [
    "workspace {",
    "",
    "  model {",
    "    person Team",
    `    softwareSystem CurrentSystem "${model.currentState}"`,
    `    softwareSystem TargetSystem "${model.targetState}"`,
    "",
    "    CurrentSystem -> TargetSystem \"Transforms via streams\"",
    streamSystems,
    "  }",
    "",
    "  views {",
    "    systemContext CurrentSystem {",
    "      include *",
    "      autoLayout",
    "    }",
    "  }",
    "}",
    "",
  ].join("\n");
}
