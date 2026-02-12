// Core container and app abstractions

export interface AppConfig {
  name: string;
  entry?: string;
  endpoints?: Array<{
    name: string;
    path: string;
    method: string;
    expect?: { status?: number; body?: any };
  }>;
  // ...other app-specific config
}

export interface ContainerConfig {
  name: string;
  app?: AppConfig;
  apps?: AppConfig[];
  image?: string;
  ports?: number[];
  env?: Record<string, string>;
  healthcheck?: {
    path: string;
    interval?: string;
    timeout?: string;
    retries?: number;
  };
  // ...other container-specific config
}

export class App {
  name: string;
  entry?: string;
  endpoints: AppConfig["endpoints"];
  constructor(cfg: AppConfig) {
    this.name = cfg.name;
    this.entry = cfg.entry;
    this.endpoints = cfg.endpoints || [];
  }
}

export class Container {
  name: string;
  app?: App;
  apps?: App[];
  image?: string;
  ports: number[];
  env: Record<string, string>;
  healthcheck?: ContainerConfig["healthcheck"];
  constructor(cfg: ContainerConfig) {
    this.name = cfg.name;
    this.image = cfg.image;
    this.ports = cfg.ports || [];
    this.env = cfg.env || {};
    this.healthcheck = cfg.healthcheck;
    if (cfg.app) this.app = new App(cfg.app);
    if (cfg.apps) this.apps = cfg.apps.map(a => new App(a));
  }
}
