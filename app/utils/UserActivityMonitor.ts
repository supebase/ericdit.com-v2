const ACTIVITY_EVENTS = ["mousemove", "keydown", "scroll"] as const;

interface ActivityMonitorOptions {
  timeout?: number;
  events?: readonly string[];
}

export class ActivityMonitor {
  private timer: ReturnType<typeof setTimeout> | null = null;
  private readonly onStatusChange: (status: boolean) => void;
  private readonly timeout: number;
  private readonly events: readonly string[];

  constructor(onStatusChange: (status: boolean) => void, options: ActivityMonitorOptions = {}) {
    this.onStatusChange = onStatusChange;
    this.timeout = options.timeout || 180000; // 3 minutes
    this.events = options.events || ACTIVITY_EVENTS;
  }

  private resetTimer = () => {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.onStatusChange(true);
    this.timer = setTimeout(() => {
      this.onStatusChange(false);
    }, this.timeout);
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
      window.addEventListener(event, this.resetTimer);
    });
    document.addEventListener("visibilitychange", this.handleVisibilityChange);

    this.resetTimer();

    return () => {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.events.forEach((event) => {
        window.removeEventListener(event, this.resetTimer);
      });
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    };
  }
}
