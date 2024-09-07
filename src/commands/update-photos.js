/**
 * @file The defintition of the update-content command class.
 */
import chalk from "chalk";


import StatusArchive from "../lib/status-archive.js";
import PhotoArchive from "../lib/photo-archive.js";

/**
 * Command to update the content uses statuses from the archive.
 */
class UpdatePhotos {

  allowOverwrite = false;
  debugOutput = false;

  /**
   * Update the content archive.
   * @param {boolean} force Overwrite any existing content in the archive.
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
   * Run the command to lookup user details.
   */
  async run() {
    console.log( chalk.bold( "Updating content archive..." ) );

    const statusArchivePath = process.env.ITA_ARCHIVE_PATH;

    if ( statusArchivePath === undefined ) {
      throw new Error( "Expected the ITA_ARCHIVE_PATH environment variable" );
    }

    const contentArchivePath = process.env.ITA_CONTENT_ARCHIVE_PATH;

    if ( contentArchivePath === undefined ) {
      throw new Error( "Expected the ITA_CONTENT_ARCHIVE_PATH environment variable" );
    }

    const mediaArchivePath = process.env.ITA_MEDIA_ARCHIVE_PATH;

    if ( mediaArchivePath === undefined ) {
      throw new Error( "Expected the ITA_MEDIA_ARCHIVE_PATH environment variable" );
    }

    if ( this. debugOutput ) {
      console.log( chalk.bold.underline( "\nEnvironment variables" ) );
      console.log( "Status archive path: %s", process.env.ITA_ARCHIVE_PATH );
      console.log( "Content archive path: %s%s", process.env.ITA_ARCHIVE_PATH, "\n" );
      console.log( "Media archive path: %s%s", process.env.ITA_ARCHIVE_PATH, "\n" );
    }

    const statusArchive = new StatusArchive(
      statusArchivePath
    );

    if ( this.allowOverwrite ) {
      console.log( chalk.yellow( "Warning: Overwriting content is not supported" ) );
      this.allowOverwrite = false;
    }

    const photoArchive = new PhotoArchive(
      contentArchivePath,
      this.allowOverwrite
    );

    const statusCount = await statusArchive.loadContents();

    if ( statusCount === 0 ) {
      console.log( chalk.red( "Error: Status archive is empty" ) );
      process.exit( 1 );
    }

    const contentCount = await photoArchive.loadContents();

    console.log( `Number of statuses in status archive: ${ statusCount }` );

    console.log( `Number of posts in photo archive: ${ contentCount }` );

    const addedContent = await photoArchive.addContent(
      statusArchive.contents,
      statusArchivePath,
      mediaArchivePath
    );

    console.log( chalk.green( "Updated content archive" ) );
    console.log( `Number of posts added: ${ addedContent }` );
  }
}

export default UpdatePhotos;
