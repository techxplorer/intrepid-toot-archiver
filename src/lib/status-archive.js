/**
 * @file The defintition of the StatusArchive class.
 */
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";

/**
 * Manage an archive of statuses.
 */
class StatusArchive extends Archive {

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

  /**
   * Get the number of statuses in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async getStatusCount() {

    if ( this.cacheStale ) {
      await this.loadStatuses();
    }

    return this.contents.length;
  }

  /**
   * Get a list of statuses in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async loadStatuses() {

    if ( this.cacheStale === false ) {
      return this.contents.length;
    }

    this.contents = Array();

    this.contents = await readdir(
      this.archivePath
    );

    this.contents = this.contents.filter( status => path.extname( status ) === ".json" );

    this.cacheStale = false;
    return this.contents.length;
  }

  /**
   * Get the array of statuses in the archive.
   * Uses the already loaded statuses, or loads them if required.
   * @returns {Array} The array of statuses from the archive.
   */
  async getStatuses() {

    if ( this.cacheStale === false ) {
      return this.contents;
    }

    await this.loadStatuses();

    return this.contents;
  }
}

export default StatusArchive;
