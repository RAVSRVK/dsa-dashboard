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

## Phase 1: Current Application

The first phase is a local React and Node.js application stored in one GitHub repository. Markdown files remain the source of truth.

### Problem creation and editing

- Create a problem from the dashboard.
- Use the LeetCode slug as the filename, such as `remove-duplicates-from-sorted-array.md`.
- Generate the LeetCode URL automatically from the slug.
- Select a difficulty, folder, and pattern.
- Create a new folder from the folder dropdown, then immediately add problems to it.
- Use `Two pointers` as the initial pattern and add new patterns from the dropdown when needed.
- Write the problem in your own words.
- Add multiple problem examples with input, output, and explanation.
- Add a key idea, code, complexity, and remember notes.
- Edit existing problems without resetting their original solved date.
- Move a problem when its folder changes.
- Delete a problem with confirmation.

### Dry-run learning workflow

- Keep multiple dry-run examples by default.
- Give every dry-run example its own input.
- Record multiple iterations for each input.
- Use configurable columns such as variables state, observation, and notes or changes.
- Add or remove examples, iterations, and columns.
- Save dry-run data as Markdown tables.

### Dashboard workflow

- Browse the existing folders as a nested tree.
- Group problems by pattern inside each folder.
- Collapse folders and pattern groups.
- Search by problem name, folder, or pattern.
- View structured Markdown instead of raw file text.
- Show code blocks, Markdown formatting, examples, complexity, and dry-run tables clearly.
- Open the generated LeetCode link while viewing a problem.
- Show seven-day revisit reminders and open a problem from a reminder.

### Git workflow

- Stage created, edited, moved, or deleted notes.
- Commit changes with generated messages such as `Solve: <problem name>` or `Update: <problem name>`.
- Keep pushing to GitHub as a deliberate user action.

### Current project structure

```text
dsa-dashboard/
├── client/       # React and Vite dashboard
├── server.js      # Node.js API, filesystem, and Git operations
├── Arrays/       # Markdown notes and problem folders
├── README.md
└── DSA dashboard plan.md
```

## Phase 2: Fetch Problem Details (Pending)

The dashboard should be able to prefill problem information when a user enters a LeetCode slug or URL.

### Proposed flow

1. Enter a slug or LeetCode URL.
2. Click **Fetch problem details**.
3. The Node.js server fetches the available LeetCode problem data.
4. Preview the fetched information before saving.
5. Allow every fetched field to be edited.
6. Save the final Markdown note only after confirmation.

### Fields that may be fetched

- Problem title.
- Problem description.
- Examples with input, output, and explanation.
- Difficulty.
- LeetCode URL generated from the slug.

### Fields that remain user-owned

- Pattern.
- Key idea.
- Dry-run inputs and iterations.
- Code.
- Time and space complexity.
- Mistakes and remember notes.

### Risks and fallback

LeetCode may block automated requests, rate-limit the server, require dynamic requests, or change its page structure. Fetched content must therefore be previewed and editable. If direct fetching is unreliable, add a manual paste/import option or use a stable problem-data API instead.

## Folder Creation (Implemented)

The folder dropdown includes an explicit **Create new folder** option, similar to adding a new pattern. Selecting it prompts for a folder name, creates the directory, and selects it for the current problem.

### Proposed flow

1. Choose **Create new folder** from the folder control.
2. Enter the folder name.
3. Create the matching directory under the DSA workspace.
4. Make the new folder available immediately when adding or moving problems, so problems can be saved there.

The existing folder structure and Markdown files remain the source of truth.

## React migration steps

1. Create or share the Git repository.
2. Move the current dashboard into a React frontend and Node.js backend.
3. Keep the current Markdown format and folder behavior.
4. Rebuild the problem browser and collapsible folders as React components.
5. Rebuild the new-problem form with validation and a live preview.
6. Keep stage and commit actions on the Node.js side.
7. Add tests for file creation, path safety, reminders, and Git actions.

## Future Ideas

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
