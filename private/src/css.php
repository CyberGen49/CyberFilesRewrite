<?php global $theme; ?>
<style>

/* Import fonts */
@import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@100;200;300;400;500;600;700;800;900&family=Open+Sans:wght@300;400;600;700;800&display=swap');

* {
    font-family: "Open Sans", sans-serif;
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
    background: <?= $theme['accent'] ?>;
    z-index: 10;
    user-select: none;
}

#topbarTitle {
    font-family: "Montserrat", sans-serif;
    font-size: 24px;
    font-weight: bold;
    color: <?= $theme['fg'] ?>;
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
    margin-top: 85px;
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

.fileListHeader {
    font-size: 13px;
    color: <?= $theme['fg2'] ?>;
    padding: 8px;
}

#fileListHeaderIcon, .fileEntryIcon {
    width: 70px;
}

#fileListHeaderDate, .fileEntryDate {
    width: 170px;
}

#fileListHeaderSize, .fileEntrySize {
    width: 80px;
}

.fileEntryIcon,
.fileEntryName,
.fileEntryDate,
.fileEntrySize {
    padding: 8px;
}

#fileListHint {
    margin-top: 20px;
    font-size: 13px;
    color: <?= $theme['fg2'] ?>;
    text-align: center;
}

#fileList {
    user-select: none;
}

/* Custom placeholder text colour */
::placeholder {
    color: <?= $theme['fg3'] ?>;
    opacity: 1;
}
    
/* Disables transitions for all child elements */
.no-transitions *:not(.no-transitions-exclude) {
    -webkit-transition: none !important;
    -moz-transition: none !important;
    -ms-transition: none !important;
    -o-transition: none !important;
    transition: none !important;
}

</style>