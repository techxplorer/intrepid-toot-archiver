import assert from "node:assert/strict";
import { describe, it } from "node:test";

import FetchUserDetails from "../../src/lib/fetch-user-details.js";

const testPassFQDN = "example.com";
const testFailFQDN = "example";
const testFQDNMessage = "A valid FQDN is required";

const testPassUserName = "@techxplorer";
const testFailUserName = "techxplorer";

describe( "FetchUserDetails", () => {

  describe( "constructor" , () => {
    it( "should throw a TypeError when the host name is not a FQDN", () => {
      assert.throws(
        () => {
          new FetchUserDetails(
            testFailFQDN,
            testPassUserName
          );
        },
        {
          name: "TypeError",
          message: testFQDNMessage
        }
      );
    } );

  } );

} );
