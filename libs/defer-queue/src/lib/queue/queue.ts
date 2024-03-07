interface Item<T> {
  priority: number;
  payload: T;
}

export class Queue<T> {
  protected data: Item<T>[] = [];

  public insert(priority: number, payload: T): void {
    this.data = [...this.data, { priority, payload }].sort(comparePriorityHighToLow);
  }

  public take(payload: T | null = null): T | null {
    if (!payload) {
      return this.data.shift()?.payload || null;
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

  private takeSpecific(payload: T): T | null {
    const index = this.data.findIndex((s) => s.payload === payload);
    if (index < 0) {
      return null;
    }

    payload = this.data[index].payload;
    const updated = this.data.slice();
    updated.splice(index, 1);
    this.data = updated;
    return payload;
  }
}

function comparePriorityHighToLow<T>(a: Item<T>, b: Item<T>) {
  return b.priority - a.priority;
}
