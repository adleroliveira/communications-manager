import { Subscription, SubscriptionStatus } from "./interfaces";
import { RequestManager } from "./RequestManager";
import { Logger, LogLevel } from "./Logger";

export class SubscriptionManager {
  private logger: Logger;
  private subscriptions: Map<string, Subscription> = new Map();

  constructor(private requestManager: RequestManager) {
    this.logger = new Logger(LogLevel.INFO);
  }

  public async subscribe(channel: string): Promise<void> {
    const subscription = this.subscriptions.get(channel);
    if (
      !subscription ||
      subscription.status !== SubscriptionStatus.Subscribed
    ) {
      this.subscriptions.set(channel, {
        channel,
        status: SubscriptionStatus.Pending,
      });
      try {
        const result = await this.requestManager.request("subscribe", {
          channel,
        });
        if (!result.success) {
          throw (
            result.error ||
            new Error(`Error trying to subscribe to channel ${channel}`)
          );
        }
        this.subscriptions.set(channel, {
          channel,
          status: SubscriptionStatus.Subscribed,
        });
        this.logger.info("Subscribed to channel", channel);
      } catch (error) {
        this.logger.error(
          `Error trying to subscribe to channel ${channel}`,
          error
        );
        this.subscriptions.set(channel, {
          channel,
          status: SubscriptionStatus.Unsubscribed,
        });
      }
    }
  }

  public unsubscribeAll() {
    this.subscriptions.forEach((subscription) => {
      this.subscriptions.set(subscription.channel, {
        channel: subscription.channel,
        status: SubscriptionStatus.Unsubscribed,
      });
    });
  }
}
