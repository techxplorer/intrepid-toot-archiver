import assert from "node:assert/strict";
import { lstatSync, copyFileSync, mkdirSync } from "node:fs";
import path from "node:path";
import { after, afterEach, before, describe, it } from "node:test";

import nock from "nock";
import { rimraf } from "rimraf";

import PhotoArchive from "../../src/lib/photo-archive.js";
import MediaArchive from "../../src/lib/media-archive.js";

const testFailArchivePathOne = "";
const testFailArchivePathMsgOne = "Archive path not found";
const testFailArchivePathTwo = path.resolve( import.meta.dirname, "../../package.json" );
const testFailArchivePathMsgTwo = "Archive path must be a directory";
const testPassArchivePath = path.resolve( "tests/artefacts/photo-archive" );

const testFailStatusArchivePathMsg = "The statusArchivePath parameter must be a string";

const testContentFileName = "112546982904162819.md";
const testContentDirName = path.basename( testContentFileName, ".md" );
const testActualContentsFilePath = path.join(
  testPassArchivePath,
  testContentDirName,
  "index.md"
);
const testExpectedContentsFilePath = path.join(
  path.resolve( "tests/artefacts/contents" ),
  testContentFileName
);

const testFailStatusArray = null;
const testFailStatusArrayMsg = "New statuses must be an array";
const testPassStatusArray = [];
const testPassStatusArchivePath = path.resolve( "tests/artefacts/statuses" );

const testPassMediaArchive = path.resolve( "tests/artefacts/photo-media-archive" );
const testFailMediaArchivePathMsg = "The mediaArchivePath parameter must be a string";

const testFetchUrlHost = "https://static.theblower.au";
const testFetchUrlPath = "/media_attachments/files/112/546/982/645/822/223/original/";
const testMediaFileName = "dfb3792535a960dd.jpeg";
const testPassMediaUrl = new URL(
  testFetchUrlHost +
  testFetchUrlPath +
  testMediaFileName
);

const testNewStatuses = [
  "112546982904162819.json"
];

/**
 * Helper function to tidy the archive directory.
 */
function tidyArchiveDir() {
  rimraf.sync(
    testPassArchivePath + "/**/*",
    {
      preserveRoot: true,
      glob: true
    }
  );

  rimraf.sync(
    testPassMediaArchive + "/*.jpeg",
    {
      preserveRoot: true,
      glob: true
    }
  );
}

const nockArtefacts = path.resolve( "tests/artefacts/nock" );
const nockBack = nock.back;

describe( "PhotoArchive", () => {

  describe( "constructor", () => {
    it( "should throw a TypeError when the Archive path cannot be found", () => {
      assert.throws(
        () => {
          new PhotoArchive(
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
          new PhotoArchive(
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
          new PhotoArchive(
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

      const archive = new PhotoArchive(
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

      mkdirSync(
        path.dirname(
          testActualContentsFilePath
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

      const archive = new PhotoArchive(
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

      const archive = new PhotoArchive(
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

      mkdirSync(
        path.dirname(
          testActualContentsFilePath
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

    it( "should throw a TypeError when the new statuses is not an array", async() => {

      const archive = new PhotoArchive(
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

    it( "should throw a TypeError when the status archive path is not a string", async() => {

      const archive = new PhotoArchive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.addContent(
            testPassStatusArray,
            undefined
          );
        },
        {
          name: "TypeError",
          message: testFailStatusArchivePathMsg
        }
      );

      await assert.rejects(
        async() => {
          await archive.addContent(
            testPassStatusArray,
            1234
          );
        },
        {
          name: "TypeError",
          message: testFailStatusArchivePathMsg
        }
      );
    } );

    it( "should throw a TypeError when the media archive path is not a string", async() => {

      const archive = new PhotoArchive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.addContent(
            testPassStatusArray,
            testPassStatusArchivePath,
            undefined
          );
        },
        {
          name: "TypeError",
          message: testFailMediaArchivePathMsg
        }
      );

      await assert.rejects(
        async() => {
          await archive.addContent(
            testPassStatusArray,
            testPassStatusArchivePath,
            1234
          );
        },
        {
          name: "TypeError",
          message: testFailMediaArchivePathMsg
        }
      );
    } );

    it( "should not throw a TypeError when all parameters are correct", async() => {

      const archive = new PhotoArchive(
        testPassArchivePath
      );

      await assert.doesNotReject(
        async() => {
          await archive.addContent(
            testPassStatusArray,
            testPassStatusArchivePath,
            testPassMediaArchive
          );
        }
      );
    } );

    it( "should add the expected number of photos to the archive", async() => {

      // setup the media archive first
      const mediaArchive = new MediaArchive(
        testPassMediaArchive
      );

      let statusCount = await mediaArchive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      const addedMedia = await mediaArchive.addMedia( testPassMediaUrl );

      nockDone();

      assert.equal(
        addedMedia,
        1
      );

      const photoArchive = new PhotoArchive(
        testPassArchivePath
      );

      const photoCount = await photoArchive.addContent(
        testNewStatuses,
        testPassStatusArchivePath,
        testPassMediaArchive
      );

      assert.equal(
        photoCount,
        1
      );

    } );

    it( "should not overwrite photos already in the archive", async() => {

      // setup the media archive first
      const mediaArchive = new MediaArchive(
        testPassMediaArchive
      );

      let statusCount = await mediaArchive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      const addedMedia = await mediaArchive.addMedia( testPassMediaUrl );

      nockDone();

      assert.equal(
        addedMedia,
        1
      );

      const photoArchive = new PhotoArchive(
        testPassArchivePath
      );

      let photoCount = await photoArchive.addContent(
        testNewStatuses,
        testPassStatusArchivePath,
        testPassMediaArchive
      );

      assert.equal(
        photoCount,
        1
      );

      photoCount = await photoArchive.addContent(
        testNewStatuses,
        testPassStatusArchivePath,
        testPassMediaArchive
      );

      assert.equal(
        photoCount,
        0
      );

    } );

    it( "should only add content that matches the hashtag", async() => {

      // setup the media archive first
      const mediaArchive = new MediaArchive(
        testPassMediaArchive
      );

      let statusCount = await mediaArchive.getContentsCount();

      assert.equal(
        statusCount,
        0
      );

      const { nockDone } = await nockBack( "media-attachment.json" );

      const addedMedia = await mediaArchive.addMedia( testPassMediaUrl );

      nockDone();

      assert.equal(
        addedMedia,
        1
      );

      const photoArchive = new PhotoArchive(
        testPassArchivePath,
        false,
        "testHashTag"
      );

      const photoCount = await photoArchive.addContent(
        testNewStatuses,
        testPassStatusArchivePath,
        testPassMediaArchive
      );

      assert.equal(
        photoCount,
        0
      );

    } );
  } );

} );
