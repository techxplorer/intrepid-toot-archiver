import assert from "node:assert/strict";
import path from "node:path";
import { describe, it } from "node:test";

import TagReplacer from "../../src/lib/tag-replacer.js";

const testFailPathOne = path.resolve( "tests/artefacts/not-found" );
const testFailPathTwo = path.resolve( "tests/artefacts/" );
const testPassPath = path.resolve( "tests/artefacts/tag-replacer/tag-mapping.yml" );
const testPassMappingCount = 5;

const testTagList = [
  "australiannatives",
  "teddybear",
  "SouthAustralia",
  "weather"
];

const expectedTagList = [
  "AustralianNatives",
  "TeddyBear",
  "SouthAustralia"
];

describe( "TagReplacer", () => {

  describe( "Constructor", () => {

    it( "should throw a TypeError when the YAML file cannot be found", () => {

      assert.throws(
        () => {
          new TagReplacer(
            testFailPathOne
          );
        },
        {
          name: "TypeError",
          message: /not found/
        }
      );

    } );

    it( "should throw a TypeError when the path is to a directory", () => {

      assert.throws(
        () => {
          new TagReplacer(
            testFailPathTwo
          );
        },
        {
          name: "TypeError",
          message: /must .* a file/
        }
      );
    } );

    it( "should not throw a TypeError when the path valid", () => {

      assert.doesNotThrow(
        () => {
          new TagReplacer(
            testPassPath
          );
        }
      );
    } );

  } );

  describe( "loadMappingList", () => {

    it( "should successfully load the list of mappings", () => {

      const tagReplacer = new TagReplacer( testPassPath );

      tagReplacer.loadMappingList();

    } );
  } );

  describe( "getMappingCount", () => {

    it( "should return the expected number of mappings", () => {

      const tagReplacer = new TagReplacer( testPassPath );

      const mappingCount = tagReplacer.getMappingCount();

      assert.equal(
        mappingCount,
        testPassMappingCount
      );

    } );

  } );

  describe( "replaceTags", () => {

    it( "should thrown a TypeError if the parameter is not an array", () => {

      const tagReplacer = new TagReplacer( testPassPath );

      assert.throws(
        () => {
          tagReplacer.replaceTags( "fail" );
        },
        {
          name: "TypeError",
          message: /parameter must .* an array/
        }
      );

    } );

    it( "should replace the required tags", () => {

      const tagReplacer = new TagReplacer( testPassPath );

      const actualTagList = tagReplacer.replaceTags( testTagList );

      assert.deepEqual(
        actualTagList,
        expectedTagList
      );

    } );

    it( "should not crash of the replacer is empty", () => {

      const tagReplacer = new TagReplacer( testPassPath );
      tagReplacer.tagMappings = {};

      const actualTagList = tagReplacer.replaceTags( testTagList );

      assert.deepEqual(
        actualTagList,
        actualTagList
      );

    } );

    it( "should not crash of the list of tags is empty", () => {

      const tagReplacer = new TagReplacer( testPassPath );

      const actualTagList = tagReplacer.replaceTags( [] );

      assert.deepEqual(
        actualTagList,
        []
      );

    } );

  } );

} );
