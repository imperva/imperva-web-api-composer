<?
header('Cache-Control: no-cache, must-revalidate');
//header('Content-type: application/json');
$version = $_GET["version"];

if ($version=='12') {
    print(file_get_contents('../assets/12_swagger.json'));
} else if ($fileType=='13') {
    print(file_get_contents('../assets/13_swagger.json'));
} else {
    print('no file found');
}

?>