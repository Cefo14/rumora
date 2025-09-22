
export class PerformanceEntryBuilder {
  private entry = {
    name: 'test-entry',
    entryType: 'measure',
    startTime: 100,
    duration: 50,
    toJSON: () => ({})
  } satisfies Partial<PerformanceEntry>;

  static create(): PerformanceEntryBuilder {
    return new PerformanceEntryBuilder();
  }

  withName(name: string): PerformanceEntryBuilder {
    this.entry.name = name;
    return this;
  }

  withType(entryType: string): PerformanceEntryBuilder {
    this.entry.entryType = entryType;
    return this;
  }

  withStartTime(startTime: number): PerformanceEntryBuilder {
    this.entry.startTime = startTime;
    return this;
  }

  withDuration(duration: number): PerformanceEntryBuilder {
    this.entry.duration = duration;
    return this;
  }

  asResource(): PerformanceEntryBuilder {
    return this.withType('resource');
  }

  asMeasure(): PerformanceEntryBuilder {
    return this.withType('measure');
  }

  asMark(): PerformanceEntryBuilder {
    return this.withType('mark').withDuration(0);
  }

  withSlowTiming(): PerformanceEntryBuilder {
    return this.withStartTime(0).withDuration(2000);
  }

  withFastTiming(): PerformanceEntryBuilder {
    return this.withStartTime(0).withDuration(50);
  }

  build(): PerformanceEntry {
    return this.entry as PerformanceEntry;
  }
}
