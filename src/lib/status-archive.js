/**
 * @file The defintition of the StatusArchive class.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";

/**
 * Manage an archive of statuses.
 * @augments Archive
 */
class StatusArchive extends Archive {

  /**
   * Manage the Status Archive.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false ) {
    super( archivePath, overwriteFlag );
    this.fileExtension = ".json";
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

    await this.loadContents();

    let addedStatuses = 0;

    for ( const status of newStatuses ) {
      const fileName = status.id + ".json";

      if (
        this.writeFileOptions.flag === "wx" &&
        this.contents.indexOf( fileName ) > -1 ) {
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

}

export default StatusArchive;
