/**
 * @file The defintition of the PackageUtils class.
 */
import path from "node:path";
import fs from "node:fs";

/**
 * Make available various properties from the package.json file, and
 * provide simple methods to explore unit testing.
 */
export default class PackageUtils {

  appPackage = Object();

  /**
   * Parse the package.json file, making it available for use with the getter
   * methds.
   */
  constructor() {

    this.appPackage = JSON.parse(
      fs.readFileSync(
        path.resolve(
          import.meta.dirname,
          "../../package.json"
        )
      )
    );
  }

  /**
   * Get the version property from the package.json file.
   * @returns {string} The version of the app.
   * @throws {Error} When the property is not defined.
   */
  getVersion() {

    if ( typeof this.appPackage.version === "undefined" ) {
      this.throwError( "version number" );
    }

    return this.appPackage.version;
  }

  /**
   * Get the description property from the package.json file.
   * @returns {string} The description of the app.
   * @throws {Error} When the property is not defined.
   */
  getDescription() {

    if ( typeof this.appPackage.description === "undefined" ) {
      this.throwError( "description" );
    }

    return this.appPackage.description;
  }

  /**
   * Get the homepage property from the package.json file.
   * @returns {string} The homepage of the app.
   * @throws {Error} When the property is not defined.
   */
  getHomepage() {

    if ( typeof this.appPackage.homepage === "undefined" ) {
      this.throwError( "homepage" );
    }

    try {
      new URL( this.appPackage.homepage );
    // eslint-disable-next-line no-unused-vars
    } catch ( err ) {
      this.throwError( "homepage" );
    }

    return this.appPackage.homepage;
  }

  /**
   * Make it easy to throw a consistent error message.
   * @param {string} propertyName The name of the property that wasn't found.
   */
  throwError( propertyName ) {
    throw new Error(
      `Unable to get ${ propertyName } from package.json`
    );
  }
}
