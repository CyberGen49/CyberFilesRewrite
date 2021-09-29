<?php

// CyberFiles CSS Parser
// This script parses the theme placeholders in cyberfiles.css, and is what's
// actually requested by the client
// To the client, this file is no different than a normal CSS file

header("Content-Type: text/css");

define('document_root', $_SERVER['DOCUMENT_ROOT']);
require(document_root."/_cyberfiles/private/src/functions.php");

$theme = array_merge($theme, [
    'mobDirHeaderMarginBottom' => "initial",
    'mobFileListHeadersDisplay' => "initial",
    'mobFileListHeadersMarginBottom' => "initial",
    'mobFileListHintMarginTop' => "initial",
    'mobFileEntryBorder' => "initial",
]);
if (!$conf['mobileFileListBorders']) {
    $theme = array_merge($theme, [
        'mobDirHeaderMarginBottom' => "15px",
        'mobFileListHeadersDisplay' => "none",
        'mobFileListHeadersMarginBottom' => "5px",
        'mobFileListHintMarginTop' => "15px",
        'mobFileEntryBorder' => "none",
    ]);
}

$out = file_get_contents(document_root."/_cyberfiles/public/src/cyberfiles.css");
$vars = preg_match_all("/var\(--([a-zA-Z0-9]+)\)/", $out, $matches, PREG_PATTERN_ORDER);
$replacements = [];
$targets = [];
foreach ($matches[1] as $m) {
    $targets[] = "var(--$m)";
    $replacements[] = $theme[$m];
}
$out = str_replace($targets, $replacements, $out);
print($out);

?>