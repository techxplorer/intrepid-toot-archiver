import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import Archive from "../../src/lib/archive.js";

const testPassArchivePath = path.resolve( "tests/artefacts/status-archive" );

const testStatusFile = path.resolve( "tests/artefacts/statuses/112546982904162819.json" );

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

  describe( "statusHasTag", async() => {
    it( "should throw an error if the parameters are incorrect", () => {
      const archive = new Archive(
        testPassArchivePath
      );

      assert.throws( () => {
        archive.statusHasTag(
          "",
          undefined
        );
      },
      {
        name: "TypeError",
        message: /status parameter/
      } );

      assert.throws( () => {
        archive.statusHasTag(
          {},
          123
        );
      },
      {
        name: "TypeError",
        message: /tag parameter/
      } );

      assert.throws( () => {
        archive.statusHasTag(
          {},
          "test tag"
        );
      },
      {
        name: "TypeError",
        message: /expected to have a 'tags' property/
      } );

      assert.throws( () => {
        archive.statusHasTag(
          {
            tags: ""
          },
          "test tag"
        );
      },
      {
        name: "TypeError",
        message: /tags property is expected to be an array/
      } );

    } );

    it( "should not throw an error when the parameters are correct", () => {
      const archive = new Archive(
        testPassArchivePath
      );

      assert.doesNotThrow( () => {
        archive.statusHasTag(
          {
            tags: []
          },
          "test tags"
        );
      } );
    } );

    it( "should return true when the tag is found", () => {
      const archive = new Archive(
        testPassArchivePath
      );

      const testStatus = JSON.parse(
        readFileSync(
          testStatusFile
        )
      );

      assert.ok(
        archive.statusHasTag( testStatus, "teddybear" ) === true
      );
    } );

    it( "should return false when the tag is not found", () => {
      const archive = new Archive(
        testPassArchivePath
      );

      const testStatus = JSON.parse(
        readFileSync(
          testStatusFile
        )
      );

      assert.ok(
        archive.statusHasTag( testStatus, "testandtag" ) === false
      );
    } );
  } );

} );
