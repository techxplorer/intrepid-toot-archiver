/**
 * @file The defintition of the Archive class.
 */

import { lstatSync } from "node:fs";

/**
 * Base class for all of the archives to reduce code duplications.
 */
class Archive {

  /**
   * Path to the archive directory.
   * @type {string}
   */
  archivePath = null;

  /**
   * An array of content in the archive.
   * @type {Array}
   */
  contents = Array();

  /**
   * A flag to indicate if the status cache is stale.
   * @type {boolean}
   */
  cacheStale = true;

  /**
   * Options to be used when writing files to the archive.
   * @type {object}
   */
  writeFileOptions = {
    flag: "wx"
  };

  /**
   * Manage the archive of contents.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false ) {

    let syncStatus = null;

    try {
      syncStatus = lstatSync( archivePath );
    // eslint-disable-next-line no-unused-vars
    } catch ( err ) {
      throw new TypeError( "Archive path not found" );

    }

    if ( !syncStatus.isDirectory() ) {
      throw new TypeError( "Archive path must be a directory" );
    }

    this.archivePath = archivePath;

    if ( overwriteFlag ) {
      this.writeFileOptions = {
        flag: "w"
      };
    }

  }

}

export default Archive;
