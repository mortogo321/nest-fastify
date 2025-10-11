export enum EventPriority {
  LOW = 0,
  NORMAL = 5,
  HIGH = 10,
  CRITICAL = 15,
}

export interface Event<T = any> {
  id: string;
  name: string;
  data: T;
  priority: EventPriority;
  timestamp: Date;
  source?: string;
  metadata?: Record<string, any>;
}

export interface EventHandler<T = any> {
  handle(event: Event<T>): Promise<void> | void;
}

export interface EventSubscription {
  id: string;
  eventName: string;
  handler: EventHandler;
  priority: EventPriority;
}
