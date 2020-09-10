<?
header('Cache-Control: no-cache, must-revalidate');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$data = '';
ob_start();
print_r($GLOBALS);
$data = ob_get_contents();
ob_end_clean();
error_log($data);

$post_data = (isset($_POST["jsonData"])) ? $_POST["jsonData"] : $_POST;
$server = urldecode($_GET["server"]);
$contentType = $_GET["contentType"];
$method = $_GET["method"];
$contentLength = '0';
if ($method=='POST' || $method=='PUT') {
	// $contentLength = strlen(implode($post_data));
}
$post_header = array();
$logDate = date("F j, Y, g:i a");

// $req_str = '';
// foreach ($post_data as $param=>$val){
// 	if ($req_str!='') $req_str .= '&';
// 	$req_str .= $param.'='.urlencode($val);
// }
// error_log($logDate." | Incapsula API Request: curl ".$server." --data '".$req_str."'");
error_log($logDate." | method: ".$method);

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data); 
$response = curl_exec($ch);
error_log($logDate." | Incapsula API Response: ".$response);
curl_close($ch);

header('Content-type: '.((is_object(json_decode($response))) ? 'text/json' : 'application/html'));
print($response);


?>