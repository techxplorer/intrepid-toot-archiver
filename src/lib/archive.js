/**
 * @file The defintition of the Archive class.
 */

import { lstatSync } from "node:fs";
import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";

/**
 * Base class for all of the archives to reduce code duplications.
 */
class Archive {

  /**
   * Path to the archive directory.
   * @type {string}
   */
  archivePath = null;

  /**
   * An array of content in the archive.
   * @type {Array}
   */
  contents = Array();

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
   * The file extension of content in the archive.
   * @type {string}
   */
  fileExtension = undefined;

  /**
   * The tag used to filter the list of statuses.
   * @type {string}
   */
  statusFilter = false;

  /**
   * The minimum expected length of a content id.
   * @type {number}
   */
  minContentIdLen = 0;

  /**
   * A flag indicating that the archive supports content deletion.
   * @type {boolean}
   */
  supportsDelete = false;

  /**
   * Manage the archive of contents.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @param {string} statusFilter An optional tag used to filter the list of statuses.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false, statusFilter = false ) {

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

    this.statusFilter = statusFilter;

  }

  /**
   * Build the list of content in the archive if necessary or use the cached list.
   * @returns {number} The number of statuses in the archive.
   */
  async loadContents() {

    if ( this.fileExtension === undefined ) {
      throw new TypeError( "The fileExt property is required" );
    }

    if ( this.cacheStale === false ) {
      return this.contents.length;
    }

    this.contents = Array();

    if ( this.fileExtension !== false ) {

      this.contents = await readdir(
        this.archivePath
      );

      this.contents = this.contents.filter(
        contentFile => path.extname( contentFile ) === this.fileExtension
      );

    } else {

      this.contents = await readdir(
        this.archivePath,
        {
          withFileTypes: true
        }
      );

      this.contents = this.contents
        .filter( ( contentDir ) => {
          return contentDir.isDirectory();
        } )
        .map( ( contentDir ) => {
          return contentDir.name;
        } );

    }

    this.cacheStale = false;
    return this.contents.length;
  }

  /**
   * Get the number of content items in the archive.
   * @returns {number} The number of content items in the archive.
   */
  async getContentsCount() {

    if ( this.cacheStale ) {
      await this.loadContents();
    }

    return this.contents.length;
  }

  /**
   * Get the array of content in the archive.
   * Uses the already loaded content list, or loads them if required.
   * @returns {Array} The array of statuses from the archive.
   */
  async getContents() {

    if ( this.cacheStale === false ) {
      return this.contents;
    }

    await this.loadContents();

    return this.contents;
  }

  /**
   * Check to see if a status has a tag.
   * @param {object} status An object representing a status.
   * @param {string} tag The tag that the status must have.
   * @returns {boolean} True, if the status has the tag, otherwise false.
   * @throws {TypeError} When the parameters are incorrect.
   */
  statusHasTag( status, tag ) {

    if ( typeof status !== "object" ) {
      throw new TypeError( "The status parameter must be an object" );
    }

    if ( typeof tag !== "string" ) {
      throw new TypeError( "The tag parameter must be a string" );
    }

    if ( status.tags === undefined ) {
      throw new TypeError( "The status is expected to have a 'tags' property" );
    }

    if ( !Array.isArray( status.tags ) ) {
      throw new TypeError( "The tags property is expected to be an array" );
    }

    for ( const statusTag of status.tags ) {
      if ( statusTag.name === tag ) {
        return true;
      }
    }

    return false;

  }

  /**
   * Check to see if a status has a media.
   * @param {object} status An object representing a status.
   * @returns {boolean} True, if the status has the tag, otherwise false.
   * @throws {TypeError} When the parameters are incorrect.
   */
  statusHasMedia( status ) {

    if ( typeof status !== "object" ) {
      throw new TypeError( "The status parameter must be an object" );
    }

    if ( status.media_attachments === undefined ) {
      return false;
    }

    if ( !Array.isArray( status.media_attachments ) ) {
      return false;
    }

    if ( status.media_attachments.length === 0 ) {
      return false;
    }

    return true;

  }

  /**
   * Get the status object from the archive.
   * @param {string} contentID The Unique id of the status.
   * @throws {TypeError} If the parameters are invalid.
   * @returns {object | string} The status object.
   */
  async getContent( contentID ) {

    if ( this.fileExtension !== ".json" && this.fileExtension !== ".md" ) {
      throw Error( "Only supports JSON and Markdown content at this time." );
    }

    this.validateContentID( contentID );

    await this.loadContents();

    const fileName = contentID + this.fileExtension;

    if ( !this.contents.includes( fileName ) ) {
      return false;
    }

    const content = await readFile(
      path.join(
        this.archivePath,
        fileName
      )
    );

    if ( this.fileExtension === ".json" ) {
      return JSON.parse(
        content.toString()
      );
    } else {
      return content.toString();
    }
  }

  /**
   * Utility function to validate a content ID.
   * @param {string} contentID The unique ID of the content.
   * @throws {TypeError} If the content ID is invalid.
   */
  validateContentID( contentID ) {

    if ( typeof contentID !== "string" ) {
      throw new TypeError( "The contentID parameter must be a string" );
    }

    if ( contentID === "" ) {
      throw new TypeError( "The contentID parameter must not be empty" );
    }

    if ( contentID.length < this.minContentIdLen ) {
      throw new TypeError( `The contentID must be at least ${ this.minContentIdLen } characters` );
    }
  }

  /**
   * Delete an item of content from the archive.
   * @param {string} contentID The unique identifier of the content in the archive.
   * @throws {TypeError} If the parameters are invalid.
   * @returns {boolean} True if the content is deleted, False if it isn't.
   */
  async deleteContent( contentID ) {

    if ( !this.supportsDelete ) {
      throw new Error( "This archive doesn't support content deletion" );
    }

    this.validateContentID( contentID );

    await this.loadContents();

    const fileName = contentID + this.fileExtension;

    if ( !this.contents.includes( fileName ) ) {
      return false;
    }

    const filePath = path.join(
      this.archivePath,
      fileName
    );

    try {
      await rm( filePath );
    // eslint-disable-next-line no-unused-vars
    } catch ( err ) {
      return false;
    }

    this.cacheStale = true;

    return true;

  }

}

export default Archive;
