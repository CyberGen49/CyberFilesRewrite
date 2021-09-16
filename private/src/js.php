<?php

global $conf, $lang, $theme;

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
    return document.getElementById(id).getBoundingClientRect().x;
}
function _getY(id) {
    return document.getElementById(id).getBoundingClientRect().y;
}
function _getX2(id) {
    return document.getElementById(id).getBoundingClientRect().right;
}
function _getY2(id) {
    return document.getElementById(id).getBoundingClientRect().bottom;
}
function _getW(id) {
    return document.getElementById(id).getBoundingClientRect().width;
}
function _getH(id) {
    return document.getElementById(id).getBoundingClientRect().height;
}

// Function to start a direct file download
function downloadFile(url, elThis) {
    var id = `fileDownload-${Date.now}`;
    _("body").insertAdjacentHTML('beforeend', `
        <a id="${id}" download></a>
    `);
    _(id).href = url;
    console.log(`Starting direct download of "${url}"`);
    _(id).click();
    _(id).remove();
    if (elThis) elThis.blur();
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
function locStoreArrayGet(key) {
    return JSON.parse(localStorage.getItem(key));
}

// Changes the meta theme color
function meta_themeColor(hexCode = null) {
    if (hexCode === null)
        return document.querySelector('meta[name="theme-color"]').getAttribute('content');
    document.querySelector('meta[name="theme-color"]').setAttribute('content',  hexCode);
}

// Parses Markdown and returns HTML
function mdToHtml(mdSource) {
    // Initial replacements
    mdSource = mdSource
    .replace("\r", "")
    .replace(/[^\\]\[(.*?)\]\((.*?) "(.*?)"\)/gi, " <a href=\"$2\" target=\"_blank\" title=\"$3\">$1</a>")
    .replace(/[^\\]\[(.*?)\]\((.*?)\)/, " <a href=\"$2\" target=\"_blank\">$1</a>")
    .replace(/[^\\]<(.*?)>/gi, " <a href=\"$1\" target=\"_blank\">$1</a>")
    .replace("  \n", "<br>")
    .replace(/[^\\]\*\*(.*?)\*\*/gi, " <b>$1</b>")
    .replace(/[^\\]__(.*?)__/gi, " <b>$1</b>")
    .replace(/[^\\]\*(.*?)\*/gi, " <em>$1</em>")
    .replace(/[^\\]_(.*?)_/gi, " <em>$1</em>")
    .replace(/\\\[/gi, " [")
    .replace(/\\\*/gi, " *")
    .replace(/\\\_/gi, " _")
    .replace(/\\\</gi, " <");
    // Handle block-level elements
    var pgs = mdSource.split("\n");
    var html = "";
    pgs.forEach(line => {
        if (line != "") {
            if (line.match(/^# .*/))
                html += line.replace(/^# (.*)/, "<h1>$1</h1>");
            else if (line.match(/^## .*/)) 
                html += line.replace(/^## (.*)/, "<h2>$1</h2>");
            else if (line.match(/^### .*/)) 
                html += line.replace(/^### (.*)/, "<h3>$1</h3>");
            else if (line.match(/^#### .*/)) 
                html += line.replace(/^#### (.*)/, "<h4>$1</h4>");
            else if (line.match(/^##### .*/)) 
                html += line.replace(/^##### (.*)/, "<h5>$1</h5>");
            else if (line.match(/^###### .*/)) 
                html += line.replace(/^###### (.*)/, "<h6>$1</h6>");
            else
                html += `<p>${line}</p>`;
        }
    });
    return html;
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
            if (date.getHours() >= 12) return window.lang.dtPeriodPM;
            else return window.lang.dtPeriodAM;
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
    if (time < 48)
        return window.lang[`dtRel${future}Hour`].replace("%0", Math.round(time));
    time /= 24;
    if (time < 60)
        return window.lang[`dtRel${future}Day`].replace("%0", Math.round(time));
    return dateFormatPreset(timestamp);
}

// Loads a file list with the API
async function loadFileList(dir = "", entryId = null, forceReload = false) {
    // Set variables
    document.title = "<?= $conf['siteName'] ?>";
    if (dir == "") dir = currentDir();
    var dirSplit = dir.split("/");
    var dirName = decodeURI(dirSplit[dirSplit.length-1]);
    // If the directory has changed since the last load
    if (dir != window.loadDir || forceReload) {
        // Prepare for loading
        var loadStart = Date.now();
        var showGenericErrors = true;
        var seamlessTimeout = setTimeout(() => {
            _("fileListLoading").style.display = "";
        }, 300);
        var cancelLoad = function() {
            // Hide spinner and update footer text
            clearTimeout(seamlessTimeout);
            _("fileListLoading").style.display = "none";
            _("fileListHint").innerHTML = window.lang.fileListError;
            _("fileListHint").style.display = "";
            _("fileListHint").style.opacity = 1;
        }
        _("fileList").style.display = "none";
        _("fileList").style.opacity = 0;
        _("fileListHint").style.display = "none";
        _("fileListHint").style.opacity = 0;
        _("directoryHeader").style.display = "none";
        _("directoryHeader").style.opacity = 0;
        _("fileListFilter").disabled = true;
        _("fileListFilter").value = "";
        _("fileListFilter").placeholder = window.lang.fileListFilterDisabled;
        // Make the API call and handle errors
        await fetch(`${dir}?api`).then((response) => {
            // If the response was ok
            if (response.ok) return response.json();
            // Otherwise, handle the error
            cancelLoad();
            // If an error code was returned by the server
            if (response.status >= 400 && response.status < 600) {
                showGenericErrors = false;
                // Set the right popup body text
                if (window.lang[`popupServerError${response.status}`]) {
                    var errorBody = window.lang[`popupServerError${response.status}`];
                } else {
                    var errorBody = window.lang.popupServerErrorOther;
                }
                // Show the error popup
                showPopup("serverError", window.lang.popupServerErrorTitle.replace("%0", response.status), errorBody, [{
                    "id": "home",
                    "text": window.lang.popupHome,
                    "action": function() {
                        _("topbarTitle").click();
                    }
                }, {
                    "id": "reload",
                    "text": window.lang.popupReload,
                    "action": function() { window.location.href = "" }
                }], false);
            }
            throw new Error("Fetch failed");
        // Wait for the server to return file list data
        }).then(data => {
            // If the return status is good
            if (data.status == "GOOD" || data.status == "CONTENTS_HIDDEN") {
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
                _("fileList").innerHTML = "";
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
                        _("fileList").insertAdjacentHTML('beforeend', `
                            <a id="fileEntryUp" class="row no-gutters fileEntry" tabindex=0 onClick='fileEntryClicked(this, event)'">
                                <div class="col-auto fileEntryIcon material-icons">arrow_back</div>
                                <div class="col fileEntryName">
                                    <div class="fileEntryNameInner noBoost">${upTitle}</div>
                                </div>
                                <div class="col-auto fileEntryDate fileListDesktop">-</div>
                                <div class="col-auto fileEntrySize fileListDesktop">-</div>
                            </a>
                        `);
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
                            f.ext = fileNameSplit[fileNameSplit.length-1].toUpperCase();
                            if (typeof window.lang.fileTypes[f.ext] !== 'undefined')
                                f.typeF = window.lang.fileTypes[f.ext];
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
                    f.nameUri = encodeURIComponent(f.name);
                    // Build HTML
                    _("fileList").insertAdjacentHTML('beforeend', `
                        <a id="fileEntry-${i}" class="row no-gutters fileEntry" tabindex=0 data-filename='${f.name}' data-objectindex=${i} onClick='fileEntryClicked(this, event)' title="${f.title}">
                            <div class="col-auto fileEntryIcon material-icons">${f.icon}</div>
                            <div class="col fileEntryName">
                                <div class="fileEntryNameInner noBoost">${f.name}</div>
                                <div class="fileEntryMobileDetails fileListMobile noBoost">${f.detailsMobile}</div>
                            </div>
                            <div class="col-auto fileEntryDate fileListDesktop noBoost">${f.modifiedF}</div>
                            <div class="col-auto fileEntrySize fileListDesktop noBoost">${f.sizeF}</div>
                        </a>
                    `);
                    _(`fileEntry-${i}`).href = f.nameUri;
                    window.fileObjects[i] = f;
                    i++;
                });
                window.fileElements = document.getElementsByClassName("fileEntry");
                // Parse and set the directory header, if it exists
                window.dirHeader = false;
                if (typeof data.headerHtml !== 'undefined') {
                    _("directoryHeader").innerHTML = data.headerHtml;
                    window.dirHeader = true;
                } else if (typeof data.headerMarkdown !== 'undefined') {
                    _("directoryHeader").innerHTML = mdToHtml(data.headerMarkdown);
                    window.dirHeader = true;
                }
                // Format load time
                var loadElapsed = Date.now()-loadStart;
                var loadTimeF = loadElapsed+window.lang.dtUnitShortMs;
                if (loadElapsed >= 1000)
                    var loadTimeF = roundSmart(loadElapsed/1000, 2)+window.lang.dtUnitShortSecs;
                // If the folder contents have been hidden
                if (data.status == "CONTENTS_HIDDEN") {
                    _("fileListHint").innerHTML = window.lang.fileListHidden;
                // If there aren't any files
                } else if (data.files.length == 0) {
                    _("fileListHint").innerHTML = window.lang.fileListEmpty;
                // Otherwise, set the footer as planned
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
                _("fileList").style.display = "";
                _("fileListHint").style.display = "";
                if (dirHeader) _("directoryHeader").style.display = "";
                setTimeout(() => {
                    _("fileListLoading").style.display = "none";
                    _("fileList").style.opacity = 1;
                    _("fileListHint").style.opacity = 1;
                    _("directoryHeader").style.opacity = 1;
                }, 50);
                // Show a file preview if it was requested
                if ($_GET("f") !== null) {
                    var targetFile = $_GET("f");
                    var targetFileFound = false;
                    // Loop through file objects and search for the right one
                    var i = 0;
                    window.fileObjects.forEach(f => {
                        if (f.name == targetFile && !targetFileFound) {
                            showFilePreview(i);
                            targetFileFound = true;
                        }
                        i++;
                    });
                    // If no file was found, show a popup
                    if (!targetFileFound) {
                        showPopup("fileNotFound", window.lang.popupErrorTitle, `<p>${window.lang.popupFileNotFound}</p><p>${window.lang.popupFileNotFound2}</p>`, [{
                            'id': "close",
                            'text': window.lang.popupOkay
                        }], false);
                    }
                }
                // Finish up
                window.canClickEntries = true;
                window.loadDir = dir;
            } else {
                console.log("Failed to fetch file list: "+data.status);
                throw new Error("Bad API return");
            }
        }).catch(error => {
            cancelLoad();
            if (!showGenericErrors) return Promise.reject();
            // Show a generic error message
            showPopup("fetchError", window.lang.popupErrorTitle, `<p>${window.lang.popupFetchError}</p><p>${error}</p>`, [{
                "id": "retry",
                "text": window.lang.popupRetry,
                "action": function() {
                    loadFileList(dir, entryId);
                }
            }, {
                "id": "retry",
                "text": window.lang.popupHome,
                "action": function() { window.location.href = "/"; }
            }], false);
            return Promise.reject();
        });
    // If the directory is the same, skip loading the file list and just try showing a file preview
    } else {
        showFilePreview(entryId);
    }
    if (dirName != "") document.title = dirName+" - <?= $conf['siteName'] ?>";
}

// Displays a file preview
function showFilePreview(id = null) {
    window.canClickEntries = true;
    // If a file is requested and the passed object ID is set
    if ($_GET("f") !== null && id !== null) {
        var data = window.fileObjects[id];
        if (data.mimeType == "directory") return;
        window.currentFile = data;
        window.currentFileId = id;
        console.log(`Loading file preview for "${data.name}"`);
        // Update history
        fileHistory.entries.push({
            'created': Date.now(),
            'dir': currentDir(),
            'name': data.name,
            'type': data.mimeType
        });
        locStoreArraySet("history", fileHistory);
        // Get previous and next items
        _("previewPrev").classList.add("disabled");
        _("previewNext").classList.add("disabled");
        _("previewPrev").title = window.lang.previewFirstFile;
        _("previewNext").title = window.lang.previewLastFile;
        idPrev = id;
        while (idPrev > 0) {
            idPrev--;
            var filePrev = window.fileObjects[idPrev];
            if (filePrev.mimeType != "directory") {
                _("previewPrev").classList.remove("disabled");
                _("previewPrev").title = filePrev.name;
                _("previewPrev").dataset.objectid = idPrev;
                break;
            }
        }
        idNext = id;
        while (idNext < window.fileObjects.length) {
            idNext++;
            var fileNext = window.fileObjects[idNext];
            if (!fileNext) break;
            if (fileNext.mimeType != "directory") {
                _("previewNext").classList.remove("disabled");
                _("previewNext").title = fileNext.name;
                _("previewNext").dataset.objectid = idNext;
                break;
            }
        }
        // Update element contents
        _("previewFileName").innerHTML = data.name;
        _("previewFileDesc").innerHTML = `${window.lang.previewTitlebar2.replace("%0", data.typeF).replace("%1", data.sizeF)}`;
        _("previewFile").classList.remove("previewTypeNone");
        _("previewFile").classList.remove("previewTypeVideo");
        _("previewFile").classList.remove("previewTypeImage");
        _("previewFile").classList.remove("previewTypeAudio");
        if (data.ext.match(/^(MP4)$/)) {
            _("previewFile").classList.add("previewTypeVideo");
            _("previewFile").innerHTML = `
                <video <?php if ($conf['videoAutoplay']) print("autoplay") ?> controls src="${encodeURIComponent(data.name)}"></video>
            `;
        } else if (data.ext.match(/^(MP3|OGG|WAV|M4A)$/)) {
            _("previewFile").classList.add("previewTypeAudio");
            _("previewFile").innerHTML = `
                <audio <?php if ($conf['audioAutoplay']) print("autoplay") ?> controls src="${encodeURIComponent(data.name)}"></audio>
            `;
        } else if (data.ext.match(/^(JPG|JPEG|PNG|SVG|GIF)$/)) {
            _("previewFile").classList.add("previewTypeImage");
            _("previewFile").innerHTML = `
                <img src="${encodeURIComponent(data.name)}"></img>
            `;
        } else {
            _("previewFile").classList.add("previewTypeNone");
            _("previewFile").innerHTML = `
                <div id="previewCard">
                    <div id="previewCardIcon">cloud_download</div>
                    <div id="previewCardTitle">${window.lang.previewTitle}</div>
                    <div id="previewCardDesc">${window.lang.previewDesc}</div>
                    <div id="previewCardDownloadCont">
                        <button id="previewCardDownload" class="buttonMain" onclick="downloadFile('${encodeURIComponent(data.name)}', this)">${window.lang.previewDownload.replace("%0", data.sizeF)}</button>
                    </div>
                </div>
            `;
        }
        // Show
        _("previewContainer").style.display = "block";
        _("body").style.overflowY = "hidden";
        setTimeout(() => {
            _("previewContainer").style.opacity = 1;
            meta_themeColor("<?= $theme['browserThemePreview'] ?>");
            document.title = data.name+" - <?= $conf['siteName'] ?>";
        }, 50);
    } else {
        hideFilePreview(false);
    }
}

// Handle moving to the next and previous file previews
function navFilePreview(el) {
    var f = window.fileObjects[el.dataset.objectid];
    console.log(f);
    if (el.classList.contains("disabled")) return;
    if (!f) {
        console.log("New file preview doesn't exist!");
        return;
    }
    console.log("File entry navigation button clicked");
    historyPushState("", `?f=${encodeURI(f.name)}`);
    loadFileList("", el.dataset.objectid);
    el.blur();
    el.blur();
}

_("previewPrev").addEventListener("click", function() { navFilePreview(this); })
_("previewNext").addEventListener("click", function() { navFilePreview(this); })

// Hides the file preview
function hideFilePreview(refresh = true) {
    meta_themeColor("<?= $theme['browserTheme'] ?>");
    _("previewContainer").style.opacity = 0;
    _("body").style.overflowY = "";
    var newPath = currentDir();
    if (newPath != "/") newPath = `${currentDir()}/`;
    historyPushState('', newPath);
    if (refresh) loadFileList();
    setTimeout(() => {
        _("previewFile").innerHTML = "";
        _("previewContainer").style.display = "none";
    }, 200);
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
        var upPath = currentDir(1);
        if (upPath != "/") upPath = `${currentDir(1)}/`;
        historyPushState("<?= $conf['siteName'] ?>", upPath);
        loadFileList();
        return;
    }
    console.log("File entry clicked:")
    var f = window.fileObjects[el.dataset.objectindex];
    console.log(f);
    // If this is a directory, move into it
    if (f.mimeType == "directory") {
        window.canClickEntries = false;
        historyPushState("<?= $conf['siteName'] ?>", `${currentDir()}/${f.name}/`.replace("//", "/"));
        loadFileList();
    } else {
        window.canClickEntries = false;
        historyPushState("<?= $conf['siteName'] ?>", `${currentDir()}/?f=${encodeURIComponent(f.name)}`.replace("//", "/"));
        loadFileList("", el.dataset.objectindex);
    }
}

// Display a popup
function showPopup(id = "", title = "", body = "", actions = [], clickAwayHide = true, actionClickAway = null) {
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
            <button id="${fullActionId}" class="popupButton">${a.text}</button>
        `);
        _(fullActionId).addEventListener("click", function() { hidePopup(id) });
        if (a.action) _(fullActionId).addEventListener("click", a.action);
    }
    if (clickAwayHide) {
        _(`popup-${id}`).addEventListener("click", function() { hidePopup(id) });
        if (actionClickAway) {
            _(`popup-${id}`).addEventListener("click", actionClickAway);
        }
    }
    console.log(`Showing popup "${id}"`);
    _(`popup-${id}`).style.display = "flex";
    clearTimeout(window.timeoutHidePopup);
    window.timeoutShowPopup = setTimeout(() => {
        _(`popup-${id}`).style.opacity = 1;
        //_("body").style.overflowY = "hidden";
    }, 50);
}

// Hide an existing popup
function hidePopup(id) {
    console.log(`Hiding popup "${id}"`);
    _(`popup-${id}`).style.opacity = 0;
    //_("body").style.overflowY = "";
    clearTimeout(window.timeoutShowPopup);
    window.timeoutHidePopup = setTimeout(() => {
        _(`popup-${id}`).style.display = "none";
    }, 200);
}

// Prebuilt popups
function popup_fileInfo(id) {
    var data = window.fileObjects[id];
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
        'id': "close",
        'text': window.lang.popupClose
    }], true);
    /* {
        'id': "dl",
        'text': "Download",
        'action': function() { downloadFile(encodeURIComponent(data.name)) }
    } */
}
function popup_clearHistory() {
    showPopup("clearHistory", window.lang.popupClearHistoryTitle, window.lang.popupClearHistoryDesc, [{
        'id': "yes",
        'text': window.lang.popupYes,
        'action': function() {
            localStorage.removeItem('history');
            window.location.href = "";
        }
    }, {
        'id': "no",
        'text': window.lang.popupNo
    }]);
}
function popup_notImplemented() {
    showPopup("notImplemented", window.lang.popupNotImplementedTitle, window.lang.popupNotImplementedDesc, [{
        'id': "close",
        'text': window.lang.popupClose
    }]);
}
function popup_about() {
    showPopup("about", window.lang.popupAboutTitle, `
        <p>${window.lang.popupAboutDesc}</p>
        <p>${window.lang.popupAboutDesc2}</p>
        <p><a href="https://github.com/CyberGen49/CyberFilesRewrite" target="_blank">${window.lang.popupAboutDescLink}</a></p>
    `, [{
        'id': "close",
        'text': window.lang.popupClose
    }]);
}

// Show a dropdown menu
var timeoutShowDropdown = [];
var timeoutHideDropdown = [];
function showDropdown(id, data, anchorId) {
    if (!_(`dropdown-${id}`)) {
        _("body").insertAdjacentHTML('beforeend', `
            <div id="dropdownArea-${id}" class="dropdownHitArea" style="display: none;"></div>
            <div id="dropdown-${id}" class="dropdown" style="display: none; opacity: 0">
        `);
        _(`dropdownArea-${id}`).addEventListener("click", function() { hideDropdown(id) });
    }
    _(`dropdownArea-${id}`).style.display = "none";
    _(`dropdown-${id}`).classList.remove("ease-in-out-100ms");
    _(`dropdown-${id}`).style.display = "none";
    _(`dropdown-${id}`).style.opacity = 0;
    _(`dropdown-${id}`).style.marginTop = "5px";
    _(`dropdown-${id}`).style.top = "";
    _(`dropdown-${id}`).style.left = "";
    _(`dropdown-${id}`).style.right = "";
    _(`dropdown-${id}`).innerHTML = "";
    data.forEach(item => {
        switch (item.type) {
            case 'item':
                _(`dropdown-${id}`).insertAdjacentHTML('beforeend', `
                    <div id="dropdown-${id}-${item.id}" class="dropdownItem row no-gutters">
                        <div class="col-auto dropdownItemIcon material-icons">${item.icon}</div>
                        <div class="col dropdownItemName">${item.text}</div>
                    </div>
                `);
                if (item.disabled) {
                    _(`dropdown-${id}-${item.id}`).classList.add("disabled");
                    _(`dropdown-${id}-${item.id}`).title = window.lang.dropdownDisabled;
                } else {
                    _(`dropdown-${id}-${item.id}`).addEventListener("click", item.action);
                    _(`dropdown-${id}-${item.id}`).addEventListener("click", function() { hideDropdown(id) });
                }
                break;
            case 'sep':
                _(`dropdown-${id}`).insertAdjacentHTML('beforeend', `
                    <div class="dropdownSep"></div>
                `);
                break;
        }
    });
    console.log(`Showing dropdown "${id}"`);
    _(`dropdownArea-${id}`).style.display = "block";
    _(`dropdown-${id}`).style.display = "block";
    if (anchorId !== null) {
        // Position the dropdown
        var anchorX = _getX2(anchorId);
        var anchorY = _getY(anchorId);
        var windowW = window.innerWidth;
        var windowH = window.innerHeight;
        _(`dropdown-${id}`).style.top = `${anchorY-5}px`;
        if (anchorX > (windowW/2))
            _(`dropdown-${id}`).style.left = `${anchorX-_getW(`dropdown-${id}`)-10}px`;
        else
            _(`dropdown-${id}`).style.left = `${anchorX+10}px`;
        // Check for height and scrolling
        var elY = _getY(`dropdown-${id}`);
        var elH = _getH(`dropdown-${id}`);
        if ((elY+elH) > windowH-20) {
            _(`dropdown-${id}`).style.height = `calc(100% - ${elY}px - 20px)`;
        } else {
            _(`dropdown-${id}`).style.height = "";
        }
    }
    try {
        clearTimeout(window.timeoutShowDropdown[id]);
    } catch (error) {}
    window.timeoutShowDropdown[id] = setTimeout(() => {
        _(`dropdown-${id}`).classList.add("ease-in-out-100ms");
        _(`dropdown-${id}`).style.opacity = 1;
        _(`dropdown-${id}`).style.marginTop = "10px";
    }, 50);
}

// Hide an existing dropdown
function hideDropdown(id) {
    console.log(`Hiding dropdown "${id}"`);
    _(`dropdownArea-${id}`).style.display = "none";
    _(`dropdown-${id}`).style.marginTop = "15px";
    _(`dropdown-${id}`).style.opacity = 0;
    try {
        clearTimeout(window.timeoutHideDropdown[id]);
    } catch (error) {}
    window.timeoutHideDropdown[id] = setTimeout(() => {
        _(`dropdown-${id}`).style.display = "none";
    }, 200);
}

// Prebuilt dropdown menus
function showDropdown_sort() {
    data = [];
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'name',
        'text': window.lang.dropdownSortListName,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'nameDesc',
        'text': window.lang.dropdownSortListNameDesc,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'date',
        'text': window.lang.dropdownSortListDate,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'dateDesc',
        'text': window.lang.dropdownSortListDateDesc,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'size',
        'text': window.lang.dropdownSortListSize,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'sizeDesc',
        'text': window.lang.dropdownSortListSizeDesc,
        'icon': 'sort',
        'action': function() { console.log("It works") }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'default',
        'text': window.lang.dropdownSortListDefault,
        'icon': 'public',
        'action': function() { console.log("It works") }
    });
    showDropdown("sort", data, "topbarButtonMenu");
}
function showDropdown_recents() {
    data = [];
    data.push({
        'disabled': true,
        'type': 'item',
        'id': 'viewFull',
        'text': window.lang.dropdownRecentsViewFull,
        'icon': 'history',
        'action': function() { console.log("It works") }
    });
    data.push({
        'type': 'item',
        'id': 'clear',
        'text': window.lang.dropdownRecentsClearHistory,
        'icon': 'delete',
        'action': function() { popup_clearHistory() }
    });
    data.push({ 'type': 'sep' });
    var getUrl = function(f) {
        if (f.type == "directory") return f.dir;
        else return `${f.dir}/?f=${encodeURIComponent(f.name)}`;
    }
    var uniqueEntries = [];
    var entries = locStoreArrayGet("history").entries;
    entries.reverse();
    uniqueEntries.push(getUrl(entries[0]));
    var i = 0;
    entries.forEach(f => {
        if (uniqueEntries.length-1 <= 50) {
            var url = getUrl(f);
            if (!uniqueEntries.includes(url)) {
                var icon = "insert_drive_file";
                if (f.type == "directory") icon = "folder";
                if (f.name == "") {
                    f.name = window.lang.fileListRootName;
                    icon = "home";
                }
                data.push({
                    'type': 'item',
                    'id': i,
                    'text': f.name,
                    'icon': icon,
                    'action': function() {
                        historyPushState('', url);
                        loadFileList("", null, true);
                    }
                });
                uniqueEntries.push(url);
                i++;
            }
        }
    });
    showDropdown("recents", data, "topbarButtonMenu");
}

// Handle dropdown menu buttons
_("topbarButtonMenu").addEventListener("click", function() {
    this.blur();
    data = [];
    data.push({
        'type': 'item',
        'id': 'refresh',
        'text': window.lang.dropdownRefreshList,
        'icon': 'refresh',
        'action': function() { loadFileList("", null, true) }
    });
    data.push({
        'type': 'item',
        'id': 'sort',
        'text': window.lang.dropdownSortList,
        'icon': 'sort',
        'action': function() { showDropdown_sort() }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'share',
        'text': window.lang.dropdownShareDirectory,
        'icon': 'share',
        'action': function() { copyText(window.location.href) }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'history',
        'text': window.lang.dropdownRecents,
        'icon': 'history',
        'action': function() { showDropdown_recents() }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'about',
        'text': window.lang.dropdownAbout,
        'icon': 'info',
        'action': function() { popup_about() }
    });
    data.push({
        'type': 'item',
        'id': 'reload',
        'text': window.lang.dropdownRefreshPage,
        'icon': 'refresh',
        'action': function() { window.location.href = "" }
    });
    showDropdown("mainMenu", data, this.id);
});
_("previewButtonMenu").addEventListener("click", function() {
    this.blur();
    var fileData = window.currentFile;
    data = [];
    data.push({
        'type': 'item',
        'id': 'download',
        'text': window.lang.dropdownFileDownload.replace("%0", fileData.sizeF),
        'icon': 'download',
        'action': function() { downloadFile(encodeURIComponent(fileData.name)) }
    });
    data.push({
        'type': 'item',
        'id': 'fileInfo',
        'text': window.lang.dropdownFileInfo,
        'icon': 'description',
        'action': function() { popup_fileInfo(window.currentFileId) }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'share',
        'text': window.lang.dropdownShareFilePreview,
        'icon': 'share',
        'action': function() { copyText(window.location.href) }
    });
    data.push({
        'type': 'item',
        'id': 'shareDirect',
        'text': window.lang.dropdownShareFile,
        'icon': 'link',
        'action': function() { copyText(window.location.href.replace("?f=", "")) }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'history',
        'text': window.lang.dropdownRecents,
        'icon': 'history',
        'action': function() { showDropdown_recents() }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'about',
        'text': window.lang.dropdownAbout,
        'icon': 'info',
        'action': function() { popup_about() }
    });
    data.push({
        'type': 'item',
        'id': 'reload',
        'text': window.lang.dropdownRefreshPage,
        'icon': 'refresh',
        'action': function() { window.location.href = "" }
    });
    showDropdown("previewMenu", data, this.id);
});

// Handle the filter bar
_("fileListFilter").addEventListener("keyup", function(event) {
    var value = this.value.toLowerCase();
    if (event.key == "Escape" || event.keyCode == 27) this.blur();
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
            if (window.dirHeader) _("directoryHeader").style.display = "";
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
            if (this.value.match(/^url=(.*)$/g)) {
                _("fileListHint").innerHTML = window.lang.fileListFilterUrl;
                if (event.key == "Enter" || event.keyCode == 13) {
                    window.location.href = this.value.replace(/^url=(.*)$/g, "$1");
                }
            } else if (matches == 0) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterNone;
            } else if (matches == 1) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterSingle;
            } else {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterMulti.replace("%0", matches);
            }
            _("directoryHeader").style.display = "none";
        }
    // 100ms for every 500 files
    }, (100*Math.floor(window.fileElements.length/500)));
});

// Topbar title click event
_("topbarTitle").addEventListener("click", function() {
    historyPushState('', `/`);
    loadFileList();
});

// Do this stuff when the window is resized
window.addEventListener("resize", function(event) {
    // Loop through dropdown menus
    var els = document.getElementsByClassName("dropdown");
    for (i = 0; i < els.length; i++) {
        var el = els[i];
        // If this dropdown is visible, hide it
        if (el.style.display != "none") {
            var id = el.id.replace(/^dropdown-(.*)$/, "$1");
            hideDropdown(id);
        }
    }
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

// On load
window.onload = function() {
    document.getElementById("body").classList.remove("no-transitions");
    console.log("Page loaded at "+dateFormat(Date.now(), "%+H:%+M on %Y-%+m-%+d"))
    // Do this stuff initially
    loadFileList();
};

</script>