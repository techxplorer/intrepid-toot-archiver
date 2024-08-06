import assert from "node:assert/strict";
import { describe, it } from "node:test";

import isURL from "validator/lib/isURL.js";

import FetchUserDetails from "../../src/lib/fetch-user-details.js";

const testPassFQDN = "theblower.au";
const testFailFQDN = "example";
const testFQDNMessage = "A valid FQDN is required";

const testPassUserName = "@geton";
const testFailUserName = "geton";
const testUserNameMessage =  "A valid username is required";

const testFetchURL = "https://theblower.au/api/v1/accounts/lookup?acct=@geton";

describe( "FetchUserDetails", () => {

  describe( "constructor", () => {
    it( "should throw a TypeError when the host name is not a FQDN", () => {
      assert.throws(
        () => {
          new FetchUserDetails(
            testFailFQDN,
            testPassUserName
          );
        },
        {
          name: "TypeError",
          message: testFQDNMessage
        }
      );
    } );

    it( "should throw a TypeError when the user name is not valid", () => {
      assert.throws(
        () => {
          new FetchUserDetails(
            testPassFQDN,
            testFailUserName
          );
        },
        {
          name: "TypeError",
          message: testUserNameMessage
        }
      );
    } );

    it( "should not throw an error when the parameters are valid", () => {
      assert.doesNotThrow(
        () => {
          new FetchUserDetails(
            testPassFQDN,
            testPassUserName
          );
        }
      );
    } );

    it( "should have a valid urlToFetch property", () => {

      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      assert.notEqual(
        fetcher.urlToFetch,
        null
      );

      assert.equal(
        fetcher.urlToFetch.toString(),
        testFetchURL
      );

      assert.ok(
        isURL(
          fetcher.urlToFetch.toString(),
          {
            require_protocol: true,
            require_valid_protocol: true,
            protocols: [ "https" ],
            allow_fragments: false,
            allow_query_components: true
          }
        )
      );

    } );

  } );

  describe( "fetchData", async() => {
    it( "should successfully fetch the user data JSON object", async() => {
      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      assert.equal(
        fetcher.fetchedUserData,
        null
      );

      await fetcher.fetchData();

      assert.notEqual(
        fetcher.fetchedUserData,
        null
      );
    } );

  } );

} );
