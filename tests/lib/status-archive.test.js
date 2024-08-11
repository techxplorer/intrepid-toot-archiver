import assert from "node:assert/strict";
import path from "node:path";
import { after, before, describe, it } from "node:test";

import ci from "ci-info";
import nock from "nock";
import { rimraf } from "rimraf";

import StatusArchive from "../../src/lib/status-archive.js";
import FetchStatuses from "../../src/lib/fetch-statuses.js";

const testFailArchivePathOne = "";
const testFailArchivePathMsgOne = "Archive path not found";
const testFailArchivePathTwo = path.resolve( import.meta.dirname, "../../package.json" );
const testFailArchivePathMsgTwo = "Archive path must be a directory";
const testPassArchivePath = path.resolve( "tests/artefacts/status-archive" );

const testFailStatusArray = null;
const testFailStatusArrayMsg = "Fetched statuses must be an array";
const testPassStatusArray = [];

const testPassFQDN = "theblower.au";
const testPassUserId = "109308203429082969";
const testPassStatusCount = 20;

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

function tidyArchiveDir() {
  rimraf.sync(
    testPassArchivePath + "/*",
    {
      preserveRoot: true,
      glob: true
    }
  );
}


describe( "StatusArchive", () => {

  describe( "constructor", () => {

    it( "should throw a TypeError when the Archive path cannot be found", () => {
      assert.throws(
        () => {
          new StatusArchive(
            testFailArchivePathOne,
            testFailStatusArray
          );
        },
        {
          name: "TypeError",
          message: testFailArchivePathMsgOne
        }
      );
    } );

    it( "should throw a TypeError when the Archive path is not a directory", () => {
      assert.throws(
        () => {
          new StatusArchive(
            testFailArchivePathTwo,
            testFailStatusArray
          );
        },
        {
          name: "TypeError",
          message: testFailArchivePathMsgTwo
        }
      );
    } );

    it( "should throw a TypeError when the fetched statuses is not an array", () => {
      assert.throws(
        () => {
          new StatusArchive(
            testPassArchivePath,
            testFailStatusArrayMsg
          );
        },
        {
          name: "TypeError",
          message: testFailStatusArrayMsg
        }
      );
    } );

    it( "should not throw an error when the parameters are valid", () => {
      assert.doesNotThrow(
        () => {
          new StatusArchive(
            testPassArchivePath,
            testPassStatusArray
          );
        }
      );
    } );

  } );

  describe( "addStatuses", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;

      if ( ci.isCI ) {
        nockBack.setMode( "lockdown" );
      } else {
        nockBack.setMode( "record" );
      }

      tidyArchiveDir();

    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should add the expected number of statuses to the archive", async() => {
      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassArchivePath,
        fetcher.fetchedStatusData
      );

      const addedStatuses = await archive.addStatuses();

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

    } );

  } );

} );
