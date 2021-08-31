<script>

// On load
window.onload = function() {
    document.getElementById("body").classList.remove("no-transitions");
};

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

// To change addressbar without reloading
// window.history.pushState("", "Title", "/new-url");

// To get the current path
// window.location.pathname

</script>