// src/auth/ssoSync.ts
import { isSSOAvailable } from "@/config/api";

const CHANNEL_NAME = "mt-mdss-sso";

export class SSOSync {
  private static channel: BroadcastChannel | null = null;

  static init(onChange: () => void) {
    if ("BroadcastChannel" in window) {
      this.channel = new BroadcastChannel(CHANNEL_NAME);
      this.channel.onmessage = () => onChange();
    }

    // Fallback: localStorage event
    window.addEventListener("storage", (e) => {
      if (e.key === CHANNEL_NAME) onChange();
    });
  }

  static notify() {
    if (this.channel) {
      this.channel.postMessage({ ts: Date.now() });
    }
    localStorage.setItem(CHANNEL_NAME, Date.now().toString());
  }

  static isSSOAvailable() {
    return isSSOAvailable();
  }
}
