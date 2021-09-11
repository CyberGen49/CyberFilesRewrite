<?php

global $conf, $lang;

?>
<script>

// Hide the Javascript warning popup
if (document.getElementById("popupNoJs"))
    document.getElementById("popupNoJs").style.display = "none";

// Language variables dumped from the server
var lang = JSON.parse(`<?= json_encode($lang) ?>`);

// Initialize file history
var fileHistoryTargetVersion = 1;
var fileHistory = locStoreArrayGet("history");
if (fileHistory === null || fileHistory.version != fileHistoryTargetVersion) {
    fileHistory = {
        'version': fileHistoryTargetVersion,
        'entries': []
    };
    locStoreArraySet("history", fileHistory);
    console.log("File history has been wiped because the version changed");
}
var i = 0;
while (JSON.stringify(fileHistory).length > 1000000) {
    fileHistory.entries.shift();
    i++;
}
if (i > 0) console.log(`Removed ${i} of the oldest file history entries`);

// Copies the specified text to the clipboard
function copyText(value) {
    var tempInput = document.createElement("input");
    tempInput.value = value;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    console.log("Copied text to clipboard: "+value);
}

// Get a query string parameter
function $_GET(name, url = window.location.href) {
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    try {
        return decodeURIComponent(results[2].replace(/\+/g, '%20'));
    } catch {
        console.log(`Failed to decode "${results[2]}"`);
        return null;
    }
}

// Shorthand function for document.getElementById()
function _(id) {
    return document.getElementById(id);
}

// Get element coordinates and dimensions
function _getX(id) {
    return document.getElementById(id).getBoundingClientRect.x;
}
function _getY(id) {
    return document.getElementById(id).getBoundingClientRect.y;
}
function _getX2(id) {
    return document.getElementById(id).getBoundingClientRect.right;
}
function _getY2(id) {
    return document.getElementById(id).getBoundingClientRect.bottom;
}
function _getW(id) {
    return document.getElementById(id).getBoundingClientRect.width;
}
function _getH(id) {
    return document.getElementById(id).getBoundingClientRect.height;
}

// Function to start a direct file download
function downloadFile(url) {
    var id = `fileDownload-${Date.now}`;
    _("body").insertAdjacentHTML('beforeend', `
        <a id="${id}" href="${url}" download></a>
    `);
    console.log(`Starting direct download of "${url}"`);
    _(id).click();
    _(id).remove();
}

// Adds leading characters to a string to match a specified length
function addLeadingZeroes(string, newLength = 2, char = "0") {
    return string.toString().padStart(newLength, "0");
}

// Pushes a state to history
function historyPushState(title, url) {
    window.history.pushState("", title, url);
}

// Rounds a number to a certain number of decimal places
function roundSmart(number, decimalPlaces = 0) {
    const factorOfTen = Math.pow(10, decimalPlaces)
    return Math.round(number * factorOfTen) / factorOfTen
}

// Saves an array to localstorage
function locStoreArraySet(key, array) {
    localStorage.setItem(key, JSON.stringify(array));
}

// Retrieves an array from localstorage
function locStoreArrayGet(key, array) {
    return JSON.parse(localStorage.getItem(key));
}

// Changes the meta theme color
function meta_themeColor(hexCode = "#fff") {
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  hexCode);
}

// Parses Markdown and returns HTML
function mdToHtml(mdSource) {
    // ...
}

// Returns a properly formatted version of the current directory
function currentDir(upLevels = 0) {
    var path = window.location.pathname;
    var tmp = path.split("/");
    var dirSplit = [];
    tmp.forEach(f => {
        if (f != '') dirSplit.push(f);
    });
    path = "";
    for (i = 0; i < dirSplit.length-upLevels; i++) {
        if (dirSplit[i] != '') {
            path += `/${dirSplit[i]}`;
        }
    }
    path = path.replace("//", "/");
    if (path == "") return "/";
    else return path;
}

// Makes sure a timestamp is in millisecond form and returns it
function convertTimestamp(timestamp) {
    if (timestamp > 3000000000) return timestamp;
    else return (timestamp*1000);
}

// Returns the formatted version of a file size
function formattedSize(bytes) {
    if (bytes < 1000) return `${bytes} ${window.lang.sizeUnitBytes}`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 0)} ${window.lang.sizeUnitKB}`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 1)} ${window.lang.sizeUnitMB}`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 2)} ${window.lang.sizeUnitGB}`;
    bytes /= 1024;
    if (bytes < (1000)) return `${roundSmart(bytes, 2)} ${window.lang.sizeUnitTB}`;
    return "-";
}

// Returns a formatted interpritation of a date
// Format should use custom variables mapped to those provided by the Date class
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
function dateFormat(timestamp, format) {
    date = new Date(convertTimestamp(timestamp));
    var twelveH = date.getHours();
    if (twelveH > 12) {
        var twelveH = twelveH-12;
    }
    if (twelveH == 0) twelveH = 12;
    format = format
        .replace("%a", window.lang[`dtWeekday${date.getDay()+1}Short`])
        .replace("%A", window.lang[`dtWeekday${date.getDay()+1}`])
        .replace("%b", window.lang[`dtMonth${date.getMonth()+1}Short`])
        .replace("%B", window.lang[`dtMonth${date.getMonth()+1}`])
        .replace("%d", date.getDate())
        .replace("%+d", addLeadingZeroes(date.getDate(), 2))
        .replace("%H", date.getHours())
        .replace("%+H", addLeadingZeroes(date.getHours(), 2))
        .replace("%I", twelveH)
        .replace("%+I", addLeadingZeroes(twelveH, 2))
        .replace("%m", date.getMonth()+1)
        .replace("%+m", addLeadingZeroes(date.getMonth()+1, 2))
        .replace("%M", date.getMinutes())
        .replace("%+M", addLeadingZeroes(date.getMinutes(), 2))
        .replace("%p", function() {
            if (date.getHours() >= 12) return window.lang.dtPM;
            else return window.lang.dtAM;
        })
        .replace("%S", date.getSeconds())
        .replace("%+S", addLeadingZeroes(date.getSeconds(), 2))
        .replace("%Y", date.getFullYear())
        .replace("%y", function() {
            var tmp = date.getFullYear().toString();
            return tmp.substr(tmp.length-2);
        })
        .replace("%%", "%")
    return format;
}

// Returns a formatted interpritation of a date
function dateFormatPreset(timestamp, format = "short") {
    try {
        if (format == "short") {
            return dateFormat(timestamp, "<?= $conf['dateFormatShort'] ?>");
        }
        if (format == "full") {
            return dateFormat(timestamp, "<?= $conf['dateFormatFull'] ?>");
        }
    } catch (error) {
        return;
    }
}

// Returns the relative interpritation of a date
function dateFormatRelative(timestamp) {
    time = Date.now()-convertTimestamp(timestamp);
    var future = "";
    if (time < 0) {
        future = "future";
        time = abs(time);
    }
    time /= 1000;
    if (time < 120) return window.lang[`dtRelNow`];
    time /= 60;
    if (time < 180)
        return window.lang[`dtRel${future}Min`].replace("%0", Math.round(time));
    time /= 60;
    if (time < 72)
        return window.lang[`dtRel${future}Hour`].replace("%0", Math.round(time));
    time /= 24;
    if (time < 30)
        return window.lang[`dtRel${future}Day`].replace("%0", Math.round(time));
    return dateFormatPreset(timestamp);
}

// Loads a file list with the API
async function loadFileList(dir = "", entryData = null) {
    // Set variables
    document.title = "<?= $conf['siteName'] ?>";
    if (dir == "") dir = currentDir();
    var dirSplit = dir.split("/");
    var dirName = decodeURI(dirSplit[dirSplit.length-1]);
    // If the directory has changed since the last load
    if (dir != window.loadDir) {
        // Prepare for loading
        var loadStart = Date.now();
        var seamlessTimeout = setTimeout(() => {
            _("fileListLoading").style.display = "";
        }, 500);
        _("fileList").style.display = "none";
        _("fileListHint").style.display = "none";
        _("fileList").style.opacity = 0;
        _("fileListHint").style.opacity = 0;
        _("fileListFilter").disabled = true;
        _("fileListFilter").value = "";
        _("fileListFilter").placeholder = window.lang.fileListFilterDisabled;
        // Make the API call
        let response = await fetch(`${dir}?api&type=list`);
        await response.json().then(data => {
            if (data.status == "GOOD") {
                console.log("Fetched file list:");
                console.log(data);
                // Update history
                fileHistory.entries.push({
                    'created': Date.now(),
                    'dir': dir,
                    'name': dirName,
                    'type': 'directory'
                });
                locStoreArraySet("history", fileHistory);
                // If we aren't in the document root
                var output = "";
                if (dir != "/") {
                    // Set the appropriate parent directory name
                    if (dirSplit.length > 2)
                        var dirParentName = decodeURI(dirSplit[dirSplit.length-2]);
                    else
                        var dirParentName = window.lang.fileListRootName;
                    // Set the up entry text
                    var upTitle = window.lang.fileListEntryUp.replace("%0", dirParentName);
                    // Build the HTML
                    if ('<?= $conf['upButtonInFileList'] ?>' !== '') {
                        output += `
                            <a id="fileEntryUp" class="row no-gutters fileEntry" tabindex=0 onClick='fileEntryClicked(this, event)'">
                                <div class="col-auto fileEntryIcon material-icons">arrow_back</div>
                                <div class="col fileEntryName">
                                    <div class="fileEntryNameInner">${upTitle}</div>
                                </div>
                                <div class="col-auto fileEntryDate fileListDesktop">-</div>
                                <div class="col-auto fileEntrySize fileListDesktop">-</div>
                            </a>
                        `;
                    }
                    // Handle the up button in the topbar
                    _("topbarButtonUp").classList.remove("disabled");
                    _("topbarButtonUp").title = upTitle;
                } else {
                    _("topbarButtonUp").classList.add("disabled");
                    _("topbarButtonUp").title = window.lang.topbarButtonUpLimitTooltip;
                }
                // Loop through the returned file objects
                window.fileObjects = [];
                var totalSize = 0;
                var i = 0;
                data.files.forEach(f => {
                    // Get formatted dates
                    f.modifiedF = dateFormatRelative(f.modified);
                    f.modifiedFF = dateFormatPreset(f.modified, "full");
                    // If the file is a directory
                    if (f.mimeType == "directory") {
                        // Set texts
                        f.sizeF = "-";
                        f.typeF = window.lang.fileTypeDirectory;
                        f.icon = "folder";
                        // Set tooltip
                        f.title = `${f.name}\n${window.lang.fileDetailsDate}: ${f.modifiedFF}\n${window.lang.fileDetailsType}: ${f.typeF}`;
                        // Set mobile details
                        f.detailsMobile = f.modifiedF;
                    } else {
                        // Get formatted size and add to total
                        f.sizeF = formattedSize(f.size);
                        totalSize += f.size;
                        // Set file type from type list
                        f.typeF = window.lang.fileTypeDefault;
                        if (f.name.match(/^.*\..*$/)) {
                            var fileNameSplit = f.name.split(".");
                            var fileExt = fileNameSplit[fileNameSplit.length-1].toUpperCase();
                            if (typeof window.lang.fileTypes[fileExt] !== 'undefined')
                                f.typeF = window.lang.fileTypes[fileExt];
                        }
                        // Set icon based on MIME type
                        f.icon = "insert_drive_file";
                        if (f.mimeType.match(/^video\/.*$/gi))
                            f.icon = "movie";
                        if (f.mimeType.match(/^text\/.*$/gi))
                            f.icon = "text_snippet";
                        if (f.mimeType.match(/^audio\/.*$/gi))
                            f.icon = "headset";
                        if (f.mimeType.match(/^image\/.*$/gi))
                            f.icon = "image";
                        if (f.mimeType.match(/^application\/.*$/gi))
                            f.icon = "widgets";
                        if (f.mimeType.match(/^application\/(zip|x-7z-compressed)$/gi))
                            f.icon = "archive";
                        // Set tooltip
                        f.title = `${f.name}\n${window.lang.fileDetailsDate}: ${f.modifiedFF}\n${window.lang.fileDetailsType}: ${f.typeF}\n${window.lang.fileDetailsSize}: ${f.sizeF}" href="${f.name}`;
                        // Set mobile details
                        f.detailsMobile = window.lang.fileListMobileLine2.replace("%0", f.modifiedF).replace("%1", f.sizeF);
                    }
                    // Build HTML
                    output += `
                        <a class="row no-gutters fileEntry" tabindex=0 data-filename='${f.name}' data-objectindex=${i} onClick='fileEntryClicked(this, event)' title="${f.title}" href="${encodeURI(f.name)}">
                            <div class="col-auto fileEntryIcon material-icons">${f.icon}</div>
                            <div class="col fileEntryName">
                                <div class="fileEntryNameInner">${f.name}</div>
                                <div class="fileEntryMobileDetails fileListMobile">${f.detailsMobile}</div>
                            </div>
                            <div class="col-auto fileEntryDate fileListDesktop">${f.modifiedF}</div>
                            <div class="col-auto fileEntrySize fileListDesktop">${f.sizeF}</div>
                        </a>
                    `;
                    window.fileObjects[i] = f;
                    i++;
                });
                window.fileElements = document.getElementsByClassName("fileEntry");
                // Format load time
                var loadElapsed = Date.now()-loadStart;
                var loadTimeF = loadElapsed+window.lang.dtUnitShortMs;
                if (loadElapsed >= 1000)
                    var loadTimeF = roundSmart(loadElapsed/1000, 2)+window.lang.dtUnitShortSecs;
                // If there aren't any files
                if (data.files.length == 0) {
                    _("fileListHint").innerHTML = window.lang.fileListEmpty;
                } else {
                    // Handle the filter bar while we're at it
                    _("fileListFilter").disabled = false;
                    _("fileListFilter").placeholder = window.lang.fileListFilter;
                    // Set the right footer
                    if (data.files.length == 1) {
                        _("fileListHint").innerHTML = window.lang.fileListDetails1Single.replace("%0", loadTimeF);
                    } else {
                        _("fileListHint").innerHTML = window.lang.fileListDetails1Multi.replace("%0", data.files.length).replace("%1", loadTimeF);
                    }
                    _("fileListHint").innerHTML += "<br>"+window.lang.fileListDetails2.replace("%0", formattedSize(totalSize));
                }
                window.fileListHint = _("fileListHint").innerHTML;
                // Show elements
                clearTimeout(seamlessTimeout);  
                _("fileList").innerHTML = output;
                _("fileList").style.display = "";
                _("fileListHint").style.display = "";
                setTimeout(() => {
                    _("fileListLoading").style.display = "none";
                    _("fileList").style.opacity = 1;
                    _("fileListHint").style.opacity = 1;
                }, 50);
                // Show a file preview if it was requested
                if ($_GET("f") !== null) {
                    var targetFile = $_GET("f");
                    var targetFileFound = false;
                    // Loop through file objects and search for the right one
                    window.fileObjects.forEach(f => {
                        if (f.name == targetFile && !targetFileFound) {
                            showFilePreview(f);
                            targetFileFound = true;
                        }
                    });
                    // If no file was found, show a popup
                    if (!targetFileFound) {
                        showPopup("fileNotFound", window.lang.popupErrorTitle, `<p>${window.lang.popupFileNotFound}</p>`, [{
                            'id': "close",
                            'text': window.lang.popupOkay,
                            'action': function() { hidePopup("fileNotFound") }
                        }], false);
                    }
                }
                // Finish up
                window.canClickEntries = true;
                window.loadDir = dir;
                if (dirName != "")
                    document.title = dirName+" - <?= $conf['siteName'] ?>";
            } else {
                console.log("Failed to fetch file list: "+data.status);
                showPopup("fetchFailed", window.lang.popupErrorTitle, window.lang.popupFileListFetchFailed.replace("%0", `<b>${data.status}</b>`), [{
                    'id': "close",
                    'text': window.lang.popupOkay,
                    'action': function() { hidePopup("fileNotFound") }
                }], false);
            }
        });
    } else showFilePreview(entryData);
}

// Displays a file preview
function showFilePreview(data = null) {
    window.canClickEntries = true;
    if ($_GET("f") !== null && data !== null) {
        console.log(`Loading file preview for "${data.name}"`);
        showPopup("fileInfo", window.lang.popupFileInfoTitle, `
            <p>
                <b>${window.lang.fileDetailsName}</b><br>
                ${data.name}
            </p><p>
                <b>${window.lang.fileDetailsDate}</b><br>
                ${data.modifiedFF}
            </p><p>
                <b>${window.lang.fileDetailsType}</b><br>
                ${data.typeF}
            </p><p>
                <b>${window.lang.fileDetailsSize}</b><br>
                ${data.sizeF}
            </p>
        `, [{
            'id': "dl",
            'text': "Download",
            'action': function() { downloadFile(encodeURIComponent(data.name)) }
        }, {
            'id': "close",
            'text': window.lang.popupClose,
            'action': function() {
                historyPushState('', currentDir());
                hidePopup("fileInfo");
            }
        }]);
    }
}

// Function to do stuff when a file entry is clicked
var canClickEntries = true;
function fileEntryClicked(el, event) {
    event.preventDefault();
    document.activeElement.blur();
    // Make sure elements can be clicked
    if (!window.canClickEntries) {
        console.log("Can't click entries right now!");
        return;
    }
    // See if this is the up button
    if (el.id == "fileEntryUp" || (el.id == "topbarButtonUp" && !el.classList.contains("disabled"))) {
        console.log("Up entry clicked: "+currentDir(1));
        historyPushState("<?= $conf['siteName'] ?>", currentDir(1));
        loadFileList();
        return;
    }
    console.log("File entry clicked:")
    var f = window.fileObjects[el.dataset.objectindex];
    console.log(f);
    // If this is a directory, move into it
    if (f.mimeType == "directory") {
        window.canClickEntries = false;
        historyPushState("<?= $conf['siteName'] ?>", `${currentDir()}/${f.name}`.replace("//", "/"));
        loadFileList();
    } else {
        window.canClickEntries = false;
        historyPushState("<?= $conf['siteName'] ?>", `${currentDir()}/?f=${encodeURIComponent(f.name)}`.replace("//", "/"));
        loadFileList("", f);
    }
}

// Display a popup
function showPopup(id = "", title = "", body = "", actions = [], clickAwayHide = true) {
    if (!_(`popup-${id}`)) {
        _("body").insertAdjacentHTML('beforeend', `
            <div id="popup-${id}" class="popupBackground ease-in-out-100ms" style="display: none; opacity: 0"></div>
        `);
    }
    _(`popup-${id}`).style.display = "none";
    _(`popup-${id}`).style.opacity = 0;
    _(`popup-${id}`).innerHTML = `
        <div class="popupCard" onclick="event.stopPropagation()">
            <div id="popup-${id}-title" class="popupTitle">${title}</div>
            <div id="popup-${id}-body" class="popupContent">${body}</div>
            <div id="popup-${id}-actions" class="popupActions"></div>
        </div>
    `;
    for (i = 0; i < actions.length; i++) {
        var a = actions[i];
        var fullActionId = `popup-${id}-action-${a.id}`;
        _(`popup-${id}-actions`).insertAdjacentHTML('beforeend', `
            <div id="${fullActionId}" class="popupButton">${a.text}</div>
        `);
        _(fullActionId).addEventListener("click", a.action);
    }
    if (clickAwayHide) {
        _(`popup-${id}`).addEventListener("click", function() { hidePopup(id) });
    }
    console.log(`Showing popup "${id}"`);
    _(`popup-${id}`).style.display = "flex";
    setTimeout(() => {
        _(`popup-${id}`).style.opacity = 1;
        _("body").style.overflowY = "hidden";
    }, 50);
}

// Hide an existing popup
function hidePopup(id) {
    console.log(`Hiding popup "${id}"`);
    _(`popup-${id}`).style.opacity = 0;
    _("body").style.overflowY = "";
    setTimeout(() => {
        _(`popup-${id}`).style.display = "none";
    }, 200);
}

// Handle the filter bar
_("fileListFilter").addEventListener("keyup", function(event) {
    var value = this.value.toLowerCase();
    // To reduce system resource usage, we'll wait a set amount of time after the user hasn't typed anything to actually run the filter
    clearTimeout(window.filterInterval);
    window.filterInterval = setTimeout(() => {
        console.log(`Filtering files that match "${value}"`);
        if (value == "") {
            for (i = 0; i < window.fileElements.length; i++) {
                var el = window.fileElements[i];
                el.style.display = "";
            }
            _("fileListHint").innerHTML = window.fileListHint;
        } else {
            var matches = 0;
            for (i = 0; i < window.fileElements.length; i++) {
                var el = window.fileElements[i];
                if (el.dataset.filename.toLowerCase().includes(value)) {
                    el.style.display = "";
                    matches++;
                }
                else
                    el.style.display = "none";
            }
            if (matches == 0) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterNone;
            } else if (matches == 1) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterSingle;
            } else {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterMulti.replace("%0", matches);
            }
        }
    }, (500*Math.floor(window.fileElements.length/500)));
});

// Do this stuff whenever a state is pushed to history
window.addEventListener("popstate", function(event) {
    console.log("Browser navigation buttons were used");
    loadFileList();
});

// Do this stuff when the main window is scrolled
document.addEventListener("scroll", function(event) {
    el = document.documentElement;
    if (el.scrollTop > 0)
        _("topbar").classList.add("shadow");
    else
        _("topbar").classList.remove("shadow");
});

// Topbar title click event
_("topbarTitle").addEventListener("click", function() {
    historyPushState('', `/`);
    loadFileList();
});

// On load
window.onload = function() {
    document.getElementById("body").classList.remove("no-transitions");
    console.log("Page loaded at "+dateFormat(Date.now(), "%+H:%+M on %Y-%+m-%+d"))
    // Do this stuff initially
    loadFileList();
};

</script>