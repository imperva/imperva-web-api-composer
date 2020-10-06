<?

function login(){
	
}

function is_assoc($array) {
  return (bool)count(array_filter(array_keys($array), 'is_string'));
}

function htmlspecialchars_deep($mixed, $quote_style = ENT_QUOTES, $charset = 'UTF-8') {
    if (is_array($mixed)) {
        foreach($mixed as $key => $value) {
            $mixed[$key] = htmlspecialchars_deep($value, $quote_style, $charset);
        }
    } elseif (is_string($mixed)) {
        $mixed = htmlspecialchars(htmlspecialchars_decode($mixed, $quote_style), $quote_style, $charset);
    }
    return $mixed;
}
	

function isJson($string) {
    json_decode($string);
    return (json_last_error() == JSON_ERROR_NONE);
}
   
   

?>