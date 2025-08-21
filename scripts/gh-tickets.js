#!/usr/bin/env node
/*
 Simple GitHub Issues CLI
 Commands:
  - list:   node scripts/gh-tickets.js list [--state open|closed|all] [--repo owner/name]
  - create: node scripts/gh-tickets.js create --title "..." [--body "..."] [--labels bug,help wanted] [--repo owner/name]
  - close:  node scripts/gh-tickets.js close --number 123 [--repo owner/name]

 Auth:
  - Requires a GitHub token with repo scope in env: GITHUB_TOKEN
 Repo resolution order:
  1) --repo owner/name
  2) env.GITHUB_REPOSITORY (owner/name)
  3) parse `git config --get remote.origin.url`
*/

const { Octokit } = require("@octokit/rest");
const yargs = require("yargs");
const { hideBin } = require("yargs/helpers");
const { execSync } = require("child_process");

function resolveRepo(cliRepo) {
  if (cliRepo) return parseOwnerRepo(cliRepo);
  if (process.env.GITHUB_REPOSITORY) return parseOwnerRepo(process.env.GITHUB_REPOSITORY);
  try {
    const url = execSync("git config --get remote.origin.url", { encoding: "utf8" }).trim();
    // Handle formats: git@github.com:owner/repo.git or https://github.com/owner/repo.git
    const match = url.match(/github\.com[/:]([^/]+)\/([^/.]+)(?:\.git)?$/i);
    if (match) return { owner: match[1], repo: match[2] };
  } catch (_) {}
  throw new Error("Unable to resolve repository. Use --repo owner/name or set GITHUB_REPOSITORY.");
}

function parseOwnerRepo(s) {
  const [owner, repo] = s.split("/");
  if (!owner || !repo) throw new Error("--repo must be in the form owner/name");
  return { owner, repo };
}

function getOctokit() {
  const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN;
  if (!token) {
    throw new Error("Missing GITHUB_TOKEN env. Create a Fine-grained PAT and export GITHUB_TOKEN.");
  }
  return new Octokit({ auth: token });
}

async function cmdList(argv) {
  const { owner, repo } = resolveRepo(argv.repo);
  const octokit = getOctokit();
  const state = argv.state || "open";
  const res = await octokit.issues.listForRepo({ owner, repo, state, per_page: 50 });
  if (!res.data.length) {
    console.log(`No ${state} issues in ${owner}/${repo}.`);
    return;
  }
  for (const issue of res.data) {
    const labels = (issue.labels || []).map(l => typeof l === "string" ? l : l.name).filter(Boolean).join(", ");
    console.log(`#${issue.number} [${issue.state}] ${issue.title}${labels ? " (" + labels + ")" : ""}`);
  }
}

async function cmdCreate(argv) {
  const { owner, repo } = resolveRepo(argv.repo);
  const octokit = getOctokit();
  if (!argv.title) throw new Error("--title is required for create");
  const labels = argv.labels ? argv.labels.split(",").map(s => s.trim()).filter(Boolean) : undefined;
  const res = await octokit.issues.create({ owner, repo, title: argv.title, body: argv.body, labels });
  console.log(`Created issue #${res.data.number}: ${res.data.html_url}`);
}

async function cmdClose(argv) {
  const { owner, repo } = resolveRepo(argv.repo);
  const octokit = getOctokit();
  if (!argv.number) throw new Error("--number is required for close");
  const res = await octokit.issues.update({ owner, repo, issue_number: Number(argv.number), state: "closed" });
  console.log(`Closed issue #${res.data.number}: ${res.data.html_url}`);
}

async function main() {
  const argv = yargs(hideBin(process.argv))
    .command("list", "List issues", y => y.option("state", { choices: ["open", "closed", "all"], default: "open" }))
    .command("create", "Create an issue", y => y.option("title", { type: "string", demandOption: true })
                                           .option("body", { type: "string" })
                                           .option("labels", { type: "string", describe: "comma separated" }))
    .command("close", "Close an issue", y => y.option("number", { type: "number", demandOption: true }))
    .option("repo", { type: "string", describe: "owner/name" })
    .demandCommand(1)
    .strict()
    .help()
    .argv;

  const cmd = argv._[0];
  try {
    if (cmd === "list") await cmdList(argv);
    else if (cmd === "create") await cmdCreate(argv);
    else if (cmd === "close") await cmdClose(argv);
  } catch (err) {
    console.error("Error:", err.message);
    process.exitCode = 1;
  }
}

main();
