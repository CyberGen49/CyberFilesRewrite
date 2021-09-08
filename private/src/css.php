<?php
global $theme;
/*

READ ME FIRST!
Before everyone screams at me about using CSS this way (putting it in a PHP file and including it in the main script), know that the reason for this is to allow the use of theme variables set in the config to be used here in the styling.

*/
?>
<style>

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;600;700;800&display=swap');

* {
    font-family: "Segoe UI", "Open Sans", "Roboto", sans-serif;
    color: <?= $theme['fg'] ?>;
}

body {
    background: <?= $theme['bg'] ?>;
    padding: 0px;
    margin: 0px;
}

a:hover, a:focus {
    text-decoration: none;
}

#topbar {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 55px;
    width: 100%;
    padding: 0px 20px;
    background: <?= $theme['bgTopbar'] ?>;
    border-bottom: 1px solid <?= $theme['topbarBorder'] ?>;
    z-index: 10;
    user-select: none;
}

#topbarTitle {
    font-family: "Montserrat", sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: <?= $theme['fgTopbar'] ?>;
    padding: 5px;
    transition: 0.1s ease-in-out;
}
#topbarTitle:hover, #topbarTitle:focus {
    opacity: 70%;
    color: inherit;
    text-decoration: none;
    cursor: default;
}

#fileListContainer {
    max-width: 1000px;
    margin-top: 80px;
}

#fileListFilter {
    width: 100%;
    padding: 10px 16px;
    margin-bottom: 20px;
    background: rgba(0, 0, 0, 0);
    border: none;
    border-bottom: 2px solid <?= $theme['bg2'] ?>;
    border-radius: 4px 4px 0px 0px;
    outline: none;
    font-family: "Open Sans";
    font-size: 15px;
    color: <?= $theme['fg'] ?>;
    transition: 0.1s ease-in-out;
    user-select: none;
}

#fileListFilter:focus {
    background: <?= $theme['bg2'] ?>;
    border-bottom: 2px solid <?= $theme['accent'] ?>;
}

#fileListHeaders {
    border-bottom: 1px solid <?= $theme['fileSep'] ?>;
    user-select: none;
}

.fileEntryIcon,
.fileEntryName,
.fileEntryDate,
.fileEntrySize,
.fileListHeader {
    padding: 7px 15px 8px 15px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

#fileListHeaderIcon, .fileEntryIcon {
    width: 50px;
}

#fileListHeaderDate, .fileEntryDate {
    width: 170px;
}

#fileListHeaderSize, .fileEntrySize {
    width: 80px;
}

#fileList {
    user-select: none;
}

.fileEntry {
    border-bottom: 1px solid <?= $theme['fileSep'] ?>;
    font-size: 14px;
    cursor: default;
}

.fileEntry:hover,
.fileEntry:focus {
    background: <?= $theme['fileH'] ?>;
    border-color: rgba(0, 0, 0, 0);
}

.fileEntry:active {
    background: <?= $theme['fileC'] ?>;
    border-color: rgba(0, 0, 0, 0);
}

.fileEntryIcon {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 0px;
    font-family: "Material Icons Outlined", "Material Icons";
    font-size: 22px;
    color: <?= $theme['fg2'] ?>;
    text-overflow: clip;
}

.fileListHeader {
    font-size: 13px;
    color: <?= $theme['fg2'] ?>;
}

#fileListHint {
    margin: 20px 0px;
    font-size: 14px;
    color: <?= $theme['fg2'] ?>;
    text-align: center;
}

/* Custom placeholder text colour */
::placeholder {
    color: <?= $theme['fg3'] ?>;
    opacity: 1;
}

/* Custom scrollabrs */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-thumb {
    background: <?= $theme['scrollbar'] ?>;
}

::-webkit-scrollbar-thumb:hover {
    background: <?= $theme['scrollbarH'] ?>;
}

::-webkit-scrollbar-thumb:active {
    background: <?= $theme['scrollbarC'] ?>;
}
    
/* Disables transitions for all child elements */
.no-transitions *:not(.no-transitions-exclude) {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
}

/*

** Material Design Spinner **

<div class="mdSpinner">
    <svg viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="20" />
    </svg>
</div>

*/

.mdSpinner {
    width: 90px;
    height: 90px;
    margin: 0 auto;
}

.mdSpinner svg {
    animation: mdSpin-rotate 1.2s linear infinite;
    height: 100%;
    width: 100%;
}

.mdSpinner circle {
    stroke-dasharray: 1,200;
    stroke-dashoffset: 0;
    animation: mdSpin-dash 1.2s ease-in-out infinite 0s;
    stroke-linecap: round;
    fill: none;
    stroke: <?= $theme['fg2'] ?>;
    stroke-width: 5;
}

@keyframes mdSpin-rotate {
    100% {
        -webkit-transform: rotate(360deg);
                transform: rotate(360deg);
    }
}
@keyframes mdSpin-dash {
    0% {
        stroke-dasharray: 1,200;
        stroke-dashoffset: 0;
    }
    50% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -35;
    }
    100% {
        stroke-dasharray: 89,200;
        stroke-dashoffset: -124;
    }
}

</style>