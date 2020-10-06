var starStr = '******************************************************************************************************';
var responseObj = {};
var INCAP_AUTH;
var SS_AUTH;

$().ready(function() {
	$("#mainNav").tabs();
	$("#settingsNav").tabs().addClass( "ui-tabs-vertical ui-helper-clearfix" );
	$("#settingsNav li").removeClass( "ui-corner-top" ).addClass( "ui-corner-left" );
    // var INCAP_AUTH = JSON.parse(localStorage.getItem('INCAP_AUTH'));
	/*if (localStorage.getItem('INCAP_AUTH')==null) {
		localStorage.setItem("INCAP_AUTH",JSON.stringify({
			"API User 1":{
				"account_id":"1234",
				"api_id":"4321",
				"api_key":"your_key_here"
			},
			"API User 2":{
				"account_id":"1234",
				"api_id":"4321",
				"api_key":"your_key_here"
			}
		}))
	}
	INCAP_AUTH = JSON.parse(localStorage.getItem('INCAP_AUTH'));*/
});

function initCopyButtons(){
	$('.ui-icon-copy').unbind("click").click(function(){ 
		var id = this.id.substring(0,this.id.length-4);
		if ($("#"+id).val()!='') {
			if ($("#"+id).hasClass("query")) {
				$("#SSrequestUrl").val($("#SSrequestUrl").val().replace(id+"={string}",id+"="+$('#'+id).val()+"").replace(id+"={list}",id+"="+$('#'+id).val()+"").replace(id+"={boolean}",id+"="+$('#'+id).val()+""));
			} else {
				$("#SSrequestUrl").val($("#SSrequestUrl").val().replace("{"+id+"}",$('#'+id).val()));
			}
		}
		checkForm();
	});
}

function checkForm() {
	var isok = true;
	if (!($('#SSrequestUrl').val().indexOf('{') == -1)) {
		$('#SSrequestUrl').addClass('errors');
		isok=false;
	} else {
		$('#SSrequestUrl').removeClass('errors');
	}
	SSUpdateCURL();
	return isok;
}

function clearAllFields() {
	$('#SSresult').val('');
	//$("#siteName").html('');
	//$("#MXServerGroupName").html('');
	//$("#serviceName").html('');
	//$("#applicationName").html('');
	$("#jsessionid").val('');
	curLoadedPolicyName = null;
}

function populateSelect(id,listObj){
	$('#'+id).html('');
	$.each(listObj,function(key, ary){
		if (ary.length!=0 && key!='errors') {
			ary.sort();
			$.each(ary,function(j, val){
				$('#'+id).append('<option value="'+val+'">'+val+'</option>');
			});
		} else {
			$('#'+id).html('<option>Not Currently Available</option>');
		}
	});
}

function transformToCURL(requestUrl,reqObj){
	var data = '';
	$.each(reqObj, function(param,val) {
		if (data!='') data += '&';
		data += param+'='+val;
	});
	return "curl '"+requestUrl+"' --data '"+data+"'";
}

function IsJsonString(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

function filterStr(str){
	return str.replaceAll("<a href=","").replaceAll("</a>","").replaceAll("<","").replaceAll(">","").replaceAll("'","").replaceAll('"',"");
}