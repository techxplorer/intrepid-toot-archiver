/**
 * @file The defintition of the StatusArchive class.
 */
import { lstatSync } from "node:fs";
import { writeFile } from "node:fs/promises";
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
   * An array of status objects.
   * @type {Array}
   */
  statuses = Array();

  /**
   * Manage the archive of statuses.
   * @param {string} archivePath The path to the status archive directory.
   * @param {Array} fetchedStatuses An array of status to add to the archive.
   */
  constructor( archivePath, fetchedStatuses ) {

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

    if ( !Array.isArray( fetchedStatuses ) ) {
      throw new TypeError( "Fetched statuses must be an array" );
    }

    this.archivePath = archivePath;
    this.statuses = fetchedStatuses;

  }

  /**
   * Add any missing statuses to the archive.
   * @returns {number} The number of statuses added to the archive.
   */
  async addStatuses() {

    let addedStatuses = 0;

    for ( const status of this.statuses ) {
      const filePath = path.join(
        this.archivePath,
        status.id + ".json"
      );

      await writeFile( filePath, JSON.stringify( status, null, 2 ) );

      addedStatuses++;

    }


    return addedStatuses;

  }

}

export default StatusArchive;
