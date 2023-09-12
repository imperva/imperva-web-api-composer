<?php
error_reporting(E_ALL);
header('Cache-Control: no-cache, must-revalidate');
header('Content-type: application/json');
include('../functions.php');
$logDate = date("F j, Y, g:i a");

$endpoint = $_GET["endpoint"];
$method = "GET";
$contentLength = '0';
$logDate = date("F j, Y, g:i a");

// Check if endpoint is local or remote (http)
if (substr($endpoint,0,4)=='http') {
	error_log($logDate." | DSF SWAGGER Request: curl ".$endpoint);
	$endpointAry = explode("/",$endpoint);
	$post_header = array(
		"Host: ".$endpointAry[2]
	);

	$ch = curl_init($endpoint);
	curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
	curl_setopt($ch, CURLOPT_HTTPHEADER, $post_header);
	curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
	
	$response = curl_exec($ch);
	error_log($logDate." | DSF SWAGGER Response: ".$response);
	if(curl_exec($ch) === false){
		var_dump(curl_error($ch));
	}	
	curl_close($ch);
} else {
	$response = file_get_contents('../assets/dsf/'.$_GET["endpoint"]); 
}

$parsed = (isJson($response) ? json_decode($response) : (object) yaml_parse($response));
$parsed->dsfAPIDefinitionIndex = $_GET["dsfAPIDefinitionIndex"];
print(json_encode($parsed));

?>