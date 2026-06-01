#!/usr/bin/env bash

cd "$HOME/Desktop/BitbyBit/projects/job-hunter-dashboard" || exit 1

saved=$(grep -o '"status": "saved"' data/jobs.json | wc -l)
applied=$(grep -o '"status": "applied"' data/jobs.json | wc -l)

notify-send \
"🚀 Job Hunt Reminder" \
"Saved: $saved | Applied: $applied. Time to apply for more jobs."

node tracker.js remind >> reminder.log 2>&1