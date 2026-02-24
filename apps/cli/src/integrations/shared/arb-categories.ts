import type { ArbCategory } from "../../domain/inspect/models.js";

const EXPERIENCE_STEREOTYPES = new Set([
  "spa-app",
  "admin-app",
  "static-app",
  "public-api",
  "graphql-api",
  "internal-api",
]);

const INTEGRATION_STEREOTYPES = new Set([
  "api-integration",
  "file-integration",
  "webhook-integration",
]);

const DATA_STEREOTYPES = new Set([
  "relational-data-container",
  "analytics-data-container",
  "cache-container",
  "blob-container",
]);

const PROCESSING_STEREOTYPES = new Set([
  "etl-job",
  "scheduled-job",
  "batch-job",
  "event-job",
]);

const GOVERNANCE_STEREOTYPES = new Set([
  "logging-container",
  "metrics-container",
  "audit-container",
  "identity-provider",
  "auth-provider",
]);

export function inferArbCategory(name: string, type: string, stereotypes: string[]): ArbCategory {
  for (const stereotype of stereotypes) {
    if (EXPERIENCE_STEREOTYPES.has(stereotype)) {
      return "Experience";
    }
    if (INTEGRATION_STEREOTYPES.has(stereotype)) {
      return "Integration";
    }
    if (DATA_STEREOTYPES.has(stereotype)) {
      return "Data";
    }
    if (PROCESSING_STEREOTYPES.has(stereotype)) {
      return "Processing";
    }
    if (GOVERNANCE_STEREOTYPES.has(stereotype)) {
      return "Governance";
    }
  }

  if (type === "sql-job" || type === "data-job") {
    return "Processing";
  }
  if (type === "terraform-stack" || type === "container-image" || type === "container-compose") {
    return "Platform";
  }

  if (/(^|[-_])(queue|kafka|mq|rabbit|eventbus|bus|orchestrator|platform)($|[-_])/i.test(name)) {
    return "Platform";
  }
  if (/(^|[-_])(log|audit|trace|metric|telemetry|auth|identity)($|[-_])/i.test(name)) {
    return "Governance";
  }
  if (/(^|[-_])(etl|batch|worker|job|pipeline)($|[-_])/i.test(name)) {
    return "Processing";
  }
  if (/(^|[-_])(db|database|warehouse|cache|blob)($|[-_])/i.test(name)) {
    return "Data";
  }
  if (/(^|[-_])(integration|connector|adapter|webhook|api-client)($|[-_])/i.test(name)) {
    return "Integration";
  }
  if (/(^|[-_])(api|web|ui|frontend|graphql|admin|spa)($|[-_])/i.test(name)) {
    return "Experience";
  }

  return "Domain";
}
