const http = require('node:http');
const fs = require('node:fs/promises');
const path = require('node:path');
const { execFile } = require('node:child_process');
const { promisify } = require('node:util');

const execFileAsync = promisify(execFile);
const root = __dirname;
const clientDist = path.join(root, 'client', 'dist');
const port = Number(process.env.PORT) || 3000;
const hiddenDocuments = new Set(['README.md', 'DSA dashboard plan.md']);

function safeRelativePath(relativePath) {
  const normalized = path.normalize(relativePath || '').replace(/^([.][.][\\/])+/, '');
  const absolute = path.resolve(root, normalized);
  if (absolute !== root && !absolute.startsWith(`${root}${path.sep}`)) {
    throw new Error('Invalid path');
  }
  return absolute;
}

function problemFileName(name) {
  return `${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')}.md`;
}

function problemTitle(slug) {
  return slug.trim().replace(/[-_]+/g, ' ').replace(/\b\w/g, character => character.toUpperCase());
}

function markdownContent(data, dateSolved) {
  const title = problemTitle(data.name);
  const columns = Array.isArray(data.iterationColumns) && data.iterationColumns.length
    ? data.iterationColumns
    : [{ id: 'variables', label: 'Variables state' }, { id: 'observation', label: 'Observation' }, { id: 'notes', label: 'Notes or changes' }];
  const cases = Array.isArray(data.dryRunCases) && data.dryRunCases.length
    ? data.dryRunCases
    : [{ input: data.dryRunInput || '', iterations: Array.isArray(data.iterations) ? data.iterations : [] }];
  const renderCase = (dryRunCase, caseIndex) => {
    const iterations = Array.isArray(dryRunCase.iterations) ? dryRunCase.iterations : [];
    const table = iterations.length
      ? `| Iteration | ${columns.map(column => column.label.replace(/\|/g, '\\|')).join(' | ')} |\n| --- | ${columns.map(() => '---').join(' | ')} |\n${iterations.map((item, index) => `| ${index + 1} | ${columns.map(column => String(item[column.id] || '').replace(/\|/g, '\\|').replace(/\n/g, '<br>')).join(' | ')} |`).join('\n')}`
      : '_Add iterations for this example._';
    return `### Example ${caseIndex + 1}\n\n**Input:** ${dryRunCase.input || ''}\n\n${table}`;
  };
  const iterationTables = cases.map(renderCase).join('\n\n');
  const examples = Array.isArray(data.examples) ? data.examples : [];
  const exampleMarkdown = examples.length
    ? examples.map((example, index) => `### Example ${index + 1}\n\n- **Input:** ${example.input || ''}\n- **Output:** ${example.output || ''}\n- **Explanation:** ${example.explanation || ''}`).join('\n\n')
    : '_Add the problem examples here._';
  return `# ${title}\n\n**Slug:** ${data.name}\n**Link:** https://leetcode.com/problems/${data.name}\n**Difficulty:** ${data.difficulty || 'Easy'}\n**Date solved:** ${dateSolved}\n**Pattern:** ${data.pattern || ''}\n\n## Problem in my own words\n\n${data.description || ''}\n\n## Examples\n\n${exampleMarkdown}\n\n## Key idea\n\n${data.keyIdea || ''}\n\n## Code\n\n\`\`\`javascript\n${data.code || ''}\n\`\`\`\n\n## Dry run\n\n${iterationTables}\n\n## Complexity\n\n- **Time:** ${data.time || ''}\n- **Space:** ${data.space || ''}\n\n## Remember\n\n${data.remember || ''}\n\n## Revisit\n\n- [ ] Redo without looking\n`;
}

async function walk(currentDir, relativeDir = '') {
  const entries = await fs.readdir(currentDir, { withFileTypes: true });
  const result = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    if (entry.name.startsWith('.') || entry.name === 'node_modules' || entry.name === 'client') continue;
    const entryRelativePath = path.join(relativeDir, entry.name);
    const entryAbsolutePath = path.join(currentDir, entry.name);
    if (entry.isDirectory()) {
      result.push({ type: 'folder', name: entry.name, path: entryRelativePath.replaceAll(path.sep, '/') });
      result.push(...await walk(entryAbsolutePath, entryRelativePath));
    } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.md') && !hiddenDocuments.has(entry.name)) {
      const content = await fs.readFile(entryAbsolutePath, 'utf8');
      const solvedMatch = content.match(/\*\*Date solved:\*\*\s*(\d{4}-\d{2}-\d{2})/i);
      result.push({
        type: 'file',
        name: entry.name,
        path: entryRelativePath.replaceAll(path.sep, '/'),
        dateSolved: solvedMatch ? solvedMatch[1] : null,
        pattern: content.match(/\*\*Pattern:\*\*\s*(.*)/i)?.[1]?.trim() || ''
      });
    }
  }
  return result;
}

async function git(args) {
  const { stdout } = await execFileAsync('git', args, { cwd: root });
  return stdout.trim();
}

async function readJson(request) {
  let body = '';
  for await (const chunk of request) body += chunk;
  return JSON.parse(body);
}

function send(response, status, data, contentType = 'application/json') {
  response.writeHead(status, { 'Content-Type': `${contentType}; charset=utf-8` });
  response.end(contentType === 'application/json' ? JSON.stringify(data) : data);
}

async function handleApi(request, response, pathname) {
  if (request.method === 'GET' && pathname === '/api/tree') {
    return send(response, 200, { entries: await walk(root) });
  }

  if (request.method === 'GET' && pathname === '/api/file') {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    const relativePath = requestUrl.searchParams.get('path') || '';
    const filePath = safeRelativePath(relativePath);
    return send(response, 200, { content: await fs.readFile(filePath, 'utf8') });
  }

  if (request.method === 'POST' && pathname === '/api/problems') {
    const data = await readJson(request);
    const name = String(data.name || '').trim().toLowerCase();
    const folder = String(data.folder || '').trim();
    if (!name) return send(response, 400, { error: 'Problem name is required.' });

    const targetFolder = safeRelativePath(folder);
    await fs.mkdir(targetFolder, { recursive: true });
    const relativeFile = path.join(folder, problemFileName(name)).replaceAll(path.sep, '/');
    const targetFile = safeRelativePath(relativeFile);
    try {
      await fs.access(targetFile);
      return send(response, 409, { error: 'A problem with that name already exists in this folder.' });
    } catch {}

    const content = markdownContent({ ...data, name }, new Date().toISOString().slice(0, 10));
    await fs.writeFile(targetFile, content, 'utf8');
    return send(response, 201, { path: relativeFile });
  }

  if (request.method === 'PUT' && pathname === '/api/problems') {
    const data = await readJson(request);
    const relativePath = String(data.path || '');
    const name = String(data.name || '').trim().toLowerCase();
    if (!name) return send(response, 400, { error: 'Problem name is required.' });
    const content = markdownContent({ ...data, name }, data.dateSolved || new Date().toISOString().slice(0, 10));
    const folder = String(data.folder || path.dirname(relativePath)).trim();
    const nextRelativePath = path.join(folder, problemFileName(name)).replaceAll(path.sep, '/');
    const targetFile = safeRelativePath(nextRelativePath);
    const currentFile = safeRelativePath(relativePath);
    await fs.mkdir(path.dirname(targetFile), { recursive: true });
    if (currentFile !== targetFile) await fs.rename(currentFile, targetFile);
    await fs.writeFile(targetFile, content, 'utf8');
    await git(['add', '-A', '--', relativePath, nextRelativePath]);
    return send(response, 200, { path: nextRelativePath });
  }

  if (request.method === 'DELETE' && pathname === '/api/problems') {
    const data = await readJson(request);
    const relativePath = String(data.path || '');
    if (!relativePath.toLowerCase().endsWith('.md') || hiddenDocuments.has(path.basename(relativePath))) {
      return send(response, 400, { error: 'Only problem notes can be deleted.' });
    }
    const targetFile = safeRelativePath(relativePath);
    await fs.unlink(targetFile);
    await git(['add', '-A', '--', relativePath]);
    return send(response, 200, { path: relativePath });
  }

  if (request.method === 'POST' && pathname === '/api/git/stage') {
    const data = await readJson(request);
    const file = String(data.path || '');
    safeRelativePath(file);
    await git(['add', '--', file]);
    return send(response, 200, { message: `Staged ${file}` });
  }

  if (request.method === 'POST' && pathname === '/api/git/commit') {
    const data = await readJson(request);
    const message = String(data.message || '').trim();
    if (!message) return send(response, 400, { error: 'Commit message is required.' });
    await git(['commit', '-m', message]);
    return send(response, 200, { message: `Committed: ${message}` });
  }

  return send(response, 404, { error: 'Not found' });
}

const server = http.createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${request.headers.host}`);
    if (requestUrl.pathname.startsWith('/api/')) {
      return await handleApi(request, response, requestUrl.pathname);
    }
    const requested = requestUrl.pathname === '/' ? '/index.html' : decodeURIComponent(requestUrl.pathname);
    let filePath = requested.toLowerCase().endsWith('.md')
      ? safeRelativePath(requested)
      : safeRelativePath(path.join('client', 'dist', requested));
    try {
      await fs.access(filePath);
    } catch (error) {
      if (error.code !== 'ENOENT' || requested.includes('.')) throw error;
      filePath = path.join(clientDist, 'index.html');
    }
    const extension = path.extname(filePath);
    const contentType = extension === '.css' ? 'text/css' : extension === '.js' ? 'text/javascript' : 'text/html';
    return send(response, 200, await fs.readFile(filePath, 'utf8'), contentType);
  } catch (error) {
    send(response, error.code === 'ENOENT' ? 404 : 500, { error: error.message });
  }
});

server.listen(port, () => {
  console.log(`DSA dashboard running at http://localhost:${port}`);
});
