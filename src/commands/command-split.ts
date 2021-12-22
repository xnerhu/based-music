import { createCommand } from "commander";
import { resolve } from "path";
import Progressbar from "progress";

import {
  AudioChunk,
  AudioChunksOptions,
  getAudioChunks,
  processAudio,
} from "../audio";
import {
  ensureDir,
  getFiles,
  parseAllToNumber,
  Queue,
  threadify,
} from "../utils";

export interface CommandSplitOptions {
  path: string;
  out: string;
  segments: number;
  length: number;
  offset: number;
  margin: number;
  sample_rate: number;
  threads: number;
  channels: number;
}

export const commandSplit = createCommand("split")
  .description("splits audio into multiple segments")
  .requiredOption("-p, --path <string>", "path to directory")
  .requiredOption("-o, --out <string>", "where to save songs")
  .requiredOption("-n, --segments <number>", "number of segments")
  .requiredOption("-l, --length <number>", "length of segments in seconds")
  .requiredOption("-f, --offset <number>", "offset to segments in seconds")
  .requiredOption("-m, --margin <number>", "margin between segments in seconds")
  .option("-c, --channels <number>", "number of audio channels", "1")
  .option("-r, --sample_rate <number>", "sample rate")
  .option("-t, --threads <number>", "number of threads", "1")
  .action(async ({ path, out, ...options }: CommandSplitOptions) => {
    const {
      threads,
      length,
      margin,
      offset,
      sample_rate: sampleRate,
      segments,
      channels,
    } = parseAllToNumber(options);

    await ensureDir(out);

    const files = await getFiles(path);

    const chunks = await threadify<typeof getAudioChunks, AudioChunk>(
      getAudioChunks,
      threads,
      files.map((file) => [
        resolve(path, file),
        out,
        {
          segments,
          offset,
          length,
          margin,
        } as AudioChunksOptions,
      ])
    ).then((r) => r.flat());

    const bar = new Progressbar("%s [:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      total: chunks.length,
      width: 100,
    });

    bar.render();

    const queue = new Queue<AudioChunk, void>(
      async ({ src, dst, length, offset }) => {
        await processAudio(src, dst, {
          channels,
          length,
          offset,
          sampleRate,
        });
      },
      () => {
        bar.tick();
      },
      threads
    );

    queue.add(...chunks);
    queue.process();

    await queue.waitForFinish();
  });
