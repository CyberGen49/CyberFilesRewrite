<?php

define('document_root', $_SERVER['DOCUMENT_ROOT']);

require(document_root."/_cyberfiles/private/src/functions.php");
try {
    $conf = yaml_parse_file(document_root."/_cyberfiles/private/config.yml");
    $theme = $conf['theme'];
} catch (\Throwable $th) {
    print("CyberFiles requires the php_yaml extension. Install the extension and reload to continue.");
    exit;
}

$webConf = [
    "pageTitle" => "",
    "pageDesc" => $conf['siteDesc'],
    "siteName" => $conf['siteName'],
    "favicon" => "/_cyberfiles/public/icon.png",
    "themeColour" => $theme['accent'],
];

// Handle API requests
if (isset($_GET['api'])) {
    $data = [];
    // Do something based on the request type
    if ($_GET['get'] == "list") {
        // Should return a list of files and their details
        $data['status'] = "UNFINISHED";
    } else if ($_GET['get'] == "file") {
        // Should return the details of a single file, along with the relative next and previous files
        $data['status'] = "UNFINISHED";
    } else {
        $data['status'] = "INVALID_ACTION";
    }
    // Send the data
    header('Content-Type: application/json');
    print(json_encode($data));
    exit;
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
        <title><?= $webConf['pageTitle'] ?></title>
        <meta name="og:type" content="website">
        <meta name="og:site_name" content="<?= $webConf['siteName'] ?>">
        <meta name="og:title" content="<?= $webConf['metaTitle'] ?>">
        <meta name="og:description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="description" content="<?= $webConf['pageDesc'] ?>">
        <meta name="og:image" content="<?= $webConf['favicon'] ?>">
        <meta name="theme-color" content="<?= $webConf['themeColour'] ?>">
        <link rel="icon" href="<?= $webConf['favicon'] ?>">
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
        
    </body>
</html>