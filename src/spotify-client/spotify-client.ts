export interface SpotifyClientOptions {
  // clientId: string;
  // clientSecret: string;
  accessToken: string;
}

export type SpotifyTrack = SpotifyApi.TrackObjectFull;

export interface SpotifyDownloadOptions {
  keepTitleAsFilename?: boolean;
}

export interface SpotifyClient {
  getTrack(...trackId: string[]): Promise<SpotifyTrack[]>;
  download(
    trackId: string,
    path: string,
    options?: SpotifyDownloadOptions
  ): Promise<string>;
}
