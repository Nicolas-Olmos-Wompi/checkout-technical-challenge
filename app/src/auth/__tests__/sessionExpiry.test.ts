import { notifySessionExpired, onSessionExpired } from "../sessionExpiry";

describe("sessionExpiry", () => {
  it("calls a subscribed listener when notified", () => {
    const listener = jest.fn();
    onSessionExpired(listener);

    notifySessionExpired();

    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("calls all subscribed listeners when notified", () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    onSessionExpired(listenerA);
    onSessionExpired(listenerB);

    notifySessionExpired();

    expect(listenerA).toHaveBeenCalledTimes(1);
    expect(listenerB).toHaveBeenCalledTimes(1);
  });

  it("stops calling a listener after it unsubscribes", () => {
    const listener = jest.fn();
    const unsubscribe = onSessionExpired(listener);

    unsubscribe();
    notifySessionExpired();

    expect(listener).not.toHaveBeenCalled();
  });

  it("only unsubscribes the listener whose unsubscribe function was called", () => {
    const listenerA = jest.fn();
    const listenerB = jest.fn();
    const unsubscribeA = onSessionExpired(listenerA);
    onSessionExpired(listenerB);

    unsubscribeA();
    notifySessionExpired();

    expect(listenerA).not.toHaveBeenCalled();
    expect(listenerB).toHaveBeenCalledTimes(1);
  });
});
