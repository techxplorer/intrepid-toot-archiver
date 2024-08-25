import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import Archive from "../../src/lib/archive.js";

const testPassArchivePath = path.resolve( "tests/artefacts/status-archive" );

describe( "Archive", () => {

  describe( "loadContents", async() => {
    it( "should throw an error when the reqiured property is not set", async() => {
      const archive = new Archive(
        testPassArchivePath
      );

      await assert.rejects(
        async() => {
          await archive.loadContents();
        },
        {
          name: "TypeError"
        }
      );
    } );

    it( "should not throw an error when the reqiured property is set", async() => {
      const archive = new Archive(
        testPassArchivePath
      );

      archive.fileExtension = ".json";

      await assert.doesNotReject(
        async() => {
          await archive.loadContents();
        },
        {
          name: "TypeError"
        }
      );
    } );

  } );

  describe( "getContentsCount", async() => {
    it( "should return zero for an empty archive", async() => {

      const archive = new Archive(
        testPassArchivePath
      );

      archive.contents = [];
      archive.cacheStale = false;

      const count = await archive.getContentsCount();

      assert.equal(
        count,
        0
      );

    } );

  } );

  describe( "getContents", async() => {
    it( "should return an empty array for an empty archive", async() => {

      const archive = new Archive(
        testPassArchivePath
      );

      archive.contents = [];
      archive.cacheStale = false;

      const contents = await archive.getContents();

      assert.ok(
        Array.isArray( contents )
      );

      assert.equal(
        contents.length,
        0
      );

    } );

  } );

} );
