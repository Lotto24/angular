interface Item<T> {
  priority: number;
  payload: T;
}

export class Queue<T> {
  protected data: Item<T>[] = [];

  public insert(priority: number, payload: T): void {
    this.data = [...this.data, { priority, payload }].sort(comparePriority);
  }

  public take(): T | undefined {
    return this.data.shift()?.payload;
  }

  public peek(): T | undefined {
    return this.data[0]?.payload;
  }

  public get length(): number {
    return this.data.length;
  }

  public get empty(): boolean {
    return this.length < 1;
  }
}

function comparePriority<T>(a: Item<T>, b: Item<T>) {
  return a.priority - b.priority;
}
