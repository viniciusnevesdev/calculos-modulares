/** Serialize writes to prevent older edits from completing after newer edits. */
export class WriteQueue {
  private tail: Promise<unknown> = Promise.resolve();
  pending = 0;
  run<T>(task: () => Promise<T>): Promise<T> {
    this.pending++;
    const result = this.tail.then(task);
    this.tail = result.catch(() => undefined);
    return result.finally(() => { this.pending--; });
  }
}
