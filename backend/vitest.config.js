import { defineConfig } from "vitest/config";
import { parse } from "dotenv";
import { existsSync, readFileSync } from "node:fs";

const envPath = new URL("./.env.test", import.meta.url);
const env = existsSync(envPath) ? parse(readFileSync(envPath)) : {};

export default defineConfig({
  test: {
    env,
    fileParallelism: false,
    testTimeout: 15000,
  },
});
