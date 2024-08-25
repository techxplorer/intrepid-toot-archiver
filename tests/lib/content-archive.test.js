import assert from "node:assert/strict";
import { lstatSync, readFileSync, copyFileSync } from "node:fs";
import path from "node:path";
import { after, afterEach, before, describe, it } from "node:test";

import nock from "nock";
import { rimraf } from "rimraf";

import ContentArchive from "../../src/lib/content-archive.js";
import FetchStatuses from "../../src/lib/fetch-statuses.js";
import StatusArchive from "../../src/lib/status-archive.js";


const testFailArchivePathOne = "";
const testFailArchivePathMsgOne = "Archive path not found";
const testFailArchivePathTwo = path.resolve( import.meta.dirname, "../../package.json" );
const testFailArchivePathMsgTwo = "Archive path must be a directory";
const testPassArchivePath = path.resolve( "tests/artefacts/content-archive" );
const testPassStatusArchivePath = path.resolve( "tests/artefacts/content-status-archive" );

const testContentFileName = "112793425453345288.md";
const testActualContentsFilePath = path.join( testPassArchivePath, testContentFileName );
const testExpectedContentsFilePath = path.join(
  path.resolve( "tests/artefacts/contents" ),
  testContentFileName
);

const testFailStatusArray = null;
const testFailStatusArrayMsg = "New statuses must be an array";
const testPassStatusArray = [];

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

const testPassFQDN = "theblower.au";
const testPassUserId = "109308203429082969";
const testPassStatusCount = 20;

/**
 * Helper function to tidy the archive directory.
 */
function tidyArchiveDir() {
  rimraf.sync(
    testPassArchivePath + "/*.md",
    {
      preserveRoot: true,
      glob: true
    }
  );
}

/**
 * Helper function to tidy the status archive used in testing the content archive.
 */
function tidyStatusArchiveDir() {
  rimraf.sync(
    testPassStatusArchivePath + "/*.json",
    {
      preserveRoot: true,
      glob: true
    }
  );
}

describe( "ContentArchive", () => {
  describe( "constructor", () => {
    it( "should throw a TypeError when the Archive path cannot be found", () => {
      assert.throws(
        () => {
          new ContentArchive(
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
          new ContentArchive(
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
          new ContentArchive(
            testPassArchivePath
          );
        }
      );
    } );
  } );

  describe( "getContentsCount", async() => {

    before( () => {
      tidyArchiveDir();
    } );

    afterEach( () => {
      tidyArchiveDir();
    } );


    it( "should return 0 for an empty archive", async() => {

      const archive = new ContentArchive(
        testPassArchivePath
      );

      archive.contents = [];
      archive.cacheStale = false;

      const contentCount = await archive.getContentsCount();

      assert.equal(
        contentCount,
        0
      );

    } );

    it( "should return the accurate count of content in the archive", async() => {

      assert.ok(
        lstatSync(
          testExpectedContentsFilePath
        )
      );

      copyFileSync(
        testExpectedContentsFilePath,
        testActualContentsFilePath
      );

      assert.ok(
        lstatSync(
          testActualContentsFilePath
        )
      );

      const archive = new ContentArchive(
        testPassArchivePath
      );

      const contentCount = await archive.getContentsCount();

      assert.equal(
        contentCount,
        1
      );
    } );
  } );

  describe( "loadContents", async() => {

    before( () => {
      tidyArchiveDir();
    } );

    after( () => {
      tidyArchiveDir();
    } );


    it( "should return the accurate count of content in the archive", async() => {

      const archive = new ContentArchive(
        testPassArchivePath
      );

      let contentCount = await archive.loadContents();

      assert.equal(
        contentCount,
        0
      );

      assert.ok(
        lstatSync(
          testExpectedContentsFilePath
        )
      );

      copyFileSync(
        testExpectedContentsFilePath,
        testActualContentsFilePath
      );

      assert.ok(
        lstatSync(
          testActualContentsFilePath
        )
      );

      archive.cacheStale = true;

      contentCount = await archive.loadContents();

      assert.equal(
        contentCount,
        1
      );

    } );
  } );

  describe( "addContent", async() => {

    before( async() => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      const fetcher = new FetchStatuses(
        testPassFQDN,
        testPassUserId
      );

      const { nockDone } = await nockBack( "user-statuses.json" );

      await fetcher.fetchData();

      nockDone();

      const archive = new StatusArchive(
        testPassStatusArchivePath
      );

      await archive.addStatuses(
        fetcher.fetchedStatusData
      );

      tidyArchiveDir();
    } );

    after( () => {
      tidyStatusArchiveDir();
    } );

    afterEach( () => {
      tidyArchiveDir();
    } );

    it( "should throw a TypeError when the new statuses is not an array", async() => {

      const archive = new ContentArchive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.addContent(
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

      const archive = new ContentArchive(
        testPassArchivePath
      );

      await assert.doesNotReject(
        async() => {
          await archive.addContent(
            testPassStatusArray
          );
        }
      );
    } );

    it( "should add the expected number of posts to the archive", async() => {
      const statusArchive = new StatusArchive(
        testPassStatusArchivePath
      );

      const archive = new ContentArchive(
        testPassArchivePath
      );

      const addedStatuses = await archive.addContent(
        await statusArchive.getContents(),
        statusArchive.archivePath
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );
    } );

    it( "should not overwrite files by default", async() => {
      const statusArchive = new StatusArchive(
        testPassStatusArchivePath
      );

      const archive = new ContentArchive(
        testPassArchivePath
      );

      const addedStatuses = await archive.addContent(
        await statusArchive.getContents(),
        statusArchive.archivePath
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

      archive.cacheStale = false;

      await assert.rejects(
        async() => {
          await archive.addContent(
            await statusArchive.getContents(),
            statusArchive.archivePath
          );
        }
      );
    } );

    it( "should overwrite files if the flag is set", async() => {
      const statusArchive = new StatusArchive(
        testPassStatusArchivePath
      );

      const archive = new ContentArchive(
        testPassArchivePath,
        true
      );

      const addedStatuses = await archive.addContent(
        await statusArchive.getContents(),
        statusArchive.archivePath
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount
      );

      archive.cacheStale = false;

      await assert.doesNotReject(
        async() => {
          await archive.addContent(
            await statusArchive.getContents(),
            statusArchive.archivePath
          );
        }
      );
    } );

    it( "should not try to add an existing status to the archive by default", async() => {
      const statusArchive = new StatusArchive(
        testPassStatusArchivePath
      );

      copyFileSync(
        testExpectedContentsFilePath,
        testActualContentsFilePath
      );

      const archive = new ContentArchive(
        testPassArchivePath
      );

      const addedStatuses = await archive.addContent(
        await statusArchive.getContents(),
        statusArchive.archivePath
      );

      assert.equal(
        addedStatuses,
        testPassStatusCount - 1
      );
    } );

    it( "should output content in the expected format", async() => {
      const statusArchive = new StatusArchive(
        testPassStatusArchivePath
      );

      const archive = new ContentArchive(
        testPassArchivePath
      );

      await archive.addContent(
        await statusArchive.getContents(),
        statusArchive.archivePath
      );

      assert.ok(
        lstatSync(
          testExpectedContentsFilePath
        )
      );

      assert.ok(
        lstatSync(
          testActualContentsFilePath
        )
      );

      const actualStatus = readFileSync( testActualContentsFilePath ).toString();

      const expectedStatus = readFileSync( testExpectedContentsFilePath ).toString();

      assert.deepEqual(
        actualStatus,
        expectedStatus
      );
    } );

  } );

} );
