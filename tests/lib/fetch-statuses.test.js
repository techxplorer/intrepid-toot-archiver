import assert from "node:assert/strict";
import { before, describe, it } from "node:test";
import path from "node:path";

import ci from "ci-info";
import isURL from "validator/lib/isURL.js";
import nock from "nock";

import FetchStatuses from "../../src/lib/fetch-statuses.js";

const testPassFQDN = "theblower.au";
const testFailFQDN = "example";
const testFQDNMessage = "A valid FQDN is required";

const testPassUserId = "109308203429082969";
const testFailUsrerIdOne = testPassUserId + "abc";
const testFailUsrerIdTwo = "-" + testPassUserId;
const testUserIdMessage = "A numeric userId is required";

const testSingleStatusId = "112793425453345288";
const testFetchedStatusCount = 20;

const testFetchURL = `https://${ testPassFQDN }/api/v1/accounts/${ testPassUserId }/statuses?exclude_replies=true&exclude_reblogs=true`;

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

describe( "FetchStatuses", () => {

  describe( "constructor", () => {
    it( "should throw a TypeError when the host name is not a FQDN", () => {
      assert.throws(
        () => {
          new FetchStatuses(
            testFailFQDN,
            testPassUserId
          );
        },
        {
          name: "TypeError",
          message: testFQDNMessage
        }
      );
    } );

    it( "should throw a TypeError when the user ID is not valid (1)", () => {
      assert.throws(
        () => {
          new FetchStatuses(
            testPassFQDN,
            testFailUsrerIdOne
          );
        },
        {
          name: "TypeError",
          message: testUserIdMessage
        }
      );
    } );

    it( "should throw a TypeError when the user ID is not valid (2)", () => {
      assert.throws(
        () => {
          new FetchStatuses(
            testPassFQDN,
            testFailUsrerIdTwo
          );
        },
        {
          name: "TypeError",
          message: testUserIdMessage
        }
      );
    } );

    it( "should not throw an error when the parameters are valid", () => {
      assert.doesNotThrow(
        () => {
          new FetchStatuses(
            testPassFQDN,
            testPassUserId
          );
        }
      );
    } );

    it( "should have a valid urlToFetch property", () => {

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
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
    before( () => {
      nockBack.fixtures = nockArtefacts;

      if ( ci.isCI ) {
        nockBack.setMode( "lockdown" );
      } else {
        nockBack.setMode( "record" );
      }
    } );

    it( "should successfully fetch the user data JSON object", async() => {
      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      assert.equal(
        fetcher.fetchedStatusData,
        null
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      assert.notEqual(
        fetcher.fetchedStatusData,
        null
      );

      assert.ok(
        Array.isArray( fetcher.fetchedStatusData )
      );

      assert.equal(
        fetcher.fetchedStatusData.length,
        testFetchedStatusCount
      );

      assert.equal(
        fetcher.fetchedStatusData[ 0 ].id,
        testSingleStatusId
      );

    } );

  } );
} );