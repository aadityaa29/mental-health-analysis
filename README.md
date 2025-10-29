# Mental Health Analysis - Team Setup Guide

This guide explains how to set up the project repository for all team members and follow a standard workflow for contributions.

---

## 1. Fork the Repository

1. Go to the original repo: [https://github.com/aadityaa29/mental-health-analysis](https://github.com/aadityaa29/mental-health-analysis)
2. Click **Fork** (top-right corner) to create your own copy under your GitHub account.

---

## 2. Clone Your Fork Locally

```bash
git clone https://github.com/<your-username>/mental-health-analysis.git
cd mental-health-analysis
```
Replace <your-username> with your GitHub username.

## 3. Add the Original Repo as Upstream
```bash
git remote add upstream https://github.com/aadityaa29/mental-health-analysis.git
git remote -v
```

## 4. Keep Your Fork Updated
```bash
git fetch upstream
git checkout main             # or backend branch
git merge upstream/main       # merge latest changes
```

## 5. Work on Code and Commit Changes
```bash
git add .
git commit -m "Your Commit Message"
```

## 6. Push Branch to Your Fork
```bash
git push origin feature/<your-feature-name>
```

## 7. Open a Pull Request (PR)

1. Go to your fork on GitHub.

2. Click Compare & pull request.

3. Target branch: main or backend on the original repo (upstream).

4. Assign reviewers.

5. Wait for review and merge.

## 8. Team Rules

1. Always work on a feature branch.

2. Always fetch & merge upstream before starting work.

3. Push only to your fork.

4. Use Pull Requests to merge into main/backend.

5. Resolve conflicts locally if they occur.
