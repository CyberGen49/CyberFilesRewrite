
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
        window.themes = data.themes;
        window.languages = data.languages;
        window.vidProgConf = data.config.videoProgressSave;
        //window.defaultSort = data.config.defaultSort;
        window.textPreviewMaxSize = data.config.textPreviewMaxSize;
        window.cfVersion = data.version;
        console.log(`Loaded config, language, and theme constants from the server:`);
        console.log(data);
    }).catch(error => {
        return Promise.reject();
    });
})();
window.doOnLoad = [];

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

    // Initialize directory views
    window.dirView = locStoreArrayGet("dirview");
    if (dirView === null) {
        dirView = {};
        locStoreArraySet("dirview", dirView);
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

// Escapes HTML special characters in a string and returns the result
function escapeHtml(unsafe) {
    return unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
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
function _id(id) {
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

// Starts a direct file download
function downloadFile(url, elThis) {
    let id = `fileDownload-${Date.now}`;
    _id("body").insertAdjacentHTML('beforeend', `
        <a id="${id}" download></a>
    `);
    _id(id).href = url;
    console.log(`Starting direct download of "${url}"`);
    _id(id).click();
    _id(id).remove();
    if (elThis) elThis.blur();
}

// Adds leading characters to a string to match a specified length
function addLeadingZeroes(string, newLength = 2, char = "0") {
    return string.toString().padStart(newLength, char);
}

// Pushes a state to history
lastUrl = window.location.href;
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

// Sets a cookie
function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

// Returns the value of a cookie
function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i <ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
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
        time = Math.abs(time);
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
    secs = Math.round(secs);
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
        secs = Math.floor(secs-(mins*60)-(hours*60*60));
        return `${hours}:${addLeadingZeroes((mins), 2)}:${addLeadingZeroes((secs), 2)}`;
    }
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
fileListLoaded = false;
fileObjects = [];
function loadFileList(dir = "", entryId = null, forceReload = false) {
    // Set variables
    if (dir == "") dir = currentDir();
    const dirSplit = dir.split("/");
    const dirName = decodeURI(dirSplit[dirSplit.length-1]);
    let i = 0;
    // If the directory has changed since the last load
    if (dir != window.loadDir || forceReload) {
        // Prepare for loading
        window.fileListLoaded = false;
        let loadStart = Date.now();
        let seamlessTimeout = setTimeout(() => {
            _id("fileListLoading").style.display = "";
        }, 300);
        const cancelLoad = function() {
            // Hide spinner and update footer text
            clearTimeout(seamlessTimeout);
            _id("fileListLoading").style.display = "none";
            _id("fileListHint").innerHTML = window.lang.fileListError;
            _id("fileListHint").style.display = "";
            _id("fileListHint").style.opacity = 1;
        }
        window.fileObjects = [];
        _id("fileListFilter").disabled = true;
        _id("fileListFilter").value = "";
        _id("fileListFilter").placeholder = window.lang.fileListFilterDisabled;
        _id("fileListFilterClear").style.display = "none";
        _id("directoryHeader").style.display = "none";
        _id("directoryHeader").style.opacity = 0;
        _id("fileListHeaders").style.display = "none";
        _id("fileList").style.display = "none";
        _id("fileList").style.opacity = 0;
        _id("fileListHint").style.display = "none";
        _id("fileListHint").style.opacity = 0;
        const sortIndicators = document.getElementsByClassName("fileListSortIndicator");
        for (i = 0; i < sortIndicators.length; i++)
            sortIndicators[i].innerHTML = "";
        let combinedFiles = {};
        let serverProcessingTime = 0;
        const loadFileList_get = async function(offset = 0) {
            window.sendTime = Date.now();
            // Make the API call and handle errors
            await fetch(`${dir}?api&get=files&offset=${offset}&sendTime=${window.sendTime}`).then((response) => {
                // If the response was ok
                if (response.ok) return response.json();
                // Otherwise, handle the error
                cancelLoad();
                // If an error code was returned by the server
                if (response.status >= 400 && response.status < 600) {
                    // Set the right popup body text
                    let errorBody = window.lang.popupServerErrorOther;
                    if (window.lang[`popupServerError${response.status}`]) {
                        errorBody = window.lang[`popupServerError${response.status}`];
                        switch (response.status) {
                            case 500:
                                errorBody = errorBody.replace("%0", `<a href="https://github.com/CyberGen49/CyberFilesRewrite/issues" target="_blank">${window.lang.popupServerError500Lnk}</a>`)
                                break;
                        }
                    }
                    // Show the error popup
                    showPopup("serverError", window.lang.popupServerErrorTitle.replace("%0", response.status), errorBody, [{
                        "id": "home",
                        "text": window.lang.popupHome,
                        "action": function() {
                            _id("topbarTitle").click();
                        }
                    }, {
                        "id": "reload",
                        "text": window.lang.popupReload,
                        "action": function() { window.location.href = "" }
                    }], false);
                }
                throw new Error("Unknown Fetch error.");
            // Wait for the server to return file list data
            }).then(data => {
                if (data.sendTime != window.sendTime) {
                    console.log(`Received server response, but it doesn't match the one we requested (${data.sendTime} != ${window.sendTime})`);
                    return;
                }
                // If the return status is good
                if (data.status == "GOOD") {
                    serverProcessingTime += data.processingTime;
                    console.log(`Fetched file list chunk (${data.chunking.offset+1}/${data.chunking.totalFiles}, ${Math.round(serverProcessingTime/1000)}s):`);
                    console.log(data);
                    if (typeof combinedFiles.files === 'undefined')
                        combinedFiles = data;
                    else
                        combinedFiles.files = combinedFiles.files.concat(data.files);
                    combinedFiles.processingTime = serverProcessingTime;
                    if (data.chunking.complete) {
                        console.log("File list fetch finished");
                        loadFileList_display();
                    } else {
                        let loadPercent = Math.ceil((data.chunking.offset/data.chunking.totalFiles)*100);
                        let loadTimeRemaining = Math.ceil(((serverProcessingTime/1000)/data.chunking.offset)*(data.chunking.totalFiles-data.chunking.offset));
                        _id("fileListHint").innerHTML = `
                            ${window.lang.fileListDetailsLoading1}
                            <br>${window.lang.fileListDetailsLoading2.replace("%0", loadPercent).replace("%1", secondsFormat(loadTimeRemaining))}
                        `;
                        _id("fileListHint").style.display = "block";
                        _id("fileListHint").style.opacity = 1;
                        loadFileList_get(data.chunking.offset);
                    }
                } else {
                    console.log("Failed to fetch file list: "+data.status);
                    throw new Error(`CyberFiles API responded with a status of '${data.status}'`);
                }
            }).catch(error => {
                cancelLoad();
                throw new Error(error);
            });
        }
        const createFileEntry = function(id, name, icon, thumb, detailsMobile, modified, type, size) {
            // Grid view
            if (typeof window.dirView[currentDir()] !== 'undefined' && window.dirView[currentDir()].match(/^grid.*$/)) {
                // Check for a thumbnail and set icon accordingly
                let iconOuter = `<div class="fileGridEntryIcon material-icons">${icon}</div>`;
                if (thumb) iconOuter = `<div class="fileGridEntryIcon"><img src="/_cyberfiles/public/thumbs/${thumb}"></div>`;
                let sizeOuter = '';
                let dateOuter = '';
                if (size != '-' && window.conf.gridView.showSize)
                    sizeOuter = `<div class="fileGridEntrySize">${size}</div>`;
                if (window.conf.gridView.showModified)
                    dateOuter = `<div id="fileEntryDate-${i}" class="fileGridEntryDate">${modified}</div>`;
                // Create and return HTML
                return `
                    <a id="fileEntry-${id}" class="fileGridEntry" tabindex=0 data-filename="${name}" data-objectindex=${id} onClick='fileEntryClicked(this, event)'>
                        ${iconOuter}
                        <div class="fileGridEntryDetails">
                            <div class="fileGridEntryName fileNameInner">${name}</div>
                            ${dateOuter}
                            ${sizeOuter}
                        </div>
                    </a>
                `;
            }
            // Check for a thumbnail and set icon accordingly
            let iconOuter = `<div class="col-auto fileEntryIcon material-icons">${icon}</div>`;
            if (thumb) iconOuter = `<div class="col-auto fileEntryIcon"><img src="/_cyberfiles/public/thumbs/${thumb}"></div>`;
            // Create and return HTML
            return `
                <a id="fileEntry-${id}" class="row no-gutters fileEntry" tabindex=0 data-filename="${name}" data-objectindex=${id} onClick='fileEntryClicked(this, event)'>
                    ${iconOuter}
                    <div class="col fileEntryName">
                        <div class="fileEntryNameInner fileNameInner noBoost">${name}</div>
                        <div class="fileEntryMobileDetails fileListMobile noBoost">${detailsMobile}</div>
                    </div>
                    <div id="fileEntryDate-${i}" class="col-auto fileEntryDate fileListDesktop noBoost">${modified}</div>
                    <div class="col-auto fileEntryType fileListDesktopBig noBoost">
                        <div class="fileEntryTypeInner noBoost">${type}</div>
                    </div>
                    <div class="col-auto fileEntrySize fileListDesktop noBoost">${size}</div>
                </a>
            `;
        }
        const loadFileList_display = function() {
            let data = combinedFiles;
            // Update history
            fileHistory.entries.push({
                'created': Date.now(),
                'dir': dir,
                'name': dirName,
                'type': 'directory'
            });
            locStoreArraySet("history", fileHistory);
            // If we aren't in the document root
            _id("fileList").innerHTML = "";
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
                    _id("fileList").insertAdjacentHTML('beforeend', createFileEntry('up', upTitle, 'arrow_back', null, '', '-', '-', '-'));
                }
                // Handle the up button in the topbar
                _id("topbarButtonUp").classList.remove("disabled");
                _id("topbarButtonUp").dataset.tooltip = upTitle;
            } else {
                _id("topbarButtonUp").classList.add("disabled");
                _id("topbarButtonUp").dataset.tooltip = window.lang.tooltipTopbarUpRoot;
            }
            // Get sort order
            window.defaultSort = {
                'type': data.sort.type,
                'desc': data.sort.desc,
            };
            let sortType = defaultSort.type;
            let sortDesc = defaultSort.desc;
            let customSort = dirSort[currentDir()];
            if (typeof customSort !== 'undefined') {
                sortType = customSort.type;
                sortDesc = customSort.desc;
                console.log(`Using custom sort: ${sortType}-${sortDesc}`);
            }
            // Separate files and folders and count thumbnails
            let tmpFiles = [];
            let tmpFolders = [];
            let thumbed = 0;
            data.files.forEach(f => {
                if (f.mimeType == 'directory') tmpFolders.push(f);
                else tmpFiles.push(f);
                if (f.thumbnail) thumbed++;
            });
            // Sort the files
            // https://stackoverflow.com/questions/52660451/javascript-natural-sort-objects
            // https://stackoverflow.com/questions/8837454/sort-array-of-objects-by-single-key-with-date-value
            let func_sort = function(a, b) {
                return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
            };
            switch (sortType) {
                case 'date':
                    func_sort = function(a, b) {
                        if (a.modified < b.modified) return -1;
                        if (a.modified > b.modified) return 1;
                        return 0;
                    };
                    break;
                case 'size':
                    func_sort = function(a, b) {
                        if (a.size < b.size) return -1;
                        if (a.size > b.size) return 1;
                        return 0;
                    };
                    break;
                case 'ext':
                    func_sort = function(a, b) {
                        if (a.ext < b.ext) return -1;
                        if (a.ext > b.ext) return 1;
                        return 0;
                    };
                    break;
            }
            tmpFolders.sort(func_sort);
            tmpFiles.sort(func_sort);
            // Reverse files if requested
            if (sortDesc) {
                tmpFolders.reverse();
                tmpFiles.reverse();
            }
            // Merge files and folders back into the main files object
            data.files = tmpFolders.concat(tmpFiles);
            // Update global sort variable
            window.fileListSort = {
                'type': sortType,
                'desc': sortDesc,
            };
            // Switch to grid view if more than 70% of files have a thumbnail
            if (typeof window.dirView[currentDir()] === 'undefined'
              && (thumbed/data.files.length) > 0.5)
                changeListView('grid2', false);
            // Loop through the returned file objects
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
                    if (typeof window.lang.fileTypes[f.ext] !== '')
                        f.typeF = window.lang.fileTypes[f.ext];
                    // Set icon based on MIME type
                    f.icon = getFileTypeIcon(f.mimeType);
                    // Set tooltip
                    f.title = `<b>${f.name}</b><br>${window.lang.fileDetailsDate}: ${f.modifiedFF}<br>${window.lang.fileDetailsType}: ${f.typeF}<br>${window.lang.fileDetailsSize}: ${f.sizeF}`;
                    try {
                        if (f.mimeType.match(/^(video|audio)\/.*$/)) {
                            f.title += `<br>${window.lang.fileDetailsDuration}: ${secondsFormat(Math.round(f.other.duration))}`;
                        }
                        if (f.mimeType.match(/^video\/.*$/)) {
                            let temp = f.other.fps.split('/');
                            f.other.fpsF = Math.round(temp[0]/temp[1]);
                            f.title += `<br>${window.lang.fileDetailsResolution}: ${window.lang.fileDetailsResolutionJointFormatVid.replace("%0", f.other.width).replace("%1", f.other.height).replace("%2", f.other.fpsF)}`;
                        }
                        if (f.mimeType.match(/^audio\/.*$/)) {
                            f.title += `<br>${window.lang.fileDetailsSampleRate}: ${f.other.sampleRate}`;
                        }
                        if (f.mimeType.match(/^image\/.*$/)) {
                            f.title += `<br>${window.lang.fileDetailsResolution}: ${window.lang.fileDetailsResolutionJointFormatImg.replace("%0", f.other.width).replace("%1", f.other.height)}`;
                            f.title += `<br>${window.lang.fileDetailsBitDepth}: ${f.other.bitDepth}`;
                        }
                    } catch (error) {}
                    // Set mobile details
                    f.detailsMobile = window.lang.fileListMobileLine2.replace("%0", f.modifiedF).replace("%1", f.sizeF);
                }
                f.nameUri = encodeURIComponent(f.name);
                // Build HTML
                _id("fileList").insertAdjacentHTML('beforeend', createFileEntry(i, f.name, f.icon, f.thumbnail, f.detailsMobile, f.modifiedF, f.typeF, f.sizeF));
                _id(`fileEntry-${i}`).dataset.tooltip = f.title;
                _id(`fileEntry-${i}`).href = f.nameUri;
                f.dateElement = _id(`fileEntryDate-${i}`);
                window.fileObjects[i] = f;
                i++;
            });
            // Get directory short link
            window.shortSlug = data.shortSlug;
            // Parse and set the directory header, if it exists
            window.dirHeader = false;
            if (typeof data.headerHtml !== 'undefined') {
                _id("directoryHeader").innerHTML = atob(data.headerHtml);
                window.dirHeader = true;
            } else if (typeof data.headerMarkdown !== 'undefined') {
                _id("directoryHeader").innerHTML = marked(atob(data.headerMarkdown));
                window.dirHeader = true;
            }
            // Show the appropriate sort indicator
            let sortIndicator = _id("sortIndicatorName");
            if (sortType == 'date')
                sortIndicator = _id("sortIndicatorDate");
            else if (sortType == 'ext')
                sortIndicator = _id("sortIndicatorType");
            else if (sortType == 'size')
                sortIndicator = _id("sortIndicatorSize");
            if (sortDesc) sortIndicator.innerHTML = "keyboard_arrow_up";
            else sortIndicator.innerHTML = "keyboard_arrow_down";
            // Format load time
            let loadElapsed = Date.now()-loadStart;
            let loadTimeF = loadElapsed+window.lang.dtUnitShortMs;
            if (loadElapsed >= 1000)
                loadTimeF = roundSmart(loadElapsed/1000, 2)+window.lang.dtUnitShortSecs;
            // If there aren't any files
            if (data.files.length == 0) {
                _id("fileListHint").innerHTML = window.lang.fileListEmpty;
            // Otherwise, set the footer as planned
            } else {
                // Handle the filter bar while we're at it
                _id("fileListFilter").disabled = false;
                _id("fileListFilter").placeholder = window.lang.fileListFilter;
                // Set the right footer
                if (data.files.length == 1) {
                    _id("fileListHint").innerHTML = window.lang.fileListDetails1Single.replace("%0", loadTimeF);
                } else {
                    _id("fileListHint").innerHTML = window.lang.fileListDetails1Multi.replace("%0", data.files.length).replace("%1", loadTimeF);
                }
                _id("fileListHint").innerHTML += "<br>"+window.lang.fileListDetails2.replace("%0", formattedSize(totalSize));
            }
            window.fileListHint = _id("fileListHint").innerHTML;
            _id("fileList").classList.remove('fileListGrid');
            _id("fileList").classList.remove('grid1');
            _id("fileList").classList.remove('grid2');
            _id("fileList").classList.remove('grid3');
            // Check for view and update styles accordingly
            if (typeof window.dirView[currentDir()] !== 'undefined' && window.dirView[currentDir()].match(/^grid.*$/)) {
                _id("fileList").classList.add('fileListGrid');
                _id("fileList").classList.add(window.dirView[currentDir()]);
                window.fileElements = document.getElementsByClassName("fileGridEntry");
            } else {
                _id("fileListHeaders").style.display = "";
                window.fileElements = document.getElementsByClassName("fileEntry");
            }
            // Show elements
            clearTimeout(seamlessTimeout);
            _id("fileList").style.display = "";
            _id("fileListHint").style.display = "";
            if (dirHeader) _id("directoryHeader").style.display = "";
            setTimeout(() => {
                _id("fileListLoading").style.display = "none";
                _id("fileList").style.opacity = 1;
                _id("fileListHint").style.opacity = 1;
                _id("directoryHeader").style.opacity = 1;
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
        }
        const loadFileList_updateBreadcrumbs = function() {
            // Build breadcrumbs
            const breadcrumbAddClick = function(path) {
                historyReplaceState('', path);
                loadFileList();
            };
            _id("breadcrumbs").innerHTML = "";
            i = 0;
            while (true) {
                let bcDir = currentDir(i);
                let bcName = bcDir.split('/');
                bcName = decodeURIComponent(bcName[bcName.length-1]);
                if (bcDir == '/') break;
                _id("breadcrumbs").insertAdjacentHTML('afterbegin', `
                    <div id="breadcrumb-${i}-cont" class="col-auto row no-gutters fileListDesktop breadcrumb" data-name="${bcName}" data-path="${bcDir}">
                        <div class="col-auto material-icons breadcrumbSep">chevron_right</div>
                        <div class="col-auto breadcrumbNameCont">
                            <button id="breadcrumb-${i}" class="breadcrumbName hover">${bcName}</button>
                        </div>
                    </div>
                `);
                if (i != 0) {
                    _id(`breadcrumb-${i}`).dataset.tooltip = window.lang.tooltipBreadcrumb.replace("%0", bcName);
                    _id(`breadcrumb-${i}`).addEventListener("click", function() {
                        this.blur();
                        breadcrumbAddClick(bcDir);
                    });
                } else {
                    _id(`breadcrumb-${i}`).classList.remove("hover");
                    _id(`breadcrumb-${i}`).dataset.tooltip = window.lang.tooltipBreadcrumbCurrent;
                }
                i++;
            }
            reflowBreadcrumbs();
        }
        loadFileList_get();
        loadFileList_updateBreadcrumbs();
    // If the directory is the same, skip loading the file list and just try showing a file preview
    } else {
        showFilePreview(entryId);
    }
    if (dirName != "") document.title = `${dirName} - ${window.conf.siteName}`;
    else document.title = window.conf.siteName;
}

// Interval to dynamically update the displayed modification dates
setInterval(() => {
    for (i = 0; i < window.fileObjects.length; i++) {
        let f = window.fileObjects[i];
        window.fileObjects[i].modifiedF = dateFormatRelative(f.modified);
        f.dateElement.innerHTML = window.fileObjects[i].modifiedF;
    }
    console.log(`Updated ${i} modification dates`);
}, (1000*60));

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
        if (type == window.defaultSort.type && desc == window.defaultSort.desc) {
            // Reset to default by deleting the entry
            delete window.dirSort[currentDir()];
        } else {
            // Add/update the custom sort
            window.dirSort[currentDir()] = {
                'type': type,
                'desc': desc,
            };
        }
    }
    // Commit to local storage and reload the file list
    locStoreArraySet('dirsort', window.dirSort);
    loadFileList('', null, true);
}

// Change this directory's view
function changeListView(type, refresh = true) {
    window.dirView[currentDir()] = type;
    // Commit to local storage and reload the file list
    locStoreArraySet('dirview', window.dirView);
    if (refresh) loadFileList('', null, true);
}

// File list column header click event listeners
_id("fileListHeaderName").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('name', null);
    }
});
_id("fileListHeaderDate").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('date', null);
    }
});
_id("fileListHeaderType").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('ext', null);
    }
});
_id("fileListHeaderSize").addEventListener("click", function() {
    if (window.fileListLoaded) {
        sortFileList('size', null);
    }
});

// Displays a file preview
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
        _id("previewPrev").classList.add("disabled");
        _id("previewNext").classList.add("disabled");
        _id("previewPrev").dataset.tooltip = window.lang.previewFirstFile;
        _id("previewNext").dataset.tooltip = window.lang.previewLastFile;
        idPrev = id;
        while (idPrev > 0) {
            idPrev--;
            const filePrev = window.fileObjects[idPrev];
            if (filePrev.mimeType != "directory") {
                _id("previewPrev").classList.remove("disabled");
                _id("previewPrev").dataset.tooltip = `${window.lang.previewPrev}<br>${filePrev.name}`;
                _id("previewPrev").dataset.objectid = idPrev;
                break;
            }
        }
        idNext = id;
        while (idNext < window.fileObjects.length) {
            idNext++;
            const fileNext = window.fileObjects[idNext];
            if (!fileNext) break;
            if (fileNext.mimeType != "directory") {
                _id("previewNext").classList.remove("disabled");
                _id("previewNext").dataset.tooltip = `${window.lang.previewNext}<br>${fileNext.name}`;
                _id("previewNext").dataset.objectid = idNext;
                break;
            }
        }
        // Update element contents
        _id("previewFileName").innerHTML = data.name;
        _id("previewFileDesc").innerHTML = `${window.lang.previewTitlebar2.replace("%0", data.typeF).replace("%1", data.sizeF)}`;
        // Set default preview
        _id("previewFile").classList.add("previewTypeNone");
        _id("previewFile").innerHTML = `
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
            _id("previewFile").className = "";
            _id("previewFile").classList.add("previewTypeVideo");
            _id("previewFile").innerHTML = `
                <video id="videoPreview" controls src="${encodeURIComponent(data.name)}?t=${data.modified}"></video>
            `;
            // Variables
            const vid = _id("videoPreview");
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
                          && vidProg.entries[vid.src].progress > window.vidProgConf.minTime
                          && vidProg.entries[vid.src].progress < (vid.duration-window.vidProgConf.maxTime)) {
                            console.log(vidProg.entries[vid.src].progress);
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
                  && vid.currentTime > window.vidProgConf.minTime
                  && vid.currentTime < (vid.duration-window.vidProgConf.maxTime)) {
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
            _id("previewFile").className = "";
            _id("previewFile").classList.add("previewTypeAudio");
            _id("previewFile").innerHTML = `
                <audio id="audioPreview" controls src="${encodeURIComponent(data.name)}?t=${data.modified}"></audio>
            `;
            const aud = _id("audioPreview");
            aud.autoplay = window.conf.audioAutoplay;
        } else if (data.ext.match(/^(JPG|JPEG|PNG|SVG|GIF)$/)) {
            _id("previewFile").className = "";
            _id("previewFile").classList.add("previewTypeImage");
            _id("previewFile").innerHTML = `
                <img src="${encodeURIComponent(data.name)}?t=${data.modified}"></img>
            `;
        } else if (data.ext.match(/^(PDF)$/)) {
            _id("previewFile").className = "";
            _id("previewFile").classList.add("previewTypeEmbed");
            _id("previewFile").innerHTML = `
                <iframe src="${encodeURIComponent(data.name)}?t=${data.modified}"></iframe>
            `;
        } else if (data.mimeType.match(/^text\/.*$/)) {
            const getTextPreview = async function(f) {
                _id("previewFile").style.display = "none";
                await fetch(`${encodeURIComponent(f.name)}?t=${f.modified}`).then((response) => {
                    // If the response was ok
                    if (response.ok) return response.text();
                    // Otherwise, handle the error
                    _id("previewFile").style.display = "";
                    throw new Error("Fetch failed");
                // Wait for the server to return file list data
                }).then(data => {
                    _id("previewFile").className = "";
                    _id("previewFile").classList.add("previewTypeText");
                    _id("previewFile").innerHTML = `
                        <div id="textPreviewCont" class="container"></div>
                    `;
                    if (f.ext.match(/^(md|markdown)$/gi)) {
                        _id("textPreviewCont").innerHTML = `${marked(data)}`;
                    } else if (f.ext.match(/^(htm|html)$/gi)) {
                        _id("textPreviewCont").innerHTML = `${data}`;
                    } else {
                        _id("textPreviewCont").innerHTML = `<pre id="textPreviewPre"><code>${data.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;")}</code></pre>`;
                    }
                    _id("previewFile").style.display = "";
                }).catch(error => {
                    _id("previewFile").style.display = "";
                    return Promise.reject();
                });
            };
            if (data.size <= window.textPreviewMaxSize) {
                getTextPreview(data);
            }
        }
        // Show
        _id("previewContainer").style.display = "block";
        _id("body").style.overflowY = "hidden";
        clearTimeout(window.timeoutPreviewHide);
        setTimeout(() => {
            _id("previewContainer").style.opacity = 1;
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

_id("previewPrev").addEventListener("click", function() { navFilePreview(this); })
_id("previewNext").addEventListener("click", function() { navFilePreview(this); })

// Hides the file preview
function hideFilePreview() {
    meta_themeColor(window.theme.browserTheme);
    _id("previewContainer").style.opacity = 0;
    _id("body").style.overflowY = "";
    let newPath = currentDir();
    if (newPath != "/") newPath = `${currentDir()}/`;
    historyReplaceState('', newPath);
    window.timeoutPreviewHide = setTimeout(() => {
        _id("previewFile").innerHTML = "";
        _id("previewContainer").style.display = "none";
    }, 200);
}

// Function to do stuff when a file entry is clicked
canClickEntries = true;
function fileEntryClicked(el, event) {
    event.preventDefault();
    document.activeElement.blur();
    // Make sure elements can be clicked
    if (!window.canClickEntries) {
        console.log("Can't click entries right now!");
        return;
    }
    // See if this is the up button
    if (el.id == "fileEntry-up" || (el.id == "topbarButtonUp" && !el.classList.contains("disabled"))) {
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
    if (!_id(`popup-${id}`)) {
        _id("body").insertAdjacentHTML('beforeend', `
            <div id="popup-${id}" class="popupBackground ease-in-out-100ms" style="display: none; opacity: 0"></div>
        `);
    }
    _id(`popup-${id}`).style.display = "none";
    _id(`popup-${id}`).style.opacity = 0;
    _id(`popup-${id}`).innerHTML = `
        <div class="popupCard" onclick="event.stopPropagation()">
            <div id="popup-${id}-title" class="popupTitle">${title}</div>
            <div id="popup-${id}-body" class="popupContent">${body}</div>
            <div id="popup-${id}-actions" class="popupActions"></div>
        </div>
    `;
    for (i = 0; i < actions.length; i++) {
        let a = actions[i];
        let fullActionId = `popup-${id}-action-${a.id}`;
        _id(`popup-${id}-actions`).insertAdjacentHTML('beforeend', `
            <button id="${fullActionId}" class="popupButton">${a.text}</button>
        `);
        _id(fullActionId).addEventListener("click", function() { hidePopup(id) });
        if (a.action) _id(fullActionId).addEventListener("click", a.action);
    }
    if (clickAwayHide) {
        _id(`popup-${id}`).addEventListener("click", function() { hidePopup(id) });
        if (actionClickAway) {
            _id(`popup-${id}`).addEventListener("click", actionClickAway);
        }
    }
    console.log(`Showing popup "${id}"`);
    _id(`popup-${id}`).style.display = "flex";
    clearTimeout(window.timeoutHidePopup);
    window.timeoutShowPopup = setTimeout(() => {
        _id(`popup-${id}`).style.opacity = 1;
        //_id("body").style.overflowY = "hidden";
    }, 50);
}

// Hide an existing popup
function hidePopup(id) {
    console.log(`Hiding popup "${id}"`);
    _id(`popup-${id}`).style.opacity = 0;
    //_id("body").style.overflowY = "";
    clearTimeout(window.timeoutShowPopup);
    window.timeoutHidePopup = setTimeout(() => {
        _id(`popup-${id}`).style.display = "none";
    }, 200);
}

// Prebuilt popups
function popup_fileInfo(id) {
    let data = window.fileObjects[id];
    let other = '';
    try {
        if (data.mimeType.match(/^(video|audio)\/.*$/)) {
            other += `<p><b>${window.lang.fileDetailsDuration}</b><br>${secondsFormat(data.other.duration)}</p>`;
        }
        if (data.mimeType.match(/^(video|image)\/.*$/)) {
            other += `<p><b>${window.lang.fileDetailsWidth}</b><br>${data.other.width}</p>`;
            other += `<p><b>${window.lang.fileDetailsHeight}</b><br>${data.other.height}</p>`;
        }
        if (data.mimeType.match(/^video\/.*$/)) {
            other += `<p><b>${window.lang.fileDetailsFramesPerSecond}</b><br>${data.other.fpsF}</p>`;
        }
        if (data.mimeType.match(/^audio\/.*$/)) {
            other += `<p><b>${window.lang.fileDetailsSampleRate}</b><br>${data.other.sampleRate}</p>`;
        }
        if (data.mimeType.match(/^image\/.*$/)) {
            other += `<p><b>${window.lang.fileDetailsBitDepth}</b><br>${data.other.bitDepth}</p>`;
        }
    } catch (error) {}
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
        </p>${other}
    `, [{
        'id': "close",
        'text': window.lang.popupClose
    }], true);
}
function popup_folderInfo() {
    let data = window.fileObjects;
    let folderName = currentDir().split('/');
    folderName = decodeURIComponent(folderName[folderName.length-1]);
    if (folderName == "") folderName = window.lang.fileListRootName;
    let totalSize = 0;
    let contents = `<div class="col">${window.lang.folderDetailsContentsEmpty}</div>`;
    let contentsArr = {};
    if (data.length > 0) contents = "";
    data.forEach(f => {
        let ext = f.ext;
        if (f.mimeType == "directory")
            ext = window.lang.fileTypeDirectory;
        else if (typeof ext == 'undefined')
            ext = window.lang.fileTypeDefault;
        else
            totalSize += f.size;
        if (!contentsArr[ext]) contentsArr[ext] = 0;
        contentsArr[ext]++;
    });
    Object.keys(contentsArr).forEach(k => {
        let multi = 'Multi';
        if (contentsArr[k] == 1) multi = '';
        let content = '';
        if (k == window.lang.fileTypeDirectory) {
            content = `${window.lang[`folderDetailsContentItemFolder${multi}`]
                .replace("%0", `<b>${contentsArr[k]}</b>`)
            }`;
        } else {
            content = `${window.lang[`folderDetailsContentItem${multi}`]
                .replace("%0", `<b>${contentsArr[k]}</b>`)
                .replace("%1", k)
            }`;
        }
        contents += `<div class="col-auto" style="padding-right: 15px;">${content}</div>`;
    });
    showPopup("fileInfo", window.lang.popupFolderInfoTitle, `
        <p>
            <b>${window.lang.folderDetailsName}</b><br>
            ${folderName}
        </p><p>
            <b>${window.lang.folderDetailsTotalSize}</b><br>
            ${formattedSize(totalSize)}
        </p>
        <div class="row no-gutters">
            <div class="col-12"><b>${window.lang.folderDetailsContents}</b></div>
            ${contents}
        </div>
    `, [{
        'id': "close",
        'text': window.lang.popupClose
    }], true);
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
        <p>${window.lang.popupAboutVersion.replace("%0", `<b>${window.cfVersion}</b>`)}</p>
        <p>${window.lang.popupAboutDesc}</p>
        <p>${window.lang.popupAboutDesc2}</p>
        <p><a href="https://github.com/CyberGen49/CyberFilesRewrite" target="_blank">${window.lang.popupAboutDescLink}</a></p>
        <p><a href="/_cyberfiles/docs/?f=Changelog.md">${window.lang.popupAboutChangelog}</a></p>
    `, [{
        'id': "close",
        'text': window.lang.popupClose
    }]);
}

// Show a dropdown menu
timeoutShowDropdown = [];
timeoutHideDropdown = [];
function showDropdown(id, data, anchorId) {
    // Create the dropdown element
    if (!_id(`dropdown-${id}`)) {
        _id("body").insertAdjacentHTML('beforeend', `
            <div id="dropdownArea-${id}" class="dropdownHitArea" style="display: none;"></div>
            <div id="dropdown-${id}" class="dropdown" style="display: none; opacity: 0">
        `);
        _id(`dropdownArea-${id}`).addEventListener("click", function() { hideDropdown(id) });
    }
    // Set initial element properties
    _id(`dropdownArea-${id}`).style.display = "none";
    _id(`dropdown-${id}`).classList.remove("ease-in-out-100ms");
    _id(`dropdown-${id}`).style.display = "none";
    _id(`dropdown-${id}`).style.opacity = 0;
    _id(`dropdown-${id}`).style.marginTop = "5px";
    _id(`dropdown-${id}`).style.height = "";
    _id(`dropdown-${id}`).style.top = "";
    _id(`dropdown-${id}`).style.left = "";
    _id(`dropdown-${id}`).style.right = "";
    _id(`dropdown-${id}`).innerHTML = "";
    // Add items to the dropdown
    data.forEach(item => {
        switch (item.type) {
            case 'header':
                _id(`dropdown-${id}`).insertAdjacentHTML('beforeend', `
                    <div class="dropdownHeader">${item.text}</div>
                `);
                break;
            case 'item':
                _id(`dropdown-${id}`).insertAdjacentHTML('beforeend', `
                    <div id="dropdown-${id}-${item.id}" class="dropdownItem row no-gutters">
                        <div id="dropdown-${id}-${item.id}-icon" class="col-auto dropdownItemIcon material-icons">${item.icon}</div>
                        <div class="col dropdownItemName">${item.text}</div>
                    </div>
                `);
                if (item.tooltip)
                    _id(`dropdown-${id}-${item.id}`).dataset.tooltip = item.tooltip;
                if (item.disabled) {
                    _id(`dropdown-${id}-${item.id}`).classList.add("disabled");
                    _id(`dropdown-${id}-${item.id}`).dataset.tooltip = window.lang.dropdownDisabled;
                } else {
                    _id(`dropdown-${id}-${item.id}`).addEventListener("click", item.action);
                    _id(`dropdown-${id}-${item.id}`).addEventListener("click", function() { hideDropdown(id) });
                }
                break;
            case 'sep':
                _id(`dropdown-${id}`).insertAdjacentHTML('beforeend', `
                    <div class="dropdownSep"></div>
                `);
                break;
        }
    });
    // Show the dropdown
    console.log(`Showing dropdown "${id}"`);
    _id(`dropdownArea-${id}`).style.display = "block";
    _id(`dropdown-${id}`).style.display = "block";
    if (anchorId !== null) {
        // Position the dropdown
        let elW = _getW(`dropdown-${id}`);
        let elH = _getH(`dropdown-${id}`);
        let anchorX = _getX2(anchorId);
        let anchorY = _getY(anchorId);
        let windowW = window.innerWidth;
        let windowH = window.innerHeight;
        _id(`dropdown-${id}`).style.top = `${anchorY-5}px`;
        if (anchorX > (windowW-elW))
            _id(`dropdown-${id}`).style.left = `${anchorX-_getW(`dropdown-${id}`)-10}px`;
        else
            _id(`dropdown-${id}`).style.left = `${anchorX+10}px`;
        // Check for height and scrolling
        let elY = _getY(`dropdown-${id}`);
        if ((elY+elH) > windowH-20) {
            _id(`dropdown-${id}`).style.height = `calc(100% - ${elY}px - 20px)`;
        } else {
            _id(`dropdown-${id}`).style.height = "";
        }
    }
    try {
        clearTimeout(window.timeoutShowDropdown[id]);
    } catch (error) {}
    window.timeoutShowDropdown[id] = setTimeout(() => {
        _id(`dropdown-${id}`).classList.add("ease-in-out-100ms");
        _id(`dropdown-${id}`).style.opacity = 1;
        _id(`dropdown-${id}`).style.marginTop = "10px";
    }, 50);
    return `dropdown-${id}`;
}

// Hide an existing dropdown
function hideDropdown(id) {
    console.log(`Hiding dropdown "${id}"`);
    _id(`dropdownArea-${id}`).style.display = "none";
    _id(`dropdown-${id}`).style.marginTop = "15px";
    _id(`dropdown-${id}`).style.opacity = 0;
    try {
        clearTimeout(window.timeoutHideDropdown[id]);
    } catch (error) {}
    window.timeoutHideDropdown[id] = setTimeout(() => {
        _id(`dropdown-${id}`).style.display = "none";
    }, 200);
}

// Prebuilt dropdown menus
function showDropdown_sort() {
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderSort
    });
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
    _id(`${dropdownId}-name-icon`).style.opacity = 0;
    _id(`${dropdownId}-nameDesc-icon`).style.opacity = 0;
    _id(`${dropdownId}-date-icon`).style.opacity = 0;
    _id(`${dropdownId}-dateDesc-icon`).style.opacity = 0;
    _id(`${dropdownId}-ext-icon`).style.opacity = 0;
    _id(`${dropdownId}-extDesc-icon`).style.opacity = 0;
    _id(`${dropdownId}-size-icon`).style.opacity = 0;
    _id(`${dropdownId}-sizeDesc-icon`).style.opacity = 0;
    let sortString = `${window.fileListSort.type}-${window.fileListSort.desc.toString()}`;
    // Show the icon of the sort item matching the current file list
    switch (sortString) {
        case 'name-false':
            _id(`${dropdownId}-name-icon`).style.opacity = 1;
            break;
        case 'name-true':
            _id(`${dropdownId}-nameDesc-icon`).style.opacity = 1;
            break;
        case 'date-false':
            _id(`${dropdownId}-date-icon`).style.opacity = 1;
            break;
        case 'date-true':
            _id(`${dropdownId}-dateDesc-icon`).style.opacity = 1;
            break;
        case 'ext-false':
            _id(`${dropdownId}-ext-icon`).style.opacity = 1;
            break;
        case 'ext-true':
            _id(`${dropdownId}-extDesc-icon`).style.opacity = 1;
            break;
        case 'size-false':
            _id(`${dropdownId}-size-icon`).style.opacity = 1;
            break;
        case 'size-true':
            _id(`${dropdownId}-sizeDesc-icon`).style.opacity = 1;
            break;
    }
}
function showDropdown_view() {
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderView
    });
    data.push({
        'type': 'item',
        'id': 'list',
        'text': window.lang.dropdownListViewList,
        'icon': 'check',
        'action': function() { changeListView('list') }
    });
    data.push({
        'type': 'item',
        'id': 'grid1',
        'text': window.lang.dropdownListViewGrid1,
        'icon': 'check',
        'action': function() { changeListView('grid1') }
    });
    data.push({
        'type': 'item',
        'id': 'grid2',
        'text': window.lang.dropdownListViewGrid2,
        'icon': 'check',
        'action': function() { changeListView('grid2') }
    });
    data.push({
        'type': 'item',
        'id': 'grid3',
        'text': window.lang.dropdownListViewGrid3,
        'icon': 'check',
        'action': function() { changeListView('grid3') }
    });
    let dropdownId = showDropdown("view", data, "topbarButtonMenu");
    // Hide all icons
    _id(`${dropdownId}-list-icon`).style.opacity = 0;
    _id(`${dropdownId}-grid1-icon`).style.opacity = 0;
    _id(`${dropdownId}-grid2-icon`).style.opacity = 0;
    _id(`${dropdownId}-grid3-icon`).style.opacity = 0;
    // Show the icon of the sort item matching the current file list
    switch (window.dirView[currentDir()]) {
        default:
            _id(`${dropdownId}-list-icon`).style.opacity = 1;
            break;
        case 'grid1':
            _id(`${dropdownId}-grid1-icon`).style.opacity = 1;
            break;
        case 'grid2':
            _id(`${dropdownId}-grid2-icon`).style.opacity = 1;
            break;
        case 'grid3':
            _id(`${dropdownId}-grid3-icon`).style.opacity = 1;
            break;
    }
}
function showDropdown_recents() {
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderRecents
    });
    const getUrl = function(f) {
        if (f.type == "directory") return f.dir;
        if (f.dir == "/") return `/?f=${encodeURIComponent(f.name)}`;
        return `${f.dir}/?f=${encodeURIComponent(f.name)}`;
    }
    const getDir = function(f) {
        let arr = [];
        let tmp = f.dir.split('/');
        let final = '';
        tmp.unshift(window.lang.fileListRootName);
        tmp.forEach(n => {
            if (n != '') arr.push(decodeURIComponent(n));
        });
        if (f.type == 'directory') arr.pop();
        final = arr.join(' > ');
        return final;
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
                let dir = getDir(f);
                let icon = "insert_drive_file";
                let tooltipLocation = '';
                if (f.type == "directory") icon = "folder";
                if (f.name == "") {
                    f.name = window.lang.fileListRootName;
                    icon = "home";
                } else {
                    icon = getFileTypeIcon(f.type);
                    tooltipLocation = `<br>${window.lang.dropdownRecentsTooltipLocation.replace("%0", dir)}`;
                }
                data.push({
                    'type': 'item',
                    'id': i,
                    'text': f.name,
                    'icon': icon,
                    'tooltip': `<b>${f.name}</b>${tooltipLocation}`,
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
    // Make sure we're finished with the rest of the function before showing the menu
    setTimeout(() => {
        showDropdown("recents", data, "topbarButtonMenu");
    }, 5);
}
function showDropdown_themes() {
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderTheme
    });
    window.themes.forEach(t => {
        data.push({
            'type': 'item',
            'id': t.file,
            'text': t.name,
            'icon': 'check',
            'tooltip': t.desc,
            'action': function() {
                setCookie("theme", t.file, 900);
                window.location.href = "";
            }
        });
    });
    if (getCookie('theme') !== '') {
        data.push({ 'type': 'sep' });
        data.push({
            'type': 'item',
            'id': 'default',
            'text': window.lang.dropdownThemeDefault,
            'icon': 'public',
            'action': function() {
                setCookie("theme", '', -1);
                window.location.href = "";
            }
        });
    }
    let dropdownId = showDropdown("themes", data, "topbarButtonMenu");
    window.themes.forEach(t => {
        _id(`${dropdownId}-${t.file}-icon`).style.opacity = 0;
        if (window.theme.name == t.name)
            _id(`${dropdownId}-${t.file}-icon`).style.opacity = 1;
    });
}
function showDropdown_lang() {
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderLang
    });
    window.languages.forEach(t => {
        data.push({
            'type': 'item',
            'id': t.file,
            'text': t.name,
            'icon': 'check',
            'action': function() {
                setCookie("lang", t.file, 900);
                window.location.href = "";
            }
        });
    });
    if (getCookie('lang') !== '') {
        data.push({ 'type': 'sep' });
        data.push({
            'type': 'item',
            'id': 'default',
            'text': window.lang.dropdownLangDefault,
            'icon': 'public',
            'action': function() {
                setCookie("lang", '', -1);
                window.location.href = "";
            }
        });
    }
    let dropdownId = showDropdown("lang", data, "topbarButtonMenu");
    window.languages.forEach(t => {
        _id(`${dropdownId}-${t.file}-icon`).style.opacity = 0;
        if (window.lang.name == t.name)
            _id(`${dropdownId}-${t.file}-icon`).style.opacity = 1;
    });
}

// Handle dropdown menu buttons
doOnLoad.push(() => {
    window.standardDropdownEntries = [
    { 'type': 'sep' }, {
        'type': 'header',
        'text': window.lang.dropdownHeaderSubmenus
    }, {
        // Recents
        'type': 'item',
        'id': 'history',
        'text': window.lang.dropdownRecents,
        'icon': 'history',
        'action': function() { showDropdown_recents() }
    }, {
        // Theme
        'type': 'item',
        'id': 'theme',
        'text': window.lang.dropdownTheme,
        'icon': 'palette',
        'action': function() { showDropdown_themes() }
    }, {
        // Lang
        'type': 'item',
        'id': 'lang',
        'text': window.lang.dropdownLang,
        'icon': 'translate',
        'action': function() { showDropdown_lang() }
    }, { 'type': 'sep' }, {
        // About
        'type': 'item',
        'id': 'about',
        'text': window.lang.dropdownAbout,
        'icon': 'info',
        'action': function() { popup_about() }
    }, {
        // Reload
        'type': 'item',
        'id': 'reload',
        'text': window.lang.dropdownRefreshPage,
        'icon': 'refresh',
        'action': function() { window.location.href = "" }
    }];
});
_id("topbarButtonMenu").addEventListener("click", function() {
    this.blur();
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderDirectory
    });
    data.push({
        'disabled': !window.fileListLoaded,
        'type': 'item',
        'id': 'folderInfo',
        'text': window.lang.dropdownFolderInfo,
        'icon': 'topic',
        'action': function() { popup_folderInfo() }
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
        'id': 'view',
        'text': window.lang.dropdownListView,
        'icon': 'grid_view',
        'action': function() { showDropdown_view() }
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
    data.push({
        'disabled': !window.fileListLoaded,
        'type': 'item',
        'id': 'refresh',
        'text': window.lang.dropdownRefreshList,
        'icon': 'refresh',
        'action': function() { loadFileList("", null, true) }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderShare
    });
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
    data = data.concat(window.standardDropdownEntries);
    showDropdown("mainMenu", data, this.id);
});
_id("previewButtonMenu").addEventListener("click", function() {
    this.blur();
    let fileData = window.currentFile;
    data = [];
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderFile
    });
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
    data.push({
        'type': 'item',
        'id': 'popout',
        'text': window.lang.dropdownFilePopOut,
        'icon': 'open_in_new',
        'action': function() {
            let params = `status=no,location=no,toolbar=no,menubar=no,width=1189,height=724`;
            let popout = open(window.location.href, 'File', params);
            popout.addEventListener("load", function() {
                popout.document.getElementById("topbar").style.visibility = "hidden";
                popout.document.getElementById("fileListContainer").style.visibility = "hidden";
                popout.document.getElementById("previewButtonClose").style.display = "none";
                popout.standardDropdownEntries = {};
                popout.console.log("Popup loaded");
            });
            hideFilePreview();
        }
    });
    data.push({ 'type': 'sep' });
    data.push({
        'type': 'header',
        'text': window.lang.dropdownHeaderShare
    });
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
    data = data.concat(window.standardDropdownEntries);
    showDropdown("previewMenu", data, this.id);
});

// Show a toast notification
function showToast(text) {
    let id = Date.now();
    _id("body").insertAdjacentHTML('beforeend', `
        <div id="toast-${id}" class="toastContainer ease-in-out-100ms" style="display: none;">
            <div class="toast">${text}</div>
        </div>
    `);
    _id(`toast-${id}`).style.opacity = 0;
    _id(`toast-${id}`).style.bottom = "-20px";
    _id(`toast-${id}`).style.display = "flex";
    setTimeout(() => {
        _id(`toast-${id}`).style.bottom = "0px";
        _id(`toast-${id}`).style.opacity = 1;
        setTimeout(() => {
            _id(`toast-${id}`).style.opacity = 0;
            _id(`toast-${id}`).style.bottom = "-20px";
            setTimeout(() => {
                _id(`toast-${id}`).remove();
            }, 200);
        }, 3000);
    }, 100);
}

// Shows a tooltip at the cursor's current location
function showTooltip(el) {
    hideTooltip();
    if (!canHover()) return;
    window.tooltipTimeout = setTimeout(() => {
        let text = el.dataset.tooltip;
        _id("tooltip").innerHTML = text;
        _id("tooltip").style.opacity = 0;
        _id("tooltip").style.display = "block";
        _id("tooltip").style.left = "";
        _id("tooltip").style.right = "";
        _id("tooltip").style.top = "";
        _id("tooltip").style.bottom = "";
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
            _id("tooltip").style.right = `${right}px`;
            // Fix a strange bug where sometimes the tooltip is too far away from the cursor
            if (_getX2("tooltip") != window.mouseX) {
                right = right+(_getX2("tooltip")-window.mouseX);
                _id("tooltip").style.right = `${right}px`;
            }
        } else
            _id("tooltip").style.left = `${left}px`;
        // Position vertically
        if (window.mouseY > (winH/2)
          && top > (winH-elH-30))
            _id("tooltip").style.bottom = `${bottom}px`;
        else {
            _id("tooltip").style.top = `${top+15}px`;
            // Adjust for the top left corner
            if (_id("tooltip").style.left != '')
                _id("tooltip").style.left = `${left+12}px`;
        }
        // Fade in
        //console.log(`Showing tooltip at (${_getX("tooltip")}, ${_getY("tooltip")})\nCursor: (${window.mouseX}, ${window.mouseY})\nWindow W ${winW}px, H ${winH}px\nX1 ${_getX("tooltip")}px  Y1 ${_getY("tooltip")}px\nX2 ${_getX2("tooltip")}px  Y2 ${_getY2("tooltip")}px\nW ${_getW("tooltip")}px  H ${_getH("tooltip")}px`);
        console.log(`Showing tooltip at (${_getX("tooltip")}, ${_getY("tooltip")})`);
        window.tooltipFadeTimeout = setTimeout(() => {
            _id("tooltip").style.opacity = 1;
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
    _id("tooltip").style.opacity = 0;
    window.tooltipFadeTimeout = setTimeout(() => {
        _id("tooltip").style.display = "none";
    }, 200);
}

// Check for tooltip data tags on elements and add their event listeners
setInterval(() => {
    let els = document.querySelectorAll('[data-tooltip]');
    for (i = 0; i < els.length; i++) {
        let el = els[i];
        if (!el.hasAttribute("data-tooltip-listening")) {
            el.addEventListener("mousemove", function() { showTooltip(this) });
            el.addEventListener("mouseleave", function() { hideTooltip() });
            el.addEventListener("click", function() { showTooltip(this) });
            el.dataset.tooltipListening = 'true';
            //console.log(`Added tooltip to ${el.id}`);
        }
        el.ariaLabel = el.dataset.tooltip;
    }
    els = document.querySelectorAll('[title]');
    for (i = 0; i < els.length; i++) {
        let el = els[i];
        el.dataset.tooltip = el.title;
        el.removeAttribute("title");
    }
}, 500);

// Handle the filter bar
_id("fileListFilter").addEventListener("keyup", function(event) { filterFiles(event, this) });
_id("fileListFilterClear").addEventListener("click", function(event) {
    _id("fileListFilter").value = "";
    filterFiles(event, _id("fileListFilter"));
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
                el.getElementsByClassName("fileNameInner")[0].innerHTML = el.dataset.filename;
                el.style.display = "";
            }
            _id("fileListHint").innerHTML = window.fileListHint;
            if (window.dirHeader) _id("directoryHeader").style.display = "";
            _id("fileListFilterClear").style.display = "none";
        } else {
            let matches = 0;
            for (i = 0; i < window.fileElements.length; i++) {
                const el = window.fileElements[i];
                const options = {
                    threshold: -10000,
                    allowTypo: false,
                }
                let result = fuzzysort.single(value, el.dataset.filename, options);
                //if (el.dataset.filename.toLowerCase().includes(value)) {
                if (result) {
                    el.getElementsByClassName("fileNameInner")[0].innerHTML = fuzzysort.highlight(result, "<span class=\"fileListFilterHighlight\">", "</span>");
                    el.style.display = "";
                    matches++;
                }
                else
                    el.style.display = "none";
            }
            if (elBar.value.match(/^url=(.*)$/gi)) {
                _id("fileListHint").innerHTML = window.lang.fileListFilterUrl;
                if (event.key == "Enter" || event.keyCode == 13) {
                    window.location.href = elBar.value.replace(/^url=(.*)$/gi, "$1");
                }
            } else if (matches == 0) {
                _id("fileListHint").innerHTML = window.lang.fileListDetailsFilterNone;
            } else if (matches == 1) {
                _id("fileListHint").innerHTML = window.lang.fileListDetailsFilterSingle;
            } else {
                _id("fileListHint").innerHTML = window.lang.fileListDetailsFilterMulti.replace("%0", matches);
            }
            _id("directoryHeader").style.display = "none";
            _id("fileListFilterClear").style.display = "";
        }
    // 100ms for every 500 files
    }, (100*Math.floor(window.fileElements.length/500)));
}

// Topbar title click event
_id("topbarTitle").addEventListener("click", function() {
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
        _id("topbar").classList.add("shadow");
    else
        _id("topbar").classList.remove("shadow");
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

// Do this stuff any time an uncaught error occurs
function errorHandler(msg, url, lineNo, columnNo, error) {
    if (msg.match(/ResizeObserver/gi)) {
        console.log(`Error ignored: ${msg}`);
        return false;
    }
    let message = `${msg} (${url}:${lineNo}:${columnNo})`;
    try { message = error.stack; }
    catch (error) { console.log("Error stack is unavailable."); }
    showPopup("fetchError", window.lang.popupErrorTitle, `
        <p>${window.lang.popupClientError}</p>
        <pre><code>Error in CyberFiles ${window.cfVersion}:\n${escapeHtml(message)}</code></pre>
        <p>
            ${window.lang.popupClientError2}
            <ul>
                <li>${window.lang.popupClientError2a}</li>
                <li>${window.lang.popupClientError2b}</li>
                <li><a href="https://github.com/CyberGen49/CyberFilesRewrite/issues" target="_blank">${window.lang.popupClientError2c}</a></li>
            </ul>
        </p>
        <p>${window.lang.popupClientError3.replace("%0", `<a href="https://github.com/CyberGen49/CyberFilesRewrite/issues" target="_blank">${window.lang.popupClientError3Lnk}</a>`)}</p>
    `, [{
        "id": "reload",
        "text": window.lang.popupReload,
        "action": function() { window.location.href = ""; }
    }, {
        "id": "home",
        "text": window.lang.popupHome,
        "action": function() { window.location.href = "/"; }
    }, {
        "id": "close",
        "text": window.lang.popupContinue
    }], false);
    return false;
}
window.onerror = (msg, url, lineNo, columnNo, error) => {
    errorHandler(msg, url, lineNo, columnNo, error)
};

// Wait for a complete load to start stuff
loaded = false;
loadComplete = false;
window.onload = function() { window.loaded = true; };
// * For some reason, using `let` to define this global variable makes the inner function unable to clear the timeout linked to said variable
loadCheck = setInterval(() => {
    if (window.loaded && window.lang && window.theme && window.conf) {
        clearInterval(window.loadCheck);
        document.getElementById("body").classList.remove("no-transitions");
        console.log("CyberFiles loaded at "+dateFormat(Date.now(), "%+H:%+M on %Y-%+m-%+d"));
        // Hide the splash
        _id("splash").style.opacity = 0;
        setTimeout(() => {
            _id("splash").style.display = "none";
        }, 300);
        // Do this stuff initially
        initLocStore();
        loadFileList();
        _id("topbarTitle").dataset.tooltip = window.lang.tooltipTopbarTitle;
        _id("topbarButtonMenu").dataset.tooltip = window.lang.tooltipMenu;
        _id("previewButtonMenu").dataset.tooltip = window.lang.tooltipMenu;
        _id("previewButtonClose").dataset.tooltip = window.lang.tooltipPreviewClose;
        window.doOnLoad.forEach(func => {
            func();
        });
    }
}, 100);