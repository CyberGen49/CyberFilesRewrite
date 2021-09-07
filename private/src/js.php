<?php

global $conf, $lang;

?>
<script>

// Language variables dumped from the server
var lang = JSON.parse(`<?= json_encode($lang) ?>`);

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
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

// Shorthand function for document.getElementById()
function _(id) {
    return document.getElementById(id);
}

// Functions for getting element coordinates and dimensions
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

// Function to add leading zeros to a string
function addLeadingZeroes(string, newLength = 2, char = "0") {
    return string.toString().padStart(newLength, "0");
}

// Function to push a state to history
function updateAddressBar(title, url) {
    window.history.pushState("", title, url);
}

// Function to round with a certain number of decimal places
function roundSmart(number, decimalPlaces = 0) {
    const factorOfTen = Math.pow(10, decimalPlaces)
    return Math.round(number * factorOfTen) / factorOfTen
}

// Returns a properly formatted version of the current directory
function currentDir() {
    var path = window.location.pathname;
    tmp = path.split("/");
    path = "";
    tmp.forEach(f => {
        if (f != "") path += "/"+f;
    });
    if (path == "") return "/";
    else return path;
}

// Function to make sure timestamps are in millisecond form
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
        if (twelveH == 0) twelveH = 12;
    }
    format = format
        .replace("%a", window.lang[`dtWeekday${date.getDay()+1}Short`])
        .replace("%A", window.lang[`dtWeekday${date.getDay()+1}`])
        .replace("%b", window.lang[`dtMonth${date.getMonth()+1}Short`])
        .replace("%B", window.lang[`dtMonth${date.getMonth()+1}`])
        .replace("%d", date.getDate()+1)
        .replace("%+d", addLeadingZeroes(date.getDate()+1, 2))
        .replace("%H", date.getHours())
        .replace("%+H", addLeadingZeroes(date.getHours(), 2))
        .replace("%I", twelveH)
        .replace("%+I", addLeadingZeroes(twelveH, 2))
        .replace("%m", date.getMonth()+1)
        .replace("%+m", addLeadingZeroes(date.getMonth()+1, 2))
        .replace("%M", date.getMinutes())
        .replace("%+M", addLeadingZeroes(date.getMinutes(), 2))
        .replace("%p", function() {
            if (date.getHours() > 12)
                return window.lang.dtPM;
            else
                return window.lang.dtAM;
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
    time /= 1000;
    if (time < 120) return window.lang.dtRelNow;
    time /= 60;
    if (time < 180) return window.lang.dtRelMin.replace("%0", Math.round(time));
    time /= 60;
    if (time < 72) return window.lang.dtRelHour.replace("%0", Math.round(time));
    time /= 24;
    if (time < 30) return window.lang.dtRelDay.replace("%0", Math.round(time));
    return dateFormatPreset(timestamp);
}

// Function to load a file list with the API
async function loadFileList() {
    var loadStart = Date.now();
    _("fileList").style.display = "none";
    _("fileListHint").style.display = "none";
    _("fileListLoading").style.display = "";
    var dir = currentDir();
    let response = await fetch(`${dir}?api&type=list`);
    await response.json().then(data => {
        if (data.status == "GOOD") {
            console.log("Fetched file list:");
            console.log(data);
            // Build HTML
            var output = "";
            var totalSize = 0;
            window.fileObjects = [];
            var i = 0;
            data.files.forEach(f => {
                f.modifiedF = dateFormatRelative(f.modified);
                if (f.mimeType == "directory") {
                    f.sizeF = "-";
                } else {
                    f.sizeF = formattedSize(f.size);
                    totalSize += f.size;
                }
                output += `
                    <div class="row no-gutters fileEntry" tabindex=0 data-filename='${f.name}' data-objectindex=${i} onClick='fileEntryClicked(this)'>
                        <div class="col-auto fileEntryIcon material-icons"></div>
                        <div class="col fileEntryName">${f.name}</div>
                        <div class="col-auto fileEntryDate">${f.modifiedF}</div>
                        <div class="col-auto fileEntrySize">${f.sizeF}</div>
                    </div>
                `;
                window.fileObjects[i] = f;
                i++;
            });
            var loadElapsed = Date.now()-loadStart;
            var loadTimeF = loadElapsed+window.lang.dtUnitShortMs;
            if (loadElapsed >= 1000)
                var loadTimeF = roundSmart(loadElapsed/1000, 2)+window.lang.dtUnitShortSecs;
            if (data.files.length == 1) {
                _("fileListHint").innerHTML = window.lang.fileListDetails1Single.replace("%0", loadTimeF);
            } else {
                _("fileListHint").innerHTML = window.lang.fileListDetails1Multi.replace("%0", data.files.length).replace("%1", loadTimeF);
            }
            _("fileListHint").innerHTML += "<br>"+window.lang.fileListDetails2.replace("%0", formattedSize(totalSize));
            // Show elements
            _("fileList").innerHTML = output;
            _("fileListLoading").style.display = "none";
            _("fileList").style.display = "";
            _("fileListHint").style.display = "";
            window.canClickEntries = true;
        } else {
            console.log("Failed to fetch file list: "+data.status);
        }
    });
}

// Function to do stuff when a file entry is clicked
window.canClickEntries = true;
function fileEntryClicked(el) {
    document.activeElement.blur();
    if (!window.canClickEntries) {
        console.log("Can't click entries right now!");
        return;
    }
    console.log("File entry clicked:")
    var f = window.fileObjects[el.dataset.objectindex];
    console.log(f);
    // If this is a directory, move into it
    if (f.mimeType == "directory") {
        window.canClickEntries = false;
        updateAddressBar("CyberFiles", `${currentDir()}/${f.name}`.replace("//", "/"));
        loadFileList();
    }
}

// On load
window.onload = function() {
    document.getElementById("body").classList.remove("no-transitions");
    console.log("Page loaded at "+dateFormat(Date.now(), "%+H:%+M on %Y-%+m-%+d"))
    // Do this stuff initially
    loadFileList(currentDir());
};

</script>