export type TrackingEvent =
  | string
  | number
  | boolean
  | null
  | readonly TrackingEvent[]
  | { readonly [key: string]: TrackingEvent };

/** A value paired with analytics events that can be sent when the chain is executed. */
export class Trackable<T> {
  readonly value: T;
  readonly analyticsEvents: readonly TrackingEvent[];

  constructor(value: T, analyticsEvents: readonly TrackingEvent[] = []) {
    this.value = value;
    this.analyticsEvents = [...analyticsEvents];
  }

  static of<T>(value: T): Trackable<T> {
    return new Trackable(value);
  }

  getValue(): T {
    return this.value;
  }

  getAnalyticsEvents(): readonly TrackingEvent[] {
    return this.analyticsEvents;
  }

  containsValue(): boolean {
    return this.value !== null && this.value !== undefined;
  }

  map<U>(transform: (value: T) => U): Trackable<U> {
    return new Trackable(transform(this.value), this.analyticsEvents);
  }

  flatMap<U>(transform: (value: T) => Trackable<U>): Trackable<U> {
    const next = transform(this.value);
    return new Trackable(next.value, [...this.analyticsEvents, ...next.analyticsEvents]);
  }

  execute(track: (event: TrackingEvent) => void): T {
    for (const event of this.analyticsEvents) {
      track(event);
    }
    return this.value;
  }

  run(track: (event: TrackingEvent) => void): T {
    return this.execute(track);
  }
}
