import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { after, afterEach, before, describe, it } from "node:test";

import nock from "nock";
import { rimraf } from "rimraf";

const testFailArchivePathOne = "";
const testFailArchivePathMsgOne = "Archive path not found";
const testFailArchivePathTwo = path.resolve( import.meta.dirname, "../../package.json" );
const testFailArchivePathMsgTwo = "Archive path must be a directory";
const testPassArchivePath = path.resolve( "tests/artefacts/media-archive" );

const testFailMediaUrl = "";
const testFailMediaUrlMsg = "Media URL must be a valid URL object";
const testFetchUrlHost = "https://static.theblower.au";
const testFetchUrlPath = "/media_attachments/files/112/546/982/645/822/223/original/";
const testMediaFileName = "dfb3792535a960dd.jpeg";
const testPassMediaUrl = new URL(
  testFetchUrlHost +
  testFetchUrlPath +
  testMediaFileName
);

const testPassMediaCount = 1;


const testStatusFileName = "112546982904162819.json";
const testExpectedStatusFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusFileName
);

import MediaArchive from "../../src/lib/media-archive.js";

/**
 * Helper function to tidy the archive directory.
 */
function tidyArchiveDir() {
  rimraf.sync(
    testPassArchivePath + "/*.jpeg",
    {
      preserveRoot: true,
      glob: true
    }
  );
}

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;


describe( "MediaArchive", () => {

  describe( "constructor", () => {

    it( "should throw a TypeError when the Archive path cannot be found", () => {
      assert.throws(
        () => {
          new MediaArchive(
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
          new MediaArchive(
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
          new MediaArchive(
            testPassArchivePath
          );
        }
      );
    } );
  } );

  describe( "getContentsCount", async() => {

    it( "should return an empty array for an empty archive", async() => {

      const archive = new MediaArchive(
        testPassArchivePath
      );

      archive.contents = [];
      archive.cacheStale = false;

      const statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

    } );
  } );

  describe( "addMedia", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    afterEach( () => {
      tidyArchiveDir();
    } );

    after( () => {
      tidyArchiveDir();
    } );


    it( "should show throw an error when the parameter is incorrect", async() => {
      const archive = new MediaArchive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.addMedia(
            testFailMediaUrl
          );
        },
        {
          name: "TypeError",
          message: testFailMediaUrlMsg
        }
      );

    } );

    it( "should throw an error if the media cannot be fetched", async() => {
      const archive = new MediaArchive(
        testPassArchivePath
      );

      nock( testFetchUrlHost )
        .get( testFetchUrlPath + testMediaFileName )
        .reply( 404 );

      await assert.rejects(
        async() => {
          await archive.addMedia( testPassMediaUrl );
        }
      );
    } );

    it( "should fetch a media attachment and add it to the archive", async() => {

      const archive = new MediaArchive(
        testPassArchivePath
      );

      let statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      await archive.addMedia( testPassMediaUrl );

      nockDone();

      statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        testPassMediaCount
      );

    } );

    it( "should not overwrite an existing media attachment", async() => {

      const archive = new MediaArchive(
        testPassArchivePath
      );

      let statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      await archive.addMedia( testPassMediaUrl );

      statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        testPassMediaCount
      );

      await assert.doesNotReject(
        async() => {
          const { nockDone } = await nockBack( "media-attachment.json" );
          await archive.addMedia(
            testPassMediaUrl
          );
          nockDone();
        },
        {
          name: "Error",
          message: /Error: EEXIST: file already exists/
        }
      );

      nockDone();

    } );

    it( "should overwrite an existing media attachment", async() => {

      const archive = new MediaArchive(
        testPassArchivePath,
        true
      );

      let statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      await archive.addMedia( testPassMediaUrl );

      await assert.doesNotReject(
        async() => {
          const { nockDone } = await nockBack( "media-attachment.json" );
          await archive.addMedia(
            testPassMediaUrl
          );
          nockDone();
        }
      );

      nockDone();

      statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        testPassMediaCount
      );
    } );
  } );

  describe( "getContents", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    afterEach( () => {
      tidyArchiveDir();
    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should return an empty array for an empty archive", async() => {
      const archive = new MediaArchive(
        testPassArchivePath
      );

      const media = await archive.getContents();

      assert.ok(
        Array.isArray( media )
      );

      assert.equal(
        media.length,
        0
      );

    } );

    it( "should return an array with elements for an archive with media", async() => {
      const archive = new MediaArchive(
        testPassArchivePath
      );

      let media = await archive.getContents();

      assert.ok(
        Array.isArray( media )
      );

      assert.equal(
        media.length,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      await archive.addMedia( testPassMediaUrl );

      nockDone();

      media = await archive.getContents();

      assert.ok(
        Array.isArray( media )
      );

      assert.equal(
        media.length,
        testPassMediaCount
      );

      assert.notEqual(
        archive.contents.indexOf( testMediaFileName ),
        -1
      );

      assert.notEqual(
        media.indexOf( testMediaFileName ),
        -1
      );

    } );

    it( "should return the cached array with elements for an archive with media", async() => {
      const archive = new MediaArchive(
        testPassArchivePath
      );

      let media = await archive.getContents();

      assert.ok(
        Array.isArray( media )
      );

      assert.equal(
        media.length,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      await archive.addMedia( testPassMediaUrl );

      nockDone();

      media = await archive.getContents();

      assert.ok(
        archive.cacheStale === false
      );

      media = await archive.getContents();

      assert.ok(
        Array.isArray( media )
      );

      assert.equal(
        media.length,
        testPassMediaCount
      );

      assert.notEqual(
        archive.contents.indexOf( testMediaFileName ),
        -1
      );

      assert.notEqual(
        media.indexOf( testMediaFileName ),
        -1
      );

    } );

  } );

  describe( "addMediaFromStatus", async() => {

    before( () => {
      nockBack.fixtures = nockArtefacts;
      nockBack.setMode( "lockdown" );

      tidyArchiveDir();

    } );

    afterEach( () => {
      tidyArchiveDir();
    } );

    after( () => {
      tidyArchiveDir();
    } );

    it( "should throw an error when the parameter is incorrect", async() => {

      const expectedStatusJson = JSON.parse(
        readFileSync(
          testExpectedStatusFilePath
        )
      );

      const archive = new MediaArchive(
        testPassArchivePath
      );

      let testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.media_attachments = undefined;

      await assert.rejects(
        async() => {
          await archive.addMediaFromStatus(
            testStatusJson
          );
        },
        {
          name: "TypeError",
          message: /expected to have a media_attachments/
        }
      );

      testStatusJson.media_attachments = "";

      await assert.rejects(
        async() => {
          await archive.addMediaFromStatus(
            testStatusJson
          );
        },
        {
          name: "TypeError",
          message: /is expected to be an array/
        }
      );

    } );

    it( "should add the media attachment from the status", async() => {

      const expectedStatusJson = JSON.parse(
        readFileSync(
          testExpectedStatusFilePath
        )
      );

      const archive = new MediaArchive(
        testPassArchivePath
      );

      let statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      const mediaCount = await archive.addMediaFromStatus( expectedStatusJson );

      nockDone();

      statusCount = await archive.getContentsCount();

      assert.equal(
        statusCount,
        testPassMediaCount
      );

      assert.equal(
        mediaCount,
        testPassMediaCount
      );

    } );

  } );

} );
