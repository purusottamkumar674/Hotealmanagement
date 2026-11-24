import { spawn } from "node:child_process";
const port = process.env.TEST_HTTP_PORT || "3111";
const server = spawn(
  process.execPath,
  ["node_modules/next/dist/bin/next", "start", "--port", port],
  { stdio: ["ignore", "pipe", "pipe"], windowsHide: true },
);
try {
  await new Promise((resolve, reject) => {
    const timeout = setTimeout(
      () => reject(new Error("Production server did not become ready")),
      20000,
    );
    server.stdout.on("data", (data) => {
      if (String(data).includes("Ready")) {
        clearTimeout(timeout);
        resolve();
      }
    });
    server.stderr.on("data", (data) => {
      process.stderr.write(data);
    });
    server.once("error", (error) => {
      clearTimeout(timeout);
      reject(error);
    });
    server.once("exit", (code) => {
      clearTimeout(timeout);
      reject(
        new Error(`Production server exited before verification (${code})`),
      );
    });
  });
  const tests = spawn(
    process.execPath,
    ["tests/http-smoke.mjs", `http://localhost:${port}`],
    { stdio: "inherit", windowsHide: true },
  );
  process.exitCode = await new Promise((resolve, reject) => {
    tests.once("exit", (code) => resolve(code ?? 1));
    tests.once("error", reject);
  });
} finally {
  server.kill();
}
