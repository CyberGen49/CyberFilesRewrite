
# CyberFilesRewrite Changelog
I'll try my best to keep track of all changes to CyberFilesRewrite, big and small, right here in this changelog. I do most of my web development late at night, so the dates here tend to extend into the following day.

This project adheres to [semantic versioning](https://semver.org/) and is (kind of) based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## 1.16.0 - 2021-10-26
* Added custom context menus when right-clicking on file entries
    * These menus present the same set of options seen in file preview menus
    * Folder context menus only show sharing options
* Watered down the preview menu when in a popped out file preview
* Popped out previews are now initially centered on the display (+40px from the bottom)

## 1.15.0 - 2021-10-25
* Added the ability to open a file preview in a popup window from the preview menu
* Now filter matching is handled by [farzher/fuzzysort](https://github.com/farzher/fuzzysort), and matched portions of the results are highlighted
* Made it so the cache database is deleted and regenerated when the cache version changes (only when the format of the database is changed)
* Made the thumbnail generation commands configurable
* Added a bunch more file details
    * Duration, resolution, and frames per second for videos
    * Duration and sample rate for audio files
    * Resolution and bit depth for images
    * Naturally, FFMPEG and ImageMagick are required to get these
* Fixed a bug where the seconds of formatted timestamps of over an hour were broken

## 1.14.2 - 2021-10-21
* Added [semantic elements](https://www.w3schools.com/html/html5_semantic_elements.asp) in place of some `<div>` elements.
* Removed hover and focus styling when the user can't hover
* Now relative file modification dates will dynamically update every minute

## 1.14.1 - 2021-10-20
* Now allowing for transparency in thumbnails
* Fixed a error that occurs when trying to get the extension of a file without one, now defaulting to an empty string

## 1.14.0 - 2021-10-19
* Added a grid view with multiple sizes
* Added a menu for selecting views
* Made it so folders automatically switch to grid view when over 50% of the files have thumbnails
    * This only happens when the user doesn't already have a view set for that folder

## 1.13.1 - 2021-10-17
* Fixed directories with their contents hidden
* Removed the `CONTENTS_HIDDEN` API status code
    * This way, there's no way the client can tell if a directory is empty or has hidden contents
* Further refined the appearance of the global scrollbars and code block scrollbars

## 1.13.0 - 2021-10-16
* Added image and video thumbnails to file list entries
    * This puts to use the thumbnail generation added in 1.11.4

## 1.12.0 - 2021-10-15
* File sorting now happens on the client side
* Directory headers are now sent from server to client encoded as base64
* Added a little bit of padding around the scrollbar thumb
* A custom sort entry is deleted from local storage when it matches the folder's default sort (the sort values returned by the API)
* Separated file list loading on the client into a series of subfunctions
* Added load chunking
    * This involves the server and client ping-ponging every few seconds until the client has gotten the whole file list
    * This should prevent long requests timing out, and allows us to show loading progress to the user
    * This will typically only come into play when loading large directories that haven't been cached, or that have files which need thumbnails generated
* Breadcrumbs now update immediately after clicking a directory, not after it's loaded

## 1.11.4 - 2021-10-14
* Fixed the folder name displayed in the Folder Info popup when in the root directory
* Fixed logging errors to their own file
* Added the creation of thumbnails from images and videos (stored in `_cyberfiles/public/thumbs`) and corresponding config options
* The client now sends the load start time along with the request to the server, and the response is only processed on the client if the returned start time matches the one we sent
    * This makes it so, if the user navigates away from a directory before it finishes loading, the response won't be processed if/once it's received

## 1.11.3 - 2021-10-08
* Added a folder info popup
* Slightly changed the shadow of popups
* Updated the format of paths shown in the tooltips of recent file entries
* Fixed a bug where scrolling dropdowns (those that are taller than the window height) wouldn't become scrollable sometimes

## 1.11.2 - 2021-10-07
* Replaced the video progress `minPercent` and `maxPercent` config options with `minTime` and `maxTime`, which specify a fixed amount of time before and after which progress shouldn't be saved

## 1.11.1 - 2021-10-06
* Updated documentation
* Made PHP errors log to a separate log file `yyyy-mm-dd.errors.log`
* Moved some files around

## 1.11.0 - 2021-10-05
* Added the current CyberFiles version to error popups
* Added the theme selection menu
* Improved the setting and updating of element tooltips
* Added `aria-label` attributes to elements with tooltips to help screen readers
    * These are updated dynamically to match the content of the tooltip
* Added headers to dropdown menus
* Added tooltips to entries in the recent files menu
* Added the language selection menu
    * Of course, English is the only option for now

## 1.10.4 - 2021-10-04
* Now, when the `siteName` config option is set to an empty string (as it is by default), PHP `$_SERVER['SERVER_NAME']` will be used as the site name instead.
* Added a shadow to directory headers
* Added some more theme constants
* Added the `ChromeDark` and `ChromeLight` themes
* Fixed using the default theme when the one set in the config doesn't exist
* Fixed a small Javascript bug

## 1.10.3 - 2021-10-01
* Made two new themes: Light and Blackout (AMOLED dark)

## 1.10.2 - 2021-09-30
* Added a standard popup for all Javascript errors
    * This should always leave the user informed when something goes wrong, and it should make reporting errors a more straightforward process for normal users.
* Fixed some more bugs caused by 1.10.1

## 1.10.1 - 2021-09-29
* Switched to using `let` and `const` instead of `var` in the Javascript
    * This could introduce unforeseen bugs that we'll catch later

## 1.10.0 - 2021-09-28
* Improved cross-browser consistency of scrollbars
* Now tooltips are only shown when the user's input device is capable of hovering
    * Implemented a Javascript function that tells us if the user can hover or not
        * This is done by checking the width of an element that's changed with the CSS hover media query
* Tooltips will now automatically hide after 20 seconds
* Fixed a line height issue with tooltips on Firefox
* Revamped the way theme constants are used in CSS
    * They work just like custom properties now: `var(--variableName)`
* Set up Javascript to fetch config, language, and theme from the server instead of using PHP to insert it directly into the document
* Switched to using a regular .js file and referencing it from the main PHP script
    * Before, the PHP file containing the Javascript was dumped onto the main page inside a `<script>` element
* Switched to using a regular .css file for CSS styling
    * `cyberfiles.css` is still parsed by a PHP script to apply theme constants, so the client actually makes a request for `cyberfiles.css.php`
    * Before, like the JS, the PHP file containing the CSS was just dumped onto the page in a `<style>` element

## 1.9.0 - 2021-09-27
* Now the clear filter button is hidden when changing directories
* Made `<code>` elements wrap breaking words
* Added a popup when accessing an invalid short link
* Added breadcrumbs to the topbar that allow the user to move up to any level of the path
* Revamped the hover styling of the topbar title to match that of breadcrumbs
    * Instead of just changing the text colour, we fade in a rounded rectangle behind the text using the same background colour as topbar buttons (`bgTopbarButtonH`)
* Changed some theme variable names
* Added custom hover tooltips
    * These are built to mimic the behaviour of the browser's default tooltips as closely as possible.

## 1.8.0 - 2021-09-26
* Refined styling of elements used in parsed Markdown
* Added a splash screen when loading CyberFiles that covers the main page until loading is complete
    * "Loading" doesn't include loading the file list, just the main page
* Cleaned up the API
* Added file and directory short links
    * These are created once per file path and stored in `/_cyberfiles/private/shortLinks.db`. That is to say, if the file is recached, its short link won't change.
    * These links can be copied from the main and preview menus 

## 1.7.0 - 2021-09-25
* Added a button to clear the filter bar
    * It only appears next to the filter bar while filtering
* Added text file previews
    * Markdown files are parsed and displayed, and HTML files are displayed raw. All other text files are displayed in the browser's monospace font.
    * Only files less than the size defined by the `textPreviewMaxSize` config option will be previewed
* Now self-hosting normalize.css
* Switched to using [Marked](https://github.com/markedjs/marked) for parsing Markdown (self-hosting)
    * This unlocks the whole Markdown spec without the need to dump hours into making a custom parser!

## 1.6.2 - 2021-09-24
* Improved the fluidity of using the browser back and forward buttons
    * Before, it would take a few clicks to actually move between 'pages'
    * Fixed by sprinkling in some JS history `replaceState` instead of always using `pushState` - in other words, now, when doing things like showing/hiding/navigating between file previews, the URL will change, but won't be pushed to the browser history (and nav buttons)
* Fixed several bugs in the Markdown parser
* Fixed file details in link previews

## 1.6.1 - 2021-09-23
* Fixed video progress so it doesn't prompt if the saved progress is after the max percent defined in the config
* Slightly changed the padding on directory headers
* Added a fade animation when hovering over column headers
* Added a menu option for previewing a randomly selected file in the current directory

## 1.6.0 - 2021-09-22
* Reduced the width of the Modified column from 160px to 140px
* Reduced the max width of the file list from 1200px to 1100px
* Added the Type column in the file list
    * This is only visible on screen widths larger than 950px
* Added access and error logging
    * Logs are stored in `/_cyberfiles/private/logs`, and are separated into files for each day
* Added sorting by file type (and accompanying config options)
    * This option actually sorts by file extension, as opposed to the custom language-defined type

## 1.5.0 - 2021-09-21
* Fixed the Home icon in recents
* Added the `videoProgressSave.prompt` config option
* Added the `defaultSort` config options
* Added file list sorting
    * You can change the sort order from the Sort menu or by clicking a column header
        * Clicking the header of the current sort column will reverse the direction of the sort
    * The chosen sort order is stored per-directory, and remains until changed
* Increased the max width of the file list from 1000px to 1200px
    * This is in preparation for a file type column that'll only appear at larger widths

## 1.4.0 - 2021-09-20
* Added more padding to the bottom of h1-h6 elements to go along with yesterday's line height changes
* Added PDF file previews
* Added video progress saving, respecting all of the `videoProgressSave` config options
    * On unfinished videos, users will be asked if they want to resume the video at the timestamp they stopped at
* Revamped versioning yet again, now we're using proper [semantic versioning](https://semver.org/)
    * I went back and assigned versions to all prior changelog entries, but things are a bit wonky towards the beginning

## 1.3.4 - 2021-09-19
* Reduced line height and increased top padding of h1-h6 elements (used in directory headers)
* Added the `videoProgressSave.expire` config option

## 1.3.3 - 2021-09-18
* Now, when accessing a recent directory while previewing a file, the file preview will close, instead of staying open
* Now, the current directory is hidden from Recents while a file preview is open
    * Meaning that, when previewing, both the current file and current directory are hidden in Recents
* Added config options for video progress saving
    * The actual functionality isn't here yet

## 1.3.2 - 2021-09-17
* Fixed video preview centering after I broke it yesterday
* Added file type-specific icons to the recents menu
* Added a checkmark next to the current sort order in the sort menu
    * The options are still disabled

## 1.3.1 - 2021-09-16
* Made font sizes consistent across all popups
    * Some don't use `<p>` elements
* Reorganized the buttons in the Recents menu
* Added toast notifications for events like copying text and starting file downloads
    * These are unobtrusive little popups that show up at the bottom of the screen to provide feedback on actions
    * They stay on screen for 3 seconds, and you can still click things under them
* Added version to the about popup - hopefully I can remember to update it

## 1.3.0 - 2021-09-15
* Fixed a problem where the file info popup would reset the URL, removing the file preview portion
* Added styling to make sure font sizes stay consistent across browsers
    * TIL font boosting is a thing, where some browsers (like mobile Chrome, for example) will make font sizes larger without caring about the CSS behind it - something that's been bugging me forever
    * Now that things are consistent, I can make font sizes vary depending on input device (like making it larger on touch devices)
* Made dropdown menus scrollable on small screen heights
* Made dropdown menus hide when the window is resized
    * In addition, their positioning is reset every time they're shown, just to be sure they're displayed right every time
    * Things get kinda janky otherwise
* Enabled the **Refresh files** menu option
* Added the **Recents** menu, where you can access the last 50 files and folders you've visited
    * This differs from normal history in that duplicate entries are omitted, so you only see the most recent occurrence of each entry

## 1.2.0 - 2021-09-15
* Removed the `Content-Type: application/json` header from API responses due to it leading to an empty response sometimes
    * This calls for further investigation, but for now, plain text seems to work fine.
* Added dropdown menus, one on the main topbar, and one in file previews
    * Some options are unavailable for now, and the menu's responsiveness needs some work
    * So far, this unlocks the ability to download files, view their file information, and copy file and directory links
    * This is how we'll access history, either in a submenu or a new page

## 1.1.1 - 2021-09-13
* Revamped the titlebar of file previews
    * Now it's solid, like the main one, and preview contents appear below it, without overlapping
* Directory headers are now hidden while filtering, if applicable
* Fixed the broken `href` attribute of file entries who's names contain a percent sign
* Expanded video previews to always take up the entire preview window
    * This allows for the controls to expand beyond the video's aspect ratio
* Made sure the current URL always ends with a slash, unless a file preview is open

## 1.1.0 - 2021-09-12
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

## 1.0.0 - 2021-09-11
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

## 0.6.0 - 2021-09-10
* Changed the max file history entry count to be length based
    * That is to say, on load, we'll remove the oldest entry from history until the overall size of history is less than a million characters.
    * For some context, LocalStorage allows up to 5 MB (~5.2 million ASCII characters) per origin (domain). After a very basic test, I've concluded that 1000 entries comes out to about 80k characters, which is only 1.5% of our available space.
* Added some comments at the top of the default theme
* Added the `mobileFileListBorders` config option
* Implemented a function for building and displaying popups on-demand
    * For now, this is being used for displaying file information when a file is clicked, as a proof of concept
* Added popups for the following conditions
    * When a file preview URL is invalid
    * When the file list fails to load

## 0.5.0 - 2021-09-09
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

## 0.4.0 - 2021-09-08
* Continued refining theme constants to be more specific
* Made it so the loading spinner only displays after we've been waiting on a file list for over 500ms (subject to change)
    * This prevents the quick spinner flash between fast loads
* Started work on the handling of non-directory file entries (actual files!)
* Added a CSS breakpoint at 600px for mobile devices
    * At screen widths smaller than this amount, the file list will condense into one column, with modification date and size moving to a second line, beneath the file name.

## 0.3.0 - 2021-09-07
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
* Added the ability to reference theme constants from other theme constants
    * This means we can add much deeper theming of specific elements without having to repeat colour codes

## 0.2.0 - 2021-09-06
* Started development of the client Javascript used for loading and displaying the file list
    * File modification dates and sizes are formatted correctly in the file list
    * Directories can be clicked on to move into them, but there's no way to move up directories yet

## 0.1.0 - 2021-09-05
* Created the API for fetching file lists
    * If SQLite3 and its accompanying PHP extension are installed, file details will be saved to a cache database (/_cyberfiles/private/cache.db), vastly decreasing load times (sometimes 80x faster!) after the initial load. If a file's modification date changes, it's details will be updated in the database.
    * The API's endpoint is at any directory where CyberFiles isn't overridden by another index file. Doing it this way means that directories can still be fully secured by Apache's authentication module and remain inaccessible from the API.
* Added some API documentation to the main readme

## 0.0.1 - 2021-08-30
* Continued refining the readme
* Started adding elements to the index
    * Topbar
    * Title
    * Filter bar
    * Column headers
    * File list hint

## 0.0.0 - 2021-08-29
* Created initial directory structure
* Created repository
* Created base files for the index itself, configuration, language, and more
* Set up HTML meta to use settings from the config