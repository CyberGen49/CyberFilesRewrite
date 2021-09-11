<?php
global $conf, $theme;
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
    font-size: 15px;
    color: <?= $theme['fg'] ?>;
}

body {
    background: <?= $theme['bg'] ?>;
    padding: 0px;
    margin: 0px;
}

p, .paragraph {
    margin: 0px;
    padding: 0px;
    padding-bottom: 5px;
    text-size-adjust: none;
    font-size: 15px !important;
}

a {
    color: <?= $theme['hyperlink'] ?>;
    text-decoration: none;
}

a:hover, a:focus {
    color: <?= $theme['hyperlinkH'] ?>;
    text-decoration: underline;
}

#topbar {
    position: fixed;
    top: 0px;
    left: 0px;
    height: 55px;
    width: 100%;
    padding: 0px 15px;
    background: <?= $theme['bgTopbar'] ?>;
    border-bottom: 1px solid <?= $theme['topbarBorder'] ?>;
    z-index: 10;
    user-select: none;
    transition: 0.1s ease-in-out;
}

#topbar.shadow {
    box-shadow: 0px -20px 15px 14px rgba(0,0,0,0.7);
}

#topbarTitle {
    margin-top: 2px;
    padding: 5px;
    font-family: "Montserrat", sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: <?= $theme['fgTopbar'] ?>;
    transition: 0.1s ease-in-out;
}
#topbarTitle:hover, #topbarTitle:focus {
    color: <?= $theme['fgTopbarH'] ?>;
    text-decoration: none;
    cursor: default;
}

.topbarButton {
    line-height: 100%;
    padding: 8px;
    font-family: "Material Icons Outlined", "Material Icons";
    font-size: 28px;
    color: <?= $theme['fgTopbar'] ?> !important;
    border-radius: 20px;
    transition: 0.1s ease-in-out;
}

.topbarButton:hover:not(.disabled),
.topbarButton:focus:not(.disabled) {
    background: <?= $theme['bgTopbarButtonH'] ?>;
    color: <?= $theme['fgTopbarH'] ?>;
    text-decoration: none;
    cursor: default;
}

.topbarButton.disabled {
    opacity: 50%;
}

#topbarButtonUp {
    margin-right: 5px;
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
    border-bottom: 2px solid <?= $theme['filterBarBottom'] ?>;
    border-radius: 4px 4px 0px 0px;
    outline: none;
    font-family: "Open Sans";
    font-size: 15px;
    color: <?= $theme['filterBarText'] ?>;
    transition: 0.1s ease-in-out;
    user-select: none;
}

#fileListFilter:focus {
    background: <?= $theme['filterBarBgF'] ?>;
    border-bottom: 2px solid <?= $theme['filterBarBottomF'] ?>;
}

#fileListHeaders {
    border-bottom: 1px solid <?= $theme['fileSep'] ?>;
    user-select: none;
}

.fileListMobile { display: none; }
.fileListDesktop { display: inherit; }

.fileEntryIcon,
.fileEntryName,
.fileEntryDate,
.fileEntrySize,
.fileListHeader {
    padding: 7px 15px 8px 15px;
    font-size: 14px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.fileEntryNameInner {
    font-size: 14px;
    padding-right: 10px;
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
}

.fileListHeader {
    font-size: 13px;
    color: <?= $theme['fileListHeaders'] ?>;
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
    text-decoration: none !important;
}

.fileEntryName {
    color: <?= $theme['fileNameCol'] ?>;
}

.fileEntryDate {
    color: <?= $theme['fileDateCol'] ?>;
}

.fileEntrySize {
    color: <?= $theme['fileSizeCol'] ?>;
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
    color: <?= $theme['fileIcon'] ?>;
    text-overflow: clip;
}

.fileEntryMobileDetails {
    color: <?= $theme['fileDateMobile'] ?>;
}

#fileListHint {
    margin: 25px 0px;
    font-size: 14px;
    color: <?= $theme['fileListFooter'] ?>;
    text-align: center;
}

.popupBackground {
    position: fixed;
    display: flex;
    top: 0px;
    left: 0px;
    width: 100%;
    height: 100%;
    padding: 10px;
    overflow-x: hidden;
    overflow-y: scroll;
    background: rgba(0, 0, 0, 0.5);
    z-index: 50;
}

.popupCard {
    margin: auto;
    max-width: 500px;
    padding: 15px 20px;
    background: <?= $theme['bgPopup'] ?>;
    border-radius: 12px;
    box-shadow: 0px 4px 20px 8px rgba(0,0,0,0.3);
}

.popupTitle {
    font-family: "Montserrat", "Segoe UI", sans-serif;
    font-weight: bold;
    font-size: 20px;
    color: <?= $theme['fgPopup'] ?>;
    padding-bottom: 5px;
}

.popupContent {
    color: <?= $theme['fgPopup'] ?>;
}

.popupContent p:last-of-type {
    padding-bottom: 0px;
    margin-bottom: 0px;
}

.popupActions {
    margin: -5px -10px;
    padding-top: 15px;
    display: flex;
    justify-content: right;
    flex-wrap: wrap;
    user-select: none;
}

.popupButton {
    line-height: 100%;
    margin: 1px;
    padding: 12px 14px;
    font-family: "Montserrat", "Segoe UI", sans-serif;
    font-weight: bold;
    font-size: 15px;
    color: <?= $theme['fgPopupButton'] ?>;
    border-radius: 6px;
    cursor: default;
    transition: 0.1s ease-in-out;
}

.popupButton:hover,
.popupButton:focus {
    background: <?= $theme['bgPopupButtonH'] ?>;
    color: <?= $theme['fgPopupButton'] ?>;
    text-decoration: none;
}

.popupButton:active {
    background: <?= $theme['bgPopupButtonC'] ?>;
    color: <?= $theme['fgPopupButton'] ?>;
}

@media only screen and (max-width: 600px) {
    #topbarTitle {
        font-size: 22px;
    }

    #fileListFilter {
        padding-top: 12px;
        padding-bottom: 12px;
    }

    .fileListMobile { display: inherit; }
    .fileListDesktop { display: none; }

    #fileList,
    #fileListHeaders {
        margin-left: -15px;
        margin-right: -15px;
    }

    .fileListHeader {
        font-size: 14px;
    }

    .fileEntry {
        border: <?php if (!$conf['mobileFileListBorders']) print("none"); else print("inherit"); ?>;
    }

    #fileListHeaderIcon, .fileEntryIcon {
        width: 60px;
    }
    .fileEntryIcon {
        font-size: 26px;
    }

    .fileEntryName {
        padding: 11px 15px 11px 15px;
    }
    .fileEntryNameInner {
        font-size: 15px;
    }
}

/* Transition animation classes */
.ease-in-out-100ms {
    transition: 0.1s ease-in-out;
}

/* Custom placeholder text colour */
::placeholder {
    color: <?= $theme['textboxPlaceholder'] ?>;
    opacity: 1;
}

/* Custom scrollabrs */
::-webkit-scrollbar {
    width: 10px;
}

::-webkit-scrollbar-thumb {
    background: <?= $theme['scrollbar'] ?>;
    border-radius: 3px;
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
    stroke: <?= $theme['loadingSpinner'] ?>;
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