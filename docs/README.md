# CyberFilesRewrite
A capable and customizable file index for the web, built to make viewing and sharing server files easy.

This project is a complete ground-up rewrite of my previous file index, with improvements in nearly every aspect.

Keep an eye on [the changelog](docs/Changelog.md) to see what's changing!    

## Features
* A responsive, mobile-friendly interface
* View videos, audio, images, and documents without leaving the page
* Quickly sort file lists by clicking column headers (or using the Sort menu)
* Get back to where you left off quickly with recents
* Resume videos where you left off with video progress saving
* Add custom text headers to directories in either Markdown or HTML
* Completely customizable colour themes, no CSS tinkering required
* Completely customizable language
* File list caching (via SQLite), making for blistering fast load speeds
* Keep track of activity and errors with log files
* Hide files matching name patterns
* Hide directories from their parent file lists

## Getting updates
To ensure that your configuration, custom themes, and custom languages aren't overwritten when updating CyberFiles, follow the instructions detailed in `config.yml`, `lang/en.yml`, and `themes/Default.yml` on how to make your own files.

For those looking to update their CyberFiles installation:
* Back up any stock files that you've modified (or see the statement above)
* Download the current archive from the link below
* Extract the newly downloaded .zip file to your existing `_cyberfiles` folder
* Open any files you backed up and their corresponding new files in your text editor and **manually transfer** your custom settings
    * Things could have changed, so directly replacing the new files with your old ones could lead to unforeseen consequences
* Open CyberFiles and navigate to **Menu > About CyberFiles...**, then confirm that the version listed there matches the latest in [the changelog](docs/Changelog.md)

## Installation
We can only guarantee everything will work as expected if you're using an Apache webserver. Your mileage may vary with other setups. The tutorials below assume that you're on a Debian-based Linux distribution and that you plan on using Apache.

### Prepare an environment for CyberFiles
Create a new folder where you'll store the files you want to serve with CyberFiles. For example:
```sh
mkdir /path/to/cyberfiles
```
Remember this path, we'll use it again in a bit.

### Install CyberFiles
* [Download the current archive](https://github.com/CyberGen49/CyberFilesRewrite/archive/refs/heads/main.zip)
* Create a new folder named `_cyberfiles` in the root of your website (the folder we made earlier)
* Extract the downloaded .zip file into `_cyberfiles`

### Set up the webserver
Install Apache, PHP, and the PHP YAML extension if you haven't already:
```sh
sudo apt update
sudo apt install apache2 php php-yaml -y
```
Create a new Apache configuration file:
```sh
sudo nano /etc/apache2/sites-available/cyberfiles.conf
```
In the text editor, paste this example configuration:
```apache
<VirtualHost *:80>
    ServerName files.example.com
    Define dRoot /path/to/cyberfiles
    DocumentRoot ${dRoot}
    DirectoryIndex index.html index.php /_cyberfiles/public/index.php
    # Set error documents
    # Feel free to add more of these to handle more error codes
    ErrorDocument 400 /_cyberfiles/public/index.php
    ErrorDocument 401 /_cyberfiles/public/index.php
    ErrorDocument 403 /_cyberfiles/public/index.php
    ErrorDocument 404 /_cyberfiles/public/index.php
    ErrorDocument 500 /_cyberfiles/public/index.php
    # Always allow access to the root directory
    <Directory "${dRoot}">
        Require all granted
    </Directory>
    # Always deny access to the private subdirectory
    <Directory "${dRoot}/_cyberfiles/private">
        order deny,allow
        deny from all
    </Directory>
</VirtualHost>
```
Don't forget to change `files.example.com` to your domain, and `/path/to/cyberfiles` to the path of the folder you created earlier. **Make sure your path doesn't have a trailing slash!**

Note that these settings are just the bare bones required to get things working. If you plan on using extra features like SSL (for HTTPS), there are plenty of online guides to help.

After pasting the config, press `Ctrl + O`, then `Enter`.

Enable the site in Apache, then reload
```
sudo a2ensite cyberfiles.conf
sudo service apache2 restart
```

## Configuration
To change settings for CyberFiles, open the configuration file located at `/_cyberfiles/private/config.yml`. Below is a description of each setting.

**Note:** Be sure to run the config file through a YAML checker [like this one](https://yamlchecker.com/) to be sure you didn't make any mistakes while editing.

#### `language`
Type: `string`  
The language file to reference for all text shown on the site. This should be set to the name of a file that exists in `/_cyberfiles/private/lang`, without the extension.

For example, `language: en` will use the `en.yml` language file.

The site will always include `en` first, then override it with the language set in the config. This leaves English as a fallback in case the selected language isn't complete.

#### `siteName`
Type: `string`  
The name of the file index. This is displayed in the tab title and link previews, as well as in the index navigation bar.

If left as an empty string (`''` or `""`), the hostname/domain will be used (files.example.com, for example).

#### `siteDesc`
Type: `string`  
The description of the file index. This is displayed in link previews.

#### `hiddenFiles`
Type: `array`  
A list of wildcard filters to check against file names. Matches are hidden from the file list.

#### `hideDirWhenContains`
Type: `array`  
A list of filenames to check for in each directory. If a directory contains a match, it'll be hidden in its parent directory list.

#### `headerFileNameMarkdown`
Type: `string`  
If a file with this name exists in a directory, it will be read and parsed as Markdown, then displayed above the directory's file list online. Check out [The Markdown Guide](https://www.markdownguide.org/basic-syntax/) to learn more.

#### `headerFileNameHtml`
Type: `string`  
Like `headerFileNameMarkdown`, but instead of parsing the contents as Markdown, they'll be dumped right on to the page. Ideally, this file should contain HTML.

#### `hideContentsFile`
Type: `string`  
If this file exists in a directory, the directory's contents will be hidden from view online.

#### `sortFileName`
Type: `string`  
If this file exists in a directory, its files will be sorted by name by default.

#### `sortFileDate`
Type: `string`  
If this file exists in a directory, its files will be sorted by date modified by default.

#### `sortFileType`
Type: `string`  
If this file exists in a directory, its files will be sorted by type by default.

#### `sortFileSize`
Type: `string`  
If this file exists in a directory, its files will be sorted by size by default.

#### `sortFileDesc`
Type: `string`  
If this file exists in a directory, its file order will be reversed. Folders will remain on top.

#### `defaultSort`
Defines the global default sort type and direction. This can be overridden by the sort files above, the user's chosen sort order takes priority over everything.
* `type`: `name`, `date`, `ext` (for type), or `size`
* `desc`: Set to `true` to reverse the order of the file list, keeping folders on top

#### `dateFormatShort`
Type: `string`  
A date format containing some of [these placeholders](docs/dateTimePlaceholders.md). This should be a short, friendly date format, used in the modification date column of the file list.

#### `dateFormatFull`
Type: `string`  
A date format containing some of [these placeholders](docs/dateTimePlaceholders.md). This should be a complete and informative date format, used in file details.

#### `upButtonInFileList`
Type: `boolean`  
Whether or not the "Up to parent directory" entry should be shown at the top of file lists.

#### `mobileFileListBorders`
Type: `boolean`  
Whether or or not separators should be shown between file entries on mobile (small width) displays.

#### `gridView`
Options for the grid (card) view
* `showModified`: `true` if modification dates should be shown in file cards
* `showSize`: `true` if file sizes should be shown in file cards (never shown on folders)
* `lines`: The number of lines that should be shown of long file names before clipping them with ellipses

#### `videoAutoplay`
Type: `boolean`  
Whether or not video file previews should autoplay when opened.

#### `audioAutoplay`
Type: `boolean`  
Whether or not audio file previews should autoplay when opened.

#### `videoProgressSave`
Options for video progress saving. When enabled, users will be given the option to pick up where they left off previewing a video file. This data, like history, is stored on the user's computer only.
* `enable`: If `true`, video progress saving is enabled
* `minDuration`: A video needs to be at least this many seconds long to have its progress saved
* `minTime`: The number of seconds into a video that progress saving should start
* `maxTime`: The number of seconds before the end of a video that progress saving should stop
* `expire`: The number of hours after which a video's saved progress can't be resumed anymore
* `prompt`: If `true`, the user will be given the option to resume or not. If `false`, the video will be resumed automatically, and the user will see a toast notification about it.

#### `generateThumbs`
Type: `boolean`  
Whether or not image and video thumbnails should be generated.

`ImageMagick` needs to be installed to get image thumbnails. For video thumbnails, you'll need both `ImageMagick` and `FFMPEG` installed. Make sure these programs are in the path by confirming the `mogrify` and `ffmpeg` commands can be run in your terminal.

When this is enabled, the initial loading of directories will be significantly slower, especially for videos.

Thumbnails are stored in `/_cyberfiles/public/thumbs`. This folder can be deleted to clear the thumbnails.

#### `thumbnailWidth`
Type: `integer`  
The width, in pixels, of image and video thumbnails, while maintaining aspect ratio. Higher values will make thumbnails look clearer on high resolution displays, but they'll take longer to load and take up more space on the server.

You'll need to delete the `thumbs` folder (path above) to update the size of existing thumbnails.

#### `textPreviewMaxSize`
Type: `integer`  
The largest a text file can be to still have a file preview, in bytes.

#### `shortLinkSlugLength`
Type: `integer`  
The length of random strings generated for short links. These are hex strings, meaning the number of possible unique short links is 16 to the power of this length. The default 8 characters make for nearly 4.3 billion possible links.

#### `chunkInterval`
Type: `integer`  
The number of seconds to process each file list chunk. After processing for longer than this time, the server will respond to the client so the client can request the next chunk. Larger values will decrease the number of times the client needs to make requests, but it means the user will see less frequent updates to the loading percentage.

#### `logTimezone`
Type: `string`  
A valid [PHP timezone](https://www.php.net/manual/en/timezones.php) to use for timestamps in log files.

#### `logUserIpHeader`
Type: `string`  
The server variable name containing the user's IP address, used in log files. If you're using a proxy server, there's probably another variable you should use to avoid accidentally logging the proxy server's IP.

For example, Cloudflare's user IP variable is `HTTP_CF_CONNECTING_IP`

#### `theme`
Type: `string`  
The name (without extension) of a theme file located in `/_cyberfiles/private/themes`. File free to edit the existing themes or create your own! All themes override the default, so not all of the constants need to be set in every file.

It may be smart to not touch `Default.yml` and instead make a new theme to change what you want, then change `theme` to the name of your new file.

**Remember:** Hashtags/pound symbols are comment characters in YAML, so if you're using hex codes, be sure to enclose them in quotation marks.

**Tip:** Check out the [Material Design Tools for Picking Colours](https://material.io/design/color/the-color-system.html#tools-for-picking-colors) to make cool combinations that look nice.

## Using the API
CyberFiles comes with an API that can be used to access the file list of any publicly-accessible directory that isn't overridden by another index file.

To use the API, open the target folder in CyberFiles, then add `?api` to the end of the URL. This will call the API in that directory.

For example, to get the index of the `/Images` folder, use `https://files.example.com/Images?api`, where `files.example.com` is your domain.

The API will always respond with a JSON string that can then be parsed into an array for further processing. See below for actions that define what the API responds with.

**Don't rely on the structure of this API staying consistent. It could change at any time. When updating CyberFiles, be sure to check the changelog to see if there were any API changes.**

### Actions - `get=...`

#### `config`
##### Response
* `config`: A limited subset of config options from `/_cyberfiles/private/config.yml`
* `lang`: An array of language constants from `/_cyberfiles/private/lang/<language>.yml` - see the `language` config option
* `theme`: An array of (parsed) theme constants from `/_cyberfiles/private/themes/<theme>.yml` - see the `theme` config option

#### `files`
##### Parameters
* `sort`: The column to sort files by, should be `name`, `date`, `ext`, or `size`, defaults to `name`
* `desc`: If set to `true`, the sort order will be reversed
* `offset`: The offset at which to continue scanning files - see `chunking.offset` below

##### Response
* `files`: Contains 0 or more file objects
    * `File Object`:
        * `name`: The file name
        * `modified`: The file's modification date, as a Unix timestamp
        * `size`: The file's size, in bytes
        * `ext`: The file's extension, or an empty string if the file has no extension
        * `thumbnail`: The file's thumbnail file name, if applicable - see [`generateThumbs`](#generatethumbs)
        * `mimeType`: The file's [MIME Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
        * `indexed`: `true` if the file's details were loaded from cache, `false` if they needed to be updated
* `sort`: Contains information about how the file list is sorted
    * `type`: `name`, `date`, or `size`
    * `desc`: `true` if the list is descending, `false` otherwise
* `headerMarkdown`: If a header Markdown file exists in the directory, this will contain its contents encoded as Base64 - see [`headerFileNameMarkdown`](#headerfilenamemarkdown)
* `headerHtml`: If a header HTML file exists in the directory, this will contain its contents encoded as Base64 - see [`headerFileNameHtml`](#headerfilenamehtml)
* `chunking`: Contains information about chunked responses
    * `complete`: If `true`, then the end of the file list has been reached
    * `totalFiles`: The total number of files in the directory, including hidden ones
    * `offset`: The file scanning offset at which the API stopped at. If `complete` is `false`, another request should be made with the inclusion of the `offset` parameter (listed above) to continue getting directory contents.

All API responses include these values:
* `status`: A **status code** - can be any of the following:
    * `GOOD`: The request was successful
    * `DIRECTORY_NONEXISTENT`: The current directory doesn't exist on the server
    * `UNFINISHED`: The requested action isn't finished
    * `INVALID`: The request was invalid
* `processingTime` The amount of time the server took to process the request, in milliseconds (float)