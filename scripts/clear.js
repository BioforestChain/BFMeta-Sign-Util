// @ts-check

const fs = require("node:fs");
const path = require("node:path");

const dirs = ["build"];

for (const dir of dirs) {
  const targetPath = path.join(process.cwd(), dir);
  if (fs.existsSync(targetPath)) {
    fs.rmSync(targetPath, { recursive: true });
  }
}
