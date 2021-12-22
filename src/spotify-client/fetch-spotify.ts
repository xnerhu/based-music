import Progressbar from "progress";

import { Queue } from "../utils";
import { AccessToken, getAccessToken } from "./access-token";
import { SpotifyClient } from "./spotify-client";
import { SpotifyClientImpl } from "./spotify-client-impl";

export interface SpotifyFetchOptions {
  out: string;
  clientId: string;
  clientSecret: string;
  threads?: number;
}

class Client {
  private accessToken?: AccessToken;

  private accessTokenExpirationTime?: number;

  private queue: Queue<string, string>;

  private bar: Progressbar;

  constructor(private readonly options: SpotifyFetchOptions) {
    this.queue = new Queue<string, string>(
      this.downloadDelegate,
      this.onDownload,
      this.options.threads
    );
  }

  private async getAccessToken() {
    if (
      this.accessToken == null ||
      this.accessTokenExpirationTime == null ||
      Date.now() >= this.accessTokenExpirationTime
    ) {
      const { clientId, clientSecret } = this.options;
      this.accessToken = await getAccessToken(clientId, clientSecret);
      // expiration time is in seconds
      this.accessTokenExpirationTime =
        Date.now() + (this.accessToken.expiresIn - 60) * 1000;
    }

    return this.accessToken.value;
  }

  private async createClient(): Promise<SpotifyClient> {
    const accessToken = await this.getAccessToken();
    return new SpotifyClientImpl({ accessToken });
  }

  private downloadDelegate = async (track: string) => {
    const client = await this.createClient();

    return await client.download(track, this.options.out, {
      keepTitleAsFilename: true,
    });
  };

  private onDownload = () => {
    this.bar.tick();
  };

  public async start(ids: string[]) {
    this.bar = new Progressbar("%s [:bar] :percent :etas", {
      complete: "=",
      incomplete: " ",
      total: ids.length,
      width: 60,
    });

    this.bar.render();

    this.queue.add(...ids);
    this.queue.process();

    await this.queue.waitForFinish();
  }
}

export const fetchSpotifyTracks = async (
  ids: string[],
  options: SpotifyFetchOptions
) => {
  const client = new Client(options);
  await client.start(ids);
};
