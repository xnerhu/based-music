export const normalizeSpotifyId = (uri: string) => {
  if (uri.startsWith("http")) {
    return uri.split("https://open.spotify.com/track/")[1];
  }
  return uri;
};
