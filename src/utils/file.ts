import { mkdir, readdir, readFile, stat } from "fs/promises";

export const pathExists = async (path: string) => {
  try {
    await stat(path);
  } catch (err) {
    return false;
  }

  return true;
};

export const ensureDir = async (...paths: string[]) => {
  await Promise.all(
    paths.map(async (path) => {
      if (!(await pathExists(path))) {
        await mkdir(path, { recursive: true });
      }
    })
  );
};

export const readLines = async (path: string) => {
  const data = await readFile(path, "utf8");
  return data.split("\n").slice(0, -1);
};

export const normalizeFilename = (filename: string) => {
  return filename.replace(/[/\\?%*:|"<>]/g, "-");
};

export const isFolder = async (path: string) => {
  return await stat(path).then((r) => r.isDirectory());
};

export const getFiles = async (dir: string) => {
  const all = await readdir(dir, { withFileTypes: true });

  return all.filter((file) => !file.isDirectory()).map((r) => r.name);
};
