import { createCommand } from "commander";
import { readdir } from "fs/promises";
import { basename, extname, resolve } from "path";
import Progressbar from "progress";

import { convertAudio } from "../audio";
import { ensureDir, Queue, readLines } from "../utils";

export interface CommandConvertToWavOptions {
  path: string;
  out: string;
  threads?: number;
}

export const commandConvertToWav = createCommand("convert")
  .description("converts every audio/video file in a directory to wav format")
  .requiredOption("-p, --path <string>", "path to directory")
  .requiredOption("-o, --out <string>", "where to save songs")
  .option("-t, --threads <number>", "number of threads", "1")
  .action(async ({ path, out, threads }: CommandConvertToWavOptions) => {
    await ensureDir(out);

    const files = await readdir(path);

    const bar = new Progressbar("%s [:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      total: files.length,
      width: 100,
    });

    bar.render();

    const targetFormat = "wav";

    const queue = new Queue<string, void>(
      async (filename) => {
        const srcPath = resolve(path, filename);

        const dstPath = resolve(
          out,
          basename(filename, extname(filename)) + `.${targetFormat}`
        );

        await convertAudio(srcPath, dstPath, "wav");
      },
      () => {
        bar.tick();
      },
      threads
    );

    queue.add(...files);
    queue.process();

    await queue.waitForFinish();
  });
