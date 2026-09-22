import { useEffect, useState } from "react";
import "./App.css";

const defaultIterationColumns = [
  { id: "variables", label: "Variables state" },
  { id: "observation", label: "Observation" },
  { id: "notes", label: "Notes or changes" },
];
const defaultPatterns = ["Two pointers"];
const complexityOptions = ["O(1)", "O(log n)", "O(n)", "O(n log n)", "O(n²)", "O(n + m)", "O(2ⁿ)", "Custom"];

const blankIteration = (columns = defaultIterationColumns) =>
  Object.fromEntries(columns.map((column) => [column.id, ""]));
const blankCase = (columns = defaultIterationColumns) => ({ input: "", iterations: [blankIteration(columns)] });

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
    link: "",
    difficulty: "Easy",
    pattern: "",
    description: "",
    keyIdea: "",
    iterationColumns: defaultIterationColumns,
    dryRunCases: [blankCase(), blankCase()],
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
  const availablePatterns = [...new Set(patterns)];
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
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }));
  const updatePattern = (event) => {
    if (event.target.value !== "__add_pattern__") {
      setForm((current) => ({ ...current, pattern: event.target.value }));
      return;
    }
    const pattern = window.prompt("New pattern name");
    if (!pattern?.trim()) return;
    const next = [...new Set([...patterns, pattern.trim()])];
    setPatterns(next);
    localStorage.setItem("dsa-patterns", JSON.stringify(next.filter((item) => !defaultPatterns.includes(item))));
    setForm((current) => ({ ...current, pattern: pattern.trim() }));
  };
  const startNew = () => {
    setEditing(null);
    setForm({
      name: "",
      folder: "",
      link: "",
      difficulty: "Easy",
      pattern: "Two pointers",
      description: "",
      keyIdea: "",
      iterationColumns: defaultIterationColumns,
      dryRunCases: [blankCase(), blankCase()],
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
    const exampleBlocks = dryRun.split(/(?=###\s+Example\s+\d+)/i).filter(Boolean);
    const firstBlock = exampleBlocks[0] || dryRun;
    const tableRows = firstBlock.split("\n").filter((line) => line.trim().startsWith("|"));
    const tableHeaders = tableRows[0]?.split("|").slice(1, -1).map((header) => header.trim()) || [];
    const parsedColumns = tableHeaders.slice(1).map((label) => ({ id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-") || `column-${Math.random()}`, label }));
    const columns = parsedColumns.length ? parsedColumns : defaultIterationColumns;
    const parseIterations = (block) => block.split("\n").filter((line) => line.trim().startsWith("|")).slice(2).map((line) => {
      const cells = line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/<br>/g, "\n"));
      return Object.fromEntries(columns.map((column, index) => [column.id, cells[index + 1] || ""]));
    });
    const parsedCases = exampleBlocks.length ? exampleBlocks.map((block) => ({ input: block.match(/\*\*Input:\*\*\s*(.*)/i)?.[1] || "", iterations: parseIterations(block) })) : [{ input: dryRun.match(/\*\*Input:\*\*\s*(.*)/i)?.[1] || "", iterations: parseIterations(dryRun) }];
    setEditing(selected);
    setForm({
      name: slug,
      folder: selected.path.split("/").slice(0, -1).join("/"),
      link: value("Link"),
      difficulty: value("Difficulty"),
      pattern: value("Pattern"),
      description: section("Problem in my own words"),
      keyIdea: section("Key idea"),
      iterationColumns: columns,
      dryRunCases: parsedCases.map((dryRunCase) => ({ ...dryRunCase, iterations: dryRunCase.iterations.length ? dryRunCase.iterations : [blankIteration(columns)] })),
      code: section("Code"),
      time: section("Complexity").match(/Time:\*\*\s*(.*)/i)?.[1] || "",
      space: section("Complexity").match(/Space:\*\*\s*(.*)/i)?.[1] || "",
      remember: section("Remember"),
    });
    setFormOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    const payload = { ...form, dateSolved: editing?.dateSolved };
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
  const updateIteration = (caseIndex, index, field, value) =>
    setForm((current) => ({
      ...current,
      dryRunCases: current.dryRunCases.map((dryRunCase, currentCaseIndex) => currentCaseIndex === caseIndex ? { ...dryRunCase, iterations: dryRunCase.iterations.map((item, itemIndex) => itemIndex === index ? { ...item, [field]: value } : item) } : dryRunCase),
    }));
  const addIteration = (caseIndex) =>
    setForm((current) => ({
      ...current,
      dryRunCases: current.dryRunCases.map((dryRunCase, index) => index === caseIndex ? { ...dryRunCase, iterations: [...dryRunCase.iterations, blankIteration(current.iterationColumns)] } : dryRunCase),
    }));
  const removeIteration = (caseIndex, index) =>
    setForm((current) => ({
      ...current,
      dryRunCases: current.dryRunCases.map((dryRunCase, currentCaseIndex) => currentCaseIndex === caseIndex && dryRunCase.iterations.length > 1 ? { ...dryRunCase, iterations: dryRunCase.iterations.filter((_, itemIndex) => itemIndex !== index) } : dryRunCase),
    }));
  const updateCaseInput = (caseIndex, input) => setForm((current) => ({ ...current, dryRunCases: current.dryRunCases.map((dryRunCase, index) => index === caseIndex ? { ...dryRunCase, input } : dryRunCase) }));
  const addCase = () => setForm((current) => ({ ...current, dryRunCases: [...current.dryRunCases, blankCase(current.iterationColumns)] }));
  const removeCase = (caseIndex) => setForm((current) => ({ ...current, dryRunCases: current.dryRunCases.length > 1 ? current.dryRunCases.filter((_, index) => index !== caseIndex) : current.dryRunCases }));
  const addIterationColumn = () =>
    setForm((current) => {
      const id = `column-${current.iterationColumns.length + 1}`;
      const column = { id, label: `Column ${current.iterationColumns.length + 1}` };
      return { ...current, iterationColumns: [...current.iterationColumns, column], dryRunCases: current.dryRunCases.map((dryRunCase) => ({ ...dryRunCase, iterations: dryRunCase.iterations.map((item) => ({ ...item, [id]: "" })) })) };
    });
  const updateIterationColumn = (index, label) =>
    setForm((current) => ({ ...current, iterationColumns: current.iterationColumns.map((column, columnIndex) => columnIndex === index ? { ...column, label } : column) }));
  const removeIterationColumn = (index) =>
    setForm((current) => {
      if (current.iterationColumns.length === 1) return current;
      const columnId = current.iterationColumns[index].id;
      return { ...current, iterationColumns: current.iterationColumns.filter((_, columnIndex) => columnIndex !== index), dryRunCases: current.dryRunCases.map((dryRunCase) => ({ ...dryRunCase, iterations: dryRunCase.iterations.map((item) => { const next = { ...item }; delete next[columnId]; return next; }) })) };
    });
  const deleteProblem = async () => {
    if (!selected || !window.confirm(`Delete ${selected.name.replace(/\.md$/i, "")}? This cannot be undone.`)) return;
    await fetch("/api/problems", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ path: selected.path }) });
    await fetch("/api/git/commit", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: `Delete: ${selected.name.replace(/\.md$/i, "")}` }) });
    setSelected(null);
    await loadEntries();
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
          <nav><ProblemTree files={visible} folders={folders} onOpen={openFile} /></nav>
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
          onCaseInputChange={updateCaseInput}
          onAddCase={addCase}
          onRemoveCase={removeCase}
          onAddColumn={addIterationColumn}
          onUpdateColumn={updateIterationColumn}
          onRemoveColumn={removeIterationColumn}
          patterns={availablePatterns}
          onPatternChange={updatePattern}
        />
      )}
    </>
  );
}

function ProblemTree({ files, folders, onOpen }) {
  const renderGroup = (groupFiles) => {
    const groups = [...new Set(groupFiles.map((file) => file.pattern || "Uncategorized"))];
    return groups.map((pattern) => (
      <details className="pattern-group" key={pattern} open>
        <summary>{pattern}</summary>
        {groupFiles.filter((file) => (file.pattern || "Uncategorized") === pattern).map((file) => (
          <button key={file.path} onClick={() => onOpen(file)}>{file.name.replace(".md", "")}</button>
        ))}
      </details>
    ));
  };
  return <>
    {renderGroup(files.filter((file) => !file.path.includes("/")))}
    {folders.map((folder) => {
      const folderFiles = files.filter((file) => file.path.startsWith(`${folder.path}/`) && !file.path.slice(folder.path.length + 1).includes("/"));
      if (!folderFiles.length) return null;
      return <details key={folder.path} open><summary>{folder.path}</summary>{renderGroup(folderFiles)}</details>;
    })}
  </>;
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
            <span key={item}>{item.startsWith("**Link:") ? <a href={item.replace(/^\*\*Link:\*\*\s*/i, "")} target="_blank" rel="noreferrer">Open LeetCode</a> : item.replaceAll("**", "")}</span>
          ))}
      </div>
      {sections.map((section) => {
        const [heading, ...lines] = section.split("\n");
        const value = lines.join("\n").trim();
        if (heading.toLowerCase() === "dry run") {
          const cases = value.split(/(?=###\s+Example\s+\d+)/i).filter(Boolean);
          return <section key={heading}><h3>{heading}</h3>{cases.map((example, exampleIndex) => { const tableRows = example.split("\n").filter((line) => line.trim().startsWith("|")); const headers = tableRows[0]?.split("|").slice(1, -1).map((cell) => cell.trim()) || []; const rows = tableRows.slice(2).map((line) => line.split("|").slice(1, -1).map((cell) => cell.trim().replace(/<br>/g, "\n"))); const label = example.match(/###\s+(Example\s+\d+)/i)?.[1] || `Example ${exampleIndex + 1}`; const input = example.match(/\*\*Input:\*\*\s*(.*)/i)?.[1] || ""; return <div className="dry-run-case" key={label}><h4>{label}</h4><p className="dry-run-input"><strong>Input:</strong> {input}</p><div className="dry-run-table" style={{ "--iteration-columns": `85px repeat(${Math.max(headers.length - 1, 1)}, minmax(180px, 1fr))` }}><div className="dry-run-row dry-run-header">{headers.map((header) => <span key={header}>{header}</span>)}</div>{rows.map((row, index) => <div className="dry-run-row" key={index}>{row.map((cell, cellIndex) => <span key={cellIndex}>{cell}</span>)}</div>)}</div></div>; })}</section>;
        }
        return heading.toLowerCase() === "code" ? (
          <pre key={heading}>
            <code>{value.replace(/```javascript|```/g, "").trim()}</code>
          </pre>
        ) : (
          <section key={heading}>
            <h3>{heading}</h3>
            <MarkdownContent value={value} />
          </section>
        );
      })}
    </article>
  );
}

function MarkdownContent({ value }) {
  const blocks = value.split(/\n\s*\n/).filter(Boolean);
  return <div className="markdown-content">{blocks.map((block, index) => {
    const lines = block.split("\n");
    if (lines.every((line) => /^[-*]\s+/.test(line))) {
      return <ul key={index}>{lines.map((line) => <li key={line}>{formatInlineMarkdown(line.replace(/^[-*]\s+/, ""))}</li>)}</ul>;
    }
    return <p key={index}>{lines.map((line, lineIndex) => <span key={lineIndex}>{formatInlineMarkdown(line)}{lineIndex < lines.length - 1 && <br />}</span>)}</p>;
  })}</div>;
}

function formatInlineMarkdown(value) {
  const parts = value.split(/(`[^`]+`|\*\*[^*]+\*\*)/g);
  return parts.map((part, index) => {
    if (part.startsWith("`") && part.endsWith("`")) return <code className="inline-code" key={index}>{part.slice(1, -1)}</code>;
    if (part.startsWith("**") && part.endsWith("**")) return <strong key={index}>{part.slice(2, -2)}</strong>;
    return part;
  });
}
function Form({ values, folders, editing, onChange, onSubmit, onClose, onIterationChange, onAddIteration, onRemoveIteration, onCaseInputChange, onAddCase, onRemoveCase, onAddColumn, onUpdateColumn, onRemoveColumn, patterns, onPatternChange }) {
  return (
    <div className="modal" onKeyDown={(event) => { if (event.key === "Escape") onClose(); }}>
      <form onSubmit={onSubmit}>
        <button type="button" className="close" onClick={onClose}>
          ×
        </button>
        <small>{editing ? "EDIT NOTE" : "NEW ENTRY"}</small>
        <h2>{editing ? "Update this problem" : "Capture a problem"}</h2>
        <div className="fields">
          <div className="compact-fields">
            <div className="compact-row"><label>Problem slug<input name="name" value={values.name} onChange={onChange} placeholder="remove-duplicates-from-sorted-array" required /></label><label>Pattern<select name="pattern" value={values.pattern} onChange={onPatternChange}><option value="">Select pattern</option>{patterns.map((pattern) => <option key={pattern} value={pattern}>{pattern}</option>)}<option value="__add_pattern__">+ Add new pattern</option></select></label></div>
            <div className="compact-row"><label>Difficulty<select name="difficulty" value={values.difficulty} onChange={onChange}><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label>Folder<select name="folder" value={values.folder} onChange={onChange}><option value="">Root</option>{folders.map((folder) => <option key={folder.path} value={folder.path}>{folder.path}</option>)}</select></label></div>
          </div>
          {[
            ["description", "Problem in my own words"],
            ["keyIdea", "Key idea"],
            ["code", "Code"],
          ].map(([name, label]) => (
            <label className={`${name}-field`} key={name}>
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
          <fieldset className="iterations-fieldset">
            <legend>Dry-run examples</legend>
            <p className="field-help">Keep a separate input and iteration table for each example.</p>
            {values.dryRunCases.map((dryRunCase, caseIndex) => <div className="dry-run-case" key={caseIndex}><div className="case-heading"><strong>Example {caseIndex + 1}</strong><button type="button" className="remove-case" onClick={() => onRemoveCase(caseIndex)} disabled={values.dryRunCases.length === 1}>Remove example</button></div><label>Input used for this example<input value={dryRunCase.input} onChange={(event) => onCaseInputChange(caseIndex, event.target.value)} placeholder="[0, 0, 1, 1, 2]" /></label><div className="iteration-table"><div className="iteration-table-scroll"><div className="iteration-row iteration-header" style={{ gridTemplateColumns: `85px repeat(${values.iterationColumns.length}, minmax(180px, 1fr)) 32px` }}><span>Iteration</span>{values.iterationColumns.map((column, index) => <span className="column-heading" key={column.id}><input value={column.label} onChange={(event) => onUpdateColumn(index, event.target.value)} aria-label={`Column ${index + 1} name`} /><button type="button" onClick={() => onRemoveColumn(index)} disabled={values.iterationColumns.length === 1} aria-label={`Remove ${column.label}`}>×</button></span>)}<span aria-hidden="true"></span></div>{dryRunCase.iterations.map((iteration, index) => <div className="iteration-row" style={{ gridTemplateColumns: `85px repeat(${values.iterationColumns.length}, minmax(180px, 1fr)) 32px` }} key={index}><strong>{index + 1}</strong>{values.iterationColumns.map((column) => <textarea key={column.id} value={iteration[column.id] || ""} onChange={(event) => onIterationChange(caseIndex, index, column.id, event.target.value)} placeholder={`Add ${column.label.toLowerCase()}`} />)}<button type="button" className="remove-iteration" onClick={() => onRemoveIteration(caseIndex, index)} disabled={dryRunCase.iterations.length === 1} aria-label={`Remove iteration ${index + 1}`}>×</button></div>)}</div></div><button type="button" className="add-iteration" onClick={() => onAddIteration(caseIndex)}>+ Add iteration</button></div>)}
            <button type="button" className="add-iteration" onClick={onAddCase}>+ Add example</button><button type="button" className="add-iteration" onClick={onAddColumn}>+ Add column to all examples</button>
          </fieldset>
          <div className="complexity-row"><label>Time complexity<select name="time" value={values.time} onChange={onChange}>{complexityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label><label>Space complexity<select name="space" value={values.space} onChange={onChange}>{complexityOptions.map((option) => <option key={option} value={option}>{option}</option>)}</select></label></div>
          <label className="full-field">Remember<textarea name="remember" value={values.remember} onChange={onChange} /></label>
        </div>
        <button className="save">
          {editing ? "Save changes" : "Save problem"}
        </button>
      </form>
    </div>
  );
}

export default App;
