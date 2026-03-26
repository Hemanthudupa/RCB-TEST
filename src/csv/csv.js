const fs = require("fs/promises");
const path = require("path");

// In-process write lock to keep CSV rewrites safe.
let writeChain = Promise.resolve();
function withWriteLock(fn) {
  const next = writeChain.then(fn, fn);
  writeChain = next.catch(() => {});
  return next;
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

async function fileExists(p) {
  try {
    await fs.access(p);
    return true;
  } catch {
    return false;
  }
}

async function listFiles(dirPath) {
  try {
    return await fs.readdir(dirPath);
  } catch {
    return [];
  }
}

function escapeCsvCell(v) {
  const s = String(v ?? "");
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function parseCsvLine(line) {
  // Minimal CSV parser: supports quotes and commas
  const out = [];
  let cur = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        const next = line[i + 1];
        if (next === '"') {
          cur += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        cur += ch;
      }
    } else {
      if (ch === ",") {
        out.push(cur);
        cur = "";
      } else if (ch === '"') {
        inQuotes = true;
      } else {
        cur += ch;
      }
    }
  }
  out.push(cur);
  return out;
}

async function readFileText(p) {
  return await fs.readFile(p, "utf8");
}

async function readCsv(p) {
  if (!(await fileExists(p))) return [];
  const text = await fs.readFile(p, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.length > 0);
  if (lines.length === 0) return [];
  const header = parseCsvLine(lines[0]).map((h) => h.trim());
  const rows = [];
  for (const line of lines.slice(1)) {
    const cols = parseCsvLine(line);
    const row = {};
    for (let i = 0; i < header.length; i++) row[header[i]] = cols[i] ?? "";
    rows.push(row);
  }
  return rows;
}

async function rewriteCsv(p, headers, rows) {
  await ensureDir(path.dirname(p));
  return await withWriteLock(async () => {
    const lines = [];
    lines.push(headers.join(","));
    for (const r of rows) {
      lines.push(headers.map((h) => escapeCsvCell(r[h])).join(","));
    }
    const text = lines.join("\n") + "\n";
    await fs.writeFile(p, text, "utf8");
  });
}

async function appendCsvRow(p, headers, row) {
  await ensureDir(path.dirname(p));
  return await withWriteLock(async () => {
    const exists = await fileExists(p);
    if (!exists) {
      await rewriteCsv(p, headers, [row]);
      return;
    }
    const line = headers.map((h) => escapeCsvCell(row[h])).join(",") + "\n";
    await fs.appendFile(p, line, "utf8");
  });
}

module.exports = {
  ensureDir,
  fileExists,
  listFiles,
  readCsv,
  rewriteCsv,
  appendCsvRow,
  readFileText,
};

