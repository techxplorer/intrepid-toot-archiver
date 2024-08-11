/**
 * @file The defintition of the FetchStatuses class.
 */
import isFQDN from "validator/lib/isFQDN.js";
import isNumeric from "validator/lib/isNumeric.js";

/**
 * Fetch the most recent statuses from the server.
 */
class FetchStatuses {

  /**
   * An instance of a URL object representing the URL to use to fetch data.
   */
  urlToFetch = null;

  /**
   * The status data fetched using the URL.
   */
  fetchedStatusData = null;

  /**
   * Construct a new instance of the object to fetch statuses.
   * @param {string} hostName The FQDN of the host.
   * @param {string} userId The unique identifier of the user on the host.
   * @throws {TypeError} When the function parameters are invalid.
   */
  constructor( hostName, userId ) {

    if ( isFQDN( hostName ) === false ) {
      throw new TypeError( "A valid FQDN is required" );
    }

    if ( isNumeric( userId, { no_symbols: true } ) === false ) {
      throw new TypeError( "A numeric userId is required" );
    }

    this.urlToFetch = new URL(
      `/api/v1/accounts/${ userId }/statuses?exclude_replies=true&exclude_reblogs=true`,
      `https://${ hostName }`
    );
  }

  /**
   * Fetch the JSON for the most recent statuses.
   * @throws {Error} When the JSON object cannot be fetched from the server.
   */
  async fetchData() {

    try {
      const response = await fetch( this.urlToFetch );
      if ( !response.ok ) {
        throw new Error( `Response status: ${ response.status }` );
      }

      this.fetchedStatusData = await response.json();

    } catch ( error ) {
      throw new Error( error );
    }
  }

}

export default FetchStatuses;
