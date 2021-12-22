const YoutubeMusicApi = require("youtube-music-api");

import { YTFindOptions, YTClient, YTVideo } from "./yt-client";

export class YTClientImpl implements YTClient {
  private api: any;

  private isApiInitialized = false;

  constructor() {
    this.api = new YoutubeMusicApi();
  }

  private async initAPI() {
    if (this.isApiInitialized) return;
    await this.api.initalize();
  }

  public async find({ title, artists }: YTFindOptions): Promise<YTVideo> {
    await this.initAPI();

    const query = `${title} ${artists.join(" ")}`;
    const res = await this.api.search(query);

    let content = res.content as YTVideo[];

    if (content.length < 1) {
      content = (await this.api.search(`${artists[0]} ${title}`))
        .content as YTVideo[];
    }

    const items = content.filter(
      (track: any) => track.type === "song" || track.type === "video"
    );

    if (items.length < 1) {
      throw new Error(`Video ${title} not found`);
    }

    if (items.length > 1) {
      if (items[0].type === "song") return items[0];
      if (items[1].type === "song") return items[1];
    }

    return items[0];
  }
}
