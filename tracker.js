#!/usr/bin/env node
const fs = require("fs");
const path = require("path");

const DATA_DIR = path.join(__dirname, "data");
const DATA_FILE = path.join(DATA_DIR, "jobs.json");

function ensureStore() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, "[]", "utf8");
}

function loadJobs() {
  ensureStore();
  return JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
}

function saveJobs(jobs) {
  ensureStore();
  fs.writeFileSync(DATA_FILE, JSON.stringify(jobs, null, 2), "utf8");
}

function parseArgs(argv) {
  const args = {};
  const positionals = [];
  for (let i = 0; i < argv.length; i++) {
    const token = argv[i];
    if (token.startsWith("--")) {
      const key = token.slice(2);
      const next = argv[i + 1];
      if (!next || next.startsWith("--")) {
        args[key] = true;
      } else {
        args[key] = next;
        i++;
      }
    } else {
      positionals.push(token);
    }
  }
  return { args, positionals };
}

function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

function nowISO() {
  return new Date().toISOString();
}

function makeId() {
  return `J${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`.toUpperCase();
}

function help() {
  console.log(`
Usage:
  node tracker.js add --company "ABC" --role "Frontend Engineer" --platform "Naukri" --link "https://..." --status "saved" --followup "2026-06-05"
  node tracker.js list
  node tracker.js list --status applied
  node tracker.js done JOB_ID
  node tracker.js followups
  node tracker.js remind

Statuses:
  saved | applied | interview | rejected | follow-up
`);
}

function addJob(args) {
  const jobs = loadJobs();
  const job = {
    id: makeId(),
    company: args.company || "",
    role: args.role || "",
    platform: args.platform || "",
    link: args.link || "",
    status: args.status || "saved",
    followup: args.followup || "",
    notes: args.notes || "",
    createdAt: nowISO(),
    updatedAt: nowISO(),
  };

  if (!job.company || !job.role || !job.platform) {
    console.log("Missing required fields: --company, --role, --platform");
    process.exit(1);
  }

  jobs.unshift(job);
  saveJobs(jobs);
  console.log(`Added: ${job.id}`);
}

function listJobs(status) {
  const jobs = loadJobs()
    .filter((job) => !status || job.status === status)
    .sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));

  if (!jobs.length) {
    console.log("No jobs found.");
    return;
  }

  for (const job of jobs) {
    console.log(
      [
        job.id,
        `[${job.status}]`,
        job.company,
        "-",
        job.role,
        `(${job.platform})`,
        job.followup ? `follow-up: ${job.followup}` : "",
      ]
        .filter(Boolean)
        .join(" ")
    );
  }
}

function doneJob(id) {
  const jobs = loadJobs();
  const job = jobs.find((j) => j.id === id);
  if (!job) {
    console.log("Job not found.");
    process.exit(1);
  }
  job.status = "applied";
  job.updatedAt = nowISO();
  saveJobs(jobs);
  console.log(`Updated ${id} to applied`);
}

function followups() {
  const jobs = loadJobs();
  const today = todayISO();

  const due = jobs.filter(
    (job) =>
      job.followup &&
      job.followup <= today &&
      !["rejected"].includes(job.status)
  );

  if (!due.length) {
    console.log("No follow-ups due today.");
    return;
  }

  console.log("Follow-ups due:");
  for (const job of due) {
    console.log(
      `${job.id} [${job.status}] ${job.company} - ${job.role} (${job.platform}) follow-up: ${job.followup}`
    );
  }
}

function remind() {
  const jobs = loadJobs();
  const today = todayISO();
  const saved = jobs.filter((j) => j.status === "saved").length;
  const applied = jobs.filter((j) => j.status === "applied").length;
  const followUpDue = jobs.filter((j) => j.followup && j.followup <= today && j.status !== "rejected").length;

  console.log(`Job Search Reminder (${today})`);
  console.log(`Saved: ${saved}`);
  console.log(`Applied: ${applied}`);
  console.log(`Follow-ups due: ${followUpDue}`);
  console.log("");
  console.log("1) Refresh Naukri profile");
  console.log("2) Check fresh jobs");
  console.log("3) Apply to 5–10 relevant roles");
  console.log("4) Send follow-ups");
  console.log("");
  followups();
}

const [, , command = "help", ...rest] = process.argv;
const { args, positionals } = parseArgs(rest);

switch (command) {
  case "add":
    addJob(args);
    break;
  case "list":
    listJobs(args.status);
    break;
  case "done":
    doneJob(positionals[0]);
    break;
  case "followups":
    followups();
    break;
  case "remind":
    remind();
    break;
  default:
    help();
}