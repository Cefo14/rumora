export abstract class PerformanceReport {
  public readonly id: string;
  public readonly createdAt: number;
  public abstract timestamp: number;

  constructor(id: string) {
    this.id = id;
    this.createdAt = Date.now();
  }

  public abstract toJSON(): unknown;

  public abstract toString(): string;

}
