import type { InspectorIntegration } from "../../domain/inspect/contracts.js";
import { AwsInspectorIntegrationStub } from "../../integrations/aws/inspector.js";
import { FilesystemInspectorIntegration } from "../../integrations/filesystem/inspector.js";
import { GithubInspectorIntegration } from "../../integrations/github/inspector.js";
import { RemoteAgentInspectorIntegrationStub } from "../../integrations/remote-agent/inspector.js";

export function getInspectorIntegrations(): InspectorIntegration[] {
  return [
    new FilesystemInspectorIntegration(),
    new AwsInspectorIntegrationStub(),
    new GithubInspectorIntegration(),
    new RemoteAgentInspectorIntegrationStub(),
  ];
}

export function resolveInspectorIntegration(name: string): InspectorIntegration {
  const integrations = getInspectorIntegrations();
  const match = integrations.find(integration => integration.name === name);
  if (!match) {
    const available = integrations.map(integration => integration.name).join(", ");
    throw new Error(`Unknown integration '${name}'. Available integrations: ${available}`);
  }
  return match;
}
