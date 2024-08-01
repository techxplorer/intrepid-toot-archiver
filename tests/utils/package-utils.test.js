import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { default as semverValid } from "semver/functions/valid.js";

import PackageUtils from "../../src/utils/package-utils.js";

const testDescription = "A CLI app to make an archive of toots";
const testHomepage = "https://github.com/techxplorer/intrepid-toot-archiver#readme";
const testErrorProperty = "myPropertyName";
const testErrorMessage = `Unable to get ${ testErrorProperty } from package.json`;

describe( "PackageUtils", () => {

  describe( "getVersion", () => {

    it( "should report a valid version number", () => {
      const appPackage = new PackageUtils();
      assert.notEqual(
        semverValid( appPackage.getVersion() ),
        null
      );
    } );

    it( "should not throw an error", () => {
      const appPackage = new PackageUtils();
      assert.doesNotThrow(
        () => {
          appPackage.getVersion();
        }
      );
    } );

    it( "should throw an error when the requested field is not found", () => {
      const appPackage = new PackageUtils();
      appPackage.appPackage.version = undefined;
      assert.throws(
        () => {
          appPackage.getVersion();
        }
      );
    } );

  } );

  describe( "getDescription", () => {

    it( "should return a valid description", () => {
      const appPackage = new PackageUtils();
      assert.equal(
        appPackage.getDescription(),
        testDescription
      );
    } );

    it( "should not throw an error", () => {
      const appPackage = new PackageUtils();
      assert.doesNotThrow(
        () => {
          appPackage.getDescription();
        }
      );
    } );

    it( "should throw an error when the requested field is not found", () => {
      const appPackage = new PackageUtils();
      appPackage.appPackage.description = undefined;
      assert.throws(
        () => {
          appPackage.getDescription();
        }
      );
    } );
  } );

  describe( "getHomepage", () => {

    it( "should return a valid homepage url", () => {
      const appPackage = new PackageUtils();
      assert.equal(
        appPackage.getHomepage(),
        testHomepage
      );
    } );

    it( "should not throw an error", () => {
      const appPackage = new PackageUtils();
      assert.doesNotThrow(
        () => {
          appPackage.getHomepage();
        }
      );
    } );

    it( "should throw an error when the requested field is not found", () => {
      const appPackage = new PackageUtils();
      appPackage.appPackage.homepage = undefined;
      assert.throws(
        () => {
          appPackage.getHomepage();
        }
      );
    } );

    it( "should throw an error when the requested field is not valid", () => {
      const appPackage = new PackageUtils();
      appPackage.appPackage.homepage = "not a valid url";
      assert.throws(
        () => {
          appPackage.getHomepage();
        }
      );
    } );

  } );

  describe( "throwError", () => {
    it( "should throw an error", () => {
      const appPackage = new PackageUtils();
      assert.throws(
        () => {
          appPackage.throwError();
        }
      );
    } );

    it( "should throw an error with the correct message", () => {
      const appPackage = new PackageUtils();
      assert.throws(
        () => {
          appPackage.throwError( testErrorProperty );
        },
        {
          name: "Error",
          message: testErrorMessage
        }
      );
    } );
  } );
} );
