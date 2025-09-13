export type FallibleObserverCallback<T> = (error: Error | null, value: T | null) => void;

export abstract class FallibleObserver<T> {
  private subscribers = new Set<FallibleObserverCallback<T>>();

  public subscribe(callback: FallibleObserverCallback<T>): this {
    this.subscribers.add(callback);
    this.onSubscribe();
    return this;
  }

  public unsubscribe(callback: FallibleObserverCallback<T>): void {
    this.subscribers.delete(callback);
  }

  protected notifyError(error: Error): void {
    for (const subscriber of this.subscribers) {
      subscriber(error, null);
    }
  }

  protected notifySuccess(value: T): void {
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
