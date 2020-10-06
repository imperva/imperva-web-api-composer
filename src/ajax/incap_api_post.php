<?
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

header('Cache-Control: no-cache, must-revalidate');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

// print_r((object)$_POST["postData"]);

$data = '';
ob_start();
print("GLOBALS");
print_r($GLOBALS);
// if (isset($_POST["postData"])) {
// 	print('_POST["postData"]');
// 	print(http_build_query($_POST["postData"]));
// }
// if (isset($_POST["jsonData"])) {
// 	print('_POST["jsonData"]');
// 	print($_POST["jsonData"]);
// }
if (isset($_POST["headerData"])) {
	print('_POST["headerData"]');
	print_r($_POST["headerData"]);
}
$data = ob_get_contents();
ob_end_clean();
error_log($data);

$post_data = (isset($_POST["jsonData"])) ? $_POST["jsonData"] : ((isset($_POST["postData"]) && $_POST["postData"]!='') ? http_build_query($_POST["postData"]) : array());
$server = urldecode($_GET["server"]);
$contentType = $_GET["contentType"];
$method = $_GET["method"];
$contentLength = '0';
if ($method=='POST' || $method=='PUT') {
	// $contentLength = strlen(implode($post_data));
}

$post_header = ($_POST["headerData"]) ? $_POST["headerData"] : array();

$logDate = date("F j, Y, g:i a");

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data); 
$response = curl_exec($ch);
error_log($logDate." | Incapsula API Response: ".$response);
if(curl_errno($ch)){
	error_log("CURL ERROR: ".curl_error($ch));
}
curl_close($ch);
header('Content-type: '.((is_object(json_decode($response))) ? 'application/json' : ((is_array(json_decode($response))) ? 'application/json' : 'application/html')));
error_log($response);
print($response);


?>