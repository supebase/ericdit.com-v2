const ACTIVITY_EVENTS = [
  "mousemove",
  "keydown",
  "scroll",
  "click",
  "touchstart",
  "visibilitychange",
] as const;

interface ActivityMonitorOptions {
  timeout?: number;
  events?: readonly string[];
}

export class ActivityMonitor {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly onStatusChange: (status: boolean) => void;
  private readonly timeout: number;
  private readonly events: readonly string[];
  private debounceTimeout: NodeJS.Timeout | null = null;

  constructor(onStatusChange: (status: boolean) => void, options: ActivityMonitorOptions = {}) {
    this.onStatusChange = onStatusChange;
    this.timeout = options.timeout || 180000; // 3分钟无活动则视为离线
    this.events = options.events || ACTIVITY_EVENTS;
  }

  private debounce(fn: () => void, delay: number) {
    if (this.debounceTimeout) {
      clearTimeout(this.debounceTimeout);
    }
    this.debounceTimeout = setTimeout(fn, delay);
  }

  private resetTimer = () => {
    this.debounce(() => {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.onStatusChange(true);
      this.timer = setTimeout(() => {
        this.onStatusChange(false);
      }, this.timeout);
    }, 250);
  };

  private handleVisibilityChange = () => {
    const isVisible = !document.hidden;
    this.onStatusChange(isVisible);
    if (isVisible) {
      this.resetTimer();
    }
  };

  public start(): () => void {
    this.events.forEach((event) => {
      if (event === "visibilitychange") {
        document.addEventListener(event, this.handleVisibilityChange);
      } else {
        window.addEventListener(event, this.resetTimer);
      }
    });

    this.resetTimer();

    return () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }
      this.events.forEach((event) => {
        if (event === "visibilitychange") {
          document.removeEventListener(event, this.handleVisibilityChange);
        } else {
          window.removeEventListener(event, this.resetTimer);
        }
      });
    };
  }
}
