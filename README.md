# Intrepid Toot Archiver #

[![GitHub License](https://img.shields.io/github/license/techxplorer/intrepid-toot-archiver?style=flat-square)](https://github.com/techxplorer/intrepid-toot-archiver/blob/master/LICENSE)
![GitHub Actions Workflow Status](https://img.shields.io/github/actions/workflow/status/techxplorer/intrepid-toot-archiver/node.js.yml?branch=master&style=flat-square)
![GitHub package.json version (branch)](https://img.shields.io/github/package-json/v/techxplorer/intrepid-toot-archiver/master)

The Intrepid Toot Archiver is a small CLI app that I use to create and manage an
archive of my public toots (toots / posts) from a [Mastodon][mastodon] server on the
[fediverse][fedi]. Specifically my accounts at [theblower.au][theblower].

Archived statuses are the source of content for the content archive. The content
archive contains Markdown files that can be used for content by static site
generates such [Hugo][hugo], which is my preferred framework.

## Commands ##

The app has the following commands:

| Command        | Description |
| -------------- | ----------- |
| lookup-user    | Lookup the details of a user on the Mastodon server |
| update-archive | Download new statuses from the server |
| update-content | Update the content archive |
| update-photos  | Update the content archive with photo posts |
| delete-status  | Delete a status and related media from the archive |
| help           | Display brief help for a command |

## Options ##

The app has the following options:

| Short option | Long option | Description |
| ------------ | ----------- | ----------- |
| -d           | --debug     | Output environment variable content |
| -f           | --force     | Overwrite files in the status or content archive |
| -t           | --tag <tag> | Only add new statuses with the matching tag |

## Configuration ##

Configuration uses environment variables. They can be supplied by a .env file
or via a shell script. The environment variables are:

| Variable   | Description |
| ---------- | ----------- |
| ITA_HOST   | The name of the Mastodon host |
| ITA_USERID | The unique ID of the user |
| ITA_USERNAME | The username of the account on the host |
| ITA_ARCHIVE_PATH | The full path to the status archive |
| ITA_MEDIA_ARCHIVE_PATH | The full path to the media archive |
| ITA_CONTENT_ARCHIVE_PATH | The full path to the content archive |
| ITA_TAG_MAP_YAML_PATH | The full path to a YAML file containing a tag mapping (optional) |

## Archives ##

### Status archive ##

The status archive is a directory of JSON files. Each file represents one status.
The `update-archive` command downloads the most recent statuses and adds any new
ones to the archive. The `--force` option will overwrite any existing status files.

### Media archive ###

A directory of the media files (images) that are part of the statuses in the
status archive. Populating the media archive occurs during the update of the
status archive.

### Content archive ###

The content archive is a directory of Markdown files. Each file represents one status.
The `update-content` command will create one Markdown file for each archived status
not in the content archive. The `--force` option will overwrite any existing
Markdown files.

### Posts and photo posts ###

Using the `update-content` command creates one Markdown file for every status.
In contrast, the `update-photos` command creates a directory for each status that
contains an index.md file and the attached media.

## Road map ##

The following items are on my road map:

1. Add any other functionality as required

## Rationale ##

I developed this app for a couple of reasons, including:

- Easily archive my toots in a place that I controlled
- Convert the toots into content for a Hugo powered website
- Scratch the itch that comes with being a software developer
- Keep using my software development skills
- Continue to learn

## Contact ##

There is no guarantee that the app will work for anyone other than me. I'm
putting up here on GitHub as a way of showing what is possible.

If you'd like to get in contact, you can do so via [my website][txp].

[fedi]: https://en.wikipedia.org/wiki/Fediverse
[hugo]: https://gohugo.io
[mastodon]: https://en.wikipedia.org/wiki/Mastodon_(social_network)
[theblower]: https://theblower.au/
[txp]: https://techxplorer.com
