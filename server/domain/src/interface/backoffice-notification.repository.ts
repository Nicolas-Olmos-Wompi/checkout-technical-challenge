export interface IBackOfficeNotification {
  /**
   *
   * Send slack channel notification
   * @param {string} message
   */
  sendCustomNotification(message: string): Promise<void>;
}
