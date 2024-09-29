/**
 * @file The defintition of the delete-status command class.
 */
import path from "node:path";

import chalk from "chalk";

import StatusArchive from "../lib/status-archive.js";
import MediaArchive from "../lib/media-archive.js";

/**
 * Command to delete a status from the archive.
 */
class DeleteStatus {

  statusID = null;

  /**
   * Delete a status from the archive.
   * @param {string} statusID The unique id of the status.
   */
  constructor( statusID ) {

    this.statusID = statusID;

  }

  /**
   * Run the command to delete a status.
   */
  async run() {
    console.log( chalk.bold( "Deleting a status..." ) );

    const archivePath = process.env.ITA_ARCHIVE_PATH;

    if ( archivePath === undefined ) {
      throw new Error( "Expected the ITA_ARCHIVE_PATH environment variable" );
    }

    const mediaArchivePath = process.env.ITA_MEDIA_ARCHIVE_PATH;

    if ( mediaArchivePath === undefined ) {
      throw new Error( "Expected the ITA_MEDIA_ARCHIVE_PATH environment variable" );
    }

    if ( this.debugOutput ) {
      console.log( chalk.bold.underline( "\nEnvironment variables" ) );
      console.log( "Archive path: %s", archivePath );
      console.log( "Media archive path: %s%s", mediaArchivePath, "\n" );
    }

    const archive = new StatusArchive(
      archivePath
    );

    const mediaArchive = new MediaArchive(
      mediaArchivePath
    );

    console.log( `Attempting to delete status with id: ${ this.statusID }` );

    const status = await archive.getContent( this.statusID );

    if ( status === false ) {
      console.log( chalk.yellow( "Unable to find status" ) );
      return;
    }

    if ( archive.statusHasMedia( status ) ) {
      console.log( "Status includes media which will also be deleted" );
    }

    let completed = true;

    for ( const media of status.media_attachments ) {
      const mediaContentId = path.basename( media.url, ".jpeg" );
      console.log( `Deleting media with id: ${ mediaContentId }...` );
      const deleted = mediaArchive.deleteContent( mediaContentId );
      if ( deleted === false ) {
        console.log( chalk.red( "Unable to delete media" ) );
        completed = false;
      }
    }

    const deleted = archive.deleteContent( this.statusID );

    if ( deleted === false ) {
      console.log( chalk.red( "Unable to delete status" ) );
      completed = false;
    }

    if ( completed ) {
      console.log( chalk.green( "Status succesfully deleted" ) );
    } else {
      console.log( chalk.red( "Unable to delete status" ) );
    }

  }


}

export default DeleteStatus;
