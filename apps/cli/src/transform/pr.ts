import path from "node:path";
import { mkdir, writeFile } from "node:fs/promises";
import execa from "execa";
import { TransformationModel } from "./model.js";
import { generateTransformationMarkdown } from "./markdown.js";

function parseGithubSlug(remoteUrl: string): string {
  const ssh = remoteUrl.match(/github\.com:(.+?)\.git$/);
  if (ssh?.[1]) return ssh[1];
  const https = remoteUrl.match(/github\.com\/(.+?)\.git$/);
  if (https?.[1]) return https[1];
  throw new Error(`Unsupported GitHub remote URL: ${remoteUrl}`);
}

function summarize(model: TransformationModel) {
  const activeStreams = model.streams.filter(s => s.status === "active");
  const completedMilestones = model.streams
    .flatMap(s => s.milestones.map(m => ({ stream: s.name, milestone: m })))
    .filter(item => item.milestone.status === "done");
  const blockers = model.streams
    .flatMap(s => s.milestones.filter(m => m.status !== "done").map(m => `${s.name}: ${m.title}`));

  return { activeStreams, completedMilestones, blockers };
}

function prBody(model: TransformationModel): string {
  const { activeStreams, completedMilestones, blockers } = summarize(model);
  return [
    `## Transformation Update: ${model.phase} phase`,
    "",
    "### Summary of active streams",
    ...activeStreams.map(s => `- ${s.name} (${s.owner})`),
    "",
    "### Completed milestones",
    ...completedMilestones.map(item => `- ${item.stream}: ${item.milestone.title}`),
    "",
    "### Remaining blockers",
    ...blockers.map(b => `- ${b}`),
    "",
    "### Checklist summary",
    `- Streams completed: ${model.streams.filter(s => s.status === "completed").length}/${model.streams.length}`,
    `- Milestones completed: ${completedMilestones.length}/${model.streams.flatMap(s => s.milestones).length}`,
  ].join("\n");
}

export async function createTransformationPr(model: TransformationModel, repoPath: string): Promise<void> {
  const branch = `transformation/${model.phase}`;
  const docsDir = path.join(repoPath, "docs");
  const docPath = path.join(docsDir, "transformation.md");

  await mkdir(docsDir, { recursive: true });
  await writeFile(docPath, generateTransformationMarkdown(model), "utf8");

  await execa("git", ["checkout", "-B", branch], { cwd: repoPath });
  await execa("git", ["add", "docs/transformation.md"], { cwd: repoPath });
  await execa("git", ["commit", "-m", "chore(transformation): update phase + stream status"], { cwd: repoPath });
  await execa("git", ["push", "-u", "origin", branch], { cwd: repoPath });

  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error("GITHUB_TOKEN is required to open PRs.");
  }

  const { stdout } = await execa("git", ["remote", "get-url", "origin"], { cwd: repoPath });
  const slug = parseGithubSlug(stdout.trim());
  const [owner, repo] = slug.split("/");

  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      title: `Transformation Update: ${model.phase} phase`,
      head: branch,
      base: "main",
      body: prBody(model),
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to open GitHub PR: ${response.status} ${text}`);
  }
}
