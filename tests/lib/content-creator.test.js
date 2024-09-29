import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

import YAML from "yaml";

import ContentCreator from "../../src/lib/content-creator.js";
import TagReplacer from "../../src/lib/tag-replacer.js";

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
).toString().trim();

const expectedStatusYml = readFileSync(
  testExpectedStatusYmlFilePath
).toString().trim();

const testStatusUrl = "https://theblower.au/@geton/112793425453345288";
const testInavlidStatusURL = testStatusUrl.replace( "https://", "" );
const expectedLinkBack = `[Original post on the Fediverse](${ testStatusUrl })`;
const testTagMappingYml = path.resolve( "tests/artefacts/tag-replacer/tag-mapping.yml" );

/* eslint-disable max-len, no-useless-escape */
const testLongContent = `Hello Blowerians!

There's been an uptick in reported posts lately, for probably obvious reasons.

1\. Criticism of any nation's actions is not considered racism by us.
2\. With that in mind, please be careful with your wording, and do not use general racial terms when talking about the actions of governments.
3\. We expect all \*public\* posts that appear on the Local feed to meet a fairly conservative PG-13 standard. This is not just "adult" content, but also violence/gore.`;

const expectedTitle = "Hello Blowerians! There's been an uptick in reported posts lately…";

const expectedDescr = "Hello Blowerians! There's been an uptick in reported posts lately, for probably obvious reasons…";
/* eslint-enable max-len, no-useless-escape */

describe( "ContentCreator", () => {

  describe( "constructor", () => {
    it( "should not throw any errors", () => {
      assert.doesNotThrow(
        () => {
          new ContentCreator();
        }
      );

      assert.doesNotThrow(
        () => {
          new ContentCreator( null );
        }
      );

      assert.doesNotThrow(
        () => {
          new ContentCreator( new TagReplacer( testTagMappingYml ) );
        }
      );
    } );
  } );

  describe( "makeMarkdownContent", () => {
    it( "should throw a TypeError of the parameter is not correct", () => {
      const contentCreator = new ContentCreator();

      const testStatusJson = structuredClone( expectedStatusJson );

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent();
        },
        {
          name: "TypeError",
          message: /must be an object/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( 1234 );
        },
        {
          name: "TypeError",
          message: /must be an object/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( "" );
        },
        {
          name: "TypeError",
          message: /must be an object/
        }
      );

      testStatusJson.content = 1234;

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( testStatusJson );
        },
        {
          name: "TypeError",
          message: /must be a string/
        }
      );

      testStatusJson.content = "";

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( testStatusJson );
        },
        {
          name: "TypeError",
          message: /cannot be a zero length string/
        }
      );

      testStatusJson.content = undefined;

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( testStatusJson );
        },
        {
          name: "TypeError",
          message: /content/
        }
      );

      testStatusJson.content = "test content";
      testStatusJson.id = undefined;

      assert.throws(
        () => {
          contentCreator.makeMarkdownContent( testStatusJson );
        },
        {
          name: "TypeError",
          message: /id/
        }
      );
    } );

    it( "should not throw an error with a valid parameter.", () => {
      const contentCreator = new ContentCreator();

      assert.doesNotThrow(
        () => {
          contentCreator.makeMarkdownContent( expectedStatusJson );
        }
      );
    } );

    it( "should return the expected markdown from the HTML content.", () => {
      const contentCreator = new ContentCreator();
      const markdownContent = contentCreator.makeMarkdownContent( expectedStatusJson );

      assert.equal(
        markdownContent,
        expectedStatusTxt
      );
    } );
  } );

  describe( "makeFrontMatter", () => {
    it( "should throw an error when the parameter is incorrect", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.makeFrontMatter();
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeFrontMatter( "" );
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeFrontMatter( 1234 );
        },
        {
          name: "TypeError",
          message: /status parameter/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeFrontMatter(
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
          contentCreator.makeFrontMatter( expectedStatusJson );
        }
      );

    } );

    it( "should throw an error when the satus object is missing a property", () => {
      const contentCreator = new ContentCreator();

      let testStatusJson = structuredClone( expectedStatusJson );
      testStatusJson.created_at = undefined;

      assert.throws(
        () => {
          contentCreator.makeFrontMatter( testStatusJson );
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
          contentCreator.makeFrontMatter( testStatusJson );
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
          contentCreator.makeFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /tags/
        }
      );

      testStatusJson.tags = "";

      assert.throws(
        () => {
          contentCreator.makeFrontMatter( testStatusJson );
        },
        {
          name: "TypeError",
          message: /tags/
        }
      );
    } );

    it( "should return the expected front matter", () => {
      const contentCreator = new ContentCreator( new TagReplacer( testTagMappingYml ) );
      let actualYml = contentCreator.makeFrontMatter(
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

      actualYml = contentCreator.makeFrontMatter(
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

  describe( "makeTitle", () => {

    it( "should throw an error when the parameter is incorrect", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.makeTitle();
        },
        {
          name: "TypeError",
          message: /is required/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeTitle( 1234 );
        },
        {
          name: "TypeError",
          message: /must be a string/
        }
      );

      assert.doesNotThrow(
        () => {
          contentCreator.makeTitle( testLongContent );
        }
      );

    } );

    it( "should make the expected title", () => {
      const contentCreator = new ContentCreator();
      const testTitle = contentCreator.makeTitle( testLongContent );
      assert.equal(
        testTitle,
        expectedTitle
      );
    } );

  } );

  describe( "makeDescription", () => {

    it( "should throw an error when the parameter is incorrect", () => {
      const contentCreator = new ContentCreator();

      assert.throws(
        () => {
          contentCreator.makeDescription();
        },
        {
          name: "TypeError",
          message: /is required/
        }
      );

      assert.throws(
        () => {
          contentCreator.makeDescription( 1234 );
        },
        {
          name: "TypeError",
          message: /must be a string/
        }
      );

      assert.doesNotThrow(
        () => {
          contentCreator.makeDescription( testLongContent );
        }
      );

    } );

    it( "should make the expected description", () => {
      const contentCreator = new ContentCreator();
      const testDescr = contentCreator.makeDescription( testLongContent );
      assert.equal(
        testDescr,
        expectedDescr
      );
    } );

  } );
} );
