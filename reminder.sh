#!/usr/bin/env bash
cd "$HOME/Desktop/BitbyBit/projects/job-hunter-dashboard" || exit 1
node tracker.js remind >> "$HOME/Desktop/BitbyBit/projects/job-hunter-dashboard/reminder.log" 2>&1