
# CyberFilesRewrite Changelog
I'll try my best to keep track of all changes to CyberFilesRewrite, big and small, right here in this changelog.

## September 6th, 2021
* Started development of the client Javascript used for loading and displaying the file list
    * File modification dates and sizes are formatted correctly in the file list
    * Directories can be clicked on to move into them, but there's no way to move up directories yet

## September 5th, 2021
* Created the API for fetching file lists
    * If SQLite3 and its accompanying PHP extension are installed, file details will be saved to a cache database (/_cyberfiles/private/cache.db), vastly decreasing load times (sometimes 80x faster!) after the initial load. If a file's modification date changes, it's details will be updated in the database.
    * The API's endpoint is at any directory where CyberFiles isn't overridden by another index file. Doing it this way means that directories can still be fully secured by Apache's authentication module and remain inaccessible from the API.
* Added some API documentation to the main readme

## August 30th, 2021
* Continued refining the readme
* Started adding elements to the index
    * Topbar
    * Title
    * Filter bar
    * Column headers
    * File list hint

## August 29th, 2021
* Created initial directory structure
* Created repository
* Created base files for the index itself, configuration, language, and more
* Set up HTML meta to use settings from the config