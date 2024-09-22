/**
 * @file The defintition of the MediaArchive class.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";

/**
 * Manage an archive of media attachments.
 * @augments Archive
 */
class MediaArchive extends Archive {

  /**
   * Manage the Media Archive.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false ) {
    super( archivePath, overwriteFlag );
    this.fileExtension = ".jpeg";
  }

  /**
   * Add any media attachments included in the status.
   * @param {object} status A status object.
   * @returns {number} The number of media files added to the archive.
   * @throws {TypeError} When the status doesn't contain the expected properties.
   */
  async addMediaFromStatus( status ) {

    let mediaCount = 0;

    if ( status.media_attachments === undefined ) {
      throw new TypeError( "Status is expected to have a media_attachments property" );
    }

    if ( !Array.isArray( status.media_attachments ) ) {
      throw new TypeError( "Media_attachments property is expected to be an array" );
    }

    for ( const mediaAttachment of status.media_attachments ) {
      const mediaUrl = new URL( mediaAttachment.url );
      mediaCount += await this.addMedia( mediaUrl );
    }

    return mediaCount;

  }

  /**
   * Add a media file to the archive.
   * @param {URL} mediaUrl The full URL to the media file to download.
   * @throws {TypeError} When the parameters are incorrect.
   * @returns {number} The number of media files added to the archive.
   */
  async addMedia( mediaUrl ) {

    if ( mediaUrl instanceof URL !== true ) {
      throw new TypeError( "Media URL must be a valid URL object" );
    }

    const mediaFileName = path.basename( mediaUrl.pathname );

    await this.loadContents();

    if (
      this.writeFileOptions.flag === "wx" &&
      this.contents.indexOf( mediaFileName ) > -1 ) {
      return 0;
    }

    try {
      const response = await fetch( mediaUrl );
      if ( !response.ok ) {
        throw new Error( `Response status: ${ response.status }` );
      }

      const mediaArrayBuffer = await response.arrayBuffer();
      const mediaPath = path.join( this.archivePath, mediaFileName );

      await writeFile(
        mediaPath,
        Buffer.from( mediaArrayBuffer ),
        this.writeFileOptions
      );

    } catch ( error ) {
      throw new Error( error );
    }

    this.cacheStale = true;

    return 1;
  }

}

export default MediaArchive;
