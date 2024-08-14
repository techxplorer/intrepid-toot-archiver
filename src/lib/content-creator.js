/**
 * @file The defintition of the ContentCreator class.
 */
import TurndownService from "turndown";

/**
 * Create content from the statuses in the archive.
 */
class ContentCreator {

  /**
   * An instance of the TurndownService to convert HTML to markdown.
   * @type {TurndownService}
   */
  turndownService = null;

  /**
   * Construct a new ContentCreator and initialise dependencies.
   */
  constructor() {

    this.turndownService = new TurndownService();

  }

  /**
   * Convert the HTML version of the content to Markdown.
   * @param {string} htmlContent The html content to convert.
   * @returns {string} The content converted into Markdown.
   * @throws {TypeError} If the htmlContent not a string, or an empty string.
   */
  convertContent( htmlContent ) {

    if ( typeof htmlContent !== "string" ) {
      throw new TypeError( "The htmlContent parameter must be a string." );
    }

    if ( htmlContent.length === 0 ) {
      throw new TypeError( "The htmlContent parameter cannot be a zero length string." );
    }

    // replace any trailing spaces on each line.
    return this.turndownService.turndown( htmlContent ).replace( /[^\S\r\n]+$/gm, "" );

  }

}

export default ContentCreator;
