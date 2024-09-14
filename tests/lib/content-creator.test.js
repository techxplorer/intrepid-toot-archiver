import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import YAML from "yaml";

import ContentCreator from "../../src/lib/content-creator.js";

const testContentTypeErrorOne = "The htmlContent parameter must be a string.";
const testContentTypeErrorTwo = "The htmlContent parameter cannot be a zero length string.";

const testStatusJsonFileName = "112793425453345288.json";
const testExpectedStatusJsonFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusJsonFileName
);

const testStatusTxtFileName = "112793425453345288.txt";
const testExpectedStatusTxtFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusTxtFileName
);

const testStatusYamlFileName = "112793425453345288.yml";
const testExpectedStatusYmlFilePath = path.join(
  path.resolve( "tests/artefacts/statuses" ),
  testStatusYamlFileName
);

const expectedStatusJson = JSON.parse(
  readFileSync(
    testExpectedStatusJsonFilePath
  )
);

const expectedStatusTxt = readFileSync(
  testExpectedStatusTxtFilePath
).toString().trimEnd();

const expectedStatusYml = readFileSync(
  testExpectedStatusYmlFilePath
).toString();

const testStatusUrl = "https://theblower.au/@geton/112793425453345288";
const testInavlidStatusURL = testStatusUrl.replace( "https://", "" );
const expectedLinkBack = `[Original post on the Fediverse](${ testStatusUrl })`;

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
        expectedStatusTxt
      );
    } );
  } );

  describe( "createFrontMatter", () => {
    it( "should throw an error when the parameter is incorrect", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.createFrontMatter();
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.createFrontMatter( "" );
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.createFrontMatter( 1234 );
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.createFrontMatter(
            expectedStatusJson,
            1234
          );
        },
        {
          name: "TypeError",
          message: /categories parameter/
        }
      );
    } );

    it( "should not throw an error when the parameter is correct", () => {
      const contentCreator = new ContentCreator();

      assert.doesNotThrow(
        () => {
          contentCreator.createFrontMatter( expectedStatusJson );
        }
      );

    } );

    it( "should not throw an error when the satus object is missing a property", () => {
      const contentCreator = new ContentCreator();

      let testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.created_at = undefined;

      assert.throws(
        () => {
          contentCreator.createFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /created_at/
        }
      );

      testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.url = undefined;

      assert.throws(
        () => {
          contentCreator.createFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /url/
        }
      );

      testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.tags = undefined;

      assert.throws(
        () => {
          contentCreator.createFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /tags/
        }
      );

      testStatusJson.tags = "";

      assert.throws(
        () => {
          contentCreator.createFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /tags/
        }
      );
    } );

    it( "should return the expected front matter", () => {
      const contentCreator = new ContentCreator();
      let actualYml = contentCreator.createFrontMatter(
        expectedStatusJson
      );

      assert.equal(
        actualYml,
        expectedStatusYml
      );

      let testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.tags = [
        {
          "name": "microfiction",
          "url": "https://theblower.au/tags/microfiction"
        },
        {
          "name": "amwriting",
          "url": "https://theblower.au/tags/amwriting"
        },
        {
          "name": "love",
          "url": "https://theblower.au/tags/love"
        }
      ];

      const testTags = [
        "microfiction",
        "amwriting",
        "love"
      ];

      actualYml = contentCreator.createFrontMatter(
        testStatusJson
      );

      let testYaml = YAML.parse( actualYml );

      for ( const tag of testTags ) {
        assert.ok(
          testYaml.tags.includes( tag )
        );
      }
    } );
  } );

  describe( "throwError", () => {
    it( "should throw an error", () => {
      const contentCreator = new ContentCreator();
      assert.throws(
        () => {
          contentCreator.throwError();
        }
      );
    } );

    it( "should throw an error with the correct message", () => {
      const contentCreator = new ContentCreator();
      assert.throws(
        () => {
          contentCreator.throwError( "created_at" );
        },
        {
          name: "TypeError",
          message: /created_at/
        }
      );
    } );
  } );

  describe( "makeLinkBack", () => {
    it( "should throw an error when the URL is invalid", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.makeLinkBack( "" );
        },
        {
          name: "TypeError",
          message: /A valid URL/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeLinkBack( "/en-US/docs" );
        },
        {
          name: "TypeError",
          message: /A valid URL/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeLinkBack( testInavlidStatusURL );
        },
        {
          name: "TypeError",
          message: /A valid URL/
        }
      );
    } );

    it( "should not throw an error when the URL is valid", () => {
      const contentCreator = new ContentCreator();
      assert.doesNotThrow(
        () => {
          contentCreator.makeLinkBack( testStatusUrl );
        }
      );
    } );

    it( "should return the expected Markdown", () => {
      const contentCreator = new ContentCreator();
      const linkBack = contentCreator.makeLinkBack( testStatusUrl );

      assert.equal(
        linkBack,
        expectedLinkBack
      );
    } );
  } );
} );
