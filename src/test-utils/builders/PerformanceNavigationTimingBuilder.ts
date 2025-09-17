export class PerformanceNavigationTimingBuilder {
  private timing = {
    name: 'document',
    entryType: 'navigation',
    startTime: 0,
    duration: 1000,
    domContentLoadedEventStart: 200,
    domContentLoadedEventEnd: 220,
    loadEventStart: 300,
    loadEventEnd: 320,
    redirectCount: 0,
    type: 'navigate',
    toJSON: () => ({})
  } satisfies Partial<PerformanceNavigationTiming>;

  static create(): PerformanceNavigationTimingBuilder {
    return new PerformanceNavigationTimingBuilder();
  }

  withDOMContentLoaded(start: number, end: number): PerformanceNavigationTimingBuilder {
    this.timing.domContentLoadedEventStart = start;
    this.timing.domContentLoadedEventEnd = end;
    return this;
  }

  withLoadEvent(start: number, end: number): PerformanceNavigationTimingBuilder {
    this.timing.loadEventStart = start;
    this.timing.loadEventEnd = end;
    return this;
  }

  withRedirects(count: number): PerformanceNavigationTimingBuilder {
    this.timing.redirectCount = count;
    return this;
  }

  withSlowPageLoad(): PerformanceNavigationTimingBuilder {
    return this
      .withDOMContentLoaded(800, 850)
      .withLoadEvent(1200, 1250);
  }

  withFastPageLoad(): PerformanceNavigationTimingBuilder {
    return this
      .withDOMContentLoaded(150, 160)
      .withLoadEvent(200, 210);
  }

  withRedirectScenario(): PerformanceNavigationTimingBuilder {
    return this.withRedirects(2);
  }

  build(): PerformanceNavigationTiming {
    return this.timing as PerformanceNavigationTiming;
  }
}
