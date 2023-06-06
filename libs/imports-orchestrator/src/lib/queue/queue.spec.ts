import { Queue } from './queue';

describe('Queue', () => {
  let queue: Queue<string>;
  beforeEach(() => {
    queue = new Queue<string>();
    queue.insert(1, '1.0');
    queue.insert(5, '5.0');
    queue.insert(3, '3.0');
    queue.insert(7, '7.0');
    queue.insert(3, '3.1');
  });

  it('should take the first payload', () => {
    expect(queue.length).toBe(5);
    expect(queue.take()).toBe('1.0');
    expect(queue.take()).toBe('3.0');
    expect(queue.peek()).toBe('3.1');
    expect(queue.take()).toBe('3.1');
    expect(queue.take()).toBe('5.0');
    expect(queue.peek()).toBe('7.0');
    expect(queue.take()).toBe('7.0');
    expect(queue.take()).toBeUndefined();
  });
});
