<?php

define('document_root', $_SERVER['DOCUMENT_ROOT']);
require(document_root."/_cyberfiles/private/src/functions.php");
try {
    // Import config
    $conf = yaml_parse_file(document_root."/_cyberfiles/private/config.yml");
    $themeDef = yaml_parse_file(document_root."/_cyberfiles/private/themes/Default.yml");
    $theme = yaml_parse_file(document_root."/_cyberfiles/private/themes/{$conf['theme']}.yml");
    array_merge($themeDef, $theme);
    // Parse variables within theme variables
    foreach (array_keys($theme) as $v) {
        if (preg_match("/\+(.*)/", $theme[$v], $matches)) {
            $theme[$v] = $theme[$matches[1]];
        }
    }
    // Import language
    $lang = yaml_parse_file(document_root."/_cyberfiles/private/lang/en.yml");
    if ($conf['language'] != "en") {
        if (file_exists(document_root."/_cyberfiles/private/lang/${$conf['language']}.yml")) {
            $lang = array_merge($lang, yaml_parse_file(document_root."/_cyberfiles/private/lang/${$conf['language']}.yml"));
        } else {
            trigger_error("[CyberFiles] Failed to load a nonexistent language file. Check your config.", E_USER_WARNING);
        }
    }
} catch (\Throwable $th) {
    print("CyberFiles requires the php_yaml extension. Install the extension and reload to continue.");
    exit;
}

if (isset($_GET['api'])) {
    new ApiCall($_GET, $conf);
}

$webConf = [
    "pageTitle" => "",
    "pageDesc" => $conf['siteDesc'],
    "siteName" => $conf['siteName'],
    "favicon" => "/_cyberfiles/public/icon.png",
    "themeColour" => $theme['browserTheme'],
];

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
        <title><?= $webConf['pageTitle'] ?></title>
        <meta name="og:type" content="website">
        <meta name="og:site_name" content="<?= $webConf['siteName'] ?>">
        <meta name="og:title" content="<?= $webConf['metaTitle'] ?>">
        <meta name="og:description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="og:image" content="<?= $webConf['favicon'] ?>">
        <meta name="theme-color" content="<?= $webConf['themeColour'] ?>">
        <link rel="icon" href="<?= $webConf['favicon'] ?>">
        <meta name="mobile-web-app-capable" content="yes">
        <meta charset="utf-8">
        <!-- Bootstrap -->
        <link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/4.0.0/css/bootstrap.min.css" integrity="sha384-Gn5384xqQ1aoWXA+058RXPxPg6fy4IWvTNh0E263XmFcJlSAwiGgFAW/dAiS6JXm" crossorigin="anonymous">
        <script src="https://code.jquery.com/jquery-3.5.1.slim.min.js" integrity="sha384-DfXdz2htPH0lsSSs5nCTpuj/zy4C+OGpamoFVy38MVBnE+IbbVYUew+OrCXaRkfj" crossorigin="anonymous"></script>
        <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.6.0/dist/js/bootstrap.bundle.min.js" integrity="sha384-Piv4xVNRyMGpqkS2by6br4gNJ7DXjqk09RmUpJ8jgGtD7zP9yug3goQfGII0yAns" crossorigin="anonymous"></script>
        <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no">
        <!-- Normalize.css -->
        <link href="https://cdnjs.cloudflare.com/ajax/libs/normalize/8.0.1/normalize.min.css" rel="stylesheet">
        <!-- Material Icon Fonts -->
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
        <link href="https://fonts.googleapis.com/icon?family=Material+Icons+Outlined" rel="stylesheet">
    </head>
    
    <?php try_require(document_root."/_cyberfiles/private/src/css.php") ?>
    
    <body id="body" class="no-transitions">
        <div id="topbar" class="row no-gutters flex-nowrap">
            <div class="col-auto d-flex align-items-center topbarButtonContainer">
                <a id="topbarButtonUp" class="topbarButton disabled" onClick='fileEntryClicked(this, event)'>arrow_back</a>
            </div>
            <div id="topbarTitleContainer" class="col-auto d-flex align-items-center">
                <a id="topbarTitle" title="<?= $lang['topbarTitleTooltip'] ?>"><?= $conf['siteName'] ?></a>
            </div>
        </div>
        <div id="fileListContainer" class="container">
            <input id="fileListFilter" type="text" placeholder="<?= $lang['fileListFilterDisabled'] ?>" autocomplete="off" disabled>
            <div id="fileListHeaders" class="row no-gutters">
                <div id="fileListHeaderIcon" class="fileListHeader col-auto"></div>
                <div id="fileListHeaderName" class="fileListHeader col fileListDesktop"><?= $lang['fileDetailsName'] ?></div>
                <div id="fileListHeaderDate" class="fileListHeader col-auto fileListDesktop"><?= $lang['fileDetailsDate'] ?></div>
                <div id="fileListHeaderSize" class="fileListHeader col-auto fileListDesktop"><?= $lang['fileDetailsSize'] ?></div>
                <div id="fileListHeaderMobile" class="fileListHeader col fileListMobile"><?= $lang['fileListColumnGeneric'] ?></div>
            </div>
            <div id="fileListLoading">
                <div class="mdSpinner">
                    <svg viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="20" />
                    </svg>
                </div>
            </div>
            <div id="fileList" class="ease-in-out-100ms"></div>
            <div id="fileListHint" class="ease-in-out-100ms"></div>
        </div>
        <div id="previewContainer"></div>

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

        <?php try_require(document_root."/_cyberfiles/private/src/js.php") ?>
    </body>
</html>