function incap_generateCodeExamples(){
    $('#incapCurlExample').html(incap_transformToCURL());
    $('#incapPythonExample').html(incap_transformToPython());
    // $('#incapRubyExample').html(incap_transformToRuby());
    // $('#incapJavaScriptExample').html(incap_transformToJavaScript());
    // $('#incapPerlExample').html(incap_transformToPerl());
    // $('#incapPowershellExample').html(incap_transformToPowershell());
    
    var curTabInput = $("#incapExamplesNav .ui-state-active a").prop("id");
	$("#"+curTabInput.substr(0,curTabInput.length-3)).height("5px").height((5+$("#"+curTabInput.substr(0,curTabInput.length-3)).prop('scrollHeight'))+"px")		
}

function incap_transformToCURL(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
    var curlStr = '';
    if (auth.api_id==undefined) auth.api_id="xxxxxx"
    if (auth.api_key==undefined) auth.api_key="************************************'"
	if (!$('#incapRequestUrl').hasClass('errors')) {
		// $('#incapServer').val()+$('#incapActions').val(),reqObj,$('#incap_configMaskSecretKey').is(":checked")
		var requestUrlAry = requestUrl.split("?");
		var curRequestUrl = requestUrlAry.shift();
		var headersStr = ' -H "Accept: application/json" -H "Content-Type: '+$('#incapContentType').val()+'" ';
		var paramsAry = [];
		if ($('#incapAuth').val()=='query') {
			paramsAry.push("api_id="+auth.api_id);
			paramsAry.push("api_key="+((maskSecretKey) ? starStr.substr(0,auth.api_key.length) : auth.api_key));
		} else {
			headersStr += ' -H "x-API-Key: '+((maskSecretKey) ? starStr.substr(0,auth.api_key.length) : auth.api_key)+'" ';
			headersStr += ' -H "x-API-Id: '+auth.api_id+'" ';	
		}
		if (requestUrlAry.join().trim()!='') paramsAry = paramsAry.concat(requestUrlAry);
		var method = $('#incapMethod').val();
		
		// Check for content type and format
		var reqData = $('#incapData').val();
		if ($('#incapContentType').val()=='application/json') {
			curlStr = "curl -k -X "+method.toUpperCase()+headersStr+"'"+curRequestUrl+"?"+paramsAry.join("&")+"'"+((reqObj.replace("{}",'')!='') ? " --data-raw '"+reqData+"'" : '');
		} else {
			curlStr = "curl -k -X "+method.toUpperCase()+headersStr+"'"+curRequestUrl+"?"+paramsAry.join("&")+"'";
			if ($('#incapData').val()!='{}' && $('#incapData').val()!='') {
				$.each(JSON.parse($('#incapData').val()),function(paramName,paramValue){
					curlStr += " --data-urlencode '"+paramName+"="+paramValue+"'";
				});
			}
		}
	}
	return curlStr;
}

function incap_transformToPython(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=($('#incapData').val())?$('#incapData').val():'{}',maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
    str = '';
    if (!$('#incapRequestUrl').hasClass('errors')) {
        var requestUrlAry = requestUrl.split("?");
        var curRequestUrl = requestUrlAry.shift();
        var headersStr = ' -H "Accept: application/json" -H "Content-Type: '+$('#incapContentType').val()+'" ';
        var paramsAry = [];
        if ($('#incapAuth').val()=='query') {
            paramsAry.push("api_id='+api_id+'");
            paramsAry.push("api_key='+api_key+'");
        }
        if (requestUrlAry.join().trim()!='') paramsAry = paramsAry.concat(requestUrlAry);
        var method = $('#incapMethod').val();
        
        str += '#Need to install requests and json package for python'+"\n";
        str += 'import requests'+"\n";
        str += 'import json'+"\n\n";

        str += '# Set authentication parameters: api_id and api_key'+"\n";
        str += "api_id = '"+auth.api_id+"'"+"\n";
        str += "api_key = '"+((maskSecretKey) ? starStr.substr(0,auth.api_key.length) : auth.api_key)+"'"+"\n\n";

        str += '# Set the request url'+((paramsAry.length>0) ? " and parameters" : '')+"\n";
        str += "url = '"+curRequestUrl+"?"+paramsAry.join("&")+"'\n\n";
       
        str += "# Set proper headers"+"\n";
        str += 'headers = {'+"\n";
        if ($('#incapAuth').val()=='headers') {
            str += '    "x-API-Id": api_id,'+"\n";
            str += '    "x-API-Key": api_key,'+"\n";
        }
        str += '    "Content-Type":"'+$('#incapContentType').val()+'",'+"\n";
        str += '    "Accept":"application/json"'+"\n";
        str += '}'+"\n\n";
        str += 'params = '+JSON.stringify(JSON.parse(reqObj), null, 4).replace("true,","True,").replace("false,","False,")+"\n";

        str += '# Make the HTTP request'+"\n";
        if (method=="post" || method=="put"){
            if ($('#incapContentType').val()=="application/json") {
                str += 'response = requests.'+method+'(url, data=json.dumps(params), headers=headers)'+"\n\n";
            } else {
                str += 'response = requests.'+method+'(url, params=params, headers=headers)'+"\n\n";
            }
        } else {
            str += 'response = requests.'+method+'(url, headers=headers )'+"\n\n";
        }
        str += '# Check for HTTP codes other than 200'+"\n";
        str += 'if response.status_code != 200:'+"\n";
        str += "    print('Status:', response.status_code, 'Headers:', response.headers, 'Error Response:',response.json())"+"\n";
        str += "    exit()"+"\n";
        
        str += "# Decode the JSON response into a dictionary and use the data"+"\n";
        str += "data = response.json()"+"\n";
        str += "print(json.dumps(data))"+"\n";
    }
    return str;
}
// function incap_transformToRuby(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToRuby';
//     return str;
// }
// function incap_transformToJavaScript(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToJavaScript';
//     return str;
// }
// function incap_transformToPerl(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToPerl';
//     return str;
// }
// function incap_transformToPowershell(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
//     var str = 'incap_transformToPowershell';
//     return str;
// }
