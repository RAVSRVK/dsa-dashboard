import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [entries, setEntries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [search, setSearch] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [remindersOpen, setRemindersOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    number: "",
    folder: "",
    link: "",
    difficulty: "Easy",
    pattern: "",
    keyIdea: "",
    code: "",
    time: "",
    space: "",
    remember: "",
  });

  const loadEntries = async () =>
    setEntries(
      (await fetch("/api/tree").then((response) => response.json())).entries,
    );
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
      number: "",
      folder: "",
      link: "",
      difficulty: "Easy",
      pattern: "",
      keyIdea: "",
      code: "",
      time: "",
      space: "",
      remember: "",
    });
    setFormOpen(true);
  };
  const startEdit = () => {
    const content = selected.content;
    const title = content.match(/^#\s+(?:(\d+)\.\s+)?(.+)$/m);
    const value = (name) =>
      content.match(new RegExp(`\\*\\*${name}:\\*\\*\\s*(.*)`, "i"))?.[1] || "";
    const section = (name) =>
      content
        .match(new RegExp(`## ${name}\\s+([\\s\\S]*?)(?=\\n## |$)`, "i"))?.[1]
        .replace(/```javascript|```/g, "")
        .trim() || "";
    setEditing(selected);
    setForm({
      name: title?.[2] || "",
      number: title?.[1] || "",
      folder: selected.path.split("/").slice(0, -1).join("/"),
      link: value("Link"),
      difficulty: value("Difficulty"),
      pattern: value("Pattern"),
      keyIdea: section("Key idea"),
      code: section("Code"),
      time: section("Complexity").match(/Time:\*\*\s*(.*)/i)?.[1] || "",
      space: section("Complexity").match(/Space:\*\*\s*(.*)/i)?.[1] || "",
      remember: section("Remember"),
    });
    setFormOpen(true);
  };
  const save = async (event) => {
    event.preventDefault();
    const payload = editing
      ? { ...form, path: editing.path, dateSolved: editing.dateSolved }
      : form;
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
    await loadEntries();
    const refreshed = entries.find((entry) => entry.path === saved.path);
    if (refreshed) openFile(refreshed);
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
            <Note file={selected} onEdit={startEdit} />
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
        />
      )}
    </>
  );
}

function Note({ file, onEdit }) {
  const title =
    file.content.match(/^#\s+(?:(\d+)\.\s+)?(.+)$/m)?.[2] ||
    file.name.replace(".md", "");
  const sections = file.content.split(/^## /m).slice(1);
  return (
    <article className="note">
      <small>{file.path}</small>
      <div className="note-title">
        <h2>{title}</h2>
        <button onClick={onEdit}>Edit</button>
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
function Form({ values, folders, editing, onChange, onSubmit, onClose }) {
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
            ["number", "Problem number (optional)"],
            ["link", "LeetCode link"],
            ["pattern", "Pattern"],
            ["keyIdea", "Key idea"],
            ["code", "Code"],
            ["time", "Time"],
            ["space", "Space"],
            ["remember", "Remember"],
          ].map(([name, label]) => (
            <label key={name}>
              {label}
              {name === "keyIdea" || name === "code" || name === "remember" ? (
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
