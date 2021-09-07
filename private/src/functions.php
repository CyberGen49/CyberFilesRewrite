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

class ApiCall {
    function __construct($params, $conf) {
        // Set class variables
        $this->params = $params;
        $this->conf = $conf;
        $this->data = [];
        $this->startTime = (microtime(true)*1000);
        $this->indexDir = [];
        // Check for and build cache database
        if (class_exists("SQLite3")) {
            $dbPath = document_root."/_cyberfiles/private/cache.db";
            // Open the database
            $this->db = new SQLite3($dbPath);
            $db = &$this->db;
            // Create the data table if it doesn't exist
            $db->query("CREATE TABLE IF NOT EXISTS 'data' (
                'key' text not null unique,
                'value' text not null
            );");
            // Get database version and wipe if necessary
            $versionTarget = "3";
            $result = $db->query("SELECT value
                from data
                where key = 'version';
            ");
            $version = $result->fetchArray(SQLITE3_NUM)[0];
            if (!isset($version) or $version !== $versionTarget) {
                if (!isset($version))
                    $db->query("INSERT INTO data ('key', 'value')
                        values ('version', '$versionTarget');
                    ");
                else
                    $db->query("UPDATE data
                        set value = '$versionTarget'
                        where key = 'version';
                    ");
                trigger_error("[CyberFiles] The cache database has been wiped to meet version $versionTarget.",  E_USER_NOTICE);
            }
            // Create the fileCache table if it doesn't exist
            $db->query("CREATE TABLE IF NOT EXISTS 'fileCache' (
                'path' text not null unique,
                'dir' text not null,
                'name' text not null,
                'modified' integer not null,
                'size' integer not null,
                'mimeType' text not null
            );");
        }
        // Start the call
        $this->start();
    }
    // Pieces the call together and returns it to the client
    function start() {
        $params = $this->params;
        $conf = $this->conf;
        $data = &$this->data;
        while (true) {
            // Do something based on the request type
            if ($params['type'] == "list") {
                // Get relative and absolute directory paths
                $dirRel = clean_path(rawurldecode(explode("?", $_SERVER['REQUEST_URI'])[0]));
                $dir = clean_path(document_root.$dirRel);
                // Make sure we're working with an existing directory
                if (!is_dir($dir)) {
                    $data['status'] = "DIRECTORY_NONEXISTENT";
                    break;
                }
                // Get and loop through directory contents
                $scandir = scandir($dir);
                $files = [];
                $folders = [];
                foreach ($scandir as $file) {
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
                    // Add to the appropriate array
                    if (is_dir($f)) $folders[] = $fileObject;
                    else $files[] = $fileObject;
                }
                // Merge the arrays and finish
                $data['files'] = array_merge($folders, $files);
                $data['status'] = "GOOD";
                break;
            } else if ($params['type'] == "file") {
                // Should return the details of a single file, along with the relative next and previous files
                $data['status'] = "UNFINISHED";
            } else {
                $data['status'] = "INVALID_ACTION";
            }
            break;
        }
        // Close the database if it's open
        if (isset($this->db)) $this->db->close();
        // Set processing time
        $data['processingTime'] = abs(ceil(microtime(true)*1000)-$this->startTime);
        // Send the data
        header('Content-Type: application/json');
        print(json_encode($data));
        exit;
    }
    // Returns a consistently structured file object
    function getFileObject($path) {
        $reindex = true;
        $dir = pathinfo($path)['dirname'];
        $file['indexed'] = false;
        // If the database is open
        if (isset($this->db)) {
            // Attempt to get the file's cache entry
            $db = &$this->db;
            $stmt = $db->prepare("SELECT * FROM 'fileCache' where path = :p");
            $stmt->bindValue(':p', $path, SQLITE3_TEXT);
            $result = $stmt->execute();
            $cache = $result->fetchArray(SQLITE3_ASSOC);
            if ($cache and filemtime($path) == $cache['modified']) {
                $reindex = false;
                $file['indexed'] = true;
                $file = array_merge($cache, $file);
            }
        }
        // Get up to date file details if needed
        if ($reindex) {
            $file['path'] = $path;
            $file['dir'] = $path;
            $file['name'] = pathinfo($path)['basename'];
            $file['modified'] = filemtime($path);
            $file['size'] = filesize($path);
            $file['mimeType'] = mime_content_type($path);
            // If the database is open, update this file's cache
            if (isset($this->db)) {
                // Build SQL
                if (!$cache) {
                    $stmt = $db->prepare("INSERT INTO 'fileCache'
                        ('path', 'dir', 'name', 'modified', 'size', 'mimeType')
                        values (:path, :dir, :name, :mod, :size, :mime)
                    ;");
                } else {
                    $stmt = $db->prepare("UPDATE 'fileCache' set
                        path = :path,
                        dir = :dir,
                        name = :name,
                        modified = :mod,
                        size = :size,
                        mimeType = :mime
                    ;");
                }
                // Bind variables
                $stmt->bindValue(':path', $file['path'], SQLITE3_TEXT);
                $stmt->bindValue(':dir', $dir, SQLITE3_TEXT);
                $stmt->bindValue(':name', $file['name'], SQLITE3_TEXT);
                $stmt->bindValue(':mod', $file['modified'], SQLITE3_TEXT);
                $stmt->bindValue(':size', $file['size'], SQLITE3_TEXT);
                $stmt->bindValue(':mime', $file['mimeType'], SQLITE3_TEXT);
                // Execute
                $result = $stmt->execute();
            }
        }
        unset($file['path'], $file['dir']);
        return $file;
    }
}

?>