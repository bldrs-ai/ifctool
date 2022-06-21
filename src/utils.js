/** Exceptions are runtime errors that should */
export class Exception extends Error {
  /** @param {string} msg */
  constructor(msg) {
    super(msg)
  }
}
