/**
 * @file The defintition of the update-archive command class.
 */
import chalk from "chalk";

import StatusArchive from "../lib/status-archive.js";
import FetchStatuses from "../lib/fetch-statuses.js";
import MediaArchive from "../lib/media-archive.js";

/**
 * Command to fetch any new statuses and update the archive.
 */
class UpdateArchive {

  allowOverwrite = false;
  debugOutput = false;

  /**
   * Update the archive of statuses.
   * @param {boolean} force Overwrite any existing files in the archive.
   * @param {boolean} debug Output configuration variables.
   */
  constructor( force = false, debug = false ) {

    if ( force ) {
      this.allowOverwrite = true;
    }

    if ( debug ) {
      this.debugOutput = true;
    }

  }

  /**
   * Run the command to update the archive.
   */
  async run() {
    console.log( chalk.bold( "Updating status archive..." ) );

    const host = process.env.ITA_HOST;

    if ( host === undefined ) {
      throw new Error( "Expected the ITA_HOST environment variable" );
    }

    const userId = process.env.ITA_USERID;

    if ( userId === undefined ) {
      throw new Error( "Expected the ITA_USERID environment variable" );
    }

    const archivePath = process.env.ITA_ARCHIVE_PATH;

    if ( archivePath === undefined ) {
      throw new Error( "Expected the ITA_ARCHIVE_PATH environment variable" );
    }

    const mediaArchivePath = process.env.ITA_MEDIA_ARCHIVE_PATH;

    if ( mediaArchivePath === undefined ) {
      throw new Error( "Expected the ITA_MEDIA_ARCHIVE_PATH environment variable" );
    }

    const fetcher = new FetchStatuses(
      host,
      userId
    );

    if ( this.debugOutput ) {
      console.log( chalk.bold.underline( "\nEnvironment variables" ) );
      console.log( "Host: %s", host );
      console.log( "User id: %s", userId );
      console.log( "Archive path: %s", archivePath );
      console.log( "Media archive path: %s%s", mediaArchivePath, "\n" );
    }

    console.log( "Fetching new statuses..." );

    await fetcher.fetchData();

    const archive = new StatusArchive(
      archivePath,
      this.allowOverwrite
    );

    if ( this.allowOverwrite ) {
      console.log( chalk.yellow( "Warning: Overwriting existing statuses" ) );
    }

    const addedStatuses = await archive.addStatuses(
      fetcher.fetchedStatusData
    );

    const mediaArchive = new MediaArchive(
      mediaArchivePath,
      this.allowOverwrite
    );

    console.log( "Fetching new media..." );

    if ( this.allowOverwrite ) {
      console.log( chalk.yellow( "Warning: Overwriting existing media" ) );
    }

    let addedMedia = 0;

    for ( const status of fetcher.fetchedStatusData ) {
      const mediaCount = await mediaArchive.addMediaFromStatus( status );
      addedMedia = addedMedia +  mediaCount;
    }

    console.log( chalk.green( "Updated status archive" ) );
    console.log( `Number of statuses added: ${ addedStatuses }` );

    console.log( chalk.green( "Updated media archive" ) );
    console.log( `Number of media added: ${ addedMedia }` );

  }

}

export default UpdateArchive;
