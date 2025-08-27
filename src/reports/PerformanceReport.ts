export abstract class PerformanceReport {
  public readonly id: string;
  public abstract readonly createdAt: number;

  constructor(id: string) {
    this.id = id;
  }

  public abstract toJSON(): unknown;

  public abstract toString(): string;
}
