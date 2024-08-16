/**
 * @file The defintition of the update-content command class.
 */
import chalk from "chalk";


import StatusArchive from "../../src/lib/status-archive.js";
import ContentArchive from "../../src/lib/content-archive.js";

/**
 * Command to update the content uses statuses from the archive.
 */
class UpdateContent {

  /**
   * Update the archive of statuses.
   * @param {boolean} force Overwrite any existing files in the archive.
   */
  constructor( force = false ) {

    if ( force ) {
      this.allowOverwrite = true;
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

    const statusArchive = new StatusArchive(
      statusArchivePath
    );

    const contentArchive = new ContentArchive(
      contentArchivePath,
      this.allowOverwrite
    );

    if ( this.allowOverwrite ) {
      console.log( chalk.yellow( "Warning: Overwriting existing content" ) );
    }

    const statusCount = await statusArchive.loadStatuses();

    if ( statusCount === 0 ) {
      console.log( chalk.red( "Error: Status archive is empty" ) );
      process.exit( 1 );
    }

    const contentCount = await contentArchive.loadContent();

    console.log( `Number of statuses in status archive: ${ statusCount }` );

    console.log( `Number of posts in content archive: ${ contentCount }` );

    const addedContent = await contentArchive.addContent(
      statusArchive.statuses,
      statusArchivePath
    );

    console.log( chalk.green( "Updated content archive" ) );
    console.log( `Number of posts added: ${ addedContent }` );
  }
}

export default UpdateContent;