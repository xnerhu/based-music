import ffmpeg, { FfprobeData } from "fluent-ffmpeg";

export const getAudioData = (src: string) => {
  return new Promise<FfprobeData>((resolve, reject) => {
    ffmpeg(src).ffprobe((err, data) => {
      if (err) return reject(err);
      resolve(data);
    });
  });
};

export const convertAudio = (path: string, out: string, format: string) => {
  return new Promise<void>((finish, reject) => {
    const proc = ffmpeg(path).format(format);

    proc.once("error", reject);
    proc.once("end", finish);

    proc.save(out);
  });
};
