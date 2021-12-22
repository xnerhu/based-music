export interface YTFindOptions {
  title: string;
  artists: string[];
}

export interface YTVideo {
  type: string;
  videoId: string;
  playlistId: string;
  name: string;
  author: string;
  views: string;
  duration: number;
  thumbnails: {
    url: string;
    width: number;
    height: number;
  };
  params: string;
}

export interface YTClient {
  find(options: YTFindOptions): Promise<YTVideo>;
}
