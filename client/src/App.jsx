import { useEffect, useState } from "react";
import "./App.css";

const defaultIterationColumns = [
  { id: "variables", label: "Variables state" },
  { id: "observation", label: "Observation" },
  { id: "notes", label: "Notes or changes" },
];
const defaultPatterns = ["Two pointers", "Sliding window", "Hash map", "Sorting", "Binary search", "Stack", "Queue", "Tree BFS", "Tree DFS", "Dynamic programming", "Graph BFS", "Graph DFS"];
const complexityOptions = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n + m)", "O(2ⁿ)", "Custom"];

const blankIteration = (columns = defaultIterationColumns) =>
  Object.fromEntries(columns.map((column) => [column.id, ""]));

function App() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [patterns, setPatterns] = useState(() => [...defaultPatterns, ...(JSON.parse(localStorage.getItem("dsa-patterns") || "[]"))]);
  const [form, setForm] = useState({
    name: "",
    folder: "",
    difficulty: "Easy",
    pattern: "",
    customPattern: "",
    description: "",
    keyIdea: "",
    dryRunInput: "",
    iterationColumns: defaultIterationColumns,
    iterations: [blankIteration()],
    code: "",
    time: "",
    space: "",
    remember: "",
  });

  const loadEntries = async () => {
    const nextEntries = (await fetch("/api/tree").then((response) => response.json())).entries;
    setEntries(nextEntries);
    return nextEntries;
  };
  useEffect(() => {
    loadEntries();
  }, []);

  const files = entries.filter((entry) => entry.type === "file");
  const folders = entries.filter((entry) => entry.type === "folder");
  const visible = files.filter((file) =>
    `${file.name} ${file.path} ${file.pattern}`
      .toLowerCase()
      .includes(search.toLowerCase()),
  );
  const due = files.filter(
    (file) =>
      file.dateSolved &&
      Date.now() - new Date(`${file.dateSolved}T00:00:00`).getTime() >=
        7 * 86400000,
  );
  const availablePatterns = [...new Set([...patterns, ...files.map((file) => file.pattern).filter(Boolean)])];
  const openFile = async (file) =>
    setSelected({
      ...file,
      content: (
        await fetch(`/api/file?path=${encodeURIComponent(file.path)}`).then(
          (response) => response.json(),
        )
      ).content,
    });
  const updateField = (event) =>
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  const startNew = () => {
    setEditing(null);
    setForm({
      name: "",
      folder: "",
      difficulty: "Easy",
      pattern: "",
      customPattern: "",
      description: "",
      keyIdea: "",
      dryRunInput: "",
      iterationColumns: defaultIterationColumns,
      iterations: [blankIteration()],
      code: "",
      time: "",
      space: "",
      remember: "",
    });
    setFormOpen(true);
  };
  const startEdit = () => {
    const content = selected.content;
    const slug = content.match(/^\*\*Slug:\*\*\s*(.*)$/im)?.[1] || selected.name.replace(/\.md$/i, "");
    const value = (name) =>
      content.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.*)`, "i"))?.[1] || "";
    const section = (name) =>
      content
        .match(new RegExp(`## ${name}\\s+([\\s\\S]*?)(?=\\n## |$)`, "i"))?.[1]
        .replace(/```javascript|```/g, "")
        .trim() || "";
    const dryRun = section("Dry run");
    const tableRows = dryRun.split("\n").filter((line) => line.trim().startsWith("|"));
    const tableHeaders = tableRows[0]?.split("|").slice(1, -1).map((header) => header.trim()) || [];
    const parsedColumns = tableHeaders.slice(1).map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `column-${Math.random()}`, label }));
    const columns = parsedColumns.length ? parsedColumns : defaultIterationColumns;
    const iterations = tableRows.slice(2).map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/<br>/g, "\n"));
      return Object.fromEntries(columns.map((column, index) => [column.id, cells[index + 1] || ""]));
    });
    setEditing(selected);
    setForm({
      name: slug,
      folder: selected.path.split("/").slice(0, -1).join("/"),
      difficulty: value("Difficulty"),
      pattern: value("Pattern"),
      customPattern: "",
      description: section("Problem in my own words"),
      keyIdea: section("Key idea"),
      dryRunInput: content.match(/\*\*Input:\*\*\s*(.*)/i)?.[1] || "",
      iterationColumns: columns,
      iterations: iterations.length ? iterations : [blankIteration(columns)],
      code: section("Code"),
      time: section("Complexity").match(/Time:\*\*\s*(.*)/i)?.[1] || "",
      space: section("Complexity").match(/Space:\*\*\s*(.*)/i)?.[1] || "",
      remember: section("Remember"),
    });
    setFormOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    const payload = { ...form, pattern: form.pattern === "__custom__" ? form.customPattern : form.pattern, dateSolved: editing?.dateSolved };
    if (editing) payload.path = editing.path;
    const response = await fetch("/api/problems", {
      method: editing ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const saved = await response.json();
    await fetch("/api/git/stage", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: saved.path }),
    });
    await fetch("/api/git/commit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: `${editing ? "Update" : "Solve"}: ${form.name}`,
      }),
    });
    setFormOpen(false);
    const nextEntries = await loadEntries();
    const refreshed = nextEntries.find((entry) => entry.path === saved.path);
    if (refreshed) openFile(refreshed);
  };
  const updateIteration = (index, field, value) =>
    setForm((current) => ({
      ...current,
      iterations: current.iterations.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item),
    }));
  const addIteration = () =>
    setForm((current) => ({
      ...current,
      iterations: [...current.iterations, blankIteration(current.iterationColumns)],
    }));
  const removeIteration = (index) =>
    setForm((current) => ({
      ...current,
      iterations: current.iterations.length === 1 ? current.iterations : current.iterations.filter((_, itemIndex) => itemIndex !== index),
    }));
  const addIterationColumn = () =>
    setForm((current) => {
      const id = `column-${current.iterationColumns.length + 1}`;
      const column = { id, label: `Column ${current.iterationColumns.length + 1}` };
      return { ...current, iterationColumns: [...current.iterationColumns, column], iterations: current.iterations.map((item) => ({ ...item, [id]: "" })) };
    });
  const updateIterationColumn = (index, label) =>
    setForm((current) => ({ ...current, iterationColumns: current.iterationColumns.map((column, columnIndex) => columnIndex === index ? { ...column, label } : column) }));
  const removeIterationColumn = (index) =>
    setForm((current) => {
      if (current.iterationColumns.length === 1) return current;
      const columnId = current.iterationColumns[index].id;
      return { ...current, iterationColumns: current.iterationColumns.filter((_, columnIndex) => columnIndex !== index), iterations: current.iterations.map((item) => { const next = { ...item }; delete next[columnId]; return next; }) };
    });
  const deleteProblem = async () => {
    if (!selected || !window.confirm(`Delete ${selected.name.replace(/\.md$/i, "")}? This cannot be undone.`)) return;
    await fetch("/api/problems", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: selected.path }) });
    await fetch("/api/git/commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Delete: ${selected.name.replace(/\.md$/i, "")}` }) });
    setSelected(null);
    await loadEntries();
  };
  const addPattern = () => {
    const pattern = window.prompt("Pattern name");
    if (!pattern?.trim()) return;
    const next = [...new Set([...patterns, pattern.trim()])];
    setPatterns(next);
    localStorage.setItem("dsa-patterns", JSON.stringify(next));
    setForm((current) => ({ ...current, pattern: pattern.trim(), customPattern: "" }));
  };

  return (
    <>
      <header>
        <div>
          <small>LOCAL KNOWLEDGE BASE</small>
          <h1>DSA Practice Desk</h1>
          <p>Your problems, organized for the long run.</p>
        </div>
        <button onClick={startNew}>+ New problem</button>
      </header>
      <main>
        <aside>
          <div className="library-title">
            <b>Library</b>
            <span>
              {files.filter((file) => file.dateSolved).length} problems
            </span>
          </div>
          <input
            className="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search problems..."
          />
          <button
            className="reminders"
            onClick={() => setRemindersOpen(!remindersOpen)}
          >
            Reminders {due.length ? <b>{due.length}</b> : null}
          </button>
          {remindersOpen && (
            <div className="reminder-list">
              {due.map((file) => (
                <button
                  key={file.path}
                  onClick={() => {
                    openFile(file);
                    setRemindersOpen(false);
                  }}
                >
                  {file.name.replace(".md", "")}
                  <small>{file.dateSolved}</small>
                </button>
              ))}
            </div>
          )}
          <nav>
            {visible
              .filter((file) => !file.path.includes("/"))
              .map((file) => (
                <button key={file.path} onClick={() => openFile(file)}>
                  {file.name.replace(".md", "")}
                </button>
              ))}
            {folders.map((folder) => {
              const folderFiles = visible.filter(
                (file) =>
                  file.path.startsWith(`${folder.path}/`) &&
                  !file.path.slice(folder.path.length + 1).includes("/"),
              );
              return (
                <details key={folder.path} open>
                  <summary>{folder.path}</summary>
                  {folderFiles.map((file) => (
                    <button key={file.path} onClick={() => openFile(file)}>
                      {file.name.replace(".md", "")}
                    </button>
                  ))}
                </details>
              );
            })}
          </nav>
        </aside>
        <section className="content">
          {selected ? (
            <Note file={selected} onEdit={startEdit} onDelete={deleteProblem} />
          ) : (
            <div className="empty">
              <span>01</span>
              <h2>
                Build the habit,
                <br />
                keep the proof.
              </h2>
              <p>
                Select a problem or capture the next one in a few focused
                fields.
              </p>
            </div>
          )}
        </section>
      </main>
      {formOpen && (
        <Form
          values={form}
          folders={folders}
          editing={editing}
          onChange={updateField}
          onSubmit={save}
          onClose={() => setFormOpen(false)}
          onIterationChange={updateIteration}
          onAddIteration={addIteration}
          onRemoveIteration={removeIteration}
          onAddColumn={addIterationColumn}
          onUpdateColumn={updateIterationColumn}
          onRemoveColumn={removeIterationColumn}
          patterns={availablePatterns}
          onAddPattern={addPattern}
        />
      )}
    </>
  );
}

function Note({ file, onEdit, onDelete }) {
  const title = file.content.match(/^#\s+(.+)$/m)?.[1] || file.name.replace(".md", "");
  const sections = file.content.split(/^## /m).slice(1);
  return (
    <article className="note">
      <small>{file.path}</small>
      <div className="note-title">
        <h2>{title}</h2>
        <div className="note-actions"><button onClick={onEdit}>Edit</button><button className="delete-button" onClick={onDelete}>Delete</button></div>
      </div>
      <div className="meta">
        {file.content
          .match(/\*\*(Link|Difficulty|Date solved|Pattern):\*\*\s*(.*)/g)
          ?.map((item) => (
            <span key={item}>{item.replaceAll("**", "")}</span>
          ))}
      </div>
      {sections.map((section) => {
        const [heading, ...lines] = section.split("\n");
        const value = lines.join("\n").trim();
        if (heading.toLowerCase() === "dry run") {
          const tableRows = value.split("\n").filter((line) => line.trim().startsWith("|"));
          const headers = tableRows[0]?.split("|").slice(1, -1).map((cell) => cell.trim()) || [];
          const rows = tableRows.slice(2).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/<br>/g, "\n")));
          return <section key={heading}><h3>{heading}</h3><div className="dry-run-table" style={{ "--iteration-columns": `85px repeat(${Math.max(headers.length - 1, 1)}, minmax(180px, 1fr))` }}><div className="dry-run-row dry-run-header">{headers.map((header) => <span key={header}>{header}</span>)}</div>{rows.map((row, index) => <div className="dry-run-row" key={index}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>)}</div></section>;
        }
        return heading.toLowerCase() === "code" ? (
          <pre key={heading}>
            <code>{value.replace(/```javascript|```/g, "").trim()}</code>
          </pre>
        ) : (
          <section key={heading}>
            <h3>{heading}</h3>
            <p>{value}</p>
          </section>
        );
      })}
    </article>
  );
}
function Form({ values, folders, editing, onChange, onSubmit, onClose, onIterationChange, onAddIteration, onRemoveIteration, onAddColumn, onUpdateColumn, onRemoveColumn, patterns, onAddPattern }) {
  return (
    <div className="modal">
      <form onSubmit={onSubmit}>
        <button type="button" className="close" onClick={onClose}>
          ×
        </button>
        <small>{editing ? "EDIT NOTE" : "NEW ENTRY"}</small>
        <h2>{editing ? "Update this problem" : "Capture a problem"}</h2>
        <div className="fields">
          {[
            ["name", "Problem name"],
            ["description", "Problem in my own words"],
            ["keyIdea", "Key idea"],
            ["code", "Code"],
            ["remember", "Remember"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              {name === "description" || name === "keyIdea" || name === "code" || name === "remember" ? (
                <textarea
                  name={name}
                  value={values[name]}
                  onChange={onChange}
                />
              ) : (
                <input
                  name={name}
                  value={values[name]}
                  onChange={onChange}
                  required={name === "name"}
                />
              )}
            </label>
          ))}
          <label>Pattern
            <div className="pattern-control"><select name="pattern" value={values.pattern} onChange={onChange}><option value="">Select pattern</option>{patterns.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}<option value="__custom__">+ Add new pattern</option></select>{values.pattern === "__custom__" && <input name="customPattern" value={values.customPattern} onChange={onChange} placeholder="New pattern name" />}<button type="button" className="add-pattern" onClick={onAddPattern}>+ Add new pattern</button></div>
          </label>
          <label>Time complexity<select name="time" value={values.time} onChange={onChange}>{complexityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <label>Space complexity<select name="space" value={values.space} onChange={onChange}>{complexityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label>
          <fieldset className="iterations-fieldset">
            <legend>Dry-run iterations</legend>
            <p className="field-help">Capture what changed after each pass through the example.</p>
            <label>Input used for dry run<input name="dryRunInput" value={values.dryRunInput} onChange={onChange} placeholder="[0, 0, 1, 1, 2]" /></label>
            <div className="iteration-table">
              <div className="iteration-table-scroll"><div className="iteration-row iteration-header" style={{ gridTemplateColumns: `85px repeat(${values.iterationColumns.length}, minmax(180px, 1fr)) 32px` }}><span>Iteration</span>{values.iterationColumns.map((column, index) => <span className="column-heading" key={column.id}><input value={column.label} onChange={(event) => onUpdateColumn(index, event.target.value)} aria-label={`Column ${index + 1} name`} /><button type="button" onClick={() => onRemoveColumn(index)} disabled={values.iterationColumns.length === 1} aria-label={`Remove ${column.label}`}>×</button></span>)}<span aria-hidden="true"></span></div>
              {values.iterations.map((iteration, index) => <div className="iteration-row" style={{ gridTemplateColumns: `85px repeat(${values.iterationColumns.length}, minmax(180px, 1fr)) 32px` }} key={index}><strong>{index + 1}</strong>{values.iterationColumns.map((column) => <textarea key={column.id} value={iteration[column.id] || ""} onChange={(event) => onIterationChange(index, column.id, event.target.value)} placeholder={`Add ${column.label.toLowerCase()}`} />)}<button type="button" className="remove-iteration" onClick={() => onRemoveIteration(index)} disabled={values.iterations.length === 1} aria-label={`Remove iteration ${index + 1}`}>×</button></div>)}</div>
            </div>
            <button type="button" className="add-iteration" onClick={onAddIteration}>+ Add iteration</button>
            <button type="button" className="add-iteration" onClick={onAddColumn}>+ Add column</button>
          </fieldset>
          <label>
            Folder
            <select name="folder" value={values.folder} onChange={onChange}>
              <option value="">Root</option>
              {folders.map((folder) => (
                <option key={folder.path} value={folder.path}>
                  {folder.path}
                </option>
              ))}
            </select>
          </label>
          <label>
            Difficulty
            <select
              name="difficulty"
              value={values.difficulty}
              onChange={onChange}
            >
              <option>Easy</option>
              <option>Medium</option>
              <option>Hard</option>
            </select>
          </label>
        </div>
        <button className="save">
          {editing ? "Save changes" : "Save problem"}
        </button>
      </form>
    </div>
  );
}

export default App;
