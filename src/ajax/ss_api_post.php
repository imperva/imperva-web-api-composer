<?
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

if ( !isset( $HTTP_RAW_POST_DATA ) ) $HTTP_RAW_POST_DATA =file_get_contents( 'php://input' );

$post_data = $HTTP_RAW_POST_DATA;
$server = $_GET["server"];
$server = str_replace("+","%20",str_replace("%2F","/",str_replace("%3A",":",str_replace("%3F","?",str_replace("%3D","=",urlencode($server))))));
$session = $_GET["session"];
$contentType = $_GET["contentType"];
$method = $_GET["method"];
$contentLength = '0';
if ($method=='POST' || $method=='PUT') {
	$contentLength = strlen($post_data);
}
$post_header = array(
	"Content-Type: ".$contentType,
	"Content-Length: ".$contentLength,
	"Cookie: ".$session
);
$logDate = date("F j, Y, g:i a");

if ($method=='POST' || $method=='PUT') $contentLength = strlen($post_data);
$curlstr='curl -ik -X '.$method.' -H "Cookie: '.$session.'" -H "Content-Type: application/json" -H "Accept: application/json" ';
if ($method=='POST' || $method=='PUT') $curlstr.=" -d '".$post_data."' ";
$curlstr.=$server;
error_log($logDate." - SS API Request | ".$curlstr);

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
if ($method=='POST' || $method=='PUT') {
	curl_setopt($ch, CURLOPT_POSTFIELDS, $post_data); 
}
$response = curl_exec($ch);
error_log($logDate." - SS API Response: ".$response);
curl_close($ch);
print($response);

?>