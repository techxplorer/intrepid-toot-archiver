import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { before, describe, it } from "node:test";


import ContentCreator from "../../src/lib/content-creator.js";

const testContentTypeErrorOne = "The htmlContent parameter must be a string.";
const testContentTypeErrorTwo = "The htmlContent parameter cannot be a zero length string.";

const testStatusJsonFileName = "112793425453345288.json";
const testExpectedStatusJsonFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusJsonFileName
);

const testStatusMdFileName = "112793425453345288.md";
const testExpectedStatusMdFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusMdFileName
);

const expectedStatusJson = JSON.parse(
  readFileSync(
    testExpectedStatusJsonFilePath
  )
);

const expectedStatusMd = readFileSync(
  testExpectedStatusMdFilePath
).toString().trimEnd();

describe( "ContentCreator", () => {

  describe( "constructor", () => {
    it( "should not throw any errors", () => {
      assert.doesNotThrow(
        () => {
          new ContentCreator();
        }
      );
    } );
  } );

  describe( "convertContent", () => {
    it( "should throw a TypeError of the parameter is not a string.", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.convertContent();
        },
        {
          name: "TypeError",
          message: testContentTypeErrorOne
        }
      );

      assert.throws(
        () => {
          contentCreator.convertContent( 1234 );
        },
        {
          name: "TypeError",
          message: testContentTypeErrorOne
        }
      );

      assert.throws(
        () => {
          contentCreator.convertContent( "" );
        },
        {
          name: "TypeError",
          message: testContentTypeErrorTwo
        }
      );
    } );

    it( "should not throw an error with a valid parameter.", () => {
      const contentCreator = new ContentCreator();

      assert.doesNotThrow(
        () => {
          contentCreator.convertContent( "12345" );
        }
      );

      assert.doesNotThrow(
        () => {
          contentCreator.convertContent( expectedStatusJson.content );
        }
      );
    } );

    it( "should return the expected markdown from the HTML content.", () => {
      const contentCreator = new ContentCreator();
      const markdownContent = contentCreator.convertContent( expectedStatusJson.content );

      assert.equal(
        markdownContent,
        expectedStatusMd
      );
    } );
  } );
} );
