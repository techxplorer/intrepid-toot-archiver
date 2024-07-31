import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { default as semverValid } from "semver/functions/valid.js";

import PackageUtils from "../..//src/utils/package-utils.js";

describe( "PackageUtils", () => {
  describe( "getVersion", () => {
    it( "should report a valid version number", () => {
      const appPackage = new PackageUtils();
      assert.notEqual(
        semverValid( appPackage.getVersion() ),
        null
      );
    } );
  } );
} );
