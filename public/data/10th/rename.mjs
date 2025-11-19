import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Enable __dirname in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Folder containing your files
const dir = path.join(__dirname, "science1");

const files = fs.readdirSync(dir);

files.forEach((file) => {
  const ext = path.extname(file);
  const name = path.basename(file, ext);

  // If no space, skip
  if (!name.includes(" ")) return;

  // Replace LAST space with "-"
  const newName = name.replace(/ (?!.* )/, "-") + ext;

  fs.renameSync(path.join(dir, file), path.join(dir, newName));

  console.log(`${file} -> ${newName}`);
});
