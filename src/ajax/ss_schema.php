<?
header('Cache-Control: no-cache, must-revalidate');
//header('Content-type: application/json');
$fileType = $_GET["fileType"];

if ($fileType=='WADL') {
    print(file_get_contents('../assets/v13_application.wadl'));
    //print(file_get_contents('../assets/v12_application.wadl'));
} else if ($fileType=='XSD') {
    print(file_get_contents('../assets/xsd0_v13.xsd'));
    //print(file_get_contents('../assets/xsd0_v12_2_60.xsd'));
} else {
    print('no file found');
}

?>