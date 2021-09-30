
// CyberFiles Javascript
// This is where all the magic happens

// Get stuff from the server
(async() => {
    await fetch(`/?api&get=config`).then((response) => {
        if (response.ok) return response.json();
        throw new Error("Fetch failed");
    }).then(data => {
        window.lang = data.lang;
        window.conf = data.config;
        window.theme = data.theme;
        window.vidProgConf = data.config.videoProgressSave;
        window.defaultSort = data.config.defaultSort;
        window.textPreviewMaxSize = data.config.textPreviewMaxSize;
        console.log(`Loaded config, language, and theme constants from the server:`);
        console.log(data);
    }).catch(error => {
        return Promise.reject();
    });
})();
let loaded = false;

// Initializes functions that use to local storage
function initLocStore() {
    let i = 0;
    // Initialize file history
    window.fileHistory = locStoreArrayGet("history");
    if (fileHistory === null) {
        fileHistory = {
            'entries': []
        };
        locStoreArraySet("history", fileHistory);
        console.log("File history has been wiped because the version changed");
    }
    i = 0;
    while (JSON.stringify(fileHistory).length > 1000000) {
        fileHistory.entries.shift();
        i++;
    }
    if (i > 0) console.log(`Removed ${i} of the oldest file history entries`);
    console.log(`Loaded a total of ${fileHistory.entries.length} file history entries`);

    // Initialize video progress saving
    if (vidProgConf.enable) {
        window.vidProg = locStoreArrayGet("vidprog");
        if (vidProg === null) {
            vidProg = {
                'entries': {}
            };
            locStoreArraySet("vidprog", vidProg);
            console.log("Video progress has been wiped");
        }
        i = 0;
        Object.keys(vidProg.entries).forEach(e => {
            let entry = vidProg.entries[e];
            if ((Date.now()-entry.updated) > (vidProgConf.expire*2*60*60*1000)) {
                delete vidProg.entries[e];
                i++;
            }
        });
        if (i > 0) {
            locStoreArraySet("vidprog", vidProg);
            console.log(`Removed ${i} expired video progress entries`);
        }
    }

    // Initialize directory sort orders
    window.dirSort = locStoreArrayGet("dirsort");
    if (dirSort === null) {
        dirSort = {};
        locStoreArraySet("dirsort", dirSort);
    }
}

// Copies the specified text to the clipboard
function copyText(value) {
    let tempInput = document.createElement("input");
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
    let regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
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
    let id = `fileDownload-${Date.now}`;
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
    return string.toString().padStart(newLength, char);
}

// Pushes a state to history
let lastUrl = window.location.href;
function historyPushState(title, url) {
    window.history.pushState("", title, url);
    window.lastUrl = window.location.href;
}
function historyReplaceState(title, url) {
    window.history.replaceState("", title, url);
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

// Returns a properly formatted version of the current directory
function currentDir(upLevels = 0) {
    let path = window.location.pathname;
    let tmp = path.split("/");
    let dirSplit = [];
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

// Returns a formatted interpretation of a date
// Format should use custom variables mapped to those provided by the Date class
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date
function dateFormat(timestamp, format) {
    date = new Date(convertTimestamp(timestamp));
    let twelveH = date.getHours();
    if (twelveH > 12) {
        twelveH = twelveH-12;
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
            let tmp = date.getFullYear().toString();
            return tmp.substr(tmp.length-2);
        })
        .replace("%%", "%")
    return format;
}

// Returns a formatted interpretation of a date
function dateFormatPreset(timestamp, format = "short") {
    try {
        if (format == "short") {
            return dateFormat(timestamp, window.conf.dateFormatShort);
        }
        if (format == "full") {
            return dateFormat(timestamp, window.conf.dateFormatFull);
        }
    } catch (error) {
        return;
    }
}

// Returns the relative interpretation of a date
function dateFormatRelative(timestamp) {
    time = Date.now()-convertTimestamp(timestamp);
    let future = "";
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

// Returns a formatted interpretation of a number of seconds
function secondsFormat(secs) {
    let hours = 0;
    let mins = 0;
    if (secs < 60) {
        return `0:${addLeadingZeroes(secs, 2)}`;
    } else if (secs < 3600) {
        mins = Math.floor(secs/60);
        secs = secs-(mins*60);
        return `${mins}:${addLeadingZeroes((secs), 2)}`;
    } else {
        mins = Math.floor(secs/60);
        hours = Math.floor(mins/60);
        mins = mins-(hours*60);
        secs = secs-(mins*60);
        return `${hours}:${addLeadingZeroes((mins), 2)}:${addLeadingZeroes((secs), 2)}`;
    }
    return secs;
}

// Returns true if the input device is hover-capable
function canHover() {
    return Boolean(_getW("hoverCapable"));
}

// Returns an icon specific to the given MIME type
function getFileTypeIcon(mimeType) {
    if (mimeType.match(/^application\/(zip|x-7z-compressed)$/gi))
        return "archive";
    if (mimeType.match(/^application\/pdf$/gi))
        return "picture_as_pdf";
    if (mimeType.match(/^directory$/gi))
        return "folder";
    if (mimeType.match(/^video\/.*$/gi))
        return "movie";
    if (mimeType.match(/^text\/.*$/gi))
        return "text_snippet";
    if (mimeType.match(/^audio\/.*$/gi))
        return "headset";
    if (mimeType.match(/^image\/.*$/gi))
        return "image";
    if (mimeType.match(/^application\/.*$/gi))
        return "widgets";
    return "insert_drive_file";
}

// Loads a file list with the API
window.fileListLoaded = false;
addTooltip("topbarButtonUp");
async function loadFileList(dir = "", entryId = null, forceReload = false) {
    // Set variables
    if (dir == "") dir = currentDir();
    const dirSplit = dir.split("/");
    const dirName = decodeURI(dirSplit[dirSplit.length-1]);
    let i = 0;
    // If the directory has changed since the last load
    if (dir != window.loadDir || forceReload) {
        // Prepare for loading
        let loadStart = Date.now();
        window.fileListLoaded = false;
        let showGenericErrors = true;
        let seamlessTimeout = setTimeout(() => {
            _("fileListLoading").style.display = "";
        }, 300);
        const cancelLoad = function() {
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
        _("fileListFilterClear").style.display = "none";
        const sortIndicators = document.getElementsByClassName("fileListSortIndicator");
        for (i = 0; i < sortIndicators.length; i++) sortIndicators[i].innerHTML = "";
        // Get sort order
        let sortType = defaultSort.type;
        let sortDesc = defaultSort.desc.toString();
        let customSort = dirSort[currentDir()];
        let sortString = '';
        if (typeof customSort !== 'undefined') {
            sortType = customSort.type;
            sortDesc = customSort.desc.toString();
            console.log(`Using custom sort: ${sortType} ${sortDesc}`);
            sortString = `&sort=${sortType}&desc=${sortDesc}`;
        }
        // Make the API call and handle errors
        await fetch(`${dir}?api&get=files&${sortString}`).then((response) => {
            // If the response was ok
            if (response.ok) return response.json();
            // Otherwise, handle the error
            cancelLoad();
            // If an error code was returned by the server
            if (response.status >= 400 && response.status < 600) {
                showGenericErrors = false;
                // Set the right popup body text
                if (window.lang[`popupServerError${response.status}`]) {
                    let errorBody = window.lang[`popupServerError${response.status}`];
                    switch (response.status) {
                        case 500:
                            errorBody = errorBody.replace("%0", `<a href="https://github.com/CyberGen49/CyberFilesRewrite/issues" target="_blank">${window.lang.popupServerError500Lnk}</a>`)
                            break;
                    }
                } else {
                    let errorBody = window.lang.popupServerErrorOther;
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
                // Update global sort variable
                window.fileListSort = data.sort;
                // If we aren't in the document root
                _("fileList").innerHTML = "";
                if (dir != "/") {
                    // Set the appropriate parent directory name
                    let dirParentName;
                    if (dirSplit.length > 2)
                        dirParentName = decodeURI(dirSplit[dirSplit.length-2]);
                    else
                        dirParentName = window.lang.fileListRootName;
                    // Set the up entry text
                    let upTitle = window.lang.fileListEntryUp.replace("%0", dirParentName);
                    // Build the HTML
                    if (window.conf.upButtonInFileList) {
                        _("fileList").insertAdjacentHTML('beforeend', `
                            <a id="fileEntryUp" class="row no-gutters fileEntry" tabindex=0 onClick='fileEntryClicked(this, event)'">
                                <div class="col-auto fileEntryIcon material-icons">arrow_back</div>
                                <div class="col fileEntryName">
                                    <div class="fileEntryNameInner noBoost">${upTitle}</div>
                                </div>
                                <div class="col-auto fileEntryDate fileListDesktop">-</div>
                                <div class="col-auto fileEntryType fileListDesktopBig noBoost"><div class="fileEntryTypeInner noBoost">-</div></div>
                                <div class="col-auto fileEntrySize fileListDesktop">-</div>
                            </a>
                        `);
                    }
                    // Handle the up button in the topbar
                    _("topbarButtonUp").classList.remove("disabled");
                    _("topbarButtonUp").dataset.tooltip = upTitle;
                } else {
                    _("topbarButtonUp").classList.add("disabled");
                    _("topbarButtonUp").dataset.tooltip = window.lang.tooltipTopbarUpRoot;
                }
                // Loop through the returned file objects
                window.fileObjects = [];
                let totalSize = 0;
                i = 0;
                data.files.forEach(f => {
                    // Get formatted dates
                    f.modifiedF = dateFormatRelative(f.modified);
                    f.modifiedFF = dateFormatPreset(f.modified, "full");
                    // If the file is a directory
                    if (f.mimeType == "directory") {
                        // Set texts
                        f.sizeF = "-";
                        f.typeF = window.lang.fileTypeDirectory;
                        f.icon = getFileTypeIcon(f.mimeType);
                        // Set tooltip
                        f.title = `<b>${f.name}</b><br>${window.lang.fileDetailsDate}: ${f.modifiedFF}<br>${window.lang.fileDetailsType}: ${f.typeF}`;
                        // Set mobile details
                        f.detailsMobile = f.modifiedF;
                    } else {
                        // Get formatted size and add to total
                        f.sizeF = formattedSize(f.size);
                        totalSize += f.size;
                        // Set file type from type list
                        f.typeF = window.lang.fileTypeDefault;
                        f.ext = '.';
                        if (f.name.match(/^.*\..*$/)) {
                            let fileNameSplit = f.name.split(".");
                            f.ext = fileNameSplit[fileNameSplit.length-1].toUpperCase();
                            if (typeof window.lang.fileTypes[f.ext] !== 'undefined')
                                f.typeF = window.lang.fileTypes[f.ext];
                        }
                        // Set icon based on MIME type
                        f.icon = getFileTypeIcon(f.mimeType);
                        // Set tooltip
                        f.title = `<b>${f.name}</b><br>${window.lang.fileDetailsDate}: ${f.modifiedFF}<br>${window.lang.fileDetailsType}: ${f.typeF}<br>${window.lang.fileDetailsSize}: ${f.sizeF}`;
                        // Set mobile details
                        f.detailsMobile = window.lang.fileListMobileLine2.replace("%0", f.modifiedF).replace("%1", f.sizeF);
                    }
                    f.nameUri = encodeURIComponent(f.name);
                    // Build HTML
                    _("fileList").insertAdjacentHTML('beforeend', `
                        <a id="fileEntry-${i}" class="row no-gutters fileEntry" tabindex=0 data-filename='${f.name}' data-objectindex=${i} onClick='fileEntryClicked(this, event)'>
                            <div class="col-auto fileEntryIcon material-icons">${f.icon}</div>
                            <div class="col fileEntryName">
                                <div class="fileEntryNameInner noBoost">${f.name}</div>
                                <div class="fileEntryMobileDetails fileListMobile noBoost">${f.detailsMobile}</div>
                            </div>
                            <div class="col-auto fileEntryDate fileListDesktop noBoost">${f.modifiedF}</div>
                            <div class="col-auto fileEntryType fileListDesktopBig noBoost">
                                <div class="fileEntryTypeInner noBoost">${f.typeF}</div>
                            </div>
                            <div class="col-auto fileEntrySize fileListDesktop noBoost">${f.sizeF}</div>
                        </a>
                    `);
                    addTooltip(`fileEntry-${i}`, f.title);
                    _(`fileEntry-${i}`).href = f.nameUri;
                    window.fileObjects[i] = f;
                    i++;
                });
                window.fileElements = document.getElementsByClassName("fileEntry");
                // Get directory short link
                window.shortSlug = data.shortSlug;
                // Build breadcrumbs
                const breadcrumbAddClick = function(path) {
                    historyReplaceState('', path);
                    loadFileList();
                };
                _("breadcrumbs").innerHTML = "";
                i = 0;
                while (true) {
                    let bcDir = currentDir(i);
                    let bcName = bcDir.split('/');
                    bcName = decodeURIComponent(bcName[bcName.length-1]);
                    if (bcDir == '/') break;
                    _("breadcrumbs").insertAdjacentHTML('afterbegin', `
                        <div id="breadcrumb-${i}-cont" class="col-auto row no-gutters fileListDesktop breadcrumb" data-name="${bcName}" data-path="${bcDir}">
                            <div class="col-auto material-icons breadcrumbSep">chevron_right</div>
                            <div class="col-auto breadcrumbNameCont">
                                <button id="breadcrumb-${i}" class="breadcrumbName hover">${bcName}</button>
                            </div>
                        </div>
                    `);
                    if (i != 0) {
                        addTooltip(`breadcrumb-${i}`, window.lang.tooltipBreadcrumb.replace("%0", bcName));
                        _(`breadcrumb-${i}`).addEventListener("click", function() {
                            this.blur();
                            breadcrumbAddClick(bcDir);
                        });
                    } else {
                        _(`breadcrumb-${i}`).classList.remove("hover");
                        addTooltip(`breadcrumb-${i}`, window.lang.tooltipBreadcrumbCurrent);
                    }
                    i++;
                }
                reflowBreadcrumbs();
                // Parse and set the directory header, if it exists
                window.dirHeader = false;
                if (typeof data.headerHtml !== 'undefined') {
                    _("directoryHeader").innerHTML = data.headerHtml;
                    window.dirHeader = true;
                } else if (typeof data.headerMarkdown !== 'undefined') {
                    _("directoryHeader").innerHTML = marked(data.headerMarkdown);
                    window.dirHeader = true;
                }
                // Show the appropriate sort indicator
                let sortIndicator = _("sortIndicatorName");
                if (data.sort.type == 'name')
                    sortIndicator = _("sortIndicatorName");
                else if (data.sort.type == 'date')
                    sortIndicator = _("sortIndicatorDate");
                else if (data.sort.type == 'ext')
                    sortIndicator = _("sortIndicatorType");
                else if (data.sort.type == 'size')
                    sortIndicator = _("sortIndicatorSize");
                if (data.sort.desc) sortIndicator.innerHTML = "keyboard_arrow_up";
                else sortIndicator.innerHTML = "keyboard_arrow_down";
                // Format load time
                let loadElapsed = Date.now()-loadStart;
                let loadTimeF = loadElapsed+window.lang.dtUnitShortMs;
                if (loadElapsed >= 1000)
                    loadTimeF = roundSmart(loadElapsed/1000, 2)+window.lang.dtUnitShortSecs;
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
                    const targetFile = $_GET("f");
                    let targetFileFound = false;
                    // Loop through file objects and search for the right one
                    i = 0;
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
                        hideFilePreview();
                    }
                } else hideFilePreview();
                // Finish up
                window.canClickEntries = true;
                window.fileListLoaded = true;
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
    if (dirName != "") document.title = `${dirName} - ${window.conf.siteName}`;
    else document.title = window.conf.siteName;
}

// Change this directory's sort order
function sortFileList(type, desc) {
    // If type is null or invalid, delete the sort entry
    if (type === null || !type.match(/^(name|date|size|ext)$/)) {
        delete window.dirSort[currentDir()];
    } else {
        // If descending is null (initiated by a column header)
        if (desc === null) {
            // Default it to false
            desc = false;
            // If a custom sort order is set
            if (typeof window.dirSort[currentDir()] !== 'undefined') {
                // If the current sort order matches the requested sort order
                if (window.dirSort[currentDir()].type == type) {
                    // If descending is currently false, set it to true
                    if (!window.dirSort[currentDir()].desc) desc = true;
                }
            // If a custom order isn't set, but the default type was reselected
            } else {
                if (window.defaultSort.type == type) {
                    // If desc is false by default, set it to true
                    if (!window.defaultSort.desc) desc = true;
                }
            }
        }
        // Add/update the custom sort
        window.dirSort[currentDir()] = {
            'type': type,
            'desc': desc,
        };
        // If the default sort has been reselected, delete the custom sort
        //if (type == window.defaultSort.type && desc == window.defaultSort.desc)
        //    delete window.dirSort[currentDir()];
    }
    // Commit to local storage and reload the file list
    locStoreArraySet('dirsort', window.dirSort);
    loadFileList('', null, true);
}

// File list column header click event listeners
_("fileListHeaderName").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('name', null);
    }
});
_("fileListHeaderDate").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('date', null);
    }
});
_("fileListHeaderType").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('ext', null);
    }
});
_("fileListHeaderSize").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('size', null);
    }
});

// Displays a file preview
addTooltip("previewPrev");
addTooltip("previewNext");
function showFilePreview(id = null) {
    window.canClickEntries = true;
    // If a file is requested and the passed object ID is set
    if ($_GET("f") !== null && id !== null) {
        const data = window.fileObjects[id];
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
        _("previewPrev").dataset.tooltip = window.lang.previewFirstFile;
        _("previewNext").dataset.tooltip = window.lang.previewLastFile;
        idPrev = id;
        while (idPrev > 0) {
            idPrev--;
            const filePrev = window.fileObjects[idPrev];
            if (filePrev.mimeType != "directory") {
                _("previewPrev").classList.remove("disabled");
                _("previewPrev").dataset.tooltip = `${window.lang.previewPrev}<br>${filePrev.name}`;
                _("previewPrev").dataset.objectid = idPrev;
                break;
            }
        }
        idNext = id;
        while (idNext < window.fileObjects.length) {
            idNext++;
            const fileNext = window.fileObjects[idNext];
            if (!fileNext) break;
            if (fileNext.mimeType != "directory") {
                _("previewNext").classList.remove("disabled");
                _("previewNext").dataset.tooltip = `${window.lang.previewNext}<br>${fileNext.name}`;
                _("previewNext").dataset.objectid = idNext;
                break;
            }
        }
        // Update element contents
        _("previewFileName").innerHTML = data.name;
        _("previewFileDesc").innerHTML = `${window.lang.previewTitlebar2.replace("%0", data.typeF).replace("%1", data.sizeF)}`;
        // Set default preview
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
        // Show file-specific previews
        if (data.ext.match(/^(MP4|WEBM)$/)) {
            _("previewFile").className = "";
            _("previewFile").classList.add("previewTypeVideo");
            _("previewFile").innerHTML = `
                <video id="videoPreview" controls src="${encodeURIComponent(data.name)}"></video>
            `;
            // Variables
            const vid = _("videoPreview");
            vid.autoplay = window.conf.videoAutoplay;
            window.vidProgLastSave = 0;
            window.vidProgCanSave = false;
            // Do this stuff when the video metadata is loaded (duration, etc.)
            vid.addEventListener("loadedmetadata", function(event) {
                console.log("Video metadata has loaded");
                // If video progress saving is enabled
                if (window.vidProgConf.enable) {
                    // If the video duration is longer than the minimum to save
                    if (vid.duration >= window.vidProgConf.minDuration) {
                        // If this video has saved progress, and if it hasn't expired, and if it's later than the minimum, and if its earlier than the maximum
                        if (typeof vidProg.entries[vid.src] !== 'undefined'
                          && Date.now()-vidProg.entries[vid.src].updated < (window.vidProgConf.expire*60*60*1000)
                          && vidProg.entries[vid.src].progress > Math.floor(vid.duration*(window.vidProgConf.minPercent/100))
                          && vidProg.entries[vid.src].progress < Math.floor(vid.duration*(window.vidProgConf.maxPercent/100))) {
                              console.log(vidProg.entries[vid.src].progress);
                              console.log(vid.duration*(window.vidProgConf.maxPercent/100));
                            // If the user should be prompted to resume
                            if (window.vidProgConf.prompt) {
                                // Pause the video
                                vid.pause();
                                // Prompt the user about resuming
                                showPopup("vidResume", window.lang.popupVideoResumeTitle, `<p>${window.lang.popupVideoResumeDesc.replace("%0", `<b>${secondsFormat(vidProg.entries[vid.src].progress)}</b>`)}</p>`, [{
                                    'id': "cancel",
                                    'text': window.lang.popupNo2,
                                    'action': function() {
                                        window.vidProgCanSave = true;
                                        vid.play();
                                    }
                                }, {
                                    'id': "resume",
                                    'text': window.lang.popupYes2,
                                    'action': function() {
                                        vid.currentTime = vidProg.entries[vid.src].progress;
                                        window.vidProgCanSave = true;
                                        vid.play();
                                    }
                                }]);
                            // If prompt is disabled, resume automatically
                            } else {
                                vid.currentTime = vidProg.entries[vid.src].progress;
                                window.vidProgCanSave = true;
                                showToast(window.lang.toastVideoResumed.replace("%0", `<b>${secondsFormat(vidProg.entries[vid.src].progress)}</b>`));
                            }
                        } else window.vidProgCanSave = true;
                    }
                }
            });
            // Do this stuff when the video progress changes
            vid.addEventListener("timeupdate", function(event) {
                // If the last saved progress doesn't match the current progress, and saving is enabled, and if the current progress is later than the minimum, and if its earlier than the maximum
                if (Math.floor(vid.currentTime) != Math.floor(window.vidProgLastSave)
                  && window.vidProgCanSave
                  && vid.currentTime > (vid.duration*(window.vidProgConf.minPercent/100))
                  && vid.currentTime < (vid.duration*(window.vidProgConf.maxPercent/100))) {
                    // Save the new progress
                    window.vidProgLastSave = Math.floor(vid.currentTime);
                    vidProg.entries[vid.src] = {
                        'updated': Date.now(),
                        'progress': Math.floor(vid.currentTime),
                    };
                    locStoreArraySet("vidprog", vidProg);
                    console.log("Saved video progress");
                }
            });
        } else if (data.ext.match(/^(MP3|OGG|WAV|M4A)$/)) {
            _("previewFile").className = "";
            _("previewFile").classList.add("previewTypeAudio");
            _("previewFile").innerHTML = `
                <audio id="audioPreview" controls src="${encodeURIComponent(data.name)}"></audio>
            `;
            const aud = _("audioPreview");
            aud.autoplay = window.conf.audioAutoplay;
        } else if (data.ext.match(/^(JPG|JPEG|PNG|SVG|GIF)$/)) {
            _("previewFile").className = "";
            _("previewFile").classList.add("previewTypeImage");
            _("previewFile").innerHTML = `
                <img src="${encodeURIComponent(data.name)}"></img>
            `;
        } else if (data.ext.match(/^(PDF)$/)) {
            _("previewFile").className = "";
            _("previewFile").classList.add("previewTypeEmbed");
            _("previewFile").innerHTML = `
                <iframe src="${encodeURIComponent(data.name)}"></iframe>
            `;
        } else if (data.mimeType.match(/^text\/.*$/)) {
            const getTextPreview = async function(f) {
                _("previewFile").style.display = "none";
                await fetch(`${encodeURIComponent(f.name)}?t=${f.modified}`).then((response) => {
                    // If the response was ok
                    if (response.ok) return response.text();
                    // Otherwise, handle the error
                    _("previewFile").style.display = "";
                    throw new Error("Fetch failed");
                // Wait for the server to return file list data
                }).then(data => {
                    _("previewFile").className = "";
                    _("previewFile").classList.add("previewTypeText");
                    _("previewFile").innerHTML = `
                        <div id="textPreviewCont" class="container"></div>
                    `;
                    if (f.ext.match(/^(md|markdown)$/gi)) {
                        _("textPreviewCont").innerHTML = `${marked(data)}`;
                    } else if (f.ext.match(/^(htm|html)$/gi)) {
                        _("textPreviewCont").innerHTML = `${data}`;
                    } else {
                        _("textPreviewCont").innerHTML = `<pre id="textPreviewPre"><code>${data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")}</code></pre>`;
                    }
                    _("previewFile").style.display = "";
                }).catch(error => {
                    _("previewFile").style.display = "";
                    return Promise.reject();
                });
            };
            if (data.size <= window.textPreviewMaxSize) {
                getTextPreview(data);
            }
        }
        // Show
        _("previewContainer").style.display = "block";
        _("body").style.overflowY = "hidden";
        clearTimeout(window.timeoutPreviewHide);
        setTimeout(() => {
            _("previewContainer").style.opacity = 1;
            meta_themeColor(window.theme.browserThemePreview);
            document.title = `${data.name} - ${window.conf.siteName}`;
        }, 50);
    } else {
        hideFilePreview();
    }
}

// Handle moving to the next and previous file previews
function navFilePreview(el) {
    const f = window.fileObjects[el.dataset.objectid];
    console.log(f);
    if (el.classList.contains("disabled")) return;
    if (!f) {
        console.log("New file preview doesn't exist!");
        return;
    }
    console.log("File entry navigation button clicked");
    historyReplaceState("", `?f=${encodeURI(f.name)}`);
    loadFileList("", el.dataset.objectid);
    el.blur();
}

_("previewPrev").addEventListener("click", function() { navFilePreview(this); })
_("previewNext").addEventListener("click", function() { navFilePreview(this); })

// Hides the file preview
function hideFilePreview() {
    meta_themeColor(window.theme.browserTheme);
    _("previewContainer").style.opacity = 0;
    _("body").style.overflowY = "";
    let newPath = currentDir();
    if (newPath != "/") newPath = `${currentDir()}/`;
    historyReplaceState('', newPath);
    window.timeoutPreviewHide = setTimeout(() => {
        _("previewFile").innerHTML = "";
        _("previewContainer").style.display = "none";
    }, 200);
}

// Function to do stuff when a file entry is clicked
let canClickEntries = true;
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
        let upPath = currentDir(1);
        if (upPath != "/") upPath = `${currentDir(1)}/`;
        historyPushState('', upPath);
        loadFileList();
        return;
    }
    console.log("File entry clicked:")
    const f = window.fileObjects[el.dataset.objectindex];
    console.log(f);
    // If this is a directory, move into it
    if (f.mimeType == "directory") {
        window.canClickEntries = false;
        historyPushState('', `${currentDir()}/${f.name}/`.replace("//", "/"));
        loadFileList();
    } else {
        window.canClickEntries = false;
        historyPushState('', `${currentDir()}/?f=${encodeURIComponent(f.name)}`.replace("//", "/"));
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
        let a = actions[i];
        let fullActionId = `popup-${id}-action-${a.id}`;
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
    let data = window.fileObjects[id];
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
    showPopup("clearHistory", window.lang.popupClearHistoryTitle, `<p>${window.lang.popupClearHistoryDesc}</p><p>${window.lang.popupClearHistoryDesc2}</p>`, [{
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
        <p>${window.lang.popupAboutVersion.replace("%0", `<b>${window.conf.version}</b>`)}</p>
        <p>${window.lang.popupAboutDesc}</p>
        <p>${window.lang.popupAboutDesc2}</p>
        <p><a href="https://github.com/CyberGen49/CyberFilesRewrite" target="_blank">${window.lang.popupAboutDescLink}</a></p>
        <p><a href="/_cyberfiles/?f=Changelog.md">${window.lang.popupAboutChangelog}</a></p>
    `, [{
        'id': "close",
        'text': window.lang.popupClose
    }]);
}

// Show a dropdown menu
let timeoutShowDropdown = [];
let timeoutHideDropdown = [];
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
                        <div id="dropdown-${id}-${item.id}-icon" class="col-auto dropdownItemIcon material-icons">${item.icon}</div>
                        <div class="col dropdownItemName">${item.text}</div>
                    </div>
                `);
                if (item.disabled) {
                    _(`dropdown-${id}-${item.id}`).classList.add("disabled");
                    addTooltip(`dropdown-${id}-${item.id}`, window.lang.dropdownDisabled);
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
        let anchorX = _getX2(anchorId);
        let anchorY = _getY(anchorId);
        let windowW = window.innerWidth;
        let windowH = window.innerHeight;
        _(`dropdown-${id}`).style.top = `${anchorY-5}px`;
        if (anchorX > (windowW/2))
            _(`dropdown-${id}`).style.left = `${anchorX-_getW(`dropdown-${id}`)-10}px`;
        else
            _(`dropdown-${id}`).style.left = `${anchorX+10}px`;
        // Check for height and scrolling
        let elY = _getY(`dropdown-${id}`);
        let elH = _getH(`dropdown-${id}`);
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
    return `dropdown-${id}`;
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
        'type': 'item',
        'id': 'name',
        'text': window.lang.dropdownSortListName,
        'icon': 'check',
        'action': function() { sortFileList('name', false) }
    });
    data.push({
        'type': 'item',
        'id': 'nameDesc',
        'text': window.lang.dropdownSortListNameDesc,
        'icon': 'check',
        'action': function() { sortFileList('name', true) }
    });
    data.push({
        'type': 'item',
        'id': 'date',
        'text': window.lang.dropdownSortListDate,
        'icon': 'check',
        'action': function() { sortFileList('date', false) }
    });
    data.push({
        'type': 'item',
        'id': 'dateDesc',
        'text': window.lang.dropdownSortListDateDesc,
        'icon': 'check',
        'action': function() { sortFileList('date', true) }
    });
    data.push({
        'type': 'item',
        'id': 'ext',
        'text': window.lang.dropdownSortListType,
        'icon': 'check',
        'action': function() { sortFileList('ext', false) }
    });
    data.push({
        'type': 'item',
        'id': 'extDesc',
        'text': window.lang.dropdownSortListTypeDesc,
        'icon': 'check',
        'action': function() { sortFileList('ext', true) }
    });
    data.push({
        'type': 'item',
        'id': 'size',
        'text': window.lang.dropdownSortListSize,
        'icon': 'check',
        'action': function() { sortFileList('size', false) }
    });
    data.push({
        'type': 'item',
        'id': 'sizeDesc',
        'text': window.lang.dropdownSortListSizeDesc,
        'icon': 'check',
        'action': function() { sortFileList('size', true) }
    });
    if (typeof window.dirSort[currentDir()] !== 'undefined') {
        data.push({ 'type': 'sep' });
        data.push({
            'type': 'item',
            'id': 'default',
            'text': window.lang.dropdownSortListDefault,
            'icon': 'public',
            'action': function() { sortFileList(null, null) }
        });
    }
    let dropdownId = showDropdown("sort", data, "topbarButtonMenu");
    // Hide all icons
    _(`${dropdownId}-name-icon`).style.opacity = 0;
    _(`${dropdownId}-nameDesc-icon`).style.opacity = 0;
    _(`${dropdownId}-date-icon`).style.opacity = 0;
    _(`${dropdownId}-dateDesc-icon`).style.opacity = 0;
    _(`${dropdownId}-ext-icon`).style.opacity = 0;
    _(`${dropdownId}-extDesc-icon`).style.opacity = 0;
    _(`${dropdownId}-size-icon`).style.opacity = 0;
    _(`${dropdownId}-sizeDesc-icon`).style.opacity = 0;
    let sortString = `${window.fileListSort.type}-${window.fileListSort.desc.toString()}`;
    // Show the icon of the sort item matching the current file list
    switch (sortString) {
        case 'name-false':
            _(`${dropdownId}-name-icon`).style.opacity = 1;
            break;
        case 'name-true':
            _(`${dropdownId}-nameDesc-icon`).style.opacity = 1;
            break;
        case 'date-false':
            _(`${dropdownId}-date-icon`).style.opacity = 1;
            break;
        case 'date-true':
            _(`${dropdownId}-dateDesc-icon`).style.opacity = 1;
            break;
        case 'ext-false':
            _(`${dropdownId}-ext-icon`).style.opacity = 1;
            break;
        case 'ext-true':
            _(`${dropdownId}-extDesc-icon`).style.opacity = 1;
            break;
        case 'size-false':
            _(`${dropdownId}-size-icon`).style.opacity = 1;
            break;
        case 'size-true':
            _(`${dropdownId}-sizeDesc-icon`).style.opacity = 1;
            break;
    }
}
function showDropdown_recents() {
    data = [];
    /*data.push({
        'disabled': true,
        'type': 'item',
        'id': 'viewFull',
        'text': window.lang.dropdownRecentsViewFull,
        'icon': 'history',
        'action': function() { console.log("It works") }
    });*/
    const getUrl = function(f) {
        if (f.type == "directory") return f.dir;
        if (f.dir == "/") return `/?f=${encodeURIComponent(f.name)}`;
        return `${f.dir}/?f=${encodeURIComponent(f.name)}`;
    }
    let uniqueEntries = [];
    let entries = locStoreArrayGet("history").entries;
    entries.reverse();
    uniqueEntries.push(entries[0].dir);
    uniqueEntries.push(getUrl(entries[0]));
    let i = 0;
    entries.forEach(f => {
        if (uniqueEntries.length-2 <= 50) {
            let url = getUrl(f);
            if (!uniqueEntries.includes(url)) {
                let icon = "insert_drive_file";
                if (f.type == "directory") icon = "folder";
                if (f.name == "") {
                    f.name = window.lang.fileListRootName;
                    icon = "home";
                } else icon = getFileTypeIcon(f.type);
                data.push({
                    'type': 'item',
                    'id': i,
                    'text': f.name,
                    'icon': icon,
                    'action': function() {
                        hideFilePreview();
                        historyPushState('', url);
                        loadFileList("", null, true);
                    }
                });
                uniqueEntries.push(url);
                i++;
            }
        }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'clear',
        'text': window.lang.dropdownRecentsClearHistory,
        'icon': 'delete',
        'action': function() { popup_clearHistory() }
    });
    showDropdown("recents", data, "topbarButtonMenu");
}

// Handle dropdown menu buttons
_("topbarButtonMenu").addEventListener("click", function() {
    this.blur();
    data = [];
    data.push({
        'disabled': !window.fileListLoaded,
        'type': 'item',
        'id': 'refresh',
        'text': window.lang.dropdownRefreshList,
        'icon': 'refresh',
        'action': function() { loadFileList("", null, true) }
    });
    data.push({
        'disabled': !window.fileListLoaded,
        'type': 'item',
        'id': 'sort',
        'text': window.lang.dropdownSortList,
        'icon': 'sort',
        'action': function() { showDropdown_sort() }
    });
    data.push({
        'disabled': !window.fileListLoaded,
        'type': 'item',
        'id': 'random',
        'text': window.lang.dropdownRandomFile,
        'icon': 'shuffle',
        'action': function() {
            let filesOnly = [];
            window.fileObjects.forEach(f => {
                if (f.mimeType != "directory") filesOnly.push(f);
            });
            if (filesOnly.length != 0) {
                let id = Math.floor(Math.random()*(filesOnly.length-1));
                historyPushState('', `?f=${encodeURIComponent(filesOnly[id].name)}`);
                loadFileList('', id);
            } else showPopup("noValidRandomFile", window.lang.popupErrorTitle, window.lang.popupNoRandomFile, [{'id': 'close', 'text': window.lang.popupClose}]);
        }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'share',
        'text': window.lang.dropdownShareDirectory,
        'icon': 'share',
        'action': function() {
            copyText(window.location.href);
            showToast(window.lang.toastCopyDirectoryLink);
        }
    });
    data.push({
        'disabled': !(window.fileListLoaded && window.shortSlug),
        'type': 'item',
        'id': 'shareShort',
        'text': window.lang.dropdownShareDirectoryShort,
        'icon': 'share',
        'action': function() {
            copyText(`${window.location.protocol}//${window.location.hostname}/?s=${window.shortSlug}`);
            showToast(window.lang.toastCopyDirectoryLinkShort);
        }
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
    let fileData = window.currentFile;
    data = [];
    data.push({
        'type': 'item',
        'id': 'fileInfo',
        'text': window.lang.dropdownFileInfo,
        'icon': 'description',
        'action': function() { popup_fileInfo(window.currentFileId) }
    });
    data.push({
        'type': 'item',
        'id': 'download',
        'text': window.lang.dropdownFileDownload.replace("%0", fileData.sizeF),
        'icon': 'download',
        'action': function() {
            showToast(window.lang.toastFileDownload);
            downloadFile(encodeURIComponent(fileData.name));
        }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'item',
        'id': 'share',
        'text': window.lang.dropdownShareFilePreview,
        'icon': 'share',
        'action': function() {
            copyText(window.location.href);
            showToast(window.lang.toastCopyFilePreviewLink);
        }
    });
    data.push({
        'disabled': !(window.fileListLoaded && fileData.shortSlug),
        'type': 'item',
        'id': 'shareShort',
        'text': window.lang.dropdownShareFilePreviewShort,
        'icon': 'share',
        'action': function() {
            copyText(`${window.location.protocol}//${window.location.hostname}/?s=${fileData.shortSlug}`);
            showToast(window.lang.toastCopyFilePreviewLinkShort);
        }
    });
    data.push({
        'type': 'item',
        'id': 'shareDirect',
        'text': window.lang.dropdownShareFile,
        'icon': 'link',
        'action': function() {
            copyText(window.location.href.replace("?f=", ""));
            showToast(window.lang.toastCopyFileLink);
        }
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

// Show a toast notification
function showToast(text) {
    let id = Date.now();
    _("body").insertAdjacentHTML('beforeend', `
        <div id="toast-${id}" class="toastContainer ease-in-out-100ms" style="display: none;">
            <div class="toast">${text}</div>
        </div>
    `);
    _(`toast-${id}`).style.opacity = 0;
    _(`toast-${id}`).style.bottom = "-20px";
    _(`toast-${id}`).style.display = "flex";
    setTimeout(() => {
        _(`toast-${id}`).style.bottom = "0px";
        _(`toast-${id}`).style.opacity = 1;
        setTimeout(() => {
            _(`toast-${id}`).style.opacity = 0;
            _(`toast-${id}`).style.bottom = "-20px";
            setTimeout(() => {
                _(`toast-${id}`).remove();
            }, 200);
        }, 3000);
    }, 100);
}

// Adds a tooltip to an element
function addTooltip(id, text = null) {
    _(id).addEventListener("mousemove", function() { showTooltip(this, text) });
    _(id).addEventListener("mouseleave", function() { hideTooltip() });
    _(id).addEventListener("click", function() { showTooltip(this, text) });
}

// Shows a tooltip at the cursor's current location
function showTooltip(el, text) {
    hideTooltip();
    if (!canHover()) return;
    window.tooltipTimeout = setTimeout(() => {
        if (text === null) text = el.dataset.tooltip;
        _("tooltip").innerHTML = text;
        _("tooltip").style.opacity = 0;
        _("tooltip").style.display = "block";
        _("tooltip").style.left = "";
        _("tooltip").style.right = "";
        _("tooltip").style.top = "";
        _("tooltip").style.bottom = "";
        let winW = window.innerWidth;
        let winH = window.innerHeight;
        let elW = Math.floor(_getW("tooltip"));
        let elH = Math.floor(_getH("tooltip"));
        let left = Math.floor(window.mouseX);
        let right = Math.floor(window.innerWidth-window.mouseX);
        let top = Math.floor(window.mouseY);
        let bottom = Math.floor(window.innerHeight-window.mouseY);
        // Position horizontally
        if (window.mouseX > (winW/2)
          && left > (winW-elW-30)) {
            _("tooltip").style.right = `${right}px`;
            // Fix a strange bug where sometimes the tooltip is too far away from the cursor
            if (_getX2("tooltip") != window.mouseX) {
                right = right+(_getX2("tooltip")-window.mouseX);
                _("tooltip").style.right = `${right}px`;
            }
        } else
            _("tooltip").style.left = `${left}px`;
        // Position vertically
        if (window.mouseY > (winH/2)
          && top > (winH-elH-30))
            _("tooltip").style.bottom = `${bottom}px`;
        else {
            _("tooltip").style.top = `${top+15}px`;
            // Adjust for the top left corner
            if (_("tooltip").style.left != '')
                _("tooltip").style.left = `${left+12}px`;
        }
        // Fade in
        //console.log(`Showing tooltip at (${_getX("tooltip")}, ${_getY("tooltip")})\nCursor: (${window.mouseX}, ${window.mouseY})\nWindow W ${winW}px, H ${winH}px\nX1 ${_getX("tooltip")}px  Y1 ${_getY("tooltip")}px\nX2 ${_getX2("tooltip")}px  Y2 ${_getY2("tooltip")}px\nW ${_getW("tooltip")}px  H ${_getH("tooltip")}px`);
        console.log(`Showing tooltip at (${_getX("tooltip")}, ${_getY("tooltip")})`);
        window.tooltipFadeTimeout = setTimeout(() => {
            _("tooltip").style.opacity = 1;
            window.tooltipTimeout = setTimeout(() => {
                hideTooltip();
            }, (20*1000));
        }, 50);
    }, 400);
}

// Hides a tooltip
function hideTooltip() {
    clearTimeout(window.tooltipTimeout);
    clearTimeout(window.tooltipFadeTimeout);
    _("tooltip").style.opacity = 0;
    window.tooltipFadeTimeout = setTimeout(() => {
        _("tooltip").style.display = "none";
    }, 200);
}

// Handle the filter bar
_("fileListFilter").addEventListener("keyup", function(event) { filterFiles(event, this) });
_("fileListFilterClear").addEventListener("click", function(event) {
    _("fileListFilter").value = "";
    filterFiles(event, _("fileListFilter"));
});
function filterFiles(event, elBar) {
    let value = elBar.value.toLowerCase();
    if (event.key == "Escape" || event.keyCode == 27) elBar.blur();
    // To reduce system resource usage, we'll wait a set amount of time after the user hasn't typed anything to actually run the filter
    clearTimeout(window.filterInterval);
    window.filterInterval = setTimeout(() => {
        console.log(`Filtering files that match "${value}"`);
        if (value == "") {
            for (i = 0; i < window.fileElements.length; i++) {
                const el = window.fileElements[i];
                el.style.display = "";
            }
            _("fileListHint").innerHTML = window.fileListHint;
            if (window.dirHeader) _("directoryHeader").style.display = "";
            _("fileListFilterClear").style.display = "none";
        } else {
            let matches = 0;
            for (i = 0; i < window.fileElements.length; i++) {
                const el = window.fileElements[i];
                if (el.dataset.filename.toLowerCase().includes(value)) {
                    el.style.display = "";
                    matches++;
                }
                else
                    el.style.display = "none";
            }
            if (elBar.value.match(/^url=(.*)$/gi)) {
                _("fileListHint").innerHTML = window.lang.fileListFilterUrl;
                if (event.key == "Enter" || event.keyCode == 13) {
                    window.location.href = elBar.value.replace(/^url=(.*)$/gi, "$1");
                }
            } else if (matches == 0) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterNone;
            } else if (matches == 1) {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterSingle;
            } else {
                _("fileListHint").innerHTML = window.lang.fileListDetailsFilterMulti.replace("%0", matches);
            }
            _("directoryHeader").style.display = "none";
            _("fileListFilterClear").style.display = "";
        }
    // 100ms for every 500 files
    }, (100*Math.floor(window.fileElements.length/500)));
}

// Topbar title click event
_("topbarTitle").addEventListener("click", function() {
    this.blur();
    historyPushState('', `/`);
    loadFileList();
});

// Do this stuff when the window is resized
window.addEventListener("resize", function(event) {
    // Loop through dropdown menus
    const els = document.getElementsByClassName("dropdown");
    for (i = 0; i < els.length; i++) {
        const el = els[i];
        // If this dropdown is visible, hide it
        if (el.style.display != "none") {
            let id = el.id.replace(/^dropdown-(.*)$/, "$1");
            hideDropdown(id);
        }
    }
    // Make the breadcrumbs responsive
    reflowBreadcrumbs();
});

// Make the breadcrumbs responsive
function reflowBreadcrumbs() {
    const breadcrumbs = document.getElementsByClassName("breadcrumb");
    let i = 0;
    if (breadcrumbs.length == 0) return;
    for (i = 0; i < breadcrumbs.length; i++)
        breadcrumbs[i].style.display = "";
    i = 0;
    while (true) {
        let contX2 = _getX2("breadcrumbs");
        let bcX2 = _getX2(breadcrumbs[breadcrumbs.length-1].id);
        if (bcX2 < contX2) return;
        breadcrumbs[i].style.display = "none";
        i++;
    }
}

// Handle browser back and forward buttons
window.addEventListener("popstate", function(event) {
    if (window.location.href != window.lastUrl) {
        hideFilePreview();
        loadFileList();
    }
    window.lastUrl = window.location.href;
});

// Do this stuff when the main window is scrolled
document.addEventListener("scroll", function(event) {
    el = document.documentElement;
    if (el.scrollTop > 0)
        _("topbar").classList.add("shadow");
    else
        _("topbar").classList.remove("shadow");
});

// Do this stuff when the cursor moves anywhere within the window
window.addEventListener("mousemove", function(event) {
    window.mouseX = event.clientX;
    window.mouseY = event.clientY;
});

// Check if the user was redirected from an invalid short link
if ($_GET("badShortLink") === '') {
    showPopup("badShortLink", window.lang.popupBadShortLinkTitle, window.lang.popupBadShortLinkDesc, [{
        'id': "close",
        'text': window.lang.popupOkay
    }]);
}

// Wait for a complete load to start stuff
window.onload = function() { window.loaded = true; };
// * For some reason, using `let` to define this global variable makes the inner function unable to clear the timeout linked to said variable
loadCheck = setInterval(() => {
    if (window.loaded && window.lang && window.theme && window.conf) {
        clearInterval(window.loadCheck);
        document.getElementById("body").classList.remove("no-transitions");
        console.log("CyberFiles loaded at "+dateFormat(Date.now(), "%+H:%+M on %Y-%+m-%+d"));
        // Hide the splash
        _("splash").style.opacity = 0;
        setTimeout(() => {
            _("splash").style.display = "none";
        }, 300);
        // Do this stuff initially
        initLocStore();
        loadFileList();
        addTooltip("topbarTitle", window.lang.tooltipTopbarTitle);
        addTooltip("topbarButtonMenu", window.lang.tooltipMenu);
        addTooltip("previewButtonMenu", window.lang.tooltipMenu);
        addTooltip("previewButtonClose", window.lang.tooltipPreviewClose);
    }
}, 100);