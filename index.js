const { CancelToken } = require('axios');

/**
 * Manager that creates and stores Axios Cancel tokens.
 *
 * @example
 * import axios from 'axios';
 * import RequestManager from 'request-manager';
 *
 * const manager = new RequestManager();
 * const cancelToken = manager.getNextToken('users');
 *
 * axios.get('/api/users', { cancelToken });
 * manager.cancelAxios('users', 'User aborted the operation');
 *
 * @class RequestManager
 */
class RequestManager {
  constructor () {
    this.axiosTokens = new Map();
  }

  /**
     * Create a new cancellation token based on the provided key
     *
     * @method getNextToken
     * @param {Stirng} key The key for a given Axios cancel token
     * @returns {CancelToken} Cancel token instance that can be used to cancel the request
     */
  getNextToken (key) {
    const token = CancelToken.source();
    this.axiosTokens.set(key, token);
    return token.token;
  }

  /**
     * Cancel the axios request for the given key.
     *
     * @method cancelAxios
     * @param {String} key The key for a given Axios cancel token
     * @param {String} reason Message explaining the reason of the cancelation
     */
  cancelAxios (key, reason) {
    if (this.axiosTokens.has(key)) {
      this.axiosTokens.get(key).cancel(reason);
      this.axiosTokens.delete(key);
    }
  }

  /**
     * Cancels all Axios requests that have a key which match the prefix arg
     *
     * @method cancelAllRequestsWithPrefix
     * @param {String} keyPrefix The key prefix for Axios cancel tokens
     * @param {String} reason Message explaining the reason of the cancelation
     */
  cancelAllRequestsWithPrefix (keyPrefix, reason) {
    Array.from(this.axiosTokens.keys())
      .filter(key => key.substring(0, keyPrefix.length) === keyPrefix)
      .map(key => this.cancelAxios(key, reason));
  }

  /**
     * Cancel a request and return a new cancellation token for the provided key
     *
     * @method cancelAxiosAndGetNextToken
     * @param {String} key The key for a given Axios cancel token
     * @returns {CancelToken} New cancellation token
     */
  cancelAxiosAndGetNextToken (key) {
    this.cancelAxios(key);
    return this.getNextToken(key);
  }

  /**
     * Returns the correct CSRF header for use by Axios
     *
     * @method getCSRFHeader
     * @param {String} name Name of the cookie that stores the CSRF token value
     * @returns {{X-CSRFToken: String}}
     */
  getCSRFHeader (name = 'csrftoken') {
    return { 'X-CSRFToken': this.getCookie(name) };
  }

  /**
     * Returns a cookie by name from document.cookie.
     * Code found at http://stackoverflow.com/a/15724300
     *
     * @method getCookie
     * @param {String} name Cookie name
     * @returns {String} Cookie value
     */
  getCookie (name) {
    const value = '; ' + document.cookie;
    const parts = value.split('; ' + name + '=');
    if (parts.length === 2) return parts.pop().split(';').shift();
    return null;
  }
}

module.exports = RequestManager;
