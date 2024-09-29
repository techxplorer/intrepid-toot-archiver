/**
 * @file The defintition of the PhotoArchive class.
 */

import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import path from "node:path";

import Archive from "./archive.js";
import ContentCreator from "./content-creator.js";
import TagReplacer from "./tag-replacer.js";

/**
 * Manage an archive of photo content.
 * @augments Archive
 */
class PhotoArchive extends Archive {

  /**
   * Instance of the ContentCreator class to create content from the status.
   * @type {ContentCreator}
   */
  contentCreator = null;

  /**
   * Manage the Content Archive.
   * @param {string} archivePath The path to the content archive directory.
   * @param {boolean} overwriteFlag Flag indicating if files should be overwritten.
   * @param {string} statusFilter An optional tag used to filter the list of statuses.
   * @param {TagReplacer} tagReplacer An optional instance of the tag replacer class.
   * @throws {TypeError} When the parameters are incorrect.
   */
  constructor( archivePath, overwriteFlag = false, statusFilter = false, tagReplacer = null ) {
    super( archivePath, overwriteFlag, statusFilter );
    this.fileExtension = false;
    this.contentCreator = new ContentCreator( tagReplacer );

    // To keep things simple, always prohibit prevent file overwriting
    this.writeFileOptions.flag = "wx";
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

      if ( this.statusFilter !== false ) {
        if ( this.statusHasTag( status, this.statusFilter ) === false ) {
          continue;
        }
      }

      if ( !this.statusHasMedia( status ) ) {
        continue;
      }

      const newContent = [];
      newContent.push( "---" );
      newContent.push( this.contentCreator.makeFrontMatter( status, defaultCategories ) );
      newContent.push( "---" );
      newContent.push( this.contentCreator.makeMarkdownContent( status ) );
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

export default PhotoArchive;
