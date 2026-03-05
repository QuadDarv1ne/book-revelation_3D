import fs from "fs";
import path from "path";

const root = process.cwd();
const nextStatic = path.join(root, ".next", "static");
const standaloneStatic = path.join(root, ".next", "standalone", ".next", "static");
const publicDir = path.join(root, "public");
const standalonePublic = path.join(root, ".next", "standalone", "public");

// Copy .next/static to .next/standalone/.next/static
if (fs.existsSync(nextStatic)) {
  fs.cpSync(nextStatic, standaloneStatic, { recursive: true, force: true });
}

// Copy public to .next/standalone/public
if (fs.existsSync(publicDir)) {
  fs.cpSync(publicDir, standalonePublic, { recursive: true, force: true });
}
