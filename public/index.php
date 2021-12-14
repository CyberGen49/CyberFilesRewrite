<?php

define('document_root', $_SERVER['DOCUMENT_ROOT']);
require(document_root."/_cyberfiles/private/src/functions.php");

if (isset($_GET['api'])) new ApiCall($_GET);

// If this is a short link
if (isset($_GET['s']) and class_exists("SQLite3")) {
    $dbLnksPath = document_root."/_cyberfiles/private/shortLinks.db";
    $dbLnks = new SQLite3($dbLnksPath);
    $stmt = $dbLnks->prepare("SELECT path from entries where slug = :slug;");
    $stmt->bindValue(":slug", $_GET['s']);
    $result = $stmt->execute();
    $path = $result->fetchArray();
    $dbLnks->close();
    if ($path) {
        writeLog($lang['loggerTypeAccess'], str_replace(
            "%0", $_SERVER[$conf['logUserIpHeader']], str_replace(
            "%1", $_GET['s'], $lang['loggerShortLinkUsed']
        )));
        header("Location: ".str_replace(
            ['%'],
            ['%25'],
            $path['path']
        ));
    } else {
        header("Location: /?badShortLink");
    }
}

// Log access
writeLog($lang['loggerTypeAccess'], str_replace(
    "%0", $_SERVER[$conf['logUserIpHeader']], str_replace(
    "%1", "$dirRel/", $lang['loggerPageLoad']
)));

$webConf = [
    "pageTitle" => "",
    "pageDesc" => $conf['siteDesc'],
    "siteName" => $conf['siteName'],
    "favicon" => "/_cyberfiles/public/src/icon.png",
    "themeColour" => $theme['browserTheme'],
];

// Set dynamic page meta
$dirExpR = array_reverse(explode("/", $dir));
$webConf['pageTitle'] = $dirExpR[0];

// Check for a file preview
while (isset($_GET['f'])) {
    $webConf['pageTitle'] = urldecode($_GET['f']);
    $path = clean_path($dir.'/'.$_GET['f']);
    if (!file_exists($path)) break;
    if (is_dir($path)) break;
    $webConf['pageDesc'] = $lang['linkPreviewFileUncached'];
    // Get file details from the cache database
    $db = new SQLite3(document_root."/_cyberfiles/private/cache.db");
    $stmt = $db->prepare("SELECT * FROM fileCache where path = :path");
    $stmt->bindParam(":path", $path);
    $result = $stmt->execute();
    $cache = $result->fetchArray();
    $db->close();
    // If the file has cached details
    if ($cache) {
        $sizeF = formatted_size($cache['size']);
        $typeF = $lang['fileTypes']['fileTypeDefault'];
        $fileExt = strtoupper(pathinfo($path)['extension']);
        if ($fileExt !== '') {
            if (isset($lang['fileTypes'][$fileExt]))
                $typeF = $lang['fileTypes'][$fileExt];
            else
                $typeF = str_replace("%0", $fileExt, $lang['fileTypeExt']);
        }
        $webConf['pageDesc'] = "{$lang['fileDetailsType']}: $typeF\n{$lang['fileDetailsSize']}: $sizeF";
    }
    break;
}

?>
<!DOCTYPE html>
<html lang="en">
    <head>
        <?php
            // Append site name to page title and set meta title
            $webConf['metaTitle'] = $webConf['pageTitle'];
            if ($webConf['siteName'] != "") {
                $webConf['metaTitle'] = $webConf['siteName'];
                if ($webConf['pageTitle'] != "") {
                    $webConf['metaTitle'] = $webConf['pageTitle'];
                    $webConf['pageTitle'] = $webConf['pageTitle']." | ".$webConf['siteName'];
                } else {
                    $webConf['pageTitle'] = $webConf['siteName'];
                }
            }
        ?>
        <title><?= $webConf['siteName'] ?></title>
        <meta name="og:type" content="website">
        <meta name="og:site_name" content="<?= $webConf['siteName'] ?>">
        <meta name="og:title" content="<?= $webConf['metaTitle'] ?>">
        <meta name="og:description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="og:image" content="<?= $webConf['favicon'] ?>">
        <meta name="theme-color" content="<?= $webConf['themeColour'] ?>">
        <link rel="icon" href="<?= $webConf['favicon'] ?>">
        <meta name="mobile-web-app-capable" content="yes">
        <?php if (!isset($_GET['noManifest'])): ?>
            <link rel="manifest" href="/_cyberfiles/public/manifest.json">
        <?php endif ?>
        <meta charset="utf-8">
        <!-- Bootstrap -->
        <link rel="stylesheet" href="/_cyberfiles/public/src/bootstrap-grid.min.css">
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <!-- Normalize.css -->
        <link href="/_cyberfiles/public/src/normalize.min.css" rel="stylesheet">
        <!-- Material Icon Fonts -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
        <!-- Main CyberFiles CSS -->
        <link rel="stylesheet" href="/_cyberfiles/public/src/cyberfiles.css.php?t=<?= filemtime(document_root."/_cyberfiles/public/src/cyberfiles.css") ?>">
    </head>
    
    <body id="body" class="no-transitions">
        <div id="splash" class="ease-in-out-200ms">
            <div id="splashInner">
                <div id="splashIcon">
                    <img src="<?= $webConf['favicon'] ?>">
                </div>
                <div id="splashText"><?= $webConf['siteName'] ?></div>
            </div>
        </div>
        <nav id="topbar" class="row no-gutters flex-nowrap">
            <div class="col-auto d-flex align-items-center">
                <button id="topbarButtonUp" class="topbarButton disabled" onClick='fileEntryClicked(this, event)'>arrow_back</button>
            </div>
            <div id="topbarTitleContainer" class="col-auto d-flex align-items-center">
                <button id="topbarTitle"><?= $conf['siteName'] ?></button>
            </div>
            <div id="breadcrumbs" class="col row no-gutters"></div>
            <div class="col-auto d-flex align-items-center">
                <button id="topbarButtonMenu" class="topbarButton">more_vert</button>
            </div>
        </nav>
        <div id="fileListContainer" class="container">
            <div id="fileListFilterCont" class="row no-gutters">
                <div class="col">
                    <input id="fileListFilter" type="text" placeholder="<?= $lang['fileListFilterDisabled'] ?>" autocomplete="off" disabled>
                </div>
                <div class="col-auto">
                    <button id="fileListFilterClear" style="display: none;" title="<?= $lang['fileListFilterClear'] ?>">clear</button>
                </div>
            </div>
            <header id="directoryHeader" class="ease-in-out-100ms" style="display: none"></header>
            <nav id="fileListHeaders" class="row no-gutters">
                <div id="fileListHeaderIcon" class="fileListHeader col-auto"></div>
                <div id="fileListHeaderName" class="fileListHeader col fileListDesktop"><?= $lang['fileDetailsName'] ?><span id="sortIndicatorName" class="fileListSortIndicator material-icons"></span></div>
                <div id="fileListHeaderDate" class="fileListHeader col-auto fileListDesktop"><?= $lang['fileDetailsDate'] ?><span id="sortIndicatorDate" class="fileListSortIndicator material-icons"></span></div>
                <div id="fileListHeaderType" class="fileListHeader col-auto fileListDesktopBig"><?= $lang['fileDetailsType'] ?><span id="sortIndicatorType" class="fileListSortIndicator material-icons"></span></div>
                <div id="fileListHeaderSize" class="fileListHeader col-auto fileListDesktop"><?= $lang['fileDetailsSize'] ?><span id="sortIndicatorSize" class="fileListSortIndicator material-icons"></span></div>
                <div id="fileListHeaderMobile" class="fileListHeader col fileListMobile"><?= $lang['fileListColumnGeneric'] ?></div>
            </nav>
            <div id="fileListLoading">
                <div class="mdSpinner">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="20" />
                    </svg>
                </div>
            </div>
            <div id="fileList" class="ease-in-out-100ms"></div>
            <footer id="fileListHint" class="ease-in-out-100ms noBoost"></footer>
        </div>
        <div id="previewContainer" class="ease-in-out-100ms" style="display: none; opacity: 0;">
            <div id="previewTopbar" class="row no-gutters flex-nowrap">
                <div id="previewButtonCloseCont" class="col-auto d-flex align-items-center">
                    <button id="previewButtonClose" class="previewTopbarButton" onClick='hideFilePreview()'>close</button>
                </div>
                <div id="previewTitleContainer" class="col">
                    <span id="previewFileName">-</span>
                    <span id="previewFileDesc">-</span>
                </div>
                <div class="col-auto d-flex align-items-center">
                    <button id="previewPrev" class="previewTopbarButton">arrow_back</button>
                </div>
                <div class="col-auto d-flex align-items-center">
                    <button id="previewNext" class="previewTopbarButton">arrow_forward</button>
                </div>
                <!-- <div class="col-auto d-flex align-items-center fileListDesktop">
                    <button id="previewButtonDownload" class="previewTopbarButton">download</button>
                </div> -->
                <div class="col-auto d-flex align-items-center">
                    <button id="previewButtonMenu" class="previewTopbarButton">more_vert</button>
                </div>
            </div>
            <div id="previewFile" class="ease-in-out-100ms"></div>
        </div>

        <div id="tooltip" style="display: none;"></div>

        <noscript>
            <div id="popupNoJs" class="popupBackground ease-in-out-100ms">
                <div class="popupCard">
                    <div class="popupTitle"><?= $lang['popupErrorTitle'] ?></div>
                    <div class="popupContent">
                        <p><?= $lang['popupNoJsDesc'] ?></p>
                    </div>
                    <div class="popupActions">
                        <a class="popupButton no-transitions-exclude" href="https://www.enablejavascript.io/" target="_blank"><?= $lang['popupHelp'] ?></a>
                        <a class="popupButton no-transitions-exclude" href=""><?= $lang['popupReload'] ?></a>
                    </div>
                </div>
            </div>
        </noscript>

        <!-- Main CyberFiles JS -->
        <script src="/_cyberfiles/public/src/cyberfiles.js?t=<?= filemtime(document_root."/_cyberfiles/public/src/cyberfiles.js") ?>"></script>
        <!-- Marked -->
        <script src="/_cyberfiles/public/src/marked.min.js"></script>
        <!-- DynamicVirtualScroll -->
        <!-- <script src="/_cyberfiles/public/src/DynamicVirtualScroll.js"></script> -->
        <!-- https://github.com/farzher/fuzzysort -->
        <script src="/_cyberfiles/public/src/fuzzysort.js"></script>
    </body>
</html>