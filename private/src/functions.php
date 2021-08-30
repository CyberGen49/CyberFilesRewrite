<?php

/**
 * Requires a file and outputs an error if it fails
 *
 * @param string $file
 * @return void
 */
function try_require(string $file) {
    try {
        require($file);
    } catch (\Throwable $th) {
        print("CyberFiles error: Failed to include \"$file\"");
        exit;
    }
}

/**
 * Cleans a file path to match a consistent format:
 * * Backslashes are replaced with forward slashes
 * * Paths will always have a leading slash, and never have a trailing one
 *
 * @param string $path The source path
 * @param array|null $arrayStore If passed, each path segment will be stored in this array
 * @return string The cleaned path
 */
function clean_path(string $path, ?array &$arrayStore):string {
    $path = str_replace("\\", "/", $path);
    $tmp = explode("/", $path);
    $arrayStore = [];
    foreach ($tmp as $a) {
        if ($a != "") $arrayStore[] = $a;
    }
    return $path;
}

?>