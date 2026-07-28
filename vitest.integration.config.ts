import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  test: {
    environment: "jsdom",
    include: ["src/**/*.integration.test.{ts,tsx}"],
    setupFiles: ["./src/test-support/setup-tests.ts"],
  },
});
