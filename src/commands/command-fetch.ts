import { createCommand } from "commander";
import { resolve } from "path";

import { getConfig } from "../config";
import { fetchSpotifyTracks } from "../spotify-client/fetch-spotify";
import { normalizeSpotifyId } from "../spotify-client/spotify-utils";
import { ensureDir, readLines } from "../utils";

export interface CommandTextOptions {
  path: string;
  out: string;
  threads?: number;
}

export const commandFetchFromText = createCommand("fetch")
  .description("downloads songs from spotify that are listed in a file")
  .requiredOption("-p, --path <string>", "path to file")
  .requiredOption("-o, --out <string>", "where to save songs")
  .option("-t, --threads <number>", "number of threads", "1")
  .action(async ({ path, out, threads }: CommandTextOptions) => {
    const config = getConfig();

    await ensureDir(out);

    const lines = await readLines(path);

    await fetchSpotifyTracks([...new Set(lines.map(normalizeSpotifyId))], {
      ...config,
      threads,
      out: resolve(out),
    });
  });
