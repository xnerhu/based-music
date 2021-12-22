import { mkdir, readFile, stat } from "fs/promises";

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
