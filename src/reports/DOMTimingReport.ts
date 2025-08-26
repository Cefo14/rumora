import { PerformanceReport } from "./PerformanceReport";

interface DOMTimingData {
  id: string;
  domInteractiveTime: number;
  domProcessingTime: number;
  domContentLoadedDuration: number;
  loadEventDuration: number;
  totalDOMTime: number;
}

export class DOMTimingReport extends PerformanceReport {
  /**
   * Time until DOM became interactive (DOMContentLoaded ready).
   * 
   * @unit milliseconds
   * @remarks
   * Time from navigation start until DOM is ready for interaction.
   * This is when DOMContentLoaded event can fire.
   */
  public readonly domInteractiveTime: number;

  /**
   * Time spent processing DOM after interactive state.
   * 
   * @unit milliseconds
   * @remarks
   * Time from domInteractive to domComplete.
   * Includes additional resource loading and processing.
   */
  public readonly domProcessingTime: number;

  /**
   * Time spent executing DOMContentLoaded event listeners.
   * 
   * @unit milliseconds
   * @remarks
   * Should be minimal (< 50ms) for good performance.
   * Heavy listeners block further page processing.
   */
  public readonly domContentLoadedDuration: number;

  /**
   * Time spent executing window.load event listeners.
   * 
   * @unit milliseconds
   * @remarks
   * Should be minimal as it blocks onload completion.
   * Consider async/defer for heavy operations.
   */
  public readonly loadEventDuration: number;

  /**
   * Total time spent on DOM-related processing.
   * 
   * @unit milliseconds
   * @remarks
   * Combined time for all client-side DOM operations.
   */
  public readonly totalDOMTime: number;

  public readonly timestamp: number;

  constructor(data: DOMTimingData) {
    super(data.id);
    this.domInteractiveTime = data.domInteractiveTime;
    this.domProcessingTime = data.domProcessingTime;
    this.domContentLoadedDuration = data.domContentLoadedDuration;
    this.loadEventDuration = data.loadEventDuration;
    this.totalDOMTime = data.totalDOMTime;
    this.timestamp = Date.now();
  }

  /**
   * Total time spent on event listener execution.
   * 
   * @unit milliseconds
   * @returns DOMContentLoaded + Load event duration
   */
  get eventListenerTime(): number {
    return this.domContentLoadedDuration + this.loadEventDuration;
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
  get clientTime(): number {
    return this.domProcessingTime + this.domContentLoadedDuration + this.loadEventDuration;
  }

  /**
   * Check if DOM processing is slow.
   * 
   * @returns true if total DOM time > 1500ms
   */
  isDOMProcessingSlow(): boolean {
    return this.totalDOMTime > 1500;
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
    return `DOM: ${this.totalDOMTime}ms (Interactive: ${this.domInteractiveTime}ms, Events: ${this.eventListenerTime}ms)`;
  }

  toJSON() {
    return {
      id: this.id,
      domInteractiveTime: this.domInteractiveTime,
      domProcessingTime: this.domProcessingTime,
      domContentLoadedDuration: this.domContentLoadedDuration,
      loadEventDuration: this.loadEventDuration,
      totalDOMTime: this.totalDOMTime,
      eventListenerTime: this.eventListenerTime,
      clientTime: this.clientTime,
      timestamp: this.timestamp
    };
  }
}