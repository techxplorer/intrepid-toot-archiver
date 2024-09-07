/**
 * @file The defintition of the PhotoArchive class.
 */

import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";
import ContentCreator from "./content-creator.js";

/**
 * Manage an archive of photo content.
 */
class ContentArchive extends Archive {

  /**
   * Instance of the ContentCreator class to create content from the status.
   * @type {ContentCreator}
   */
  contentCreator = null;

  /**
   * Manage the Content Archive.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false ) {
    super( archivePath, overwriteFlag );
    this.fileExtension = false;
    this.contentCreator = new ContentCreator();
  }

  /**
   * Add any missing contents to the archive.
   * @param {Array} newStatuses A list of potential new status file names.
   * @param {string} statusArchivePath The path to the status archive.
   * @param {string} mediaArchivePath The path to the media archive.
   * @returns {number} The amount of content added to the archive.
   * @throws {TypeError} When the parameters are incorrect.
   */
  async addContent( newStatuses, statusArchivePath, mediaArchivePath ) {

    if ( !Array.isArray( newStatuses ) ) {
      throw new TypeError( "New statuses must be an array" );
    }

    if ( typeof statusArchivePath !== "string" ) {
      throw new TypeError( "The statusArchivePath parameter must be a string" );
    }

    if ( typeof mediaArchivePath !== "string" ) {
      throw new TypeError( "The mediaArchivePath parameter must be a string" );
    }

    await this.loadContents();

    let addedcontents = 0;

    const defaultCategories = [
      "Photos"
    ];

    for ( const statusFile of newStatuses ) {
      const dirName = path.basename( statusFile, ".json" );

      if ( this.writeFileOptions.flag === "wx" && this.contents.indexOf( dirName ) > -1 ) {
        continue;
      }

      const dirPath = path.join(
        this.archivePath,
        dirName
      );

      const indexPath = path.join(
        dirPath,
        "index.md"
      );

      const statusContent = await readFile(
        path.join(
          statusArchivePath,
          statusFile
        )
      );

      const status = JSON.parse(
        statusContent.toString()
      );

      const newContent = [];
      newContent.push( "---" );
      newContent.push( this.contentCreator.createFrontMatter( status, defaultCategories ) );
      newContent.push( "---" );
      newContent.push( this.contentCreator.convertContent( status.content ) );
      newContent.push( this.contentCreator.makeLinkBack( status.url ) );
      newContent.push( "" );

      await mkdir( dirPath );

      await writeFile(
        indexPath,
        newContent.join( "\n" ),
        this.writeFileOptions
      );

      for ( const mediaAttachment of status.media_attachments ) {
        const mediaFile = path.basename( mediaAttachment.url );
        await copyFile(
          path.join(
            mediaArchivePath,
            mediaFile
          ),
          path.join(
            dirPath,
            mediaFile
          )
        );
      }

      addedcontents++;

    }

    this.cacheStale = true;

    return addedcontents;
  }

}

export default ContentArchive;
