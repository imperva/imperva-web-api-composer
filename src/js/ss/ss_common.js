var siteTree = {};
var SSActions = {};
var SSSwagger = {"paths":{}};
var getSSActions = {};

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

Swagger

*/ 

var xsd = {"complexTypes":{},"elements":{}};
var SScurUrlParamsAry = [];
var SScurUrlParamsIndex = 0;
var curSSAuth = {};

$().ready(function() {
	$('#SecureSphereAPI #SSActions').change(function(){ SSchangeAction(); SScurUrlParamsIndex=0; SSgetURLParams(); });
	$('#SecureSphereAPI #SSmethod').change(function(){
		//$('#SSJSONparams .fieldwrapper').hide();
		/*$.each(actions[$("#actions").val()].methods[$('#SSmethod').val()].jsonParams, function(i,param) { 
			$('#'+param.name+'tr').show();
		});*/
		SSrenderJSONParamsHTML();
	});
	$('#SecureSphereAPI #siteName').change(function(){
		SSrenderJSONParamsHTML();
	});
	$('#ss_policies_refresh').button({iconPosition: "beginning", icon: "ui-icon-refresh"}).click(function(){ getAllWAFPolicies(); });
	$('#SecureSphereAPI #db-service-type').change(function(){ 
		$('#SecureSphereAPI #ports').val(dbPortMapping[$(this).val()]);
		SSUpdateJSON(); 
	});
	$('#SecureSphereAPI #SSJSONparams input, #SecureSphereAPI #SSJSONparams textarea').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams select').change(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSrequestUrl').keyup(function(){ checkForm(); SSUpdateCURL(); });
	$('#ssSaveCredentials').click(function(){ ssSaveCredentials(); });
	$('#ssDeleteCredentials').click(function(){ ssDeleteCredentials(); });
	loadSSCredentials();
	$('#SecureSphereAPI #MXServer').blur(function(){ SSupdateReqURL(); });
	$('#SecureSphereAPI #SSdata').blur(function(){ SSUpdateCURL(); });
	SSLoadAll();
	SSUpdateJSON();
});

// Main AJAX function to proxy API calls
function makeSSCall(action,method,callback,postDataObj) {
	if (action!=undefined || checkForm()) {
		var postData = $('#SecureSphereAPI #SSdata').val();
		if (postDataObj!=undefined) postData = JSON.stringify(postDataObj);
		$('#SecureSphereAPI #SSresult').val('processing...');
		var requestUrl = $('#SecureSphereAPI #MXServer').val()+$('#SecureSphereAPI #SSActions').val();
		if (action!=undefined) {
			requestUrl = $('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix+action;
		} else if ($('#SecureSphereAPI #SSrequestUrl').val() != ($('#SecureSphereAPI #MXServer').val()+$('#SecureSphereAPI #SSActions').val())) {
			requestUrl = $('#SecureSphereAPI #SSrequestUrl').val();
		}
		if (method==undefined) method = $('#SecureSphereAPI #SSmethod').val();
		var postParams = JSON.parse($('#SecureSphereAPI #SSdata').val());
		var reqUrl = "ajax/ss_api_post.php?server="+requestUrl;
		reqUrl += "&session="+$('#SecureSphereAPI #jsessionid').val();
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
		$('#SecureSphereAPI #MXServers').append('<option value="'+MX.ip+'">'+MX.displayName+' ('+MX.ip+')</option>'); 
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
	//$('#SecureSphereAPI #MXServers').attr("disabled", false).append('<option value="entermewmx">Enter My Own</option>'); 
	$('#SecureSphereAPI #MXServer').val($('#SecureSphereAPI #MXServers').val());
	renderSSAuth();
}

function renderSSAuth(){
	// add click event to expand Manage Credentials manageSSCredentialsBtn and align with Edit current or add new
	if ($('#SecureSphereAPI #MXServers').val()=='entermewmx') {
		$('#SecureSphereAPI #MX_display_name').parent().parent().show();
		$('#SecureSphereAPI #MXServer').parent().parent().show();
		$('#SecureSphereAPI #MXServer').val('').addClass('highlight').attr('placeholder','https://192.168.1.2:8083');
		$('#SecureSphereAPI #MX_display_name').val('').addClass('highlight').attr('placeholder','MX desc here');
		$('#SecureSphereAPI #SSusername').val('').addClass('highlight').attr('placeholder','MX username here');
		$('#SecureSphereAPI #SSpassword').val('').addClass('highlight').attr('placeholder','MX password here');
		if ($('#manageSSCredentials').css('display')=='none') toggleSSManageCredentials();
	} else {
		$('#SecureSphereAPI #MX_display_name').val(SS_AUTH[$('#SecureSphereAPI #MXServers').val()].MX_display_name);
		$('#SecureSphereAPI #MX_display_name').parent().parent().hide();
		$('#SecureSphereAPI #MXServer').removeClass('highlight').val(SS_AUTH[$('#SecureSphereAPI #MXServers').val()].MXServer);
		$('#SecureSphereAPI #MXServer').removeClass('highlight').parent().parent().hide();
		$('#SecureSphereAPI #SSusername').removeClass('highlight').val(SS_AUTH[$('#SecureSphereAPI #MXServers').val()].SSusername);
		$('#SecureSphereAPI #SSpassword').removeClass('highlight').val(SS_AUTH[$('#SecureSphereAPI #MXServers').val()].SSpassword);
		if ($('#manageSSCredentials').css('display')!='none') toggleSSManageCredentials();
	}
	SSupdateReqURL();
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
	if (SSActions[$("#SecureSphereAPI #SSActions").val()] != undefined) {
		SScurUrlParamsAry = [];
		$("#SecureSphereAPI #SSURLparams table").html('');
		$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods, function(method,obj) { 
			$('#SecureSphereAPI #SSmethod option[value="'+method+'"]').removeAttr('disabled');
		});
		$("#SecureSphereAPI #SSmethod option:not([disabled]):first").attr('selected', 'selected');
		if (SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].urlParams.length!=0) $('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #SSrequestUrl').val()+"?"); 
		$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].urlParams, function(i,param) { 
			var str = param.name+'={'+param.type+'}';
			if (SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].urlParams.length<(i-1)) str += '&';
			$('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #SSrequestUrl').val()+str);
		});
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
		$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$("#SecureSphereAPI #SSmethod").val()].urlParams, function(i,param) {
			$("#SecureSphereAPI #SSURLparams table").append('<tr id="'+param.name+'tr" class="fieldwrapper"><td align="right" width="140"><label for="'+param.name+'">'+param.name+': </label></td>'+
				'<td><a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param.name+'_btn" title="Copy to Request URL">copy</a>'+
				'<select name="'+param.name+'" id="'+param.name+'" class="min query"><option value=""></option></select></td></tr>');
			SScurUrlParamsAry.push({"name":param.name,"desc":param.name});
		});
		initSSCopyButtons();
		// show the params for the selected action, might remove this later as it is not necessary
		//$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].jsonParams, function(i,param) { $('#SecureSphereAPI #'+param.name+'tr').show(); });
	}
	//alert($('#SecureSphereAPI #jsessionid').val());
	if ($('#SecureSphereAPI #jsessionid').val()=="") {
		$("#SecureSphereAPI #SSusernametr").show();
		$("#SecureSphereAPI #SSpasswordtr").show();
		$("#SecureSphereAPI #SSmethod option").attr('disabled','disabled');
		$("#SecureSphereAPI #SSmethod").val('POST');
		reqObj = {"username":$('#SecureSphereAPI #SSusername').val(),"password":$('#SecureSphereAPI #SSpassword').val()}
		$('#SecureSphereAPI #SSdata').val(JSON.stringify(reqObj));
	} else {
		SSrenderJSONParamsHTML();
		SSUpdateJSON();
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
	if (SSActions[$("#SecureSphereAPI #SSActions").val()] != undefined) {
		$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].jsonParams, function(i,param) { 
			if ($('#SecureSphereAPI #'+param.name).val()!="") {
				if (param.type=='array') {
					reqObj[param.name] = JSON.parse($('#SecureSphereAPI #'+param.name).val());
					//reqObj[param.name] = param.values.substr(1,(param.values.length-2)).split(',');
				} else if (param.type=='obj') {
					reqObj[param.name] = JSON.parse($('#SecureSphereAPI #'+param.name).val());
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
	//if ($('#SecureSphereAPI #jsessionid').val()=="") reqObj = {"username":$('#SecureSphereAPI #SSusername').val(),"password":$('#SecureSphereAPI #SSpassword').val()};	
	if ($('#SecureSphereAPI #jsessionid').val()=="") reqObj['Authorization Header'] = "Authorization: Basic "+btoa($('#SecureSphereAPI #SSusername').val()+$('#SecureSphereAPI #SSpassword').val()); 
	$('#SecureSphereAPI #SSdata').val(JSON.stringify(reqObj));
	$('#SecureSphereAPI #SSJSONparams input').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams textarea').blur(function(){ SSUpdateJSON(); });
	$('#SecureSphereAPI #SSJSONparams select').change(function(){ SSUpdateJSON(); });
	SSUpdateCURL();
}
function SSUpdateCURL(){
	if (!$('#SecureSphereAPI #SSrequestUrl').hasClass('errors')) {
		//alert("$('#SecureSphereAPI #SSrequestUrl').hasClass('errors')="+$('#SecureSphereAPI #SSrequestUrl').hasClass('errors'));
		var str = 'curl -ik -X '+$('#SecureSphereAPI #SSmethod').val()+' ';
		if ($('#SecureSphereAPI #jsessionid').val()=="") {
			str += '-H "Authorization: Basic '+btoa($('#SecureSphereAPI #SSusername').val()+$('#SecureSphereAPI #SSpassword').val())+'"'; 
		} else {
			str += '-H "Cookie: '+$('#SecureSphereAPI #jsessionid').val()+'" -H "Content-Type: application/json" -H "Accept: application/json" ';
			if ($('#SecureSphereAPI #SSdata').val()!='{}') str += " -d '"+$('#SecureSphereAPI #SSdata').val()+"' ";
		}
		//str += ' '+$('#SecureSphereAPI #MXServer').val()+encodeURI($('#SecureSphereAPI #SSActions').val());
		str += ' '+encodeURI($('#SecureSphereAPI #SSrequestUrl').val());
		$('#SecureSphereAPI #SScurlUrl').val(str);
	} else {
		$('#SecureSphereAPI #SScurlUrl').val('');
	}
}
function SSupdateReqURL() {
	$('#SecureSphereAPI #SSrequestUrl').val($('#SecureSphereAPI #MXServer').val()+ssDefConfig.actionPrefix+$('#SecureSphereAPI #SSActions').val());
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
				if ($('#SecureSphereAPI #jsessionid').val()!='') {
					$('#SecureSphereAPI #jsessionid').val(data['session-id']);
					$.gritter.add({ title: 'Successfully logged back in!', text: "Generated new JSESSIONID"});
					$('#SecureSphereAPI #SSActions').trigger('change');
					$('#SecureSphereAPI #SSWAFPolicies_dest option').attr("selected", "selected");
					moveSSPolicyLeft();
				} else {
					$.gritter.add({ title: 'Successful Login', text: "Loading XSD File..."});
					$('#SecureSphereAPI #jsessionid').val(data['session-id']);
					$("#SecureSphereAPI #SSusernametr").hide();
					$("#SecureSphereAPI #SSpasswordtr").hide();
					$("#SecureSphereAPI #SSlogin").hide();
					$("#SecureSphereAPI #SSlogoutDiv").show();
					$("#SecureSphereAPI #curUser").html("Logged is as user: <b>"+$("#SecureSphereAPI #SSusername").val()+"</b>");
					$("#SecureSphereAPI #SSexecute").show();
					$("#SecureSphereAPI #loadSiteTreeData").show();
					$("#SecureSphereAPI #SSActions option").removeAttr('disabled');
					//loadWadl();
					loadXsd();
					//loadSwagger();
					$('#SecureSphereAPI #MXServers').attr("disabled", true); 
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

function loadXsd() {
	// var requestUrl = window.location.href;
	// if (window.location.href.indexOf("#")!= -1) requestUrl = window.location.href.substr(0,window.location.href.indexOf("#"));
	// requestUrl +='assets/xsd0_v12_2_60.xsd';
	
	//var requestUrl = window.location.href+'assets/xsd0_v12_2_60.xsd';
    //var requestUrl = window.location.href+"assets/xsd0_v13.xsd";
	//var requestUrl = ssDefConfig.proto+'://'+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.port+ssDefConfig.actionPrefix+"/application.wadl/xsd0.xsd";
	// var reqUrl = "ajax/ss_api_wadl.php?server="+requestUrl;

	// hack in place until the migration to swagger format
	var reqUrl = "ajax/ss_schema.php?fileType=XSD";
	reqUrl += "&session="+$('#SecureSphereAPI #jsessionid').val();
	reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
	reqUrl += "&method="+"GET";
	
	jQuery.ajax ({
		url: encodeURI(reqUrl),
		type: "POST",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			$.gritter.add({ title: 'Processing...', text: "Parsing XSD, loading WADL"});
			var xsdXML = $.parseXML(data);
            $xsdObj = $(xsdXML);
			responseObj = $xsdObj;
			$xsdObj.children().first().children().each(function(i) {
				if ((this).nodeName=="xs:element") xsd.elements[$(this).attr("name")] = $(this).attr("type");
			});
			$xsdObj.find("xs\\:complexType").each(function(i) {
				var complexType = $(this).attr("name");
				xsd.complexTypes[complexType] = [];
				$(this).find('xs\\:element').each(function(j) {
	    			var type = 'n/a'; if ($(this).attr('type')!=undefined) type = $(this).attr('type').substr(3); 
	    			xsd.complexTypes[complexType].push({"name":$(this).attr('name'),"type":type});
	    		});
    		});
    		loadWadl();
		}
	});	
}

function loadWadl() {
	//var requestUrl = ssDefConfig.proto+'://'+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.port+ssDefConfig.actionPrefix+"/application.wadl";
	//var requestUrl = window.location.href+'assets/v13_application.wadl';    
	//var reqUrl = "ajax/ss_api_wadl.php?server="+requestUrl;
	
	var reqUrl = "ajax/ss_schema.php?fileType=WADL";
	reqUrl += "&session="+$('#SecureSphereAPI #jsessionid').val();
	reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
	reqUrl += "&method="+"GET";

	jQuery.ajax ({
		url: encodeURI(reqUrl),
		type: "POST",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			var wadlXML = $.parseXML(data);
			$wadlObj = $(wadlXML);
			responseObj = $wadlObj;
			var resources = $wadlObj.find("resources").eq(0).children().eq(0).children();
			var defActionObjStr = '{"methods":{}}';
			var defMethodObjStr = '{"urlParams":[],"jsonParams":[]}';
			$.each(resources, function(i_0,res) {
				var resPath = $(res).attr('path');
				$.each(resources.eq(i_0).children(), function(i_1,subRes1) {
					var resSubPath1 = String(resPath+"/"+$(subRes1).attr('path')).replace("//","/");
					$.each($(subRes1).children(), function(i_2,subRes2) {
						if ((subRes2).nodeName=="resource") {
							var resSubPath2 = String(resSubPath1+"/"+$(subRes2).attr('path')).replace("//","/");
							if ($(subRes2).find("method").children().length>0) SSActions[resSubPath2] = JSON.parse(defActionObjStr);
							$.each($(subRes2).children(), function(i_3,subRes3) {
								if ((subRes3).nodeName=="resource") {
									var resSubPath3 = String(resSubPath2+"/"+$(subRes3).attr('path')).replace("//","/");
									if ($(subRes3).find("method").children().length>0) SSActions[resSubPath3] = JSON.parse(defActionObjStr);
									$.each($(subRes3).children(), function(i_4,subRes4) {
										if ((subRes4).nodeName=="resource") {
											var resSubPath4 = String("/"+$(subRes4).attr('path')).replace("//","/");
											if ($(subRes4).find("method").children().length>0) SSActions[resSubPath4] = JSON.parse(defActionObjStr);
										} else if ((subRes4).nodeName=="method") {
											if (SSActions[resSubPath3]==undefined) SSActions[resSubPath3] = JSON.parse(defActionObjStr);
											if ($(subRes4).attr('id').search(/getall/i)==0) getSSActions[$(subRes4).attr('id').toLowerCase()] = resSubPath3;
											SSActions[resSubPath3].methods[$(subRes4).attr("name")] = JSON.parse(defMethodObjStr);
											$.each($(subRes4).find("request").first().children(), function(c_i,param) {
												//console.log(param);
												if ((param).nodeName=="param") {
                                                    //console.log("nodeName==param");
                                                    if ($(param).attr("style")=='query') {
														if ($(param).attr("type").substr(0,3)=="xs:") $(param).attr("type",$(param).attr("type").substr(3));
														if (SSapiParamMapping[$(param).attr("name")]!=undefined) { param=SSapiParamMapping[$(param).attr("name")]; } else { $(param).attr("values",$(param).attr("type")); }														
														SSActions[resSubPath3].methods[$(subRes4).attr("name")].urlParams.push({"name":$(param).attr("name"),"type":$(param).attr("type"),"values":$(param).attr("values")});
													}
												} else if ((param).nodeName=="ns2:representation" || (param).nodeName=="representation") {
                                                    // console.log("nodeName==representation");
													// console.log($(param).attr("element"));
													// console.log(xsd.elements);
													// console.log(xsd.complexTypes);
													if (xsd.complexTypes[xsd.elements[$(param).attr("element")]]!=undefined) {
														$.each(xsd.complexTypes[xsd.elements[$(param).attr("element")]], function(p_i,param) {
                                                            //console.log(param);
															//console.log(param);
															if (SSFormatJSONParamObj(param)!=null) SSActions[resSubPath3].methods[$(subRes4).attr("name")].jsonParams.push(SSFormatJSONParamObj(param));
														});
													}
												}
											});
										}
									});
								} else if ((subRes3).nodeName=="method") {
									if (SSActions[resSubPath2]==undefined) SSActions[resSubPath2] = JSON.parse(defActionObjStr);
									if ($(subRes3).attr('id').search(/getall/i)==0) getSSActions[$(subRes3).attr('id').toLowerCase()] = resSubPath2;
									SSActions[resSubPath2].methods[$(subRes3).attr("name")] = JSON.parse(defMethodObjStr);
									$.each($(subRes3).find("request").first().children(), function(b_i,param) {
										if ((param).nodeName=="param") {
											if ($(param).attr("style")=='query') {
												if ($(param).attr("type").substr(0,3)=="xs:") $(param).attr("type",$(param).attr("type").substr(3));
												if (SSapiParamMapping[$(param).attr("name")]!=undefined) { param=SSapiParamMapping[$(param).attr("name")]; } else { $(param).attr("values",$(param).attr("type")); }
												SSActions[resSubPath2].methods[$(subRes3).attr("name")].urlParams.push({"name":$(param).attr("name"),"type":$(param).attr("type"),"values":$(param).attr("values")});
											}
										} else if ((param).nodeName=="ns2:representation") {
											if (xsd.complexTypes[xsd.elements[$(param).attr("element")]]!=undefined) {
												$.each(xsd.complexTypes[xsd.elements[$(param).attr("element")]], function(p_i,param) {
                                                    //console.log(param);
													if (SSFormatJSONParamObj(param)!=null) SSActions[resSubPath2].methods[$(subRes3).attr("name")].jsonParams.push(SSFormatJSONParamObj(param));
												});
											}
										}
									});
								}
							});
						} else if ((subRes2).nodeName=="method") {
							if (SSActions[resSubPath1]==undefined) SSActions[resSubPath1] = JSON.parse(defActionObjStr);
							if ($(subRes2).attr('id').search(/getall/i)==0) getSSActions[$(subRes2).attr('id').toLowerCase()] = resSubPath1;
							SSActions[resSubPath1].methods[$(subRes2).attr("name")] = JSON.parse(defMethodObjStr);
							$.each($(subRes2).find("request").first().children(), function(a_i,param) {
								if ((param).nodeName=="param") {
									if ($(param).attr("style")=='query') {
										if ($(param).attr("type").substr(0,3)=="xs:") $(param).attr("type",$(param).attr("type").substr(3));
										if (SSapiParamMapping[$(param).attr("name")]!=undefined) { param=SSapiParamMapping[$(param).attr("name")]; } else { $(param).attr("values",$(param).attr("type")); }
										SSActions[resSubPath1].methods[$(subRes2).attr("name")].urlParams.push({"name":$(param).attr("name"),"type":$(param).attr("type"),"values":$(param).attr("values")});
									}
								} else if ((param).nodeName=="ns2:representation") {
									if (xsd.complexTypes[xsd.elements[$(param).attr("element")]]!=undefined) {
										$.each(xsd.complexTypes[xsd.elements[$(param).attr("element")]], function(p_i,param) {
                                            //console.log(param);
											if (SSFormatJSONParamObj(param)!=null) SSActions[resSubPath1].methods[$(subRes2).attr("name")].jsonParams.push(SSFormatJSONParamObj(param));
										});
									}
								}
							});
						}
					});
				});
			});
			// Override Methods
			$.each(SSActions, function(action,actionObj) {
				if (SSapiParamMapping[action]!=null) {
					$.each(SSActionsParamMapping[action].methods, function(mappedMethod,methodObj) {
						if (action=='/v1/conf/dbServices/{siteName}/{serverGroupName}/{dbServiceName}' && mappedMethod=='PUT'){
							//console.log(methodObj);
						}
						SSActions[action].methods[mappedMethod] = methodObj;
					});
				}
			});
			$('#SecureSphereAPI #SSActions').html("");
			var actionkeys = Object.keys(SSActions);
			actionkeys.sort();
			for (var i=0; i<actionkeys.length; i++) { $('#SecureSphereAPI #SSActions').append('<option value="'+actionkeys[i]+'">'+actionkeys[i]+'</option>'); }
			$.gritter.add({ title: 'Success', text: "Loaded WADL and populated actions"});
			SSchangeAction();
			getAllWAFPolicies();
		}
	});	
}

function loadSwagger(){
	var requestUrl = window.location.href+"assets/"+localStorage.getItem('SS_VERSION').substr(0,2)+"_swagger.json";
	//var requestUrl = ssDefConfig.proto+'://'+$('#SecureSphereAPI #MXServer').val()+ssDefConfig.port+"/api/experimental/internal/swagger";
	var reqUrl = "ajax/ss_api_wadl.php?server="+requestUrl;
	reqUrl += "&session="+$('#SecureSphereAPI #jsessionid').val();
	reqUrl += "&contentType="+$('#SecureSphereAPI #SScontentType').val();
	reqUrl += "&method="+"GET";
	
	jQuery.ajax ({
		url: encodeURI(reqUrl),
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			$.gritter.add({ title: 'Processing...', text: "loading Swagger schema"});
			SSSwagger = JSON.parse(data);
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
			if (curAction==null && SSapiParamMapping[curParam].getAPIurlMapping[$('#SecureSphereAPI #SSActions').val()]!=undefined) curAction = SSresolveActionPlaceHolders(SSapiParamMapping[curParam].getAPIurlMapping[$('#SecureSphereAPI #SSActions').val()].url); 
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
	try { 
		if (SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default!=undefined){
			if (SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default.nestedItemName!=undefined) {
				$.each(data,function(i, ary){
					if (ary.length!=0) { 
						$.each(ary,function(i, obj){ 
							tmpAry.list.push(obj[SSapiParamMapping[SScurUrlParamsAry[SScurUrlParamsIndex].name].getAPIurlMapping.default.nestedItemName]); 
						}); 
					} 
				});
				data = tmpAry;
			} 
		}
	} catch(err) {}	
	//$.each(data,function(key, ary){ ary.sort(); });
	populateSelect(SScurUrlParamsAry[SScurUrlParamsIndex].name,data);
	$("#SecureSphereAPI #"+SScurUrlParamsAry[SScurUrlParamsIndex].name).unbind().change(function(){ 
		SSgetURLParams(this); 
	});
	if (SScurUrlParamsAry[SScurUrlParamsIndex].name=='policyName') {
		//alert(SScurUrlParamsAry[SScurUrlParamsIndex].name);
		$('#SecureSphereAPI #policyName').val(curLoadedPolicyName);
		$('#SecureSphereAPI #SSmethod').val('GET');
		$('#SecureSphereAPI #policyName_btn').trigger('click');
		SSUpdateJSON();
		$('#SecureSphereAPI #SSexecute').trigger('click');
	}
	SScurUrlParamsIndex++;
	SSgetURLParams();
}

function SSrenderJSONParamsHTML(){
	$("#SecureSphereAPI #SSJSONparams table").html('');
	//console.log(SSActions[$("#SecureSphereAPI #SSActions").val()]+' | method: '+SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()]);
	//console.log(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].jsonParams);
	$.each(SSActions[$("#SecureSphereAPI #SSActions").val()].methods[$('#SecureSphereAPI #SSmethod').val()].jsonParams, function(i,param) {
		if (param.name!=undefined) {
			var displayName = param.name.replace(/([A-Z])/g, ' $1').replace('I P','IP').replace('I D','ID').replace('Db ','DB ').replace('-',' ').replace('ip','IP');
			displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
			var str = '<tr id="'+param.name+'tr" class="fieldwrapper"><td align="right"><label for="'+param.name+'">'+displayName+': </label></td><td>';
			if (param.type=="list") {
				str += '<select name="'+param.name+'" id="'+param.name+'">';
				$.each(param.values, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
				str += '</select>';
			} else if (param.type=="boolean") {
				str += '<select name="'+param.name+'" id="'+param.name+'">';
				str += '<option value="true">true</option><option value="false">false</option>';
				str += '</select>';
			} else if (param.type=="array" || param.type=="obj") {
				str += '<textarea class="'+param.type+'" name="'+param.name+'" id="'+param.name+'" style="width:200px;">'+JSON.stringify(param.values)+'</textarea>';
				//{"database":"finance","schema":"payroll","application":"financeApp"}, {database":"HR","schema":"","application":"HRApp"}
			} else {
				str += '<input type="text" class="'+param.type+'" name="'+param.name+'" id="'+param.name+'" value="'+param.values+'" />';
			}
			str += '</td></tr>';
			$("#SecureSphereAPI #SSJSONparams table").append(str);
		}
		/*
		if ($(param).attr("name") !=undefined) {
			var displayName = $(param).attr("name").replace(/([A-Z])/g, ' $1').replace('I P','IP').replace('I D','ID').replace('Db ','DB ').replace('-',' ').replace('ip','IP');
			displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
			var str = '<tr id="'+$(param).attr("name")+'tr" class="fieldwrapper"><td align="right"><label for="'+$(param).attr("name")+'">'+displayName+': </label></td><td>';
			if ($(param).attr("type")=="list") {
				str += '<select name="'+$(param).attr("name")+'" id="'+$(param).attr("name")+'">';
				$.each($(param).attr("values"), function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
				str += '</select>';
			} else if ($(param).attr("type")=="array" || $(param).attr("type")=="obj") {
				str += '<textarea class="'+$(param).attr("type")+'" name="'+$(param).attr("name")+'" id="'+$(param).attr("name")+'" style="width:200px;">'+JSON.stringify($(param).attr("values"))+'</textarea>';
				//{"database":"finance","schema":"payroll","application":"financeApp"}, {database":"HR","schema":"","application":"HRApp"}
			} else {
				str += '<input type="text" class="'+$(param).attr("type")+'" name="'+$(param).attr("name")+'" id="'+$(param).attr("name")+'" value="'+$(param).attr("values")+'" />';
			}
			str += '</td></tr>';
			$("#SecureSphereAPI #SSJSONparams table").append(str);
		}
		*/
	});
	SSUpdateJSON(); 
}

