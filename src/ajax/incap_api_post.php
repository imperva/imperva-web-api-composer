<?
header('Cache-Control: no-cache, must-revalidate');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$data = '';
ob_start();
print_r($GLOBALS);
print_r($_POST["headerData"]);
$data = ob_get_contents();
ob_end_clean();
error_log($data);

$post_data = (isset($_POST["jsonData"])) ? $_POST["jsonData"] : ((isset($_POST["postData"])) ? $_POST["postData"] : array());
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
curl_close($ch);
header('Content-type: '.((is_object(json_decode($response))) ? 'text/json' : ((is_array(json_decode($response))) ? 'text/json' : 'application/html')));
error_log($response);
print($response);


?>