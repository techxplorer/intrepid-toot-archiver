/**
 * @file The defintition of the FetchUserDetails class.
 */

import isFQDN from "validator/lib/isFQDN.js";

/**
 * Fetch the user details using the supplied information.
 */
export default class FetchUserDetails {

  /**
   *
   * @param {string} hostName The FQDN of the host.
   * @param {string} userName The name of the user in standard Mastodon format.
   * @throws {TypeError} When the function parameters are invalid.
   */
  constructor( hostName, userName ) {

    if ( isFQDN( hostName ) === false ) {
      throw new TypeError( "A valid FQDN is required" );
    }


  }

}
