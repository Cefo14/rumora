type LogType = 'info' | 'success' | 'warning' | 'error';

export class ActivityLogger {
  private static instance: ActivityLogger;
  private container: HTMLElement | null;

  private constructor() {
    this.container = document.getElementById('activity-log');
  }

  public static getInstance(): ActivityLogger {
    if (!ActivityLogger.instance) {
      ActivityLogger.instance = new ActivityLogger();
    }
    return ActivityLogger.instance;
  }

  private log(message: string, type: LogType = 'info'): void {
    if (!this.container) return;
    
    const colors: Record<LogType, string> = {
      info: 'text-blue-400',
      success: 'text-green-400',
      warning: 'text-yellow-400',
      error: 'text-red-400'
    };
    
    const symbols: Record<LogType, string> = {
      info: '○',
      success: '●',
      warning: '◆',
      error: '✕'
    };

    const li = document.createElement('li');
    li.className = colors[type];
    li.textContent = `${symbols[type]} ${message}`;
    this.container.appendChild(li);
    this.container.scrollTop = this.container.scrollHeight;
  }

  public info(message: string): void {
    this.log(message, 'info');
  }

  public success(message: string): void {
    this.log(message, 'success');
  }

  public warning(message: string): void {
    this.log(message, 'warning');
  }

  public error(message: string): void {
    this.log(message, 'error');
  }
}