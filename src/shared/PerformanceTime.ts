// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class PerformanceTime {
  static now(): number {
    return performance.now() + performance.timeOrigin;
  }
  static addTimeOrigin(time: number): number {
    return time + performance.timeOrigin;
  }
}
