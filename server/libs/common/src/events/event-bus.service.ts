import { randomUUID } from 'node:crypto';
import { Injectable, Logger, type OnModuleDestroy } from '@nestjs/common';
import type { Event, EventHandler, EventSubscription } from './interfaces/event.interface';
import { EventPriority } from './interfaces/event.interface';

@Injectable()
export class EventBusService implements OnModuleDestroy {
  private readonly logger = new Logger(EventBusService.name);
  private readonly subscriptions = new Map<string, EventSubscription[]>();
  private readonly eventHistory: Event[] = [];
  private readonly maxHistorySize = 1000;

  async onModuleDestroy() {
    this.subscriptions.clear();
    this.eventHistory.length = 0;
    this.logger.log('Event Bus Service destroyed');
  }

  /**
   * Subscribe to an event
   */
  subscribe<T = any>(
    eventName: string,
    handler: EventHandler<T>,
    priority: EventPriority = EventPriority.NORMAL,
  ): string {
    const subscription: EventSubscription = {
      id: randomUUID(),
      eventName,
      handler,
      priority,
    };

    const existing = this.subscriptions.get(eventName) || [];
    existing.push(subscription);

    // Sort by priority (highest first)
    existing.sort((a, b) => b.priority - a.priority);

    this.subscriptions.set(eventName, existing);

    this.logger.log(`Subscribed to event: ${eventName} (ID: ${subscription.id})`);
    return subscription.id;
  }

  /**
   * Unsubscribe from an event
   */
  unsubscribe(subscriptionId: string): boolean {
    for (const [eventName, subs] of this.subscriptions.entries()) {
      const index = subs.findIndex((s) => s.id === subscriptionId);
      if (index !== -1) {
        subs.splice(index, 1);
        if (subs.length === 0) {
          this.subscriptions.delete(eventName);
        }
        this.logger.log(`Unsubscribed from event (ID: ${subscriptionId})`);
        return true;
      }
    }
    return false;
  }

  /**
   * Publish an event
   */
  async publish<T = any>(
    eventName: string,
    data: T,
    options?: {
      priority?: EventPriority;
      source?: string;
      metadata?: Record<string, any>;
    },
  ): Promise<void> {
    const event: Event<T> = {
      id: randomUUID(),
      name: eventName,
      data,
      priority: options?.priority ?? EventPriority.NORMAL,
      timestamp: new Date(),
      source: options?.source,
      metadata: options?.metadata,
    };

    // Add to history
    this.addToHistory(event);

    // Get subscribers
    const subscribers = this.subscriptions.get(eventName) || [];

    if (subscribers.length === 0) {
      this.logger.debug(`No subscribers for event: ${eventName}`);
      return;
    }

    this.logger.log(`Publishing event: ${eventName} to ${subscribers.length} subscriber(s)`);

    // Execute handlers
    const promises = subscribers.map(async (sub) => {
      try {
        await sub.handler.handle(event);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error handling event ${eventName} in subscription ${sub.id}: ${errorMessage}`,
        );
      }
    });

    await Promise.all(promises);
  }

  /**
   * Publish an event synchronously
   */
  publishSync<T = any>(
    eventName: string,
    data: T,
    options?: {
      priority?: EventPriority;
      source?: string;
      metadata?: Record<string, any>;
    },
  ): void {
    const event: Event<T> = {
      id: randomUUID(),
      name: eventName,
      data,
      priority: options?.priority ?? EventPriority.NORMAL,
      timestamp: new Date(),
      source: options?.source,
      metadata: options?.metadata,
    };

    // Add to history
    this.addToHistory(event);

    // Get subscribers
    const subscribers = this.subscriptions.get(eventName) || [];

    if (subscribers.length === 0) {
      this.logger.debug(`No subscribers for event: ${eventName}`);
      return;
    }

    this.logger.log(`Publishing event (sync): ${eventName} to ${subscribers.length} subscriber(s)`);

    // Execute handlers synchronously
    for (const sub of subscribers) {
      try {
        sub.handler.handle(event);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        this.logger.error(
          `Error handling event ${eventName} in subscription ${sub.id}: ${errorMessage}`,
        );
      }
    }
  }

  /**
   * Get all subscriptions for an event
   */
  getSubscriptions(eventName: string): EventSubscription[] {
    return this.subscriptions.get(eventName) || [];
  }

  /**
   * Get all registered event names
   */
  getEventNames(): string[] {
    return Array.from(this.subscriptions.keys());
  }

  /**
   * Get event history
   */
  getHistory(eventName?: string, limit = 100): Event[] {
    const history = eventName
      ? this.eventHistory.filter((e) => e.name === eventName)
      : this.eventHistory;

    return history.slice(-limit);
  }

  /**
   * Clear event history
   */
  clearHistory(): void {
    this.eventHistory.length = 0;
    this.logger.log('Event history cleared');
  }

  /**
   * Get event bus statistics
   */
  getStats() {
    const eventNames = this.getEventNames();
    const subscriptionCounts = eventNames.map((name) => ({
      event: name,
      subscribers: this.subscriptions.get(name)?.length || 0,
    }));

    return {
      totalEvents: eventNames.length,
      totalSubscriptions: Array.from(this.subscriptions.values()).reduce(
        (sum, subs) => sum + subs.length,
        0,
      ),
      historySize: this.eventHistory.length,
      subscriptionCounts,
    };
  }

  /**
   * Add event to history
   */
  private addToHistory(event: Event): void {
    this.eventHistory.push(event);

    // Trim history if too large
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.splice(0, this.eventHistory.length - this.maxHistorySize);
    }
  }
}
