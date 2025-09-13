export type SimpleCallback<T> = (value: T) => void;

export abstract class SimpleObserver<T> {
  private subscribers = new Set<SimpleCallback<T>>();

  public subscribe(callback: SimpleCallback<T>): this {
    this.subscribers.add(callback);
    this.onSubscribe();
    return this;
  }

  public unsubscribe(callback: SimpleCallback<T>): void {
    this.subscribers.delete(callback);
  }

  protected notify(value: T): void {
    for (const subscriber of this.subscribers) {
      subscriber(value);
    }
  }

  protected clearSubscribers(): void {
    this.subscribers.clear();
  }

  protected onSubscribe(): void {
    // Override if needed
  }
}