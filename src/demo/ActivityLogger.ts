export class ActivityLogger {
  private static instance: ActivityLogger;

  private readonly elementId = 'activity-log';
  private _container?: HTMLElement;
  private logs: HTMLElement[] = [];

  private constructor() {}

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  private get container() {
    if (this._container) return this._container;
    this._container = document.getElementById(this.elementId) as HTMLElement;
    return this._container;
  }

  public info(message: string) {
    this.log(message, 'info');
  }

  public success(message: string) {
    this.log(message, 'success');
  }

  public warning(message: string) {
    this.log(message, 'warning');
  }

  public error(message: string) {
    this.log(message, 'error');
  }

  private log(message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') {
    const timestamp = new Date().toLocaleTimeString();
    const colorClass = {
      info: 'text-gray-600',
      success: 'text-green-600', 
      warning: 'text-yellow-600',
      error: 'text-red-600'
    }[type];

    const logEntry = document.createElement('li');
    logEntry.className = colorClass;
    logEntry.textContent = `[${timestamp}] ${message}`;
    this.logs.push(logEntry);

    if (!this.container) return;
    this.container.appendChild(logEntry);
    this.container.scrollTop = this.container.scrollHeight;
  }
}
