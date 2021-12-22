import ffmpeg, { FfprobeData } from "fluent-ffmpeg";
import { basename, extname, resolve } from "path";

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

export interface ProcessAudioOptions {
  offset?: number;
  length?: number;
  sampleRate?: number;
  channels?: number;
}

export const processAudio = async (
  src: string,
  dst: string,
  options: ProcessAudioOptions
) => {
  return new Promise<string>((finish, reject) => {
    let proc = ffmpeg(src);

    if (options.offset) proc = proc.seekInput(options.offset);
    if (options.length) proc = proc.duration(options.length);
    if (options.sampleRate) proc = proc.audioFrequency(options.sampleRate);
    if (options.channels) proc = proc.audioChannels(options.channels);

    proc.once("error", reject);
    proc.once("end", () => finish(dst));

    proc.save(dst);
  });
};

export interface AudioChunksOptions {
  segments: number;
  length: number;
  offset: number;
  margin: number;
  sampleRate?: number;
}

export interface AudioChunk {
  src: string;
  dst: string;
  offset: number;
  length: number;
}

export const getAudioChunks = async (
  src: string,
  dst: string,
  { segments, offset, margin, length }: AudioChunksOptions
) => {
  const ext = extname(src);
  const filename = basename(src, ext);
  const {
    format: { duration: totalDuration },
  } = await getAudioData(src);

  if (totalDuration == null) {
    throw new Error("Duration is undefined");
  }

  const chunks: AudioChunk[] = [];

  for (let i = 0; i < segments; i++) {
    const chunkOffset = (offset ?? 0) + i * length + (margin ?? 0) * i;

    if (chunkOffset + length >= totalDuration) continue;

    chunks.push({
      src,
      offset: chunkOffset,
      length,
      dst: resolve(dst, `${filename}_${i}${ext}`),
    });
  }

  return chunks;
};
