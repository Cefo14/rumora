/**
 * Abstract base class for test helpers that mock global APIs
 */
export abstract class WebApiMock {
  protected hasBeenMocked = false;

  /**
   * Mock the target API/object
   */
  abstract mock(...args: unknown[]): unknown;

  /**
   * Restore the original API/object
   */
  abstract unmock(): void;

  /**
   * Check if the API is currently mocked
   */
  get isMocked(): boolean {
    return this.hasBeenMocked;
  }
}
