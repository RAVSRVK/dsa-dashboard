# DSA Dashboard Plan

## Goal

Manage solved DSA problems through a small local web dashboard while keeping Markdown files as the source of truth in GitHub.

## How it will work

1. Start the local dashboard.
2. Browse the existing DSA folders and problem files.
3. Click **New problem**.
4. Choose an existing folder, such as `Arrays`, or create a new folder.
5. Fill in the short problem form.
6. Save the generated Markdown file in the selected folder.
7. Stage and commit the new file from the dashboard.
8. Push to GitHub using Git when ready.

## Folder behavior

The dashboard will use the folder structure already present in this directory. For example:

```text
dsa/
├── Arrays/
│   └── Remove duplicates in place.md
├── Strings/
└── Trees/
```

Choosing `Arrays` creates a file such as:

```text
Arrays/Contains duplicate.md
```

The dashboard will not create a separate database or move files into a new structure.

## Data storage

Markdown files are the database for the first version. This keeps the notes:

- readable directly in VS Code;
- visible and searchable on GitHub;
- versioned with Git;
- portable if the dashboard is removed later.

A database can be added later if statistics, tags, or spaced-repetition scheduling become complex enough to need one.

## Project direction

The dashboard will become a React and Node.js project after the GitHub repository is created.

```text
React frontend
	|
	v
Node.js API and Git service
	|
	+-- Reads and writes Markdown files
	+-- Reads the existing folder structure
	+-- Stages and commits changes
```

React will own the interactive dashboard, forms, note viewer, reminders, filters, and folder navigation. Node.js will own filesystem access and Git commands. The Markdown files will remain the source of truth, so the notes continue to work in VS Code and on GitHub.

The project should use a clean structure similar to:

```text
dsa-dashboard/
├── client/       # React application
├── server.js      # Node.js API and Git operations
├── Arrays/       # Markdown notes and folders
└── README.md
```

The exact structure can be adjusted after the new repository is shared.

## Application and hosting direction

Keep the React frontend, Node.js backend, dashboard code, and Markdown notes together as one application and one repository for now. This keeps setup simple and makes each feature change easy to test with the notes it manages. Consider hosting it later only if remote access, multiple devices, sharing, or accounts become useful. A database or separate frontend/backend deployments can be introduced at that point if the file-based model is no longer enough.

## First version

- Browse folders and Markdown files.
- Show problem counts.
- Create a problem from a form.
- Treat the problem number as optional because many useful identifiers are only names and URLs.
- Choose or create the destination folder.
- Generate a short Markdown note.
- Stage the created file.
- Commit with `Solve: <problem name>`.
- Open existing notes from the dashboard.

## React migration steps

1. Create or share the Git repository.
2. Move the current dashboard into a React frontend and Node.js backend.
3. Keep the current Markdown format and folder behavior.
4. Rebuild the problem browser and collapsible folders as React components.
5. Rebuild the new-problem form with validation and a live preview.
6. Keep stage and commit actions on the Node.js side.
7. Add tests for file creation, path safety, reminders, and Git actions.

## Ideas to keep

- Seven-day revisit reminders with a notification panel.
- Click a reminder to open the problem note.
- Collapsible folders for a growing problem library.
- Readable Markdown rendering instead of raw file text.
- Syntax-highlighted code blocks with copy buttons.
- Search by problem name, pattern, difficulty, or folder.
- Filter for problems due for review.
- Problem statistics by folder, difficulty, and pattern.
- Preview the generated note before saving.
- Search problems from the left sidebar by name, path, or pattern.
- Edit an existing note from the dashboard and preserve its original solved date.
- Use the LeetCode slug as the filename and remove the redundant URL field.
- Capture the problem in your own words instead of using a problem-number field.
- Add a dry-run iterations table with variables state, observation, and notes or changes.
- Select a reusable pattern from a dropdown or add a new pattern.
- Add one dry-run input value above the iterations table.
- Select time and space complexity from standard dropdown values.
- Move an existing problem when its folder is changed during editing.
- Separate Save, Stage, Commit, and Push actions when the workflow grows.
- Optional database only when file-based data becomes insufficient.

## Out of scope for the first version

- Automatic pushing to GitHub.
- User accounts or cloud hosting.
- A separate database.
- Replacing Markdown editing in VS Code.

## Example note

```md
# 26. Remove Duplicates from Sorted Array

**Link:** https://leetcode.com/problems/remove-duplicates-from-sorted-array/
**Difficulty:** Easy
**Pattern:** Two Pointers

## Key idea

`i` stores the index of the last unique value while `p` scans the array.

## Complexity

- **Time:** O(n)
- **Space:** O(1)

## Remember

The array is sorted, so a larger value means a new unique value.
```
