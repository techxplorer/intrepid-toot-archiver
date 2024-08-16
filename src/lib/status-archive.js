/**
 * @file The defintition of the StatusArchive class.
 */
import { lstatSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Manage an archive of statuses.
 */
class StatusArchive {

  /**
   * Path to the archive directory.
   * @type {string}
   */
  archivePath = null;

  /**
   * An array of statuses in the archive.
   * @type {Array}
   */
  statuses = Array();

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
   * Manage the archive of statuses.
   * @param {string} archivePath The path to the status archive directory.
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

  /**
   * Add any missing statuses to the archive.
   * @param {Array} newStatuses A list of potential new statuses objects.
   * @returns {number} The number of statuses added to the archive.
   * @throws {TypeError} When the parameters are incorrect.
   */
  async addStatuses( newStatuses ) {

    if ( !Array.isArray( newStatuses ) ) {
      throw new TypeError( "New statuses must be an array" );
    }

    await this.loadStatuses();

    let addedStatuses = 0;

    for ( const status of newStatuses ) {
      const fileName = status.id + ".json";

      if (
        this.writeFileOptions.flag === "wx" &&
        this.statuses.indexOf( fileName ) > -1 ) {
        continue;
      }

      const filePath = path.join(
        this.archivePath,
        fileName
      );

      await writeFile(
        filePath,
        JSON.stringify( status, null, 2 ),
        this.writeFileOptions
      );

      addedStatuses++;

    }

    this.cacheStale = true;

    return addedStatuses;

  }

  /**
   * Get the number of statuses in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async getStatusCount() {

    if ( this.cacheStale ) {
      await this.loadStatuses();
    }

    return this.statuses.length;
  }

  /**
   * Get a list of statuses in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async loadStatuses() {

    if ( this.cacheStale === false ) {
      return this.statuses;
    }

    this.statuses = Array();

    this.statuses = await readdir(
      this.archivePath
    );

    this.statuses = this.statuses.filter( status => path.extname( status ) === ".json" );

    this.cacheStale = false;
    return this.statuses.length;
  }
}

export default StatusArchive;
