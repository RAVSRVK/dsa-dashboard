# DSA Practice Desk

A local dashboard for managing solved data structures and algorithms problems as Markdown files.

The app gives you a focused interface for creating, browsing, searching, reviewing, and editing problem notes while keeping the files readable in VS Code and on GitHub.

## Description

DSA Practice Desk is a single local application made of a React dashboard and a Node.js server. It uses the existing folder structure as the problem library and Markdown files as the source of truth.

You can:

- create a new problem from a short form;
- choose the folder where the problem should be stored;
- browse and search your problem library;
- collapse folders as the library grows;
- read notes in a structured view;
- view code in a readable code panel;
- copy code or the complete note;
- edit an existing problem;
- receive seven-day revisit reminders;
- stage and commit new or updated notes through Git.

Use the LeetCode problem slug as the problem name and filename, for example `remove-duplicates-from-sorted-array.md`. The LeetCode URL does not need to be stored because the slug identifies the problem. The form also captures a short description in your own words.

## Current architecture

This is intentionally a single application for now:

```text
Browser dashboard
        |
        v
Node.js server
        |
        +-- Reads and writes Markdown files
        +-- Reads the existing folders
        +-- Runs Git stage and commit commands
```

There is no separate database. Markdown files are the data because they are portable, easy to review in Git, and visible directly on GitHub.

## Folder structure

The dashboard follows the folders already present in the project:

```text
dsa/
├── Arrays/
│   └── Kth largest integer.md
├── client/          # React and Vite dashboard
│   ├── src/
│   └── package.json
├── DSA dashboard plan.md
├── README.md
├── package.json
└── server.js        # Node.js API and Git operations
```

When you choose `Arrays` in the form, a problem such as `Contains duplicate` is saved as:

```text
Arrays/Contains duplicate.md
```

## Run locally

Requirements:

- Node.js 18 or newer
- Git, if you want to use stage and commit actions

Install the React dependencies once:

```powershell
Push-Location client
npm install
Pop-Location
```

For normal use, start the complete application from this directory:

```powershell
npm start
```

This builds the React client first and then starts the Node.js server. Open `http://localhost:3000`.

In a second terminal, start the React dashboard:

```powershell
Push-Location client
npm install
npm run dev
Pop-Location
```

Then open the Vite URL shown in the terminal, usually:

```text
http://localhost:5173
```

The React development server proxies API requests to the Node server at `http://localhost:3000`.

Run `npm run lint` to check the React code with Oxlint. The `client/.oxlintrc.json` file is only lint configuration; it is not needed for the app to run.

## Typical workflow

1. Click **New problem**.
2. Enter the problem slug, such as `remove-duplicates-from-sorted-array`.
3. Choose a difficulty, pattern, and folder.
4. Add the problem description, key idea, dry-run iterations, final code, complexity, and reminder.
6. Save the problem.
7. The app creates the Markdown file, stages it, and commits it.
8. Push to GitHub when you are ready.

For an existing note, select it from the sidebar and click **Edit**. Search by name, folder, or pattern using the sidebar search field.

## Markdown note format

Generated notes use a short format focused on recall:

~~~~md
# Remove Duplicates From Sorted Array

**Slug:** remove-duplicates-from-sorted-array
**Difficulty:** Easy
**Date solved:** 2026-09-20
**Pattern:** Two pointers

## Problem in my own words

Keep each unique value in place and return the number of unique values.

## Key idea

The idea worth remembering.

## Dry run

| Iteration | Variables state | Observation | Notes or changes |
| --- | --- | --- | --- |
| 1 | left=0, right=1 | Values are equal | Move right |

## Code

~~~javascript
// final solution
~~~~

## Complexity

- **Time:** O(n log n)
- **Space:** O(1)

## Remember

The mistake or detail to revisit.
~~~

## Future direction

The application will remain a single local app while the workflow is being developed. Hosting can be considered later if remote access, multiple devices, accounts, or sharing become useful.

Possible future additions:

- host the dashboard and API on a server;
- add authentication if it becomes shared;
- add a database only if file-based data is no longer enough;
- add richer statistics and spaced-repetition scheduling;
- separate frontend and backend deployment if the project needs it.

See [DSA dashboard plan.md](DSA%20dashboard%20plan.md) for the broader product and implementation plan.
