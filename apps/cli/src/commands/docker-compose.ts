import { Command } from "commander";
import fs from "fs";
import path from "path";
import execa from "execa";

export function registerDockerComposeCommand(program: Command) {
  program
    .command("docker-compose <project> <service>")
    .description("Generate and run a docker-compose.yml for a given project and service, then test the container")
    .option("-p, --port <port>", "Host port to map", "5000")
    .option("--test-endpoint <endpoint>", "Endpoint to test after startup", "/health")
    .action(async (project: string, service: string, opts) => {
      const compose = {
        version: "3.8",
        services: {
          [service]: {
            build: {
              context: path.relative(process.cwd(), path.join("../../apps", service)),
            },
            ports: [ `${opts.port}:3000` ],
            environment: [
              `NODE_ENV=test`,
              `PORT=3000`,
            ],
            healthcheck: {
              test: ["CMD", "curl", "-f", `http://localhost:3000${opts.testEndpoint}`],
              interval: "5s",
              timeout: "3s",
              retries: 3,
            },
          },
        },
      };
      const tempDir = path.join("/tmp", `compose-${project}-${service}-${Date.now()}`);
      fs.mkdirSync(tempDir, { recursive: true });
      const composePath = path.join(tempDir, "docker-compose.yml");
      fs.writeFileSync(composePath, JSON.stringify(compose, null, 2));
      console.log(`Generated docker-compose.yml at ${composePath}`);
      try {
        await execa("docker", ["compose", "-f", composePath, "up", "-d", "--build"], { stdio: "inherit" });
        // Wait for health
        let healthy = false;
        const containerName = `${project}_${service}_1`;
        const start = Date.now();
        while (!healthy && Date.now() - start < 60000) {
          try {
            const { stdout } = await execa("docker", ["inspect", `--format={{.State.Health.Status}}`, containerName]);
            healthy = stdout.trim() === "healthy";
          } catch {}
          if (!healthy) await new Promise(res => setTimeout(res, 2000));
        }
        if (!healthy) throw new Error("Container did not become healthy in time");
        // Test endpoint
        const axios = require("axios");
        const res = await axios.get(`http://localhost:${opts.port}${opts.testEndpoint}`);
        console.log(`Endpoint response:`, res.data);
      } finally {
        await execa("docker", ["compose", "-f", composePath, "down"], { stdio: "inherit" });
      }
    });
}
