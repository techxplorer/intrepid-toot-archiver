/**
 * @file The defintition of the MediaArchive class.
 */
import { lstatSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

/**
 * Manage an archive of media attachments.
 */
class MediaArchive {

  /**
   * Path to the archive directory.
   * @type {string}
   */
  archivePath = null;

  /**
   * An array of media in the archive.
   * @type {Array}
   */
  media = Array();

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
   * Manage the archive of media.
   * @param {string} archivePath The path to the media archive directory.
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
   * Get the number of media files in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async getMediaCount() {

    if ( this.cacheStale ) {
      await this.loadMedia();
    }

    return this.media.length;
  }

  /**
   * Get a list of media files in the archive.
   * @returns {number} The number of statuses in the archive.
   */
  async loadMedia() {

    if ( this.cacheStale === false ) {
      return this.media.length;
    }

    this.media = Array();

    this.media = await readdir(
      this.archivePath
    );

    this.media = this.media.filter( media => path.extname( media ) === ".jpeg" );

    this.cacheStale = false;
    return this.media.length;
  }

  /**
   * Add any media attachments included in the status.
   * @param {object} status A status object.
   * @throws {TypeError} When the status doesn't contain the expected properties.
   */
  async addMediaFromStatus( status ) {

    if ( status.media_attachments === undefined ) {
      throw new TypeError( "Status is expected to have a media_attachments property" );
    }

    if ( !Array.isArray( status.media_attachments ) ) {
      throw new TypeError( "Media_attachments property is expected to be an array" );
    }

    for ( const mediaAttachment of status.media_attachments ) {
      const mediaUrl = new URL( mediaAttachment.url );
      await this.addMedia( mediaUrl );
    }

  }

  /**
   * Add a media file to the archive.
   * @param {URL} mediaUrl The full URL to the media file to download.
   * @throws {TypeError} When the parameters are incorrect.
   */
  async addMedia( mediaUrl ) {

    if ( mediaUrl instanceof URL !== true ) {
      throw new TypeError( "Media URL must be a valid URL object" );
    }

    const mediaFileName = path.basename( mediaUrl.pathname );

    await this.loadMedia();

    if (
      this.writeFileOptions.flag === "wx" &&
      this.media.indexOf( mediaFileName ) > -1 ) {
      return;
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
  }

  /**
   * Get the array of media in the archive.
   * Uses the already loaded media list, or loads them if required.
   * @returns {Array} The array of statuses from the archive.
   */
  async getMedia() {

    if ( this.cacheStale === false ) {
      return this.statuses;
    }

    await this.loadMedia();

    return this.media;
  }

}

export default MediaArchive;
