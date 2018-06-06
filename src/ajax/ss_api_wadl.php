<?
header('Cache-Control: no-cache, must-revalidate');
//header('Content-type: application/json');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$server = $_GET["server"];
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

$ch = curl_init($server);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = curl_exec($ch);
curl_close($ch);
print($response);

?>