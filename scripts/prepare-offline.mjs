import { mkdir, writeFile, access, rm, readdir, rename } from "node:fs/promises";
import { createWriteStream } from "node:fs";
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OFFLINE = path.join(ROOT, "public", "offline");
const QURAN_FILE = path.join(OFFLINE, "quran.json");
const TAFSIR_FILE = path.join(OFFLINE, "tafsir-saadi.json");
const AUDIO_DIR = path.join(OFFLINE, "audio");
const AUDIO_BASE = "https://www.everyayah.com/data/Menshawi_16kbps/zips";

async function exists(p) { try { await access(p); return true; } catch { return false; } }

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  return res.json();
}

async function download(url, file) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${url}`);
  await new Promise((resolve, reject) => {
    const out = createWriteStream(file);
    res.body.pipeTo(new WritableStream({
      write(chunk) { return new Promise((r, j) => out.write(Buffer.from(chunk), e => e ? j(e) : r())); },
      close() { out.end(resolve); },
      abort(err) { out.destroy(err); reject(err); }
    })).catch(reject);
  });
}

function run(cmd, args, cwd = ROOT) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, args, { cwd, stdio: "inherit", shell: false });
    p.on("error", reject);
    p.on("close", code => code === 0 ? resolve() : reject(new Error(`${cmd} exited ${code}`)));
  });
}

async function prepareText() {
  if (await exists(QURAN_FILE) && await exists(TAFSIR_FILE)) return;
  const quran = [];
  const tafsir = {};
  for (let n = 1; n <= 114; n++) {
    process.stdout.write(`Offline Quran data: ${n}/114\r`);
    const q = await fetchJson(`https://api.alquran.cloud/v1/surah/${n}/quran-uthmani`);
    quran.push(q.data);
    const t = await fetchJson(`https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ar-tafsir-as-saadi/${n}.json`);
    tafsir[String(n)] = t;
  }
  await writeFile(QURAN_FILE, JSON.stringify(quran), "utf8");
  await writeFile(TAFSIR_FILE, JSON.stringify(tafsir), "utf8");
  process.stdout.write("\n");
}

async function prepareAudio() {
  await mkdir(AUDIO_DIR, { recursive: true });
  const existing = await readdir(AUDIO_DIR);
  if (existing.length >= 6000) return;
  const tmpDir = path.join(OFFLINE, ".zips");
  await mkdir(tmpDir, { recursive: true });
  for (let n = 1; n <= 114; n++) {
    const s = String(n).padStart(3, "0");
    const zip = path.join(tmpDir, `${s}.zip`);
    const marker = path.join(AUDIO_DIR, `${s}.complete`);
    if (await exists(marker)) continue;
    process.stdout.write(`Offline recitation: ${n}/114\r`);
    await download(`${AUDIO_BASE}/${s}.zip`, zip);
    await run("unzip", ["-o", zip, "-d", AUDIO_DIR]);
    await writeFile(marker, "ok", "utf8");
    await rm(zip, { force: true });
  }
  const files = await readdir(AUDIO_DIR);
  for (const f of files) if (f.endsWith(".complete")) await rm(path.join(AUDIO_DIR, f));
  await rm(tmpDir, { recursive: true, force: true });
  process.stdout.write("\n");
}

await mkdir(OFFLINE, { recursive: true });
await prepareText();
await prepareAudio();
console.log("Offline bundle ready: Quran + Tafsir + complete Minshawy 16kbps recitation.");
