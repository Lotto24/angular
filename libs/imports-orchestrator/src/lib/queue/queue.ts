interface Item<T> {
  priority: number;
  payload: T;
}

export class Queue<T> {
  protected data: Item<T>[] = [];

  public insert(priority: number, payload: T): void {
    this.data = [...this.data, { priority, payload }].sort(comparePriority);
  }

  public take(payload: T | null = null): T | undefined {
    if (!payload) {
      return this.data.shift()?.payload;
    }

    return this.takeSpecific(payload);
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

  private takeSpecific(payload: T): T | undefined {
    const index = this.data.findIndex((s) => s.payload === payload);
    if (index < 0) {
      return undefined;
    }
    const item = this.data[index].payload;
    this.data = this.data.slice().splice(index, 1);
    return item;
  }
}

function comparePriority<T>(a: Item<T>, b: Item<T>) {
  return a.priority - b.priority;
}
