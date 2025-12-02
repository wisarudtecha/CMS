#!/usr/bin/env node
import { execSync } from "child_process";
import { readFileSync, existsSync, writeFileSync, appendFileSync } from "fs";

function run(cmd) {
  return execSync(cmd, { encoding: "utf8" }).trim();
}

// Read version from package.json
const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const version = pkg.version;
const date = new Date().toISOString().split("T")[0];

// Get commit logs since last tag
// const log = run('git log --pretty=format:"%s" $(git describe --tags --abbrev=0)..HEAD');
// Get the latest tag
let lastTag = "";
try {
  lastTag = run("git describe --tags --abbrev=0");
} catch {
  // No tags yet, start from beginning
  lastTag = "";
}

// Get commit logs since last tag (or from HEAD if no tag)
const logCmd = lastTag
  ? `git log --pretty=format:"%s" ${lastTag}..HEAD`
  : `git log --pretty=format:"%s" HEAD`;
const log = run(logCmd);

const sections = {
  added: [],
  changed: [],
  fixed: [],
  removed: [],
  security: [],
};

log.split("\n").forEach((commit) => {
  const msg = commit.toLowerCase();

  if (msg.startsWith("feat")) sections.added.push(commit);
  else if (msg.startsWith("fix")) sections.fixed.push(commit);
  else if (msg.startsWith("perf") || msg.startsWith("refactor")) sections.changed.push(commit);
  else if (msg.startsWith("chore") || msg.startsWith("docs")) return;
  else if (msg.startsWith("remove")) sections.removed.push(commit);
  else if (msg.includes("security")) sections.security.push(commit);
});

// build JSON entry
const entry = {
  version,
  date,
  ...sections,
};

// --- Update changelog.json
const jsonPath = "./changelog.json";
let changelog = { versions: [] };

if (existsSync(jsonPath)) {
  changelog = JSON.parse(readFileSync(jsonPath));
}

changelog.versions.unshift(entry);
writeFileSync(jsonPath, JSON.stringify(changelog, null, 2));

console.log("Updated changelog.json");

// --- Update CHANGELOG.md
let md = `## [${version}] - ${date}\n`;

for (const key in sections) {
  if (sections[key].length === 0) continue;
  md += `### ${key.charAt(0).toUpperCase() + key.slice(1)}\n`;
  sections[key].forEach((item) => (md += `- ${item}\n`));
  md += "\n";
}

appendFileSync("CHANGELOG.md", md);
console.log("Updated CHANGELOG.md");
