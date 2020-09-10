<?
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');
include('../functions.php');
$logDate = date("F j, Y, g:i a");
$server = $_GET["server"];
$contentType = $_GET["contentType"];
$method = $_GET["method"];
$username = $_POST["username"];
$password = $_POST["password"];

$post_header = array(
	"Content-Type: application/json",
    "Accept: application/json",
	"Authorization: Basic ".base64_encode($username.':'.$password)
);

$ch = curl_init($server.'/v1/auth/session');
curl_setopt($ch, CURLOPT_HEADER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
$response = json_decode(curl_exec($ch));
curl_close($ch);
error_log($logDate." | SS API Request (Login): curl ".$server." -H 'Authorization: Basic ".base64_encode($username.':'.$password)."' \r".json_encode($response));

if (isset($response->{'session-id'})) {
	$post_header = array(
		"Content-Type: ".$contentType,
		"Cookie: ".$response->{'session-id'}
	);	
	$ch = curl_init($server.'/v1/administration/version');
	curl_setopt($ch, CURLOPT_HEADER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
	curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, 'GET');
	curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	$response2 = json_decode(curl_exec($ch));
	error_log($logDate." | SS API Request: curl ".$server." \r".json_encode($response2));
	$response->{'serverVersion'} = $response2->{'serverVersion'};
	curl_close($ch);
}
print(json_encode($response));

?>