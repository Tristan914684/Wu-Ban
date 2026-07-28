import react from "@vitejs/plugin-react";
import { createHash } from "node:crypto";
import { copyFile, mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { defineConfig, type Plugin } from "vite";

const publicOfflineAssets = [
  "/favicon.svg",
  "/models/hand_landmarker.task",
  "/models/pose_landmarker_lite.task",
  "/vendor/mediapipe/vision_wasm_internal.js",
  "/vendor/mediapipe/vision_wasm_internal.wasm",
  "/vendor/mediapipe/vision_wasm_module_internal.js",
  "/vendor/mediapipe/vision_wasm_module_internal.wasm",
  "/vendor/mediapipe/vision_wasm_nosimd_internal.js",
  "/vendor/mediapipe/vision_wasm_nosimd_internal.wasm",
] as const;

function offlineBundlePlugin(): Plugin {
  let root = process.cwd();
  return {
    name: "wuban-offline-bundle",
    apply: "build",
    configResolved(config) {
      root = config.root;
    },
    async buildStart() {
      await rm(resolve(root, "dist"), { recursive: true, force: true });
    },
    generateBundle(_options, bundle) {
      const precache = [
        "/",
        ...Object.keys(bundle).map((fileName) => `/${fileName}`),
        ...publicOfflineAssets,
      ].sort();
      const version = createHash("sha256")
        .update(`offline-v3\n${precache.join("\n")}`)
        .digest("hex")
        .slice(0, 12);
      const source = `
const CACHE_NAME = "wuban-${version}";
const PRECACHE = ${JSON.stringify(precache)};

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => Promise.all(
        PRECACHE.map(async (url) => {
          const response = await fetch(
            new Request(url, { cache: "reload" }),
          );
          if (!response.ok) {
            throw new Error(\`Unable to precache \${url}\`);
          }
          await cache.put(url, response);
        }),
      ))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(
        names
          .filter((name) => name.startsWith("wuban-") && name !== CACHE_NAME)
          .map((name) => caches.delete(name)),
      ))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          void caches.open(CACHE_NAME).then((cache) => cache.put("/", copy));
          return response;
        })
        .catch(() => caches.match("/", { ignoreVary: true })),
    );
    return;
  }

  event.respondWith(
    caches.match(request, { ignoreVary: true }).then(
      (cached) =>
        cached ??
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            void caches
              .open(CACHE_NAME)
              .then((cache) => cache.put(request, copy));
          }
          return response;
        }),
    ),
  );
});
`;
      this.emitFile({
        type: "asset",
        fileName: "sw.js",
        source,
      });
    },
    async closeBundle() {
      const serverDirectory = resolve(root, "dist/server");
      const hostingDirectory = resolve(root, "dist/.openai");
      await mkdir(serverDirectory, { recursive: true });
      await mkdir(hostingDirectory, { recursive: true });
      await copyFile(
        resolve(root, ".openai/hosting.json"),
        resolve(hostingDirectory, "hosting.json"),
      );
      await writeFile(
        resolve(serverDirectory, "index.js"),
        `
const worker = {
  async fetch(request, env) {
    const response = await env.ASSETS.fetch(request);
    if (
      response.status === 404 &&
      request.method === "GET" &&
      (request.headers.get("accept") ?? "").includes("text/html")
    ) {
      return env.ASSETS.fetch(
        new Request(new URL("/index.html", request.url), request),
      );
    }
    return response;
  },
};

export default worker;
`,
        "utf8",
      );
    },
  };
}

export default defineConfig({
  plugins: [react(), offlineBundlePlugin()],
  build: {
    outDir: "dist/client",
    target: "es2022",
    sourcemap: true,
  },
  server: {
    host: "127.0.0.1",
  },
});
