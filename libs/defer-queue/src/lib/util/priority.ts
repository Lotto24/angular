const DEFER_QUEUE_ITEM_PRIORITIES = {
  higher: 999_999_999,
  high: 999_999,
  default: 100_000,
  low: 10_000,
  lower: 1_000,
} as const;

export type DeferQueueItemPriority =
  | keyof typeof DEFER_QUEUE_ITEM_PRIORITIES
  | number;

export function fromDeferQueueItemPriority(
  priority: DeferQueueItemPriority
): number {
  if (typeof priority === 'number') {
    return priority;
  }

  return (
    DEFER_QUEUE_ITEM_PRIORITIES[priority] ?? DEFER_QUEUE_ITEM_PRIORITIES.default
  );
}
