// /src/types/notification.ts
export interface Data {
  key: string;
  value: string;
}

export interface Recipient {
  type: string;
  value: string;
}

export interface Notification {
  id: string;
  tenantId: string;
  senderType: "low" | "medium" | "high" | string;
  senderPhoto: string;
  sender: string;
  message: string;
  eventType: string;
  redirectURL?: string;
  redirectUrl?: string;
  createdAt: string;
  read: boolean;
  data: Data[];
  recipients: Recipient[];
}

export type PopupItem = { id: string; noti: Notification };
