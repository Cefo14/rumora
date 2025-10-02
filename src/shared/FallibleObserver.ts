type SuccessCallback<T> = (value: T) => void;
type ErrorCallback = (error: Error) => void;
export abstract class FallibleObserver<T> {
  private successSubscribers = new Set<SuccessCallback<T>>();
  private errorSubscribers = new Set<ErrorCallback>();

  public onSuccess(callback: SuccessCallback<T>): this {
    this.successSubscribers.add(callback);
    this.onSubscribe();
    return this;
  }

  public onError(callback: ErrorCallback): this {
    this.errorSubscribers.add(callback);
    this.onSubscribe();
    return this;
  }

  public removeSuccessCallback(callback: SuccessCallback<T>): void {
    this.successSubscribers.delete(callback);
  }

  public removeErrorCallback(callback: ErrorCallback): void {
    this.errorSubscribers.delete(callback);
  }

  protected notifyError(error: Error): void {
    for (const subscriber of this.errorSubscribers) {
      subscriber(error);
    }
  }

  protected notifySuccess(value: T): void {
    for (const subscriber of this.successSubscribers) {
      subscriber(value);
    }
  }

  protected clearSubscribers(): void {
    this.successSubscribers.clear();
    this.errorSubscribers.clear();
  }

  protected onSubscribe(): void {
    // No-op
  }
}
