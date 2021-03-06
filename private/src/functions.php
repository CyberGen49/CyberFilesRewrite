<?php

// CyberFiles PHP functions
// See the APICall class at the bottom for the CyberFiles API

// CyberFiles version
$version = 'v1.17.4';

// Get relative and absolute directory paths
$dirRel = clean_path(rawurldecode(explode("?", $_SERVER['REQUEST_URI'])[0]));
$dir = clean_path(document_root.$dirRel);

// Try to include configs
try {
    // Import config
    $conf = yaml_parse_file(document_root."/_cyberfiles/private/config.yml");
    if (file_exists(document_root."/_cyberfiles/private/configUser.yml"))
        $conf = array_merge($conf, yaml_parse_file(document_root."/_cyberfiles/private/configUser.yml"));
    // Set siteName correctly
    if ($conf['siteName'] == "") $conf['siteName'] = $_SERVER['SERVER_NAME'];
    // Import theme
    $themeDef = yaml_parse_file(document_root."/_cyberfiles/private/themes/Default.yml");
    $userTheme = document_root."/_cyberfiles/private/themes/{$conf['theme']}.yml";
    if (isset($_COOKIE['theme'])) {
        $cookieTheme = str_replace(["/", "\\"], "", $_COOKIE['theme']);
        if ($conf['theme'] == $cookieTheme) setcookie("theme", '', -3600, '/');
        else $userTheme = document_root."/_cyberfiles/private/themes/{$cookieTheme}.yml";
    }
    if (file_exists($userTheme)) {
        $theme = yaml_parse_file($userTheme);
        $theme = array_merge($themeDef, $theme);
    } else $theme = $themeDef;
    // Parse variables within theme variables
    foreach (array_keys($theme) as $v) {
        if (preg_match("/\+(.*)/", $theme[$v], $matches)) {
            $theme[$v] = $theme[$matches[1]];
        }
    }
    // Import language
    $langDef = yaml_parse_file(document_root."/_cyberfiles/private/lang/en.yml");
    $userLang = document_root."/_cyberfiles/private/lang/{$conf['language']}.yml";
    if (isset($_COOKIE['lang'])) {
        $cookieLang = str_replace(["/", "\\"], "", $_COOKIE['lang']);
        if ($conf['language'] == $cookieLang) setcookie("lang", '', -3600, '/');
        else $userLang = document_root."/_cyberfiles/private/lang/{$cookieLang}.yml";
    }
    if (file_exists($userLang)) {
        $lang = yaml_parse_file($userLang);
        $lang = array_merge($langDef, $lang);
    } else $lang = $langDef;
    // Get theme list
    $scandir = scandir(document_root."/_cyberfiles/private/themes");
    $themes = [];
    foreach ($scandir as $t) {
        if ($t == "." || $t == "..") continue;
        $path = document_root."/_cyberfiles/private/themes/${t}";
        $content = yaml_parse_file($path);
        $themes[] = [
            'file' => pathinfo($path)['filename'],
            'name' => $content['name'],
            'desc' => $content['desc'],
        ];
    }
    // Get language list
    $scandir = scandir(document_root."/_cyberfiles/private/lang");
    $languages = [];
    foreach ($scandir as $t) {
        if ($t == "." || $t == "..") continue;
        $path = document_root."/_cyberfiles/private/lang/${t}";
        $content = yaml_parse_file($path);
        $languages[] = [
            'file' => pathinfo($path)['filename'],
            'name' => $content['name'],
        ];
    }
} catch (\Throwable $th) {
    print("CyberFiles requires the php_yaml extension. Install the extension and reload to continue.");
    exit;
}

// Update web manifest
$manifest = [];
$manifest['name'] = $conf['siteName'];
$manifest['short_name'] = $conf['siteName'];
$manifest['start_url'] = '/';
$manifest['display'] = 'standalone';
$manifest['background_color'] = $themeDef['bg'];
$manifest['description'] = $conf['siteDesc'];
$manifest['icons'] = [
    [
        "src" => '/_cyberfiles/public/src/icon.png',
        "sizes" => '256x256',
        "type" => 'image/png',
    ]
];
file_put_contents(document_root."/_cyberfiles/public/manifest.json", json_encode($manifest));

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
function clean_path(string $path, array &$arrayStore = []):string {
    $path = str_replace("\\", "/", $path);
    while (strpos($path, "//") !== false)
        $path = str_replace("//", "/", $path);
    $tmp = explode("/", $path);
    $arrayStore = [];
    $path = "";
    foreach ($tmp as $a) {
        if ($a != "") {
            $arrayStore[] = $a;
            $path .= "/$a";
        }
    }
    return $path;
}

/**
 * Returns the properly formatted size string from a number of bytes
 *
 * @param float $bytes A number of bytes
 * @return string The formatted size representation
 * 
 * Bytes and KB are returned with no decimal places, MB with one decimal place, and GB and above with two decimal places.
 */
function formatted_size(float $bytes = 0):string {
    $bytes = floatval($bytes);
    $fileSizeSuffix = "Bytes";
    $decimalPlaces = 0;
    if ($bytes >= 1000) {
        $bytes /= 1024;
        $fileSizeSuffix = "KB";
    }
    if ($bytes >= 1000) {
        $bytes /= 1024;
        $fileSizeSuffix = "MB";
        $decimalPlaces = 1;
    }
    if ($bytes >= 1000) {
        $bytes /= 1024;
        $fileSizeSuffix = "GB";
        $decimalPlaces = 2;
    }
    if ($bytes >= 1000) {
        $bytes /= 1024;
        $fileSizeSuffix = "TB";
        $decimalPlaces = 2;
    }
    return number_format($bytes, $decimalPlaces) . " " . $fileSizeSuffix;
}

/**
 * Returns the type of error associated with an error type ID
 *
 * @param int $type
 * @return string
 */
function error_name_by_id(int $type):string {
    switch($type) {
        case E_ERROR: // 1 //
            return 'E_ERROR';
        case E_WARNING: // 2 //
            return 'E_WARNING';
        case E_PARSE: // 4 //
            return 'E_PARSE';
        case E_NOTICE: // 8 //
            return 'E_NOTICE';
        case E_CORE_ERROR: // 16 //
            return 'E_CORE_ERROR';
        case E_CORE_WARNING: // 32 //
            return 'E_CORE_WARNING';
        case E_COMPILE_ERROR: // 64 //
            return 'E_COMPILE_ERROR';
        case E_COMPILE_WARNING: // 128 //
            return 'E_COMPILE_WARNING';
        case E_USER_ERROR: // 256 //
            return 'E_USER_ERROR';
        case E_USER_WARNING: // 512 //
            return 'E_USER_WARNING';
        case E_USER_NOTICE: // 1024 //
            return 'E_USER_NOTICE';
        case E_STRICT: // 2048 //
            return 'E_STRICT';
        case E_RECOVERABLE_ERROR: // 4096 //
            return 'E_RECOVERABLE_ERROR';
        case E_DEPRECATED: // 8192 //
            return 'E_DEPRECATED';
        case E_USER_DEPRECATED: // 16384 //
            return 'E_USER_DEPRECATED';
    }
    return 'E_UNKNOWN';
}

/**
 * Returns a cryptographically secure pseudo-random hex string of any length, with the help of random_bytes
 *
 * @param integer $length The length to make the string
 * @return string The resulting string
 */
function unique_string(int $length = 8):string {
    return substr(bin2hex(random_bytes($length)), 0, $length);
}

date_default_timezone_set($conf['logTimezone']);
function writeLog(string $type, string $message, bool $error = false) {
    $logDir = document_root."/_cyberfiles/private/logs";
    if (!file_exists($logDir)) mkdir($logDir);
    $date = new DateTime();
    $formattedDate = $date->format("o-m-d H:i:s");
    if ($error)
        $fileName = $date->format("o-m-d").".errors.log";
    else
        $fileName = $date->format("o-m-d").".log";
    file_put_contents("$logDir/$fileName", "[$formattedDate] [$type] $message\n", FILE_APPEND);
}

function errorHandler(int $errno, string $errstr, string $errfile = null, int $errline = null) {
    global $lang;
    writeLog(
        str_replace(
            "%0", error_name_by_id($errno), $lang['loggerTypePhpError']
        ),
        str_replace(
            "%0", $errstr, str_replace(
            "%1", $errfile, str_replace(
            "%2", $errline, $lang['loggerPhpError']
        ))),
        true
    );
    return null;
}

set_error_handler('errorHandler');

/**
 * Handles CyberFiles API calls
 */
class ApiCall {
    function __construct($params) {
        // Set class variables
        $this->params = $params;
        $this->conf = $GLOBALS['conf'];
        $this->data = [];
        $this->startTime = (microtime(true)*1000);
        $this->indexDir = [];
        // Check for and build cache database
        if (class_exists("SQLite3")) {
            initCacheStart:
            $dbPath = document_root."/_cyberfiles/private/cache.db";
            $dbLnksPath = document_root."/_cyberfiles/private/shortLinks.db";
            // Open the databases
            $this->db = new SQLite3($dbPath);
            $db = &$this->db;
            $this->dbLnks = new SQLite3($dbLnksPath);
            $dbLnks = &$this->dbLnks;
            // Create the data table if it doesn't exist
            $db->query("CREATE TABLE IF NOT EXISTS 'data' (
                'key' text not null unique,
                'value' text not null
            );");
            // Get database version and wipe if necessary
            $versionTarget = "2";
            $result = $db->query("SELECT value
                from data
                where key = 'version';
            ");
            $version = $result->fetchArray(SQLITE3_NUM)[0];
            if (!isset($version) or $version !== $versionTarget) {
                writeLog($GLOBALS['lang']['loggerTypeGeneric'], str_replace(
                    "%0", $versionTarget, $GLOBALS['lang']['loggerCacheReset']
                ));
                if (!isset($version)) {
                    $db->query("REPLACE INTO data ('key', 'value')
                        values ('version', '$versionTarget');
                    ");
                } else {
                    unlink($dbPath);
                    goto initCacheStart;
                }
            }
            // Create the fileCache table if it doesn't exist
            $db->query("CREATE TABLE IF NOT EXISTS 'fileCache' (
                'path' text not null unique,
                'modified' integer not null,
                'size' integer not null,
                'mimeType' integer not null,
                'other' text
            );");
            // Create the short links table if it doesn't exist
            $dbLnks->query("CREATE TABLE IF NOT EXISTS 'entries' (
                'path' text not null unique,
                'slug' text not null unique
            );");
        }
        // Start the call
        $this->start();
    }
    // Pieces the call together and returns it to the client
    function start() {
        // Process request
        $params = $this->params;
        $conf = $this->conf;
        $data = &$this->data;
        while (true) {
            // Get relative and absolute directory paths
            $dirRel = $GLOBALS['dirRel'];
            $dir = $GLOBALS['dir'];
            // Log access
            writeLog($GLOBALS['lang']['loggerTypeAccess'], str_replace(
                "%0", $_SERVER[$conf['logUserIpHeader']], str_replace(
                "%1", "$dirRel/", str_replace(
                "%2", str_replace("api=", "", http_build_query($params)), $GLOBALS['lang']['loggerApiCall']
            ))));
            if ($params['get'] == "files") {
                // Make sure we're working with an existing directory
                if (!is_dir($dir)) {
                    $data['status'] = "DIRECTORY_NONEXISTENT";
                    break;
                }
                // Get directory short slug
                $data['shortSlug'] = $this->getShortSlug($dirRel);
                // Get directory contents
                $scandir = scandir($dir);
                natsort($scandir);
                $data['chunking']['totalFiles'] = 0;
                $data['chunking']['offset'] = 0;
                $data['chunking']['complete'] = true;
                // Check for header files
                if (file_exists("$dir/{$conf['headerFileNameMarkdown']}"))
                    $data['headerMarkdown'] = base64_encode(file_get_contents("$dir/{$conf['headerFileNameMarkdown']}"));
                if (file_exists("$dir/{$conf['headerFileNameHtml']}"))
                    $data['headerHtml'] = base64_encode(file_get_contents("$dir/{$conf['headerFileNameHtml']}"));
                // Skip scanning files if contents are hidden
                $data['files'] = [];
                if (file_exists("$dir/{$conf['hideContentsFile']}"))
                    goto skipFileScanning;
                // Loop through files and add
                $chunkingStart = time();
                $offset = 0;
                $data['chunking']['totalFiles'] = count($scandir);
                if (isset($params['offset'])) $offset = $params['offset'];
                for ($i = $offset; $i < count($scandir); $i++) {
                    $file = $scandir[$i];
                    if ($file == ".") continue;
                    if ($file == "..") continue;
                    // Check for chunking
                    $data['chunking']['offset'] = $i;
                    if (time() > ($chunkingStart+$GLOBALS['conf']['chunkInterval'])) {
                        $data['chunking']['complete'] = false;
                        break;
                    }
                    // Skip files that match hidden filters
                    foreach ($conf['hiddenFiles'] as $s) {
                        if (fnmatch($s, $file)) continue 2;
                    }
                    // If it's a directory, make sure it doesn't contain files that would make it hidden
                    $f = "$dir/$file";
                    if (is_dir($f)) {
                        $childDir = scandir($f);
                        foreach ($conf['hideDirWhenContains'] as $s) {
                            if (in_array($s, $childDir)) continue 2;
                        }
                    }
                    // Get the file object
                    $fileObject = $this->getFileObject($f);
                    if (is_dir($f))
                        $fileObject['shortSlug'] = $this->getShortSlug("$dirRel/$file");
                    else
                        $fileObject['shortSlug'] = $this->getShortSlug("$dirRel/?f=$file");
                    // Add the file object
                    $data['files'][] = $fileObject;
                    // Output something to the client
                    print(" ");
                    flush();
                    // Abort the script if the user has disconnected
                    if(connection_status() != CONNECTION_NORMAL) {
                        writeLog($GLOBALS['lang']['loggerTypeAccess'], $GLOBALS['lang']['loggerClientAbort']);
                        exit;
                    }
                }
                skipFileScanning:
                // Check for sort override files
                $data['sort']['type'] = "name";
                $data['sort']['desc'] = false;
                $data['sort']['type'] = $conf['defaultSort']['type'];
                $data['sort']['desc'] = $conf['defaultSort']['desc'];
                if (file_exists("$dir/{$conf['sortTriggers']['name']}"))
                    $data['sort']['type'] = "name";
                else if (file_exists("$dir/{$conf['sortTriggers']['date']}"))
                    $data['sort']['type'] = "date";
                else if (file_exists("$dir/{$conf['sortTriggers']['size']}"))
                    $data['sort']['type'] = "size";
                else if (file_exists("$dir/{$conf['sortTriggers']['ext']}"))
                    $data['sort']['type'] = "ext";
                if (file_exists("$dir/{$conf['sortTriggers']['desc']}"))
                    $data['sort']['desc'] = true;
                // Merge the arrays and finish
                $data['status'] = "GOOD";
            } else if ($params['get'] == "config") {
                $data['version'] = $GLOBALS['version'];
                $data['config'] = $GLOBALS['conf'];
                $data['lang'] = $GLOBALS['lang'];
                $data['theme'] = $GLOBALS['theme'];
                unset(
                    $data['config']['hiddenFiles'],
                    $data['config']['hideDirWhenContains'],
                    $data['config']['shortLinkSlugLength'],
                    $data['config']['logTimezone'],
                    $data['config']['logIpHeader'],
                    $data['config']['theme'],
                );
                $data['themes'] = $GLOBALS['themes'];
                $data['languages'] = $GLOBALS['languages'];
                $data['status'] = "GOOD";
            } else {
                $data['status'] = "INVALID";
            }
            break;
        }
        // Close the database if it's open
        if (isset($this->db)) $this->db->close();
        if (isset($this->dbLnks)) $this->dbLnks->close();
        // Set processing time
        if (isset($params['sendTime'])) $data['sendTime'] = $params['sendTime'];
        $data['processingTime'] = abs(ceil(microtime(true)*1000)-$this->startTime);
        // Send the data
        print(json_encode($data));
        exit;
    }

    // Returns a consistently structured file object
    function getFileObject($path) {
        $reindex = true;
        $file['path'] = $path;
        $file['name'] = pathinfo($path)['basename'];
        $file['modified'] = filemtime($path);
        $file['ext'] = '';
        if (isset(pathinfo($path)['extension']))
            $file['ext'] = strtoupper(pathinfo($path)['extension']);
        $file['thumbnail'] = null;
        $file['indexed'] = false;
        $file['other'] = [];
        // If the database is open
        if (isset($this->db)) {
            // Attempt to get the file's cache entry
            $db = &$this->db;
            $stmt = $db->prepare("SELECT * FROM 'fileCache' where path = :p");
            $stmt->bindValue(':p', $path, SQLITE3_TEXT);
            $result = $stmt->execute();
            $cache = $result->fetchArray(SQLITE3_ASSOC);
            if ($cache and $file['modified'] == $cache['modified']) {
                $reindex = false;
                $file['indexed'] = true;
                $file = array_merge($file, $cache);
                $file['other'] = json_decode($file['other'], true);
            }
        }
        // Get up to date file details if needed
        if ($reindex) {
            $file['size'] = filesize($path);
            $file['mimeType'] = mime_content_type($path);
            // Get extra metadata if applicable
            if (preg_match("/^(video)\/(.*)$/", $file['mimeType'])) {
                exec('ffprobe -v error -select_streams v:0 -show_entries format -show_entries stream -of json "'.$file['path'].'"', $tmp);
                $tmp = json_decode(implode('', $tmp), true);
                $file['other']['duration'] = $tmp['format']['duration'];
                $file['other']['width'] = $tmp['streams'][0]['width'];
                $file['other']['height'] = $tmp['streams'][0]['height'];
                $file['other']['fps'] = $tmp['streams'][0]['r_frame_rate'];
            } elseif (preg_match("/^(audio)\/(.*)$/", $file['mimeType'])) {
                exec('ffprobe -v error -show_entries format -show_entries stream -of json "'.$file['path'].'"', $tmp);
                $tmp = json_decode(implode('', $tmp), true);
                $file['other']['duration'] = $tmp['format']['duration'];
                $file['other']['sampleRate'] = $tmp['streams'][0]['sample_rate'];
            } elseif (preg_match("/^(image)\/(.*)$/", $file['mimeType'])) {
                exec('identify -format \'{"width": "%w", "height": "%h", "depth": "%q"}\' "'.$file['path'].'"', $tmp);
                $tmp = json_decode(implode('', $tmp), true);
                $file['other']['width'] = $tmp['width'];
                $file['other']['height'] = $tmp['height'];
                $file['other']['bitDepth'] = $tmp['depth'];
            }
            // If the database is open, update this file's cache
            if (isset($this->db)) {
                // Build SQL
                $stmt = $db->prepare("REPLACE INTO 'fileCache'
                    ('path', 'modified', 'size', 'mimeType', 'other')
                    values (:path, :mod, :size, :mimeType, :other)
                ;");
                // Bind variables
                $stmt->bindValue(':path', $file['path'], SQLITE3_TEXT);
                $stmt->bindValue(':mod', $file['modified'], SQLITE3_TEXT);
                $stmt->bindValue(':size', $file['size'], SQLITE3_TEXT);
                $stmt->bindValue(':mimeType', $file['mimeType'], SQLITE3_TEXT);
                $stmt->bindValue(':other', json_encode($file['other']), SQLITE3_TEXT);
                // Execute
                $result = $stmt->execute();
                // Log
                writeLog($GLOBALS['lang']['loggerTypeGeneric'], str_replace(
                    "%0", $path, $GLOBALS['lang']['loggerFileCached']
                ));
            }
        }
        // Create a thumbnail for the file if needed
        if (preg_match("/^(image|video)\/(.*)$/", $file['mimeType'])
          and $GLOBALS['conf']['generateThumbs']) {
            $thumbName = md5($file['path']).'.png';
            $thumbsDir = document_root."/_cyberfiles/public/thumbs";
            if (!file_exists($thumbsDir)) mkdir($thumbsDir);
            // Check if the thumbnail file doesn't exist or if the file is being recached
            if (!file_exists("$thumbsDir/$thumbName") or $reindex) {
                // Create thumbnail
                $thumbTime = (microtime(true)*1000);
                $thumbPath = document_root.'/_cyberfiles/public/thumbs/'.$thumbName;
                unlink($thumbPath);
                if (preg_match("/^image\/(.*)$/", $file['mimeType']))
                    $cmd = str_replace(["%0", "%1"], [$file['path'], $thumbPath], $GLOBALS['conf']['commands']['thumbImage']);
                if (preg_match("/^video\/(.*)$/", $file['mimeType']))
                    $cmd = str_replace(["%0", "%1"], [$file['path'], $thumbPath], $GLOBALS['conf']['commands']['thumbVideo'])."; ".str_replace(["%0", "%1"], [$thumbPath, $thumbPath], $GLOBALS['conf']['commands']['thumbImage']);
                trigger_error($cmd);
                exec($cmd);
                // Make sure the new thumb exists
                if (file_exists("$thumbsDir/$thumbName")) {
                    writeLog($GLOBALS['lang']['loggerTypeGeneric'], str_replace(
                        "%0", number_format(ceil(microtime(true)*1000)-$thumbTime, 2), str_replace(
                        "%1", $path, $GLOBALS['lang']['loggerThumbnailGenerated']
                    )));
                }
            }
            // Add thumbnail file name to object
            if (file_exists("$thumbsDir/$thumbName")) {
                $file['thumbnail'] = $thumbName;
            }
        }
        // Finish
        unset($file['path']);
        return $file;
    }

    // Sets/gets a short link slug for a path
    function getShortSlug($path) {
        if (class_exists("SQLite3")) {
            $dbLnks = $this->dbLnks;
            $stmt = $dbLnks->prepare("SELECT slug from entries where path = :path;");
            $stmt->bindValue(":path", $path);
            $result = $stmt->execute();
            $slug = $result->fetchArray();
            if (!$slug) {
                $i = 0;
                while (true) {
                    if ($i >= 10) {
                        // Log
                        writeLog($GLOBALS['lang']['loggerTypeError'], str_replace(
                            "%0", $path, $GLOBALS['lang']['loggerFailedShortLink']
                        ));
                        break;
                    }
                    $slug = unique_string($GLOBALS['conf']['shortLinkSlugLength']);
                    $stmt = $dbLnks->prepare("INSERT INTO entries (path, slug) VALUES (:path, :slug);");
                    $stmt->bindValue(":path", $path);
                    $stmt->bindValue(":slug", $slug);
                    $result = $stmt->execute();
                    if ($result) {
                        // Log
                        writeLog($GLOBALS['lang']['loggerTypeGeneric'], str_replace(
                            "%0", $path, $GLOBALS['lang']['loggerNewShortLink']
                        ));
                        break;
                    }
                    $i++;
                }
            }
            if (is_array($slug)) return $slug['slug'];
            return $slug;
        } else return false;
    }
}

?>