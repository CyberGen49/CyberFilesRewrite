# CyberFilesRewrite
A capable and customizable file index for the web, based in PHP.

This project is a complete rewrite of my previous file index, which was a lot more primitive than this one. 

*Things are still under very heavy development, so they could be vastly changing over short spans of time. Keep an eye on [Changelog.md](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/Changelog.md) to see updates.*

## Features
* An extremely responsive interface
* View videos, audio files, and images without leaving the page
* Completely customizable colours, no CSS tinkering required
* Completely customizable language files
* File caching (via SQLite), making for blistering fast load speeds
* Hide files with name patterns
* Hide directories from their parent file lists

## Installation
We can only guarantee everything will work as expected if you're using an Apache webserver. Your mileage may vary with other setups. The tutorials below assume that you're on a Debian-based Linux distrobution and that you plan on using Apache.

### Prepare an environment for CyberFiles
Create a new folder where you'll store the files you want to serve with CyberFiles. For example:
```sh
mkdir /path/to/cyberfiles
```
Remember this path, we'll use it again in a bit.

### Install CyberFiles
* Click the **Clome** button
* Choose **Download ZIP**
* Create a new folder named **_cyberfiles** in the root of your website (the folder you just created)
* Extract the downloaded .zip file into the new folder

**Note:** Cloning from the `main` branch will provide you with the most reliable experience, but switching to the `dev` branch will get you the most up-to-date version of CyberFiles, while sacrificing stability.

Be sure to check back here from time to time to get updates.

### Set up Apache
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
    ErrorDocument 400 /_cyberfiles/public/index.php?error=400
    ErrorDocument 401 /_cyberfiles/public/index.php?error=401
    ErrorDocument 403 /_cyberfiles/public/index.php?error=403
    ErrorDocument 404 /_cyberfiles/public/index.php?error=404
    ErrorDocument 500 /_cyberfiles/public/index.php?error=500
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
Don't forget to change `files.example.com` to your domain, and `/path/to/cyberfiles` to the path of the folder you created earlier. **Make sure your path doesn't have a trailing slash.**

Note that these settings are just the bare bones required to get things working. If you plan on using extra features like SSL (for HTTPS), you can find guides online.

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
If a file with this name exists in a directory, it will be read and parsed as Markdown, then displayed above the directory's file list online. Only a limited subset of the Markdown spec is supported. See [the Markdown guide](#) for details.

#### `headerFileNameHtml`
Type: `string`  
Like `headerFileNameMarkdown`, but instead of parsing the contents as Markdown, they'll be dumped right on to the page. Ideally, the contents of this file should be in HTML.

#### `hideContentsFile`
Type: `string`  
If this file exists in a directory, the directory's contents will be hidden from view online.

#### `dateFormatShort`
Type: `string`  
A date format containing some of [these placeholders](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/README-dateTimePlaceholders.md). This should be a short, friendly date format, used in the modification date column of the file list.

#### `dateFormatFull`
Type: `string`  
A date format containing some of [these placeholders](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/README-dateTimePlaceholders.md). This should be a complete and informative date format, used in file details.

#### `upButtonInFileList`
Type: `boolean`  
Whether or not the "Up to parent directory" entry should be shown at the top of file lists.

#### `mobileFileListBorders`
Type: `boolean`  
Whether or or not separators should be shown between file entries on mobile (small width) displays.

#### `videoAutoplay`
Type: `boolean`  
Whether or not video file previews should autoplay when opened.

#### `audioAutoplay`
Type: `boolean`  
Whether or not audio file previews should autoplay when opened.

#### `theme`
Type: `array`  
The name (without extension) of a theme file located in `/_cyberfiles/private/themes`. File free to edit the existing themes or create your own to customize the experience.

**Remember:** Hashtags/pound symbols are comment characters in YAML, so if you're using hex codes, be sure to enclose them in quotation marks.

**Tip:** Check out the [Material Design Tools for Picking Colours](https://material.io/design/color/the-color-system.html#tools-for-picking-colors) to make cool combinations that look nice.

## Using the API
CyberFiles comes with an API that can be used to access the file list of any publically-accessible directory that isn't overridden by another index file.

To use the API, open the target folder in CyberFiles, then add `?api` to the end of the URL. This will call the API in that directory.

For example, to get the index of the `/Images` folder, use `https://files.example.com/Images?api`, where `files.example.com` is your domain.

### Return structure
* `files`: An array of [file objects](#file-object)
* `status`: A [status code](#status-codes)
* `processingTime` The amount of time the server took to process the request, in milliseconds (float)

#### Status Codes
Status codes can include any of the following:
* `GOOD`: No errors were encountered
* `CONTENTS_HIDDEN`: No errors were encountered, but the directory contents have been hidden from view
* `DIRECTORY_NONEXISTENT`: The current directory doesn't exist on the server

#### File Object
Structure:
* `name`: The file name
* `modified`: The file's modification date, as a Unix timestamp
* `size`: The file's size, in bytes
* `mimeType`: The file's [MIME Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
* `indexed`: `true` if the file's details were loaded from cache, `false` if they needed to be updated