/**
 * @file The defintition of the FetchUserDetails class.
 */

import isFQDN from "validator/lib/isFQDN.js";
import matches from "validator/lib/matches.js";

export const userNameRegEx = /^@{1}[A-Z0-9._%+-]+/i;

/**
 * Fetch the user details using the supplied information.
 */
export default class FetchUserDetails {

  /**
   * An instance of a URL object representing the URL to use to fetch data.
   */
  urlToFetch = null;

  /**
   * The user data fetched using the URL.
   */
  fetchedUserData = null;

  /**
   * Construct a new instance of the object to fetch details of a user.
   * @param {string} hostName The FQDN of the host.
   * @param {string} userName The name of the user in standard Mastodon format.
   * @throws {TypeError} When the function parameters are invalid.
   */
  constructor( hostName, userName ) {

    if ( isFQDN( hostName ) === false ) {
      throw new TypeError( "A valid FQDN is required" );
    }

    if ( matches( userName, userNameRegEx ) === false ) {
      throw new TypeError( "A valid username is required" );
    }

    this.urlToFetch = new URL(
      `/api/v1/accounts/lookup?acct=${ userName }`,
      `https://${ hostName }`
    );

  }

  /**
   * Lookup the user and fetch the user details JSON.
   * @throws {Error} When the JSON object cannot be fetched from the server.
   */
  async fetchData() {

    try {
      const response = await fetch( this.urlToFetch );
      if ( !response.ok ) {
        throw new Error( `Response status: ${ response.status }` );
      }

      this.fetchedUserData = await response.json();

    } catch ( error ) {
      throw new Error( error );
    }
  }

  /**
   * Get the user id from the fetched user JSON object.
   * @returns {string} The value of the id property from the user object.
   * @throws {Error} When the id property is missing from the user object.
   */
  async getUserId() {

    if ( this.fetchedUserData === null ) {
      await this.fetchData();
    }

    if ( this.fetchedUserData.id === undefined ) {
      throw new Error( "Missing id property of user JSON object" );
    }

    return this.fetchedUserData.id;

  }

}
