
# CyberFilesRewrite Changelog
I'll try my best to keep track of all changes to CyberFilesRewrite, big and small, right here in this changelog. As things are just getting started, I'll be lumping a lot of my changes together for the sake of simplicity

## September 9th, 2021
* Fixed some logic in date formatting (specifically with 12-hour time)
* Overhauled the colour theme
* Moved themes to separate files in `/_cyberfiles/private/themes`, and the default is set by the `theme` config option
* Added a drop shadow to the topbar that only shows up while scrolled
    * It's extremely subtle on darker backgrounds
* Made it so file lists have a short fade in animation, just to add some polish
* Updated file caching to store only the data that takes time to get
    * Now storing file path, modification timestamp, file size, and mime type
* Added an Up button to the topbar
    * Functions exactly like the one in the file list
* Added the `upButtonInFileList` config option
* Now we clear the contents of the filter bar and disable it when switching directories
* Added full functionality to the filter bar
* Added a popup that displays when Javascript is disabled
* Added history tracking with LocalStorage
    * A history entry will be added every time a directory is loaded, and there can be up to 1000 entries
    * Once file previews are in place, those will be logged as well
    * Later, we'll implement an interface for browsing your file history

## September 8th, 2021
* Continued refining theme variables to be more specific
* Made it so the loading spinner only displays after we've been waiting on a file list for over 500ms (subject to change)
    * This prevents the quick spinner flash between fast loads
* Started work on the handling of non-directory file entries (actual files!)
* Added a CSS breakpoint at 600px for mobile devices
    * At screen widths smaller than this amount, the file list will condence into one column, with modification date and size moving to a second line, beneath the file name.

## September 7th, 2021
* Added file icons (via Google Material Icons)
* Added title attributes to file entries, so they can be hovered over to view their absolute modification date, file type, and size
* Changed file entries to use a elements, so their links can be copied by right clicking
    * The default opening of the link is cancelled when clicking, since that's handled by the JS
* Added the dynamic updating of the page title to match the current folder
* Made the browser navigation buttons (back and forward) properly load their target file lists
* Added an "Up to parent directory" entry to all lists (except for the root), allowing for full navigation of the index
* Added the `hideDirWhenContains` config option
* Added future proofing to JS `dateFormatRelative()`
* Now using custom file types defined in the language file, displayed in file details (the tooltip when hovering over an entry)
* Added the ability to reference theme variables from other theme variables
    * This means we can add much deeper theming of specific elements without having to repeat colour codes

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