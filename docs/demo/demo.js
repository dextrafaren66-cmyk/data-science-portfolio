/* In-browser YOLOv8 demo: ONNX Runtime Web (WebAssembly), no server needed.
   Pipeline mirrors Ultralytics: letterbox to 640 → model → decode → per-class NMS. */

const MODEL = {
  // The model is split into chunks so no single file is too big for GitHub or uploads.
  parts: ["model/vehicle-yolov8s.onnx.part0", "model/vehicle-yolov8s.onnx.part1", "model/vehicle-yolov8s.onnx.part2"],
  bytes: 44765183,
  size: 640,
  iou: 0.7,
  minConf: 0.05,
  maxDet: 300,
};

const CLASSES = [
  ["Angkot", "city minibus", "#2997FF"],
  ["Becak", "pedicab", "#FF9F0A"],
  ["Bus Besar", "large bus", "#BF5AF2"],
  ["Bus Sedang", "medium bus", "#64D2FF"],
  ["Gerobag", "cart", "#FFD60A"],
  ["Gerobak", "cart", "#FFD60A"],
  ["Mobil", "car", "#FF453A"],
  ["Motor", "motorbike", "#30D158"],
  ["Pick Up", "pickup truck", "#FF375F"],
  ["Plat", "license plate", "#FFFFFF"],
  ["Sepeda", "bicycle", "#AC8E68"],
  ["Truk Besar", "large truck", "#5E5CE6"],
  ["Truk Sedang", "medium truck", "#66D4CF"],
];
const EXAMPLES = ["examples/street_1.jpg", "examples/street_2.jpg", "examples/street_3.jpg", "examples/street_4.jpg"];
const MAX_SIDE = 1280; // big photos are scaled down for display; detection runs at 640 anyway

const $ = (id) => document.getElementById(id);
const canvas = $("canvas");
const ctx = canvas.getContext("2d");
const state = { img: null, session: null, loading: null, candidates: null, busy: false, lastMs: 0 };

/* ---------- ONNX Runtime setup ---------- */
ort.env.wasm.wasmPaths = new URL("vendor/", location.href).href;
ort.env.wasm.numThreads = self.crossOriginIsolated ? Math.min(4, navigator.hardwareConcurrency || 1) : 1;

function showOverlay(text, withProgress = false) {
  $("overlay").hidden = false;
  $("overlay-text").textContent = text;
  $("progress").hidden = !withProgress;
}
function hideOverlay() { $("overlay").hidden = true; }
function setMeta(text, isError = false) {
  const m = $("stage-meta");
  m.textContent = text;
  m.classList.toggle("is-error", isError);
}
const nextFrame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 0)));

async function fetchModel() {
  const buf = new Uint8Array(MODEL.bytes);
  let offset = 0;
  for (const url of MODEL.parts) {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`Could not download ${url} (${res.status})`);
    const reader = res.body.getReader();
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf.set(value, offset);
      offset += value.length;
      const pct = Math.min(100, (offset / MODEL.bytes) * 100);
      $("progress-bar").style.width = `${pct}%`;
      $("overlay-text").textContent = `Downloading model… ${Math.round(offset / 1e6)} / ${Math.round(MODEL.bytes / 1e6)} MB`;
    }
  }
  if (offset !== MODEL.bytes) throw new Error("The model download was incomplete. Please reload and try again.");
  return buf;
}

function loadModel() {
  if (!state.loading) {
    state.loading = (async () => {
      showOverlay("Downloading model…", true);
      const bytes = await fetchModel();
      showOverlay("Starting the model…");
      await nextFrame();
      state.session = await ort.InferenceSession.create(bytes, { executionProviders: ["wasm"], graphOptimizationLevel: "all" });
    })().catch((e) => { state.loading = null; throw e; });
  }
  return state.loading;
}

/* ---------- image handling ---------- */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("That file couldn't be opened as an image."));
    img.src = src;
  });
}

function setImage(img) {
  const s = Math.min(1, MAX_SIDE / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * s), h = Math.round(img.naturalHeight * s);
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  c.getContext("2d").drawImage(img, 0, 0, w, h);
  state.img = c;
  state.candidates = null;
  draw([]);
  renderTable([]);
  setMeta(`${w}×${h}px · press Run detection`);
}

/* ---------- inference ---------- */
function preprocess(src) {
  const S = MODEL.size;
  const r = Math.min(S / src.width, S / src.height);
  const nw = Math.round(src.width * r), nh = Math.round(src.height * r);
  const padX = (S - nw) / 2, padY = (S - nh) / 2;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const g = c.getContext("2d");
  g.fillStyle = "rgb(114,114,114)";
  g.fillRect(0, 0, S, S);
  g.imageSmoothingQuality = "high";
  g.drawImage(src, Math.round(padX - 0.1), Math.round(padY - 0.1), nw, nh);
  const px = g.getImageData(0, 0, S, S).data;
  const plane = S * S;
  const input = new Float32Array(3 * plane);
  for (let i = 0; i < plane; i++) {
    input[i] = px[i * 4] / 255;
    input[plane + i] = px[i * 4 + 1] / 255;
    input[2 * plane + i] = px[i * 4 + 2] / 255;
  }
  return { tensor: new ort.Tensor("float32", input, [1, 3, S, S]), r, padX: Math.round(padX - 0.1), padY: Math.round(padY - 0.1) };
}

/* Output is [1, 4 + classes, anchors]: box centre/size, then one score per class. */
function decode(out, meta, w, h) {
  const data = out.data;
  const n = out.dims[2];
  const nc = out.dims[1] - 4;
  const found = [];
  for (let i = 0; i < n; i++) {
    let best = 0, cls = -1;
    for (let c = 0; c < nc; c++) {
      const s = data[(4 + c) * n + i];
      if (s > best) { best = s; cls = c; }
    }
    if (best < MODEL.minConf) continue;
    const cx = data[i], cy = data[n + i], bw = data[2 * n + i], bh = data[3 * n + i];
    const clamp = (v, max) => Math.max(0, Math.min(max, v));
    found.push({
      cls, score: best,
      x1: clamp((cx - bw / 2 - meta.padX) / meta.r, w), y1: clamp((cy - bh / 2 - meta.padY) / meta.r, h),
      x2: clamp((cx + bw / 2 - meta.padX) / meta.r, w), y2: clamp((cy + bh / 2 - meta.padY) / meta.r, h),
    });
  }
  return found;
}

function iou(a, b) {
  const ix = Math.max(0, Math.min(a.x2, b.x2) - Math.max(a.x1, b.x1));
  const iy = Math.max(0, Math.min(a.y2, b.y2) - Math.max(a.y1, b.y1));
  const inter = ix * iy;
  const union = (a.x2 - a.x1) * (a.y2 - a.y1) + (b.x2 - b.x1) * (b.y2 - b.y1) - inter;
  return union > 0 ? inter / union : 0;
}

/* Class-aware NMS, like Ultralytics' default (agnostic = false). */
function nms(cands, conf) {
  const sorted = cands.filter((d) => d.score >= conf).sort((a, b) => b.score - a.score);
  const keep = [];
  for (const d of sorted) {
    if (keep.length >= MODEL.maxDet) break;
    if (!keep.some((k) => k.cls === d.cls && iou(k, d) > MODEL.iou)) keep.push(d);
  }
  return keep;
}

async function run() {
  if (state.busy || !state.img) return;
  state.busy = true;
  $("run").disabled = true;
  try {
    await loadModel();
    showOverlay("Detecting…");
    await nextFrame();
    const t0 = performance.now();
    const meta = preprocess(state.img);
    const out = await state.session.run({ images: meta.tensor });
    const output = out[state.session.outputNames[0]];
    state.candidates = decode(output, meta, state.img.width, state.img.height);
    state.lastMs = performance.now() - t0;
    hideOverlay();
    refresh();
  } catch (e) {
    hideOverlay();
    setMeta(e.message || String(e), true);
    console.error(e);
  } finally {
    state.busy = false;
    $("run").disabled = false;
  }
}

/* ---------- drawing ---------- */
function textColor(hex) {
  const n = parseInt(hex.slice(1), 16);
  const [r, g, b] = [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 150 ? "#000" : "#fff";
}

function draw(dets) {
  const src = state.img;
  if (!src) return;
  canvas.width = src.width;
  canvas.height = src.height;
  ctx.drawImage(src, 0, 0);
  const long = Math.max(src.width, src.height);
  const lw = Math.max(2, Math.round(long / 320));
  const fs = Math.max(12, Math.round(long / 48));
  ctx.font = `600 ${fs}px Inter, system-ui, sans-serif`;
  ctx.textBaseline = "top";
  for (const d of dets) {
    const [name, , color] = CLASSES[d.cls];
    ctx.strokeStyle = color;
    ctx.lineWidth = lw;
    ctx.strokeRect(d.x1, d.y1, d.x2 - d.x1, d.y2 - d.y1);
    const label = `${name} ${d.score.toFixed(2)}`;
    const tw = ctx.measureText(label).width + fs * 0.6;
    const th = fs * 1.35;
    const ty = d.y1 - th >= 0 ? d.y1 - th : d.y1;
    ctx.fillStyle = color;
    ctx.fillRect(d.x1 - lw / 2, ty, tw, th);
    ctx.fillStyle = textColor(color);
    ctx.fillText(label, d.x1 - lw / 2 + fs * 0.3, ty + fs * 0.18);
  }
}

function renderTable(dets) {
  const body = $("found").querySelector("tbody");
  if (!dets.length) {
    body.innerHTML = `<tr><td colspan="3" class="empty">${state.candidates ? "Nothing above this threshold." : "Run detection to see results."}</td></tr>`;
    return;
  }
  const counts = new Map();
  for (const d of dets) counts.set(d.cls, (counts.get(d.cls) || 0) + 1);
  body.innerHTML = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([c, k]) => {
      const [name, meaning, color] = CLASSES[c];
      return `<tr><td><span class="swatch" style="background:${color}"></span>${name}</td><td>${meaning}</td><td class="num">${k}</td></tr>`;
    })
    .join("");
}

function refresh() {
  if (!state.candidates) return;
  const conf = parseFloat($("conf").value);
  const dets = nms(state.candidates, conf);
  draw(dets);
  renderTable(dets);
  setMeta(`${dets.length} object${dets.length === 1 ? "" : "s"} · ${Math.round(state.lastMs)} ms in your browser`);
}

/* ---------- UI wiring ---------- */
function markExample(i) {
  document.querySelectorAll(".example").forEach((b, j) => b.setAttribute("aria-pressed", String(j === i)));
}

async function useExample(i, autoRun) {
  markExample(i);
  setImage(await loadImage(EXAMPLES[i]));
  if (autoRun) run();
}

async function useFile(file) {
  if (!file || !file.type.startsWith("image/")) { setMeta("Please choose an image file.", true); return; }
  const url = URL.createObjectURL(file);
  try {
    markExample(-1);
    setImage(await loadImage(url));
    run();
  } catch (e) {
    setMeta(e.message, true);
  } finally {
    URL.revokeObjectURL(url);
  }
}

$("examples").innerHTML = EXAMPLES.map((src, i) =>
  `<button class="example" type="button" aria-pressed="false" aria-label="Example photo ${i + 1}"><img src="${src}" alt=""></button>`
).join("");
document.querySelectorAll(".example").forEach((b, i) => b.addEventListener("click", () => useExample(i, true)));

$("file").addEventListener("change", (e) => useFile(e.target.files[0]));
$("run").addEventListener("click", run);
$("conf").addEventListener("input", (e) => {
  $("conf-value").textContent = parseFloat(e.target.value).toFixed(2);
  refresh();
});

const stage = $("stage");
["dragenter", "dragover"].forEach((t) => stage.addEventListener(t, (e) => { e.preventDefault(); stage.classList.add("is-drag"); }));
["dragleave", "drop"].forEach((t) => stage.addEventListener(t, (e) => { e.preventDefault(); stage.classList.remove("is-drag"); }));
stage.addEventListener("drop", (e) => useFile(e.dataTransfer.files[0]));

useExample(0, false).catch((e) => setMeta(e.message, true));
