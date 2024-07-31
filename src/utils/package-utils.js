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
   */
  getVersion() {
    return this.appPackage.version;
  }

}
