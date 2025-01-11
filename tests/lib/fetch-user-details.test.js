import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import path from "node:path";

import isURL from "validator/lib/isURL.js";
import nock from "nock";

import FetchUserDetails from "../../src/lib/fetch-user-details.js";

const testPassFQDN = "theblower.au";
const testFailFQDN = "example";
const testFQDNMessage = "A valid FQDN is required";

const testPassUserName = "@geton";
const testFailUserName = "geton";
const testUserNameMessage =  "A valid username is required";

const testFetchUrlHost = "https://theblower.au";
const testFetchUrlPath = "/api/v1/accounts/lookup";
const testFetchUrlQuery = "?acct=@geton";

const testFetchURL = testFetchUrlHost + testFetchUrlPath + testFetchUrlQuery;
const testUserId = "109308203429082969";

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

const nockBackMode = "lockdown";
const nockArtefactName = "user-data.json";

describe( "FetchUserDetails", () => {

  before( () => {
    nockBack.fixtures = nockArtefacts;
    nockBack.setMode( nockBackMode );
  } );

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

    it( "should throw an error when the request fails", async() => {
      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      nock( testFetchUrlHost )
        .get( testFetchUrlPath + testFetchUrlQuery )
        .reply( 404 );

      await assert.rejects(
        async() => {
          await fetcher.fetchData();
        }
      );

    } );

    it( "should successfully fetch the user data JSON object", async() => {
      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      assert.equal(
        fetcher.fetchedUserData,
        null
      );

      const { nockDone } = await nockBack( nockArtefactName );

      await fetcher.fetchData();

      nockDone();

      assert.notEqual(
        fetcher.fetchedUserData,
        null
      );

      assert.equal(
        fetcher.fetchedUserData.id,
        testUserId
      );

    } );

  } );

  describe( "getUserId", async() => {

    it( "should get the user id from the server", async() => {

      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      const { nockDone } = await nockBack( nockArtefactName );

      await fetcher.fetchData();
      const userId = await fetcher.getUserId();

      nockDone();

      assert.equal(
        userId,
        testUserId
      );

    } );

    it( "should get the user id from the server without fetching first", async() => {

      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      const { nockDone } = await nockBack( nockArtefactName );

      let userId = await fetcher.getUserId();

      nockDone();

      userId = await fetcher.getUserId();

      assert.equal(
        userId,
        testUserId
      );

    } );

    it( "should throw an error when the user Id cannot be found", async() => {

      const fetcher = new FetchUserDetails(
        testPassFQDN,
        testPassUserName
      );

      const { nockDone } = await nockBack( nockArtefactName );

      await fetcher.getUserId();

      nockDone();

      fetcher.fetchedUserData.id = undefined;

      await assert.rejects(
        async() => {
          await fetcher.getUserId();
        }
      );

    } );
  } );

} );
