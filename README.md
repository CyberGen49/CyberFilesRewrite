# CyberFilesRewrite
A capable and customizable file index for the web, based in PHP.

This project is a rewrite of my previous file index site, with some major improvements in the backend structure. This should give me a chance to make things easier to maintain, and easier to add on to in the future.

The previous version of CyberFiles required that the page be completely reloaded to change what was displayed, since all of the HTML markup was put together by PHP on the server and sent back to the client. This time around, I plan on loading all of the dynamic data via Javascript on the client side, with the mentality that "the page should never need to be completely reloaded." This also means the implementation of an API that's able to serve all of the data the client could need. The result should be shorter load times while navigating through the index, and a bit less strain on the server.

*Things are still under very heavy development, so things could be vastly changing over short spans of time. Keep an eye on [Changelog.md](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/Changelog.md) to see updates.*

## Installation
We recommend using a Debian Linux-based system running Apache for hosting CyberFiles. If you're using a different operating system or webserver, you may need to do a bit more work to get everything working.

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
    ErrorDocument 401 /_cyberfiles/public/index.php?error=401
    ErrorDocument 403 /_cyberfiles/public/index.php?error=403
    ErrorDocument 404 /_cyberfiles/public/index.php?error=404
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

#### `theme`
Type: `array`  
A set of theme variables used everywhere on the site.

#### `dateFormatShort`
Type: `string`  
A date format containing some of [these placeholders](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/README-dateTimePlaceholders.md). This should be a short, friendly date format, used in the modification date column of the file list.

#### `dateFormatFull`
Type: `string`  
A date format containing some of [these placeholders](https://github.com/CyberGen49/CyberFilesRewrite/blob/main/README-dateTimePlaceholders.md). This should be a complete and informative date format, used in file details.

* `bg` - Primary background
* `bg2` - Secondary background
* `fileSep` - The colour of the separator between file entries
* `fileH` - The colour of file entries when hovered over
* `fileC` - The colour of file entries when the mouse button is down
* `scrollbar`: The colour of the scrollbar handle
* `scrollbarH`: The colour of the scrollbar handle when hovered over
* `scrollbarC`: The colour of the scrollbar handle when the mouse button is down
* `fg` - Primary foreground
* `fg2` - Secondary foreground
* `fg2H` - Secondary foreground when hovered over
* `accent` - Primary accent

## Using the API
CyberFiles comes with an API that can be used to access anything that could otherwise be accessed by the client.

To use the API, open the target folder in CyberFiles, then append add `?api` to the end of the URL. This will target the API and work in that directory.

For example, `https://files.example.com/Images?api`, where `files.example.com` is your domain.

### Actions
#### `?api&type=list`
Structure:
* `files`: An array of [FileList Objects](#filelist-object)
* `status`: A [status code](#status-codes)
* `processingTime` The amount of time the server took to process the request, in milliseconds (float)

### Types
#### Status Codes
Status codes can include any of the following:
* `GOOD`: No errors were encountered
* `DIRECTORY_NONEXISTENT`: The current directory doesn't exist on the server
* `UNFINISHED`: The requested action (`type=`) is unfinished and can't be used
* `INVALID_ACTION`: The requested action (`type=`) is invalid

#### FileList Object
Structure:
* `name`: The file name
* `modified`: The file's modification date, as a Unix timestamp
* `size`: The file's size, in bytes
* `mimeType`: The file's [MIME Type](https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types)
* `indexed`: `true` if the file's details were loaded from cache, `false` if they needed to be updated