export type ObserverCallback<T> = (error: Error | null, value: T | null) => void;

export abstract class Observer<T> {
  private subscribers: Set<ObserverCallback<T>> = new Set();

  public subscribe(callback: ObserverCallback<T>): this {
    this.subscribers.add(callback);
    this.onSubscribe();
    return this;
  }

  public unsubscribe(callback: ObserverCallback<T>): void {
    this.subscribers.delete(callback);
  }

  protected notifyError(error: Error): void {
    for (const subscriber of this.subscribers) {
      subscriber(error, null);
    }
  }

  protected notifyChange(value: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(null, value);
    }
  }

  protected clearSubscribers(): void {
    this.subscribers.clear();
  }

  protected onSubscribe(): void {
    // No-op
  }
}
