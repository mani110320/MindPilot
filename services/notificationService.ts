
export class NotificationService {
  private static instance: NotificationService;
  private _hasPermission: boolean = false;

  private constructor() {
    this.syncPermission();
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  private syncPermission() {
    if ("Notification" in window) {
      this._hasPermission = Notification.permission === "granted";
    }
  }

  public get hasPermission(): boolean {
    this.syncPermission();
    return this._hasPermission;
  }

  public async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) return false;
    
    try {
      const permission = await Notification.requestPermission();
      this._hasPermission = permission === "granted";
      return this._hasPermission;
    } catch (e) {
      console.error("Notification request error:", e);
      return false;
    }
  }

  public async scheduleAlarm(title: string, body: string, habitId: string, style: 'silent' | 'banner' | 'persistent' = 'banner', alertType: 'standard' | 'phone_call' | 'voice_ai' = 'standard') {
    if (style === 'silent') return;

    if (!this.hasPermission) {
      return;
    }

    const registration = await navigator.serviceWorker?.ready;
    const isPhoneStyle = alertType === 'phone_call' || alertType === 'voice_ai';
    
    const options: any = {
      body: body,
      icon: 'https://cdn-icons-png.flaticon.com/512/3233/3233515.png',
      badge: 'https://cdn-icons-png.flaticon.com/512/3233/3233515.png',
      tag: `alarm-${habitId}`,
      renotify: true,
      requireInteraction: true,
      silent: false,
      timestamp: Date.now(),
      data: { habitId },
      actions: [
        { 
          action: 'complete', 
          title: isPhoneStyle 
            ? (alertType === 'phone_call' ? '📞 Answer Call' : '📡 Accept Uplink') 
            : '✅ Complete Mission' 
        }
      ],
      vibrate: isPhoneStyle 
        ? [1000, 500, 1000, 500, 1000, 500, 1000]
        : [500, 200, 500, 200, 500, 200, 1000]
    };

    let displayTitle = `🚨 HABIT PROTOCOL: ${title}`;
    if (alertType === 'phone_call') displayTitle = `📞 INCOMING CALL: ${title}`;
    else if (alertType === 'voice_ai') displayTitle = `📡 NEURAL UPLINK: ${title}`;

    if (registration) {
      registration.showNotification(displayTitle, options);
    } else {
      try {
        const n = new Notification(displayTitle, options);
        n.onclick = () => {
          window.focus();
          n.close();
        };
      } catch (e) {
        console.warn("Direct Notification constructor failed, use ServiceWorker if possible.");
      }
    }
    
    this.vibrate(isPhoneStyle);
  }

  public vibrate(isPhoneStyle: boolean = false) {
    if ("vibrate" in navigator) {
      if (isPhoneStyle) {
        navigator.vibrate([1000, 500, 1000, 500, 1000, 500, 1000]);
      } else {
        navigator.vibrate([500, 110, 500, 110, 450, 110, 200, 110, 170, 40, 450, 110, 200, 110, 170, 40, 500]);
      }
    }
  }
}
