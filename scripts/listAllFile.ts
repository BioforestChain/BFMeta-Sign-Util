import { walkFiles } from "@gaubee/nodekit";
import fs from "node:fs";
import path from "node:path";

const js = process.env.js === "true" ? true : false;

function getAllFile(targetPath) {
  return [
    ...walkFiles(targetPath, {
      matchFile: (entry) => {
        return entry.name.endsWith(js ? ".js" : ".ts");
      },
    }),
  ].map((entry) => entry.relativePath);
}

function listAllFile(dirPaths) {
  for (const dirPath of dirPaths) {
    const rootPath = path.resolve(import.meta.dirname, `../${dirPath}`);

    const allFileName = getAllFile(rootPath);

    const index = allFileName[0].indexOf("/") + 1;

    const result = allFileName.map((fileName) => fileName.slice(index));

    for (const tsconfigFilename of ["tsconfig.cjs.json", "tsconfig.esm.json"]) {
      const tsconfigPath = `${rootPath}/${tsconfigFilename}`;
      if (!fs.existsSync(tsconfigPath)) {
        continue;
      }

      const tsconfig = JSON.parse(fs.readFileSync(tsconfigPath).toString());

      tsconfig.files = result;

      fs.writeFileSync(tsconfigPath, JSON.stringify(tsconfig, null, 4));
    }
  }
}

listAllFile(["src", "test"]);
