enum ThreadStatus {
  Waiting,
  Pending,
  Fulfilled,
  Rejected,
}

interface ThreadData<T> {
  index: number;
  data: T;
  status: ThreadStatus;
}

export class Queue<T, K = any> {
  private queue: T[] = [];

  private threads: (ThreadData<T> | undefined)[] = [];

  private availableThreads = 0;

  private finishCb?: () => void;

  constructor(
    private readonly executeDelegate: (
      data: T,
      threadId: number,
    ) => Promise<K> | K,
    private readonly consumerDelegate: (data: K) => Promise<void> | void,
    private readonly threadsCount: number = 1,
  ) {
    this.initThreads();
  }

  private initThreads() {
    this.availableThreads = this.threadsCount;

    for (let i = 0; i < this.threadsCount; i++) {
      this.threads[i] = undefined;
    }
  }

  public add(...items: T[]) {
    this.queue.push(...items);
  }

  private allocate() {
    if (this.availableThreads === 0 || this.queue.length === 0) return false;

    const item = this.queue.pop()!;

    for (let i = 0; i < this.threads.length; i++) {
      if (this.threads[i] == null) {
        this.threads[i] = {
          data: item,
          status: ThreadStatus.Waiting,
          index: i,
        };
        this.availableThreads--;
        return true;
      }
    }

    this.queue.push(item);

    return false;
  }

  private allocateQueue() {
    while (true) {
      const allocated = this.allocate();

      if (!allocated) break;
    }
  }

  private async execute(thread: ThreadData<T>) {
    thread.status = ThreadStatus.Pending;

    try {
      const res = await this.executeDelegate(thread.data, thread.index);

      await this.consumerDelegate(res);

      thread.status = ThreadStatus.Fulfilled;
    } catch (error) {
      thread.status = ThreadStatus.Rejected;
      console.log(error);
    }

    this.process();
  }

  public process() {
    if (
      this.queue.length === 0 &&
      this.availableThreads === this.threadsCount
    ) {
      this.finishCb?.();
      return;
    }

    for (let i = 0; i < this.threads.length; i++) {
      const thread = this.threads[i];

      if (thread == null || thread.status === ThreadStatus.Fulfilled) {
        this.threads[i] = undefined;
        this.availableThreads++;
      }
    }

    this.allocateQueue();

    for (const thread of this.threads) {
      if (thread?.status === ThreadStatus.Waiting) {
        this.execute(thread);
      }
    }
  }

  public waitForFinish() {
    return new Promise<void>((resolve) => {
      this.finishCb = resolve;
    });
  }
}
