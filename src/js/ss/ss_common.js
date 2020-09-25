var siteTree = {};
var SSActions = {};
var SSSwagger = {"paths":{}};
var getSSActions = {};

var ss_server_sel = '#SecureSphereAPI #MXServers';
var ss_action_sel = '#SecureSphereAPI #SSActions';
var ss_method_sel = '#SecureSphereAPI #SSmethod';
var ss_session_sel = '#SecureSphereAPI #jsessionid';
var ss_data_sel = '#SecureSphereAPI #SSdata';

/*
Legacy:
getSSActions
	{url}
		methods[]
			{method}
				jsonParams[]
					{name,type,values}
				urlParams[]
					{name,type,values}
SSapiParamMapping
	{paramName}
		"name":"aliasName",
		"type":"string",
		"values":"AWS Default",
		"getAPIurlMapping":{
			"default":{
				"url":"/v1/conf/applicationGroups",
				"nestedItemName":"name"
			}
			OR

			"/v1/conf/webServiceCustomPolicies/{policyName}":{
				"url":"/v1/conf/webServiceCustomPolicies"
			},
			"/v1/conf/webApplicationCustomPolicies/{policyName}":{
				"url":"/v1/conf/webApplicationCustomPolicies"
			},
			"/v1/conf/auditPolicies/{policyName}":{
				"url":"/v1/conf/auditPolicies"
			}
		}

SSSwagger new structure
	basePath	"/SecureSphere/api"
	definitions {
		ServerGroupDTO
			properties	Object { name: {…}, operationMode: {…} }
			name	Object { type: "string" }
			type	"string"
			operationMode	Object { type: "string" }
			type	"string"
			type
	}
	paths	{
		"/v1/status/alarms/active":
			"post"
				operationId	"createServerGroup"
				parameters [{
					in	"path"
					name	"siteName"
					required	true
					type	"string"
				},{
					in	"body"
					name	"body"
					required	false
					schema	Object { "$ref": "#/definitions/ServerGroupDTO" }
					$ref	"#/definitions/ServerGroupDTO"
				},{
					in	"query"
					name	"gatewayGroup"
					required	false
					type	"string"
				}]
				produces	Array [ "application/json" ]
				responses
	schemes



*/

var xsd = {"complexTypes":{},"elements":{}};
var SScurUrlParamsAry = [];
var SScurUrlParamsIndex = 0;
var curSSAuth = {};

$().ready(function() {
	$(ss_action_sel).change(function(){ SSchangeAction(); SScurUrlParamsIndex=0; SSgetURLParams(); });
	$(ss_method_sel).change(function(){
		SSrenderJSONParamsHTML();
	});
	$('#SecureSphereAPI #siteName').change(function(){
		SSrenderJSONParamsHTML();
	});
	$('#ss_policies_refresh').button({iconPosition: "beginning", icon: "ui-icon-refresh"}).click(function(){ getAllWAFPolicies(); });
	$('#SecureSphereAPI #SSJSONparams input, #SecureSphereAPI #SSJSONparams textarea').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams select').change(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSrequestUrl').keyup(function(){ checkForm(); SSUpdateCURL(); });
	$('#ssSaveCredentials').click(function(){ ssSaveCredentials(); });
	$('#ssDeleteCredentials').click(function(){ ssDeleteCredentials(); });
	loadSSCredentials();
	$('#SecureSphereAPI #MXServer').blur(function(){ SSupdateReqURL(); });
	$(ss_data_sel).blur(function(){ SSUpdateCURL(); });
	SSLoadAll();
	SSUpdateJSON();
});

// Main AJAX function to proxy API calls
function makeSSCall(action,method,callback,postDataObj) {
	// debugger
	if (action!==undefined || checkForm()) {
		// debugger
		var postData = $(ss_data_sel).val(); // postDataObj = JSON.parse($(ss_data_sel).val());
		if (postDataObj!==undefined) postData = JSON.stringify(postDataObj);
		// debugger
		$('#SecureSphereAPI #SSresult').val('processing...');
		var requestUrl = $('#SecureSphereAPI #MXServer').val()+$(ss_action_sel).val();
		if (action!==undefined) {
			requestUrl = $('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix+action;
		} else if ($('#SecureSphereAPI #SSrequestUrl').val() != ($('#SecureSphereAPI #MXServer').val()+$(ss_action_sel).val())) {
			requestUrl = $('#SecureSphereAPI #SSrequestUrl').val();
		}
		if (method==undefined) method = $(ss_method_sel).val();
		method = method.toUpperCase();
		var reqUrl = "ajax/ss_api_post.php?server="+requestUrl;
		reqUrl += "&session="+$(ss_session_sel).val();
		reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
		reqUrl += "&method="+method;
		jQuery.ajax ({
			url: encodeURI(reqUrl).replace('+','%2B'),
			type: "POST",
			data: postData,
			dataType: "json",
			contentType: "application/json; charset=utf-8",
			success: function(data){
				var isValidSession = true;
				try { if (data['errors'][0]["description"]=="User is not logged in") { isValidSession=false; login(); } } catch(err) {}
				responseObj = data;
				$('#SecureSphereAPI #SSresult').val(JSON.stringify(data));
				if (callback!=undefined) {
					return callback(data);
				}
			}
		});
	/*	$.post(encodeURI(reqUrl), postParams, function(data) {
			responseObj = data;
			$('#SecureSphereAPI #SSresult').val(JSON.stringify(data));
			if (callback!=undefined) {
				return callback(data);
			}
		});*/
	}
}

// Manage credentials
function loadSSCredentials(){
	/*$.each(listOfMXs.MXServers, function(i,MX) {
		var isDefault = '';
		if (MX.default) { sDefault=' selected '; $('#SecureSphereAPI #MXServer').parent().parent().hide(); }
		$(ss_server_sel).append('<option value="'+MX.ip+'">'+MX.displayName+' ('+MX.ip+')</option>');
	});
	*/
	if (localStorage.getItem('SS_AUTH')==null) localStorage.setItem('SS_AUTH','{}');
	SS_AUTH = JSON.parse(localStorage.getItem('SS_AUTH'));
	$("#MXServers").html('');
	$.each(SS_AUTH, function(index_id,configObj) {
		$("#MXServers").append('<option title="'+configObj.MX_display_name+' ('+configObj.MXServer+')" value="'+index_id+'">'+configObj.MX_display_name+'</option>');
	});
	var editVerbiage = 'Add new MX';
	if ($('#MXServers').children('option').length>0) { editVerbiage = 'Edit current or add new MX'; }
	$("#MXServers").append('<option value="entermewmx">'+editVerbiage+'</option>');
	$("#MXServers").unbind().change(function(){ renderSSAuth(); });
	//$(ss_server_sel).attr("disabled", false).append('<option value="entermewmx">Enter My Own</option>');
	$('#SecureSphereAPI #MXServer').val($(ss_server_sel).val());
	renderSSAuth();
}

function renderSSAuth(){
	// add click event to expand Manage Credentials manageSSCredentialsBtn and align with Edit current or add new
	if ($(ss_server_sel).val()=='entermewmx') {
		$('#SecureSphereAPI #MX_display_name').parent().parent().show();
		$('#SecureSphereAPI #MXServer').parent().parent().show();
		$('#SecureSphereAPI #MXServer').val('').addClass('highlight').attr('placeholder','https://192.168.1.2:8083');
		$('#SecureSphereAPI #MX_display_name').val('').addClass('highlight').attr('placeholder','MX desc here');
		$('#SecureSphereAPI #SSusername').val('').addClass('highlight').attr('placeholder','MX username here');
		$('#SecureSphereAPI #SSpassword').val('').addClass('highlight').attr('placeholder','MX password here');
		if ($('#manageSSCredentials').css('display')=='none') toggleSSManageCredentials();
	} else {
		$('#SecureSphereAPI #MX_display_name').val(SS_AUTH[$(ss_server_sel).val()].MX_display_name);
		$('#SecureSphereAPI #MX_display_name').parent().parent().hide();
		$('#SecureSphereAPI #MXServer').removeClass('highlight').val(SS_AUTH[$(ss_server_sel).val()].MXServer);
		$('#SecureSphereAPI #MXServer').removeClass('highlight').parent().parent().hide();
		$('#SecureSphereAPI #SSusername').removeClass('highlight').val(SS_AUTH[$(ss_server_sel).val()].SSusername);
		$('#SecureSphereAPI #SSpassword').removeClass('highlight').val(SS_AUTH[$(ss_server_sel).val()].SSpassword);
		if ($('#manageSSCredentials').css('display')!='none') toggleSSManageCredentials();
	}
	SSupdateReqURL();
	SSUpdateJSON();
}

function toggleSSManageCredentials(){
	if ($('#manageSSCredentials').css('display')=='none'){
		$('#manageSSCredentialsBtn').html('- <span>Manage Credentials</span>');
		$('#manageSSCredentials').css('display','block');
	} else {
		$('#manageSSCredentialsBtn').html('+ <span>Manage Credentials</span>');
		$('#manageSSCredentials').css('display','none');
	}
}
function ssSaveCredentials() {
	if ($('#MXServer').val().trim()!='' && $('#SSusername').val().trim()!='' && $('#SSpassword').val()!='' && $('#MX_display_name').val().trim()!='') {
		var reqUrl = "ajax/ss_api_login.php?server="+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix;
		reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
		reqUrl += "&method=POST";
		$.post(encodeURI(reqUrl), {"username":$('#SSusername').val().trim(),"password":$('#SSpassword').val()}, function(data) {
			if (data!=null) {
				responseObj = data;
				if (data.errors==undefined) {
					SS_AUTH[$('#MXServer').val()+"_"+$('#SSusername').val().trim()] = {
						"MX_display_name":$('#MX_display_name').val().trim(),
						"MXServer":$('#MXServer').val().trim(),
						"SSusername":$('#SSusername').val().trim(),
						"SSpassword":$('#SSpassword').val()
					};
					localStorage.setItem('SS_AUTH',JSON.stringify(SS_AUTH));
					loadSSCredentials();
				} else {
					$.gritter.add({ title: '<span>Error: </span>'+data.errors[0]['error-code'], text: data.errors[0]['description'], time: 20000 });
				}
			} else {
				$.gritter.add({ title: '<span>Error: </span>', text: "No response from server ("+$('#MXServer').val().trim()+"), invalid server/port. Please type in a valid server name/IP, example: https://192.168.1.2:8083", time: 20000 });
			}
			//$.gritter.add({ title: 'Invalid Credentials', text: "Please enter a valid MX server, username and password. "});
		});
	} else {
		$.gritter.add({ title: 'MISSING FIELDS', text: "Please enter a valid MX display name, MX server address, username and password. "});
	}
}

function ssDeleteCredentials(){
	if (confirm('Are you sure you want delete the MX Server ('+$('#MXServer').val()+') and username ('+$('#SSusername').val()+') from this tool?')) {
		if (SS_AUTH[$('#MXServer').val()+"_"+$('#SSusername').val()]!=undefined) {
			delete SS_AUTH[$('#MXServer').val()+"_"+$('#SSusername').val()];
			localStorage.setItem('SS_AUTH',JSON.stringify(SS_AUTH));
			$('#MX_display_name').val('');
			$('#MXServer').val('');
			$('#SSusername').val('');
			$('#SSpassword').val('');
			loadSSCredentials();
		} else {
			$.gritter.add({ title: 'User not found', text: "User with account: "+$('#account_id').val()+" and api_id: "+$('#api_id').val()+" currently not stored locally."});
		}
	}
}

// Update UI display/fields based on selected action
function SSchangeAction() {
	var reqObj = {};
	SSupdateReqURL();
	$('#SecureSphereAPI .fieldwrapper').hide();
	$('#SecureSphereAPI #SSmethod option').attr('disabled','disabled');
	if (SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()] != undefined) {
		SScurUrlParamsAry = [];
		var actionObj = SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()];
		$("#SecureSphereAPI #SSURLparams table").html('');
		$.each(actionObj, function(method,methodObj) {
			$('#SecureSphereAPI #SSmethod option[value="'+method+'"]').removeAttr('disabled');
			delete methodObj.queryParams; delete methodObj.bodyParams; delete methodObj.pathParams;
			$.each(methodObj.parameters, function(i,param) {
				if (param.in=="query") {
					if (methodObj.queryParams==undefined) methodObj.queryParams = {"index":[],"list":{}};
					methodObj.queryParams.list[param.name] = param;
					methodObj.queryParams.index.push(param.name);
				} else if (param.in=="body") {
					if (methodObj.bodyParams==undefined) methodObj.bodyParams = {"index":[],"list":{}};
					if (param.name=='body' && param.schema!=undefined) {
						$.each(SSSwagger.definitions[param.schema['$ref'].split('/').pop()].properties, function(subParamName,subParamNameObj) {
							methodObj.bodyParams.index.push(subParamName);
							subParamNameObj.name = subParamName;
							methodObj.bodyParams.list[subParamName] = subParamNameObj;
						});
					}
				} else if (param.in=="path") {
					if (methodObj.pathParams==undefined) methodObj.pathParams = {"index":[],"list":{}};
					methodObj.pathParams.list[param.name] = param;
					methodObj.pathParams.index.push(param.name);
				}
			});
		});
		$("#SecureSphereAPI #SSmethod").val($("#SecureSphereAPI #SSmethod option:not([disabled]):first").val());
		var curMethodObj = SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()][$(ss_method_sel).val()];
		if (curMethodObj.queryParams!=undefined) {
			if (curMethodObj.queryParams.index.length>0) $('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #SSrequestUrl').val()+"?");
			$.each(curMethodObj.queryParams.index, function(i,paramName) {
				var param = curMethodObj.queryParams.list[paramName];
				var str = param.name+'={'+param.type+'}';
				if (curMethodObj.queryParams.length<(i-1)) str += '&';
				$('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #SSrequestUrl').val()+str);
			});
		}
		$.each($("#SecureSphereAPI #SSActions").val().split('/'), function(i,param) {
			if (param.substr(0,1)=="{" && param.substr(param.length-1)=="}") {
				param = param.substr(1,param.length-2);
				var displayName = param.replace(/([A-Z])/g, ' $1').replace('I P','IP').replace('I D','ID').replace('Db ','DB ');
				displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
				$("#SecureSphereAPI #SSURLparams table").append('<tr id="'+param+'tr" class="fieldwrapper"><td align="right" width="140"><label for="'+param+'">'+displayName+': </label></td>'+
					'<td><a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param+'_btn" title="Copy to Request URL">copy</a>'+
					'<select name="'+param+'" id="'+param+'" class="min"><option value=""></option></select></td></tr>');
				SScurUrlParamsAry.push({"name":param,"desc":displayName});
			}
		});
		initSSCopyButtons();
	}
	if ($(ss_session_sel).val()=="") {
		$("#SecureSphereAPI #SSusernametr").show();
		$("#SecureSphereAPI #SSpasswordtr").show();
		$("#SecureSphereAPI #SSmethod option").attr('disabled','disabled');
		$("#SecureSphereAPI #SSmethod").val('post');
		reqObj = {"username":$('#SecureSphereAPI #SSusername').val(),"password":$('#SecureSphereAPI #SSpassword').val()}
		$(ss_data_sel).val(JSON.stringify(reqObj));
	} else {
		SSrenderJSONParamsHTML();
	}
}

function initSSCopyButtons(){
	$('#SecureSphereAPI .ui-icon-copy').unbind("click").click(function(){
		var id = this.id.substring(0,this.id.length-4);
		if ($("#SecureSphereAPI #"+id).val()!='') {
			if ($("#SecureSphereAPI #"+id).hasClass("query")) {
				$("#SecureSphereAPI #SSrequestUrl").val($("#SecureSphereAPI #SSrequestUrl").val().replace(id+"={string}",id+"="+$('#SecureSphereAPI #'+id).val()+"").replace(id+"={list}",id+"="+$('#SecureSphereAPI #'+id).val()+"").replace(id+"={boolean}",id+"="+$('#SecureSphereAPI #'+id).val()+""));
			} else {
				$("#SecureSphereAPI #SSrequestUrl").val($("#SecureSphereAPI #SSrequestUrl").val().replace("{"+id+"}",$('#SecureSphereAPI #'+id).val()));
			}
		}
		checkForm();
	});
}

function SSUpdateJSON(){
	var reqObj = {};
	var actionObj = SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()];
	if (actionObj!=undefined) {
		var methodObj = actionObj[$(ss_method_sel).val()];
		if (methodObj.bodyParams!=undefined) {
			$.each(methodObj.bodyParams.index, function(i,paramName) {
				var param = methodObj.bodyParams.list[paramName];
				if ($('#SecureSphereAPI #'+param.name).val()!="") {
					if (param.type=='array' || param.type=='obj') {
						if (IsJsonString($('#SecureSphereAPI #'+param.name).val())) {
							reqObj[param.name] = JSON.parse($('#SecureSphereAPI #'+param.name).val());
						} else {
							reqObj[param.name] = $('#SecureSphereAPI #'+param.name).val();
						}
					} else if (param.type=='int') {
						reqObj[param.name] = parseInt($('#SecureSphereAPI #'+param.name).val(),10);
					} else if (param.type=='boolean') {
						var boolVal = false; if ($('#SecureSphereAPI #'+param.name).val()=='true') boolVal = true;
						reqObj[param.name] = boolVal;
					} else {
						reqObj[param.name] = $('#SecureSphereAPI #'+param.name).val();
					}
					/*if (param.name=='ports') {
						var strAry = $('#SecureSphereAPI #'+param.name).val().split(',');
						for(var i = 0; i < strAry.length; i++)
							strAry[i] = parseInt(strAry[i], 10);
						reqObj[param.name] = strAry;
					} else if (param.name=='db-mappings') {
						reqObj[param.name] = JSON.parse($('#SecureSphereAPI #'+param.name).val().replace('\r','').replace('\n','').trim());
					} else {
						reqObj[param.name] = $('#SecureSphereAPI #'+param.name).val();
					}*/
				}
			});
		}
	}
	//if ($(ss_session_sel).val()=="") reqObj = {"username":$('#SecureSphereAPI #SSusername').val(),"password":$('#SecureSphereAPI #SSpassword').val()};
	if ($(ss_session_sel).val()=="") reqObj['Authorization Header'] = "Authorization: Basic "+btoa($('#SecureSphereAPI #SSusername').val()+":"+$('#SecureSphereAPI #SSpassword').val());
	$(ss_data_sel).val(JSON.stringify(reqObj));
	$('#SecureSphereAPI #SSJSONparams input').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams textarea').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams select').change(function(){ SSUpdateJSON(); });
	SSUpdateCURL();
}
function SSUpdateCURL(){
	if (!$('#SecureSphereAPI #SSrequestUrl').hasClass('errors')) {
		//alert("$('#SecureSphereAPI #SSrequestUrl').hasClass('errors')="+$('#SecureSphereAPI #SSrequestUrl').hasClass('errors'));
		var str = 'curl -ik -X '+$(ss_method_sel).prop("value").toUpperCase()+' ';
		if ($(ss_session_sel).val()=="") {
			str += '-H "Authorization: Basic '+btoa($('#SecureSphereAPI #SSusername').val()+":"+$('#SecureSphereAPI #SSpassword').val())+'"';
		} else {
			str += '-H "Cookie: '+$(ss_session_sel).val()+'" -H "Content-Type: application/json" -H "Accept: application/json" ';
			if ($(ss_data_sel).val()!='{}') str += " -d '"+$(ss_data_sel).val()+"' ";
		}
		//str += ' '+$('#SecureSphereAPI #MXServer').val()+encodeURI($(ss_action_sel).val());
		str += ' '+encodeURI($('#SecureSphereAPI #SSrequestUrl').val());
		$('#SecureSphereAPI #SScurlUrl').val(str);
	} else {
		$('#SecureSphereAPI #SScurlUrl').val('');
	}
}
function SSupdateReqURL() {
	$('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix+$(ss_action_sel).val());
	checkForm();
}

function login() {
	if ($('#MXServers').val()!='entermewmx') {
		if (curSSAuth["username"]==undefined && $('#jsessionid').val()=='') {
			curSSAuth["username"]=$("#SecureSphereAPI #SSusername").val();
			curSSAuth["password"]=$("#SecureSphereAPI #SSpassword").val();
		}
		$('#SecureSphereAPI #SSresult').val('processing...');
		var reqUrl = "ajax/ss_api_login.php?server="+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix;
		reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
		reqUrl += "&method=POST";
		$.post(encodeURI(reqUrl), curSSAuth, function(data) {
			responseObj = data;
			$('#SecureSphereAPI #SSresult').val(JSON.stringify(data));
			if (data.errors==undefined) {
				localStorage.setItem('SS_VERSION',data['serverVersion']);
				if ($(ss_session_sel).val()!='') {
					$(ss_session_sel).val(data['session-id']);
					$.gritter.add({ title: 'Successfully logged back in!', text: "Generated new JSESSIONID"});
					$(ss_action_sel).trigger('change');
					$('#SecureSphereAPI #SSWAFPolicies_dest option').attr("selected", "selected");
					moveSSPolicyLeft();
				} else {
					$.gritter.add({ title: 'Successful Login', text: "Loading Swagger API Schema..."});
					$(ss_session_sel).val(data['session-id']);
					$("#SecureSphereAPI #SSusernametr").hide();
					$("#SecureSphereAPI #SSpasswordtr").hide();
					$("#SecureSphereAPI #SSlogin").hide();
					$("#SecureSphereAPI #SSlogoutDiv").show();
					$("#SecureSphereAPI #curUser").html("Logged is as user: <b>"+$("#SecureSphereAPI #SSusername").val()+"</b>");
					$("#SecureSphereAPI #SSexecute").show();
					$("#SecureSphereAPI #loadSiteTreeData").show();
					$("#SecureSphereAPI #SSActions option").removeAttr('disabled');
					loadSwagger();
					$(ss_server_sel).attr("disabled", true);
					$('#SecureSphereAPI #MXServer').attr('readonly', true);
				}
			} else {
				$.gritter.add({ title: '<span>Error: </span>'+data.errors[0]['error-code'], text: data.errors[0]['description'], time: 2000 });
			}
		});
	} else {
		$.gritter.add({ title: '<span>MISSING CREDENTIALS</span>', text: "Please select a valid saved user from MX Servers drop down.", time: 2000 });
	}
}

function SSLoadAll() {
	$.each(ssDefConfig, function(key,val) { $("#SecureSphereAPI #"+key).val(val); });
	$("#SecureSphereAPI #login").show();
	$("#SecureSphereAPI #logoutDiv").hide();
	$("#SecureSphereAPI #curUser").html(' ');
	$("#SecureSphereAPI #SSexecute").hide();
	$("#SecureSphereAPI #loadSiteTreeData").hide();
	$("#SecureSphereAPI #SSActions option").attr('disabled','disabled');
	$("#SecureSphereAPI #SSActions option:eq(0)").removeAttr('disabled').attr('selected', 'selected');
	clearAllFields();
	SSchangeAction();
}

function loadSwagger(){
	//var requestUrl = window.location.href+"assets/"+localStorage.getItem('SS_VERSION').substr(0,2)+"_swagger.json";
	//var requestUrl = ssDefConfig.proto+'://'+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.port+"/api/experimental/internal/swagger";
	var reqUrl = "ajax/ss_schema.php?version="+localStorage.getItem('SS_VERSION').substr(0,2);
	reqUrl += "&session="+$(ss_session_sel).val();
	reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
	reqUrl += "&method="+"GET";

	jQuery.ajax ({
		url: encodeURI(reqUrl),
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			$.gritter.add({ title: 'Processing...', text: "loading Swagger schema"});
			SSSwagger = JSON.parse(data);
			$(ss_action_sel).html("");
			var actionkeys = Object.keys(SSSwagger.paths);
			actionkeys.sort();
			for (var i=0; i<actionkeys.length; i++) { $(ss_action_sel).append('<option value="'+actionkeys[i]+'">'+actionkeys[i]+'</option>'); }
			$.gritter.add({ title: 'Success', text: "Loaded WADL and populated actions"});
			SSchangeAction();
			getAllWAFPolicies();
		}
	});
}

function SSFormatJSONParamObj(param){
	if ($(param).attr("type").substr(0,3)=="xs:") $(param).attr("type",$(param).attr("type").substr(3));
	if (SSapiParamMapping[$(param).attr("name")]!=undefined) { param=SSapiParamMapping[$(param).attr("name")]; } else { $(param).attr("values",$(param).attr("type")); }
	return param;
}

function SSresolveActionPlaceHolders(str){
	$.each(str.split('/'), function(i,param) {
		if (param.substr(0,1)=="{" && param.substr(param.length-1)=="}") {
			param = param.substr(1,param.length-2);
			str = str.replace("{"+param+"}",$("#SecureSphereAPI #"+param).val());
		}
	});
	return str;
}

function SSgetURLParams(curObj) {
	var methodObj = SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()][$(ss_method_sel).val()];
	if (curObj!=undefined) setCurrentParamIndex(curObj);
	if (SScurUrlParamsAry.length>(SScurUrlParamsIndex)) {
		$('#SecureSphereAPI #'+SScurUrlParamsAry[SScurUrlParamsIndex].name).html('<option value="">loading...</option>');
		for (var i=(SScurUrlParamsIndex+1); i<SScurUrlParamsAry.length; i++) {
			$('#SecureSphereAPI #'+SScurUrlParamsAry[i].name).html('');
		}
		var curParam = SScurUrlParamsAry[SScurUrlParamsIndex].name;
		if (SSapiParamMapping[curParam]!=undefined) {
			var curAction = null;
			try { curAction = SSresolveActionPlaceHolders(SSapiParamMapping[curParam].getAPIurlMapping.default.url); } catch(err) {}
			if (curAction==null && SSapiParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()]!=undefined) curAction = SSresolveActionPlaceHolders(SSapiParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()].url);
			if (curAction!=null && curAction!=undefined) {
				makeSSCall(curAction,'GET',SSrenderURLParams,{});
			} else {
				if (SSapiParamMapping[curParam].type=="list") {
					$('#SecureSphereAPI #'+SScurUrlParamsAry[SScurUrlParamsIndex].name).html('');
					$.each(SSapiParamMapping[curParam].values, function(i,value) { 
						$('#SecureSphereAPI #'+SScurUrlParamsAry[SScurUrlParamsIndex].name).append('<option value="'+value+'">'+value+'</option>'); 
					});
				} else if (SSapiParamMapping[curParam].type=='boolean') {
					$('#SecureSphereAPI #'+SScurUrlParamsAry[SScurUrlParamsIndex].name).html('<option value="true">true</option><option value="false">false</option>');
				} else if (SSapiParamMapping[curParam].type=='string') {
					$('#SecureSphereAPI #'+SScurUrlParamsAry[SScurUrlParamsIndex].name).html('<option value="'+SSapiParamMapping[curParam].values+'">'+SSapiParamMapping[curParam].values+'</option>');
				}
			}
		} else {
			for (var i=(SScurUrlParamsIndex); i<SScurUrlParamsAry.length; i++) {
				$('#SecureSphereAPI #'+SScurUrlParamsAry[i].name).html('<option value="">Not Currently Available</option>');
			}
		}
	}
}

function setCurrentParamIndex(obj){
	var curIndex = 0;
	$.each(SScurUrlParamsAry, function(i,param){ param.isCurObj=false; });
	if (obj!=undefined) {
		$.each(SScurUrlParamsAry, function(i,param){ if (param.name==obj.id) SScurUrlParamsIndex=(i+1); });
	}
	return curIndex;
}

function SSrenderURLParams(data){
	var tmpAry = {"list":[]};
	if (SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default!=undefined){
		var nestedMappingObj = SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default;
		$.each(data,function(i, ary){
			var nestedItemName = SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default.nestedItemName;
			if (nestedMappingObj.nestedItemLevel==0) { 
				tmpAry.list.push((nestedItemName!=undefined) ? ary[SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default.nestedItemName] : ary); 
			} else if (nestedMappingObj.nestedItemLevel==1 && ary.length!=0) { 
				$.each(ary,function(i, obj){ 
					tmpAry.list.push((nestedItemName!=undefined) ? obj[SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default.nestedItemName] : obj); 
				}); 
			} 
		});
		data = tmpAry;
	}
	populateSelect(SScurUrlParamsAry[SScurUrlParamsIndex].name,data);
	$("#SecureSphereAPI #"+SScurUrlParamsAry[SScurUrlParamsIndex].name).unbind().change(function(){ SSgetURLParams(this); });
	if (SScurUrlParamsAry[SScurUrlParamsIndex].name=='policyName') {
		$('#SecureSphereAPI #policyName').val(curLoadedPolicyName);
		$(ss_method_sel).val('GET');
		$('#SecureSphereAPI #policyName_btn').trigger('click');
		SSUpdateJSON();
		$('#SecureSphereAPI #SSexecute').trigger('click');
	}
	SScurUrlParamsIndex++;
	SSgetURLParams();
}

function SSrenderJSONParamsHTML(){
	$("#SecureSphereAPI #SSJSONparams table").html('');
	var methodObj = jQuery.extend(true, {}, SSSwagger.paths[$("#SecureSphereAPI #SSActions").val()][$(ss_method_sel).val()]);
	if (methodObj.bodyParams!=undefined) {
		$.each(methodObj.bodyParams.index, function(i,paramName) {
			// if (paramName!='body') {
				var param = methodObj.bodyParams.list[paramName];
				param.name = paramName;
				// override for specific parameters
				if (SSapiParamMapping[paramName]!=undefined) param = SSapiParamMapping[paramName];
				var displayName = param.name.replace(/([A-Z])/g, ' $1').replace('I P','IP').replace('I D','ID').replace('Db ','DB ').replace('-',' ').replace('ip','IP');
				displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
				var str = '<tr id="'+param.name+'tr" class="fieldwrapper"><td align="right"><label for="'+param.name+'">'+displayName+': </label></td><td>';
				if (param.type=="list") {
					str += '<select name="'+param.name+'" id="'+param.name+'">';
					$.each(param.values, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
					str += '</select>';
				} else if (param.type=="boolean") {
					str += '<select name="'+param.name+'" id="'+param.name+'">';
					str += '<option value="">-- select --</option><option value="true">true</option><option value="false">false</option>';
					str += '</select>';
				} else if (param.type=="obj") {
					if (SSapiParamMapping[paramName]==undefined) param.values = {}; 
					str += '<textarea class="'+param.type+'" name="'+param.name+'" id="'+param.name+'" style="width:200px;">'+JSON.stringify(param.values)+'</textarea>';
				} else if (param.type=="array") {
					if (SSapiParamMapping[paramName]==undefined) param.values = []; 
					str += '<textarea class="'+param.type+'" name="'+param.name+'" id="'+param.name+'" style="width:200px;">'+JSON.stringify(param.values)+'</textarea>';
					//{"database":"finance","schema":"payroll","application":"financeApp"}, {database":"HR","schema":"","application":"HRApp"}
				} else {
					if (SSapiParamMapping[param]!=undefined) { param.values = SSapiParamMapping[param].values; } else { param.values = ''; }
					str += '<input type="text" class="'+param.type+'" name="'+param.name+'" title="Values: '+param.values+'" placeholder="'+param.values+'" id="'+param.name+'" value="" />';
				}
				str += '</td></tr>';
				$("#SecureSphereAPI #SSJSONparams table").append(str);
			// }
		});
	}
	$('#SecureSphereAPI #db-service-type').change(function(){
		$('#SecureSphereAPI #ports').val('['+dbPortMapping[$(this).val()]+']');
		SSUpdateJSON(); 
	}).trigger("change");
	SSUpdateJSON(); 
}

