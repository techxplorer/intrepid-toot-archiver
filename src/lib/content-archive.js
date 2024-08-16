/**
 * @file The defintition of the ContentArchive class.
 */
import { lstatSync } from "node:fs";
import { readdir, writeFile } from "node:fs/promises";
import path from "node:path";

import ContentCreator from "./content-creator.js";

/**
 * Manage an archive of contents.
 */
class ContentArchive {

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
   * Manage the archive of contents.
   * @param {string} archivePath The path to the content archive directory.
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
   * Add any missing contents to the archive.
   * @param {Array} newStatuses A list of potential new statuses objects.
   * @returns {number} The amount of content added to the archive.
   * @throws {TypeError} When the parameters are incorrect.
   */
  async addContent( newStatuses ) {

    if ( !Array.isArray( newStatuses ) ) {
      throw new TypeError( "New statuses must be an array" );
    }

    const contentCreator = new ContentCreator();

    await this.loadContent();

    let addedcontents = 0;

    for ( const status of newStatuses ) {
      const fileName = status.id + ".md";

      if (
        this.writeFileOptions.flag === "wx" &&
        this.contents.indexOf( fileName ) > -1 ) {
        continue;
      }

      const filePath = path.join(
        this.archivePath,
        fileName
      );

      const newContent = [];
      newContent.push( "---" );
      newContent.push( contentCreator.createFrontMatter( status ) );
      newContent.push( "---" );
      newContent.push( contentCreator.convertContent( status.content ) );
      newContent.push( "" );

      await writeFile(
        filePath,
        newContent.join( "\n" ),
        this.writeFileOptions
      );

      addedcontents++;

    }

    this.cacheStale = true;

    return addedcontents;

  }

  /**
   * Get the number of content items in the archive.
   * @returns {number} The number of content items in the archive.
   */
  async getContentCount() {

    if ( this.cacheStale ) {
      await this.loadContent();
    }

    return this.contents.length;
  }

  /**
   * Get a list of contents in the archive.
   * @returns {number} The number of contents in the archive.
   */
  async loadContent() {

    if ( this.cacheStale === false ) {
      return this.contents;
    }

    this.contents = Array();

    this.contents = await readdir(
      this.archivePath
    );

    this.contents = this.contents.filter( content => path.extname( content ) === ".md" );

    this.cacheStale = false;

    return this.contents.length;
  }
}

export default ContentArchive;
