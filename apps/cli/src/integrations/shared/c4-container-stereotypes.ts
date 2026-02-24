export function inferC4ContainerStereotype(name: string, inferredType: string): string {
  const normalizedName = name.toLowerCase();

  if (/(^|[-_])graphql($|[-_])|(^|[-_])gql($|[-_])/.test(normalizedName)) {
    return "graphql-api";
  }

  if (/(^|[-_])(internal|private|backoffice)[-_]?api($|[-_])/.test(normalizedName)) {
    return "internal-api";
  }

  if (/(^|[-_])(public|external|open)[-_]?api($|[-_])/.test(normalizedName)) {
    return "public-api";
  }

  if (/(^|[-_])(etl|pipeline|ingest|transform|loader)($|[-_])/.test(normalizedName)) {
    return "etl-job";
  }

  if (/(^|[-_])(cron|schedule|scheduler)($|[-_])/.test(normalizedName)) {
    return "scheduled-job";
  }

  if (/(^|[-_])batch($|[-_])/.test(normalizedName)) {
    return "batch-job";
  }

  if (/(^|[-_])(event|stream|consumer|kafka|pubsub|queue|worker)($|[-_])/.test(normalizedName)) {
    return "event-job";
  }

  if (/(^|[-_])webhook(s)?($|[-_])/.test(normalizedName)) {
    return "webhook-integration";
  }

  if (/(^|[-_])(sftp|ftp|file|csv|xlsx|import|export|feed)($|[-_])/.test(normalizedName)) {
    return "file-integration";
  }

  if (/(^|[-_])(integration|connector|adapter|client)($|[-_])/.test(normalizedName)) {
    return "api-integration";
  }

  if (/(^|[-_])(postgres|mysql|mariadb|sqlserver|oracle|db|database|relational)($|[-_])/.test(normalizedName)) {
    return "relational-data-container";
  }

  if (/(^|[-_])(warehouse|analytics|bi|snowflake|bigquery|redshift|clickhouse|datalake)($|[-_])/.test(normalizedName)) {
    return "analytics-data-container";
  }

  if (/(^|[-_])(cache|redis|memcache|memcached)($|[-_])/.test(normalizedName)) {
    return "cache-container";
  }

  if (/(^|[-_])(blob|object[-_]?store|s3|minio|bucket)($|[-_])/.test(normalizedName)) {
    return "blob-container";
  }

  if (/(^|[-_])(admin|backoffice|ops|operator)($|[-_])/.test(normalizedName)) {
    return "admin-app";
  }

  if (/(^|[-_])(spa|frontend|web|ui|react|vue|angular)($|[-_])/.test(normalizedName)) {
    return "spa-app";
  }

  if (/(^|[-_])(static|landing|docs|website|jamstack)($|[-_])/.test(normalizedName)) {
    return "static-app";
  }

  if (/(^|[-_])(log|logging|loki|elk)($|[-_])/.test(normalizedName)) {
    return "logging-container";
  }

  if (/(^|[-_])(metric|metrics|prometheus|grafana|telemetry)($|[-_])/.test(normalizedName)) {
    return "metrics-container";
  }

  if (/(^|[-_])(audit|compliance|trail)($|[-_])/.test(normalizedName)) {
    return "audit-container";
  }

  if (/(^|[-_])(identity|idp)($|[-_])/.test(normalizedName)) {
    return "identity-provider";
  }

  if (/(^|[-_])(auth|oauth|oidc|sso)($|[-_])/.test(normalizedName)) {
    return "auth-provider";
  }

  if (/(^|[-_])(api|service|backend)($|[-_])/.test(normalizedName)) {
    return "public-api";
  }

  if (inferredType === "terraform-stack") {
    return "c4-container:infrastructure";
  }

  if (inferredType === "container-compose") {
    return "c4-container:orchestrator";
  }

  return "c4-container:application";
}
