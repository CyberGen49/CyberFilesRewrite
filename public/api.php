<?php

define('document_root', $_SERVER['DOCUMENT_ROOT']);
require(document_root."/_cyberfiles/private/src/functions.php");
$conf = yaml_parse_file(document_root."/_cyberfiles/private/config.yml");

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

?>