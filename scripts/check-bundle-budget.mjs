import { readdir, stat } from "node:fs/promises";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../dist/client/", import.meta.url));
const limits = {
  applicationJavascriptBytes: 700 * 1024,
  runtimeJavascriptBytes: 1536 * 1024,
  cssBytes: 300 * 1024,
  clientBytes: 65 * 1024 * 1024,
};

async function collect(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await collect(path)));
    } else {
      files.push(path);
    }
  }
  return files;
}

const files = await collect(root);
const measured = await Promise.all(
  files.map(async (path) => ({
    path,
    bytes: (await stat(path)).size,
  })),
);
const totalFor = (predicate) =>
  measured
    .filter(({ path }) => predicate(path))
    .reduce((total, { bytes }) => total + bytes, 0);

const runtimeJavascriptBytes = totalFor(
  (path) => path.endsWith(".js") && !path.endsWith(".js.map"),
);
const applicationJavascriptBytes = totalFor(
  (path) =>
    path.startsWith(join(root, "assets")) &&
    path.endsWith(".js") &&
    !path.endsWith(".js.map"),
);
const cssBytes = totalFor((path) => path.endsWith(".css"));
const clientBytes = totalFor(() => true);
const requiredOfflineAssets = [
  "media/mo-li-hua-mv.mp4",
  "media/mo-li-hua-poster.webp",
  "models/hand_landmarker.task",
  "models/pose_landmarker_lite.task",
  "vendor/mediapipe/vision_wasm_internal.wasm",
];
const relativePaths = new Set(
  measured.map(({ path }) => relative(root, path)),
);
const missing = requiredOfflineAssets.filter(
  (path) => !relativePaths.has(path),
);
const failures = [
  applicationJavascriptBytes > limits.applicationJavascriptBytes
    ? `Application JavaScript ${applicationJavascriptBytes} exceeds ${limits.applicationJavascriptBytes} bytes`
    : null,
  runtimeJavascriptBytes > limits.runtimeJavascriptBytes
    ? `Runtime JavaScript ${runtimeJavascriptBytes} exceeds ${limits.runtimeJavascriptBytes} bytes`
    : null,
  cssBytes > limits.cssBytes
    ? `CSS ${cssBytes} exceeds ${limits.cssBytes} bytes`
    : null,
  clientBytes > limits.clientBytes
    ? `Client bundle ${clientBytes} exceeds ${limits.clientBytes} bytes`
    : null,
  missing.length > 0
    ? `Required offline assets are missing: ${missing.join(", ")}`
    : null,
].filter(Boolean);

if (failures.length > 0) {
  throw new Error(failures.join("\n"));
}

console.log(
  `Bundle budget passed: ${applicationJavascriptBytes} application JS bytes, ${runtimeJavascriptBytes} runtime JS bytes, ${cssBytes} CSS bytes, ${clientBytes} total client bytes.`,
);
