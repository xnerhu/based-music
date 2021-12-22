import { createWriteStream } from "fs";
import { resolve } from "path";
import SpotifyAPI from "spotify-web-api-node";
import ytdl from "ytdl-core";
import ffmpeg from "fluent-ffmpeg";
import { unlink } from "fs/promises";

import { YTClient } from "../yt-client/yt-client";
import { YTClientImpl } from "../yt-client/yt-client-impl";
import {
  SpotifyClient,
  SpotifyClientOptions,
  SpotifyDownloadOptions,
} from "./spotify-client";
import { normalizeFilename } from "../utils";

export class SpotifyClientImpl implements SpotifyClient {
  private readonly api: SpotifyAPI;

  private readonly ytClient: YTClient;

  constructor(private readonly options: SpotifyClientOptions) {
    this.api = new SpotifyAPI({
      accessToken: options.accessToken,
    });

    this.ytClient = new YTClientImpl();
  }

  public async getTrack(...trackId: string[]) {
    const {
      body: { tracks },
    } = await this.api.getTracks(trackId);

    return tracks;
  }

  public async download(
    trackId: string,
    path: string,
    options: SpotifyDownloadOptions
  ) {
    const [track] = await this.getTrack(trackId);
    const artists = track.artists.map((r) => r.name);
    const { videoId } = await this.ytClient.find({
      title: track.name,
      artists,
    });

    const normalizedPath = options.keepTitleAsFilename
      ? `${resolve(path, normalizeFilename(track.name))}.mp3`
      : path;

    const savePath = normalizedPath + ".tmp";

    await new Promise<void>(async (finish) => {
      const url = `https://music.youtube.com/watch?v=${videoId}`;
      const info = await ytdl.getInfo(url);

      const file = createWriteStream(savePath);

      const stream = ytdl.downloadFromInfo(info, {
        quality: "highestaudio",
        filter: "audioonly",
      });

      stream.on("end", finish);
      stream.pipe(file);
    });

    await new Promise<void>(async (resolve, reject) => {
      const proc = ffmpeg(savePath)
        .outputOptions("-metadata", `title=${track.name}`)
        .outputOptions("-metadata", `artist=${artists.join(" ")}`)
        .outputOptions("-metadata", `album=${track.album.name}`)
        .outputOptions("-metadata", `spotifyid=${trackId}`)
        .outputOptions("-metadata", `ytid=${videoId}`);

      proc.once("error", reject);
      proc.once("end", resolve);

      proc.save(normalizedPath);
    });

    await unlink(savePath);

    return normalizedPath;
  }
}
