<?
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$post_data = $_POST;
$server = $_GET["server"];
$server = str_replace("+","%20",str_replace("%2F","/",str_replace("%3A",":",str_replace("%3F","?",str_replace("%3D","=",urlencode($server))))));
$contentType = $_GET["contentType"];
$method = $_GET["method"];
$contentLength = '0';
if ($method=='POST' || $method=='PUT') {
	$contentLength = strlen(implode($post_data));
}
$post_header = array();
$logDate = date("F j, Y, g:i a");

$req_str = '';
foreach ($post_data as $param=>$val){
	if ($req_str!='') $req_str .= '&';
	$req_str .= $param.'='.urlencode($val);
}
error_log($logDate." | Incapsula API Request: curl ".$server." --data '".$req_str."'");

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data); 
$response = curl_exec($ch);
error_log($logDate." | Incapsula API Response: ".$response);
curl_close($ch);
print($response);
?>