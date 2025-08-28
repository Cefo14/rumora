import type { PerformanceReport } from "./PerformanceReport";

interface DOMTimingData {
  id: string;
  createdAt: number;
  interactiveTime: number;
  processingTime: number;
  contentLoadedDuration: number;
  loadEventDuration: number;
}

export class DOMTimingReport implements PerformanceReport {
  public readonly id: string;
  public readonly createdAt: number;

  /**
   * Time until DOM became interactive (DOMContentLoaded ready).
   * 
   * @unit milliseconds
   * @remarks
   * Time from navigation start until DOM is ready for interaction.
   * This is when DOMContentLoaded event can fire.
   */
  public readonly interactiveTime: number;

  /**
   * Time spent processing DOM after interactive state.
   * 
   * @unit milliseconds
   * @remarks
   * Time from domInteractive to domComplete.
   * Includes additional resource loading and processing.
   */
  public readonly processingTime: number;

  /**
   * Time spent executing DOMContentLoaded event listeners.
   * 
   * @unit milliseconds
   * @remarks
   * Should be minimal (< 50ms) for good performance.
   * Heavy listeners block further page processing.
   */
  public readonly contentLoadedDuration: number;

  /**
   * Time spent executing window.load event listeners.
   * 
   * @unit milliseconds
   * @remarks
   * Should be minimal as it blocks onload completion.
   * Consider async/defer for heavy operations.
   */
  public readonly loadEventDuration: number;

  constructor(data: DOMTimingData) {
    this.id = data.id;
    this.interactiveTime = data.interactiveTime;
    this.processingTime = data.processingTime;
    this.contentLoadedDuration = data.contentLoadedDuration;
    this.loadEventDuration = data.loadEventDuration;
    this.createdAt = data.createdAt;
  }

  /**
   * Total time spent on event listener execution.
   * 
   * @unit milliseconds
   * @returns DOMContentLoaded + Load event duration
   */
  get eventListenerTime(): number {
    return this.contentLoadedDuration + this.loadEventDuration;
  }

    /**
   * Total time spent on client-side processing.
   * 
   * @unit milliseconds
   * @returns DOM parsing + Event listeners execution time
   * @remarks
   * If > 30% of total time, optimize:
   * - Reduce JavaScript bundle size
   * - Defer non-critical scripts
   * - Optimize DOM complexity
   */
  get totalTime(): number {
    return this.processingTime + this.contentLoadedDuration + this.loadEventDuration;
  }

  /**
   * Check if DOM processing is slow.
   * 
   * @returns true if total DOM time > 1500ms
   */
  isDOMProcessingSlow(): boolean {
    return this.totalTime > 1500;
  }

  /**
   * Check if event listeners are too slow.
   * 
   * @returns true if event listeners > 100ms combined
   */
  areEventListenersSlow(): boolean {
    return this.eventListenerTime > 100;
  }

  toString(): string {
    return `DOM: ${this.totalTime}ms (Interactive: ${this.interactiveTime}ms, Events: ${this.eventListenerTime}ms)`;
  }

  toJSON() {
    return {
      id: this.id,
      interactiveTime: this.interactiveTime,
      processingTime: this.processingTime,
      contentLoadedDuration: this.contentLoadedDuration,
      loadEventDuration: this.loadEventDuration,
      totalTime: this.totalTime,
      eventListenerTime: this.eventListenerTime,
    };
  }
}