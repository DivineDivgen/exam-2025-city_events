import { spawn } from "node:child_process";

const run = (cmd, args) =>
  new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: "inherit" });
    child.on("error", reject);
    child.on("exit", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(" ")} exited with code ${code}`));
    });
  });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

await run("npx", ["prisma", "generate"]);

const maxAttempts = Number(process.env.PRISMA_MIGRATE_MAX_ATTEMPTS || 30);
for (let attempt = 1; attempt <= maxAttempts; attempt++) {
  try {
    await run("npx", ["prisma", "migrate", "deploy"]);
    process.exit(0);
  } catch (err) {
    console.error(
      `prisma migrate deploy failed (attempt ${attempt}/${maxAttempts}):`,
      err?.message || err
    );
    await sleep(2000);
  }
}

process.exit(1);

