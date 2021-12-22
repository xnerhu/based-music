import { Queue } from "./queue";

export const threadify = async <T extends (...args: any[]) => any, K>(
  fn: T,
  threads: number,
  args: any[]
): Promise<K[]> => {
  const res: K[] = [];

  const queue = new Queue<any, K>(
    async (args) => {
      return await fn(...args);
    },
    (data: K) => {
      res.push(data);
    },
    threads
  );

  queue.add(...args);
  queue.process();

  await queue.waitForFinish();

  return res;
};
