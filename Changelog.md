
# CyberFilesRewrite Changelog
I'll try my best to keep track of all changes to CyberFilesRewrite, big and small, right here in this changelog. I do most of my web development late at night, so the dates here tend to extend into the following day.

## September 15th, 2021
* Fixed a problem where the file info popup would reset the URL, removing the file preview portion
* Added styling to make sure font sizes stay consistent across browsers
    * TIL font boosting is a thing, where some browsers (like mobile Chrome, for example) will make font sizes larger without caring about the CSS behind it - something that's been bugging me forever
    * Now that things are consistent, I can make font sizes vary depending on input device (like making it larger on touch devices)
* Made dropdown menus scrollable on small screen heights
* Made dropdown menus hide when the window is resized
    * In addition, their positioning is reset every time they're shown, just to be sure they're displayed right every time
    * Things get kinda janky otherwise
* Sorted `en.yml` alphabetically
* Enabled the **Refresh files** menu option
* Added the **Recents** menu, where you can access the last 50 files and folders you've visited
    * This differs from normal history in that duplicate entries are omitted, so you only see the most recent occurance of each entry

## September 14th, 2021
* Removed the `Content-Type: application/json` header from API responses due to it leading to an empty response sometimes
    * This calls for further investigation, but for now, plain text seems to work fine.
* Added dropdown menus, one on the main topbar, and one in file previews
    * Some options are unavailable for now, and the menu's responsiveness needs some work
    * So far, this unlocks the ability to download files, view their file information, and copy file and directory links
    * This is how we'll access history, either in a submenu or a new page

## September 13th, 2021
* Revamped the titlebar of file previews
    * Now it's solid, like the main one, and preview contents appear below it, without overlapping
* Directory headers are now hidden while filtering, if applicable
* Fixed the broken `href` attribute of file entries who's names contain a percent sign
* Expanded video previews to always take up the entire preview window
    * This allows for the controls to expand beyond the video's aspect ratio
* Made sure the current URL always ends with a slash, unless a file preview is open

## September 12th, 2021
* Increased the padding of the Download button in file previews on touch devices
    * And other small styling changes
* Started saving files to history
* Added next and previous file buttons to file previews
* Added the file type and size to preview (?f=) link descriptions
    * This works by retrieving the data from cache, so we aren't spending time getting data we already have
    * If the file isn't cached, the link preview will use generic text set in the language file
* Added directory headers
* Added file sorting, but there's no way to change it from online
* Added default sort control files
    * See the `sortFileName`, `sortFileDate`, `sortFileSize`, and `sortFileDesc` config options

## September 11th, 2021
* Added styling to handle touch devices (using the `hover` and `pointer` media queries), so more padding is applied to interactive elements
* Switched to self-serving just the Bootstrap grid system instead of the whole Bootstrap library
* Added popups for a whole bunch of server and client fetch errors
    * At this point, you should never be left staring at an infinite loading spinner when something goes wrong
* Cleaned up the API
* Added the `hideContentsFile` config option
* Added a menu button to the main topbar for use later
* Added a full file preview window when clicking on a file
    * Online previews are available for MP4 video files, a few audio file formats, and a handful of image formats
    * Files that can't be previewed display a prompt to download the file instead
* Added the `videoAutoplay` and `audioAutoplay` config options

## September 10th, 2021
* Chnaged the max file history entry count to be length based
    * That is to say, on load, we'll remove the oldest entry from history until the overall size of history is less than a million characters.
    * For some context, LocalStorage allows up to 5 MB (~5.2 million ASCII characters) per origin (domain). After a very basic test, I've concluded that 1000 entries comes out to about 80k characters, which is only 1.5% of our available space.
* Added some comments at the top of the default theme
* Added the `mobileFileListBorders` config option
* Implemented a function for building and displaying popups on-demand
    * For now, this is being used for displaying file information when a file is clicked, as a proof of concept
* Added popups for the following conditions
    * When a file preview URL is invalid
    * When the file list fails to load

## September 9th, 2021
* Fixed some logic in date formatting (specifically with 12-hour time)
* Overhauled the colour theme
* Moved themes to separate files in `/_cyberfiles/private/themes`, and the default is set by the `theme` config option
* Added a drop shadow to the topbar that only shows up while scrolled
    * It's extremely subtle on darker backgrounds
* Added a short fade-in animation to file lists, just to add some polish
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