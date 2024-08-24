import assert from "node:assert/strict";
import { lstatSync, readFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { after, afterEach, before, describe, it } from "node:test";

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
const testFailStatusArrayMsg = "New statuses must be an array";
const testPassStatusArray = [];

const testPassFQDN = "theblower.au";
const testPassUserId = "109308203429082969";
const testPassStatusCount = 20;
const testStatusFileName = "112793425453345288.json";
const testActualStatusFilePath = path.join( testPassArchivePath, testStatusFileName );
const testExpectedStatusFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusFileName
);

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

/**
 * Helper function to tidy the archive directory.
 */
function tidyArchiveDir() {
  rimraf.sync(
    testPassArchivePath + "/*.json",
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
            testFailArchivePathOne
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
            testFailArchivePathTwo
          );
        },
        {
          name: "TypeError",
          message: testFailArchivePathMsgTwo
        }
      );
    } );

    it( "should not throw an error when the parameters are valid", () => {
      assert.doesNotThrow(
        () => {
          new StatusArchive(
            testPassArchivePath
          );
        }
      );
    } );
  } );

  describe( "addStatuses", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    afterEach( () => {
      tidyArchiveDir();
    } );

    it( "should throw a TypeError when the new statuses is not an array", async() => {

      const archive = new StatusArchive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.addStatuses(
            testFailStatusArray
          );
        },
        {
          name: "TypeError",
          message: testFailStatusArrayMsg
        }
      );
    } );

    it( "should not throw a TypeError when the new statuses is not an array", async() => {

      const archive = new StatusArchive(
        testPassArchivePath
      );

      await assert.doesNotReject(
        async() => {
          await archive.addStatuses(
            testPassStatusArray
          );
        }
      );
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
        testPassArchivePath
      );

      const addedStatuses = await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );
    } );

    it( "should not overwrite files by default", async() => {
      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassArchivePath
      );

      const addedStatuses = await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

      archive.cacheStale = false;

      await assert.rejects(
        async() => {
          await archive.addStatuses(
            fetcher.fetchedStatusData
          );
        }
      );
    } );

    it( "should overwrite files if the flag is set", async() => {
      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassArchivePath,
        true
      );

      const addedStatuses = await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

      archive.cacheStale = false;

      await assert.doesNotReject(
        async() => {
          await archive.addStatuses(
            fetcher.fetchedStatusData
          );
        }
      );
    } );

    it( "should not try to add an existing status to the archive by default", async() => {
      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassArchivePath
      );

      copyFileSync(
        testExpectedStatusFilePath,
        testActualStatusFilePath
      );

      const addedStatuses = await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount - 1
      );
    } );

    it( "should output statuses in the expected format", async() => {

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassArchivePath
      );

      await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.ok(
        lstatSync(
          testExpectedStatusFilePath
        )
      );

      assert.ok(
        lstatSync(
          testActualStatusFilePath
        )
      );

      const actualStatus = JSON.parse(
        readFileSync(
          testActualStatusFilePath
        )
      );

      const expectedStatus = JSON.parse(
        readFileSync(
          testExpectedStatusFilePath
        )
      );

      assert.deepEqual(
        actualStatus,
        expectedStatus
      );
    } );
  } );

  describe( "getStatusCount", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should return zero for an empty archive", async() => {

      const archive = new StatusArchive(
        testPassArchivePath
      );

      archive.statuses = [];
      archive.cacheStale = false;

      const statusCount = await archive.getStatusCount();

      assert.equal(
        statusCount,
        0
      );

    } );

    it( "should not return zero for an archive with statuses", async() => {

      const archive = new StatusArchive(
        testPassArchivePath
      );

      let statusCount = await archive.getStatusCount();

      assert.equal(
        statusCount,
        0
      );

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      statusCount = await archive.getStatusCount();

      assert.equal(
        statusCount,
        testPassStatusCount
      );

      assert.ok(
        archive.cacheStale === false
      );

      statusCount = await archive.getStatusCount();

      assert.equal(
        statusCount,
        testPassStatusCount
      );


    } );
  } );

  describe( "loadStatuses", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should get an accurate list of statuses", async() => {

      const archive = new StatusArchive(
        testPassArchivePath
      );

      let statusCount = await archive.loadStatuses();

      assert.equal(
        statusCount,
        0
      );

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const addedStatuses = await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

      statusCount = await archive.loadStatuses();

      assert.equal(
        statusCount,
        testPassStatusCount
      );

      assert.notEqual(
        archive.statuses.indexOf( testStatusFileName ),
        -1
      );

    } );
  } );

  describe( "getStatuses", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should return an array of statuses", async() => {
      const archive = new StatusArchive(
        testPassArchivePath
      );

      let statuses = await archive.getStatuses();

      assert.ok(
        Array.isArray( statuses )
      );

      assert.equal(
        statuses.length,
        0
      );

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      statuses = await archive.getStatuses();

      assert.ok(
        Array.isArray( statuses )
      );

      assert.equal(
        statuses.length,
        testPassStatusCount
      );
    } );
  } );
} );
