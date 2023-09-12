var incapActions = {};
var incap_action_sel = '#IncapsulaAPI #incapActions';
var incap_method_sel = '#IncapsulaAPI #incapMethod';
var incap_req_url_sel = '#IncapsulaAPI #incapRequestUrl';
var incap_data_sel = '#IncapsulaAPI #incapData';
var incap_url_param_sel = '#IncapsulaAPI #incapURLparams';
var apiDefinitionsAry = [];
var apiDefinitionIndex = 0;
var apiDefinitionIndex_processed = 0;

$().ready(function() {
	$("#mainNav").tabs();
	apiDefinitionsAry = getAPIDefinitionIndexes(incapAPIDefinitions);
	while (apiDefinitionIndex < apiDefinitionsAry.length) {
		var curApiDefName = apiDefinitionsAry[apiDefinitionIndex];
		loadcwafswagger(incapAPIDefinitions[curApiDefName]["endpoint"]);
		apiDefinitionIndex++;
	}
});

function loadcwafswagger(apiDefinitionEndpoint){
	// requrl = (apiDefinitionEndpoint.substr(0, 4).toLowerCase()=="http") ? 'ajax/incap_swagger.php?apiDefinitionIndex='+apiDefinitionIndex+'&endpoint='+apiDefinitionEndpoint : apiDefinitionEndpoint+'?apiDefinitionIndex='+apiDefinitionIndex;
	requrl = 'ajax/incap_swagger.php?apiDefinitionIndex='+apiDefinitionIndex+'&endpoint='+apiDefinitionEndpoint;
	jQuery.ajax ({
		url: encodeURI(requrl),
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			var curApiDefName = apiDefinitionsAry[data.apiDefinitionIndex];
			// $.gritter.add({ title: 'Processing...', text: "loading Swagger: "+curApiDefName});
			incapAPIDefinitions[curApiDefName]["definition"] = data;
			apiDefinitionIndex_processed++;
			if (apiDefinitionIndex_processed == apiDefinitionsAry.length) { 
				initIncap(); 
			}
		}
	});
}

function initIncap(){
	$.each(incapAPIDefinitions, function(optGroup,swagger) { 		
		var str = '<optgroup label="'+optGroup+'">';
		try {
			var swaggerPaths = Object.keys(swagger.definition.paths).sort();
			$.each(swaggerPaths, function(i,action) {
				var actionObj = swagger.definition.paths[action];
				var curAction = (swagger.definition.basePath!=undefined?swagger.definition.basePath:'')+action
				str += '<option value="'+curAction+'">'+curAction+'</option>';
			});
		} catch(err) {
			str += '<option value="">Error parsing swagger</option>';
			$.gritter.add({ title: 'ERROR', text: "Error retrieving and parsing swagger for: "+optGroup});
		}		
		str += '</optgroup>';
		$("#incapActions").append(str); 
	});
	$.each(incapSampleRules, function(optGroup,rules) { 
		var str = '<optgroup label="'+optGroup+'">';
		$.each(rules, function(i,rule) { str += '<option value="'+optGroup+'|'+i+'">'+rule.name+'</option>'; });
		str += '</optgroup>';
		$("#incapSampleRules").append(str).change(function(){
			var confAry = $('#'+this.id).val().split('|');
			copyElement("incap_rules",incapSampleRules[confAry[0]][confAry[1]]);
		}); 
	});	
	$('#incapServer').val(incapDefConfig.server);
	$('#incapActions').change(function(){ changeAction(); });
	$('#incapMethod').change(function(){ renderParamsHTML(); });
	$('#incapAuth').change(function(){ incap_generateCodeExamples() });
	$('#incap_migrationConfigType').change(function(){ renderMigrationToolbar_config(this); });
	$('#incap_migrationActionType').change(function(){ renderMigrationToolbar_action(this); });

	$('#execute').click(function(){ makeIncapCall(); });
	// Incapsula API credential management
	$('#incapSaveCredentials').click(function(){ incapSaveCredentials(); });
	$('#incapDeleteCredentials').click(function(){ incapDeleteCredentials(); });
	$('#incapDeleteAllCredentials').click(function(){ incapDeleteAllCredentials(); });
	$('#incapBulkImportCredentials').click(function(){ incapBulkImportCredentials(); });

	$('#incap_configMaskSecretKey').click(function(){ incap_generateCodeExamples() });
	$('#incapData').blur(function(){ incap_generateCodeExamples() });
	$('#incapbodyParams input, #incapbodyParams textarea').blur(function(){ updateRequestDataFromJsonParams(); });
	$('#incapbodyParams select, #incapAccountIDList').change(function(){ updateRequestDataFromJsonParams(); });
	//$('#incapRequestUrl').keyup(function(){ checkForm(); });
	// $('#incapServer').blur(function(){ incapUpdateReqURL(); });
	$('#insertDestCreds').button().click(function(){
		var curstr = $('#bulk_curl_examples').html();
		if ($('#dest_site_id').val()!='') curstr = curstr.replace(/your_site_id_here/g,$('#dest_site_id').val().trim());
		if ($('#dest_api_id').val().trim()!='') curstr = curstr.replace(/your_api_id_here/g,$('#dest_api_id').val().trim());
		if ($('#dest_api_key').val().trim()!='') curstr = curstr.replace(/your_api_key_here/g,$('#dest_api_key').val().trim());
		$('#bulk_curl_examples').html(curstr);
	});	
	$('.page_num').html(renderPageNumberOptions());
	$('.page_size').val(incapDefConfig.sitePageSize);
	incapLoadAll();
}
// Main AJAX function to proxy API calls
function makeIncapCall(apiUrl=$('#incapRequestUrl').val(),method,auth,callback,postDataObj,input_id, contentType) {
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	if (contentType==undefined) contentType = ((curSwagger.definition.consumes!=undefined) ? curSwagger.definition.consumes[0] : "application/json");
	if ((input_id==undefined) || auth==undefined || auth==null) {
		var auth_tmp = getUserAuthObj($('#incapAccountsList').val());
		auth = {"api_id":auth_tmp.api_id,"api_key":auth_tmp.api_key}
		$('#incapResult').val('');
		// if (auth.api_key.substr(0,10)=='**********') auth.api_key = auth_tmp.api_key;
		// $('#incapResult').val('processing...');
	} else if (input_id=='dest') {
		auth['api_key'] = $('#dest_api_key').val();
		auth['api_id'] = $('#dest_api_id').val();
	} else if (input_id=='set') {
		// do nothing as the credentials are passed into the PostDataObj as an input to the function
	}
	//  else {
	// 	var auth_tmp = getUserAuthObj($('#incapAccountsList').val());
	// 	auth = {"api_id":auth_tmp.api_id,"api_key":auth_tmp.api_key}
	// }
	if (auth.method==undefined) auth.method = $('#incapAuth').val(); 
	if (method==undefined) method = $('#incapMethod').val().toUpperCase();
	if (postDataObj==undefined){
		if (method.toUpperCase()!="GET" && method.toUpperCase()!="DELETE") {
			if (contentType=="application/json"){
				postDataObj = {"jsonData":$('#incapData').val()};
			} else {
				postDataObj = {"postData":($('#incapData').val()!='') ? JSON.parse($('#incapData').val()) : ''};
				// postDataObj = JSON.parse($('#incapData').val());
			}
		} else {
			postDataObj = {"postData":($('#incapData').val()!='') ? JSON.parse($('#incapData').val()) : ''};
		}
	}
	postDataObj["headerData"] = ["Content-Type: "+contentType,"Accept: application/json"]
	var urlParamsAry = apiUrl.split("?");
	var curRequestUrl = urlParamsAry.shift();
	if (auth.method=="query") {
		urlParamsAry.push("api_id="+auth.api_id);
		urlParamsAry.push("api_key="+auth.api_key);
	} else {
		postDataObj["headerData"].push("x-API-Key: "+auth["api_key"]);
		postDataObj["headerData"].push("x-API-Id: "+auth["api_id"]);
	}
	var reqUrl = "ajax/incap_api_post.php?server="+curRequestUrl+"?"+encodeURIComponent(urlParamsAry.join("&"));
	reqUrl += "&contentType="+contentType;
	reqUrl += "&method="+method;
	
	$.post(encodeURI(reqUrl), postDataObj, function(data) {
		if (data!=null) {
			responseObj = data;
			// if (input_id==undefined || input_id==null) $('#incapResult').val((IsJsonString(data)) ? JSON.stringify(data) : data);
			if (input_id==undefined || input_id==null) $('#incapResult').val(JSON.stringify(data));
			//if (responseObj.res_message!="Authentication missing or invalid") {
				if (callback!=undefined) { 
					if (input_id!=null && input_id!=undefined && input_id!='dest') {
						return callback(data,input_id); 
					} {
						return callback(data); 
					} 
				}
			//} else {
			//	$.gritter.add({ title: 'Error', text: responseObj.res_message });
			//}
		} else {
			$.gritter.add({ title: 'ERROR', text: "API response error, unable to connect to Incapsula."});
		}
	});
}

function getSwHost(swaggerKey){
	var host = "https://"+incapAPIDefinitions[swaggerKey].definition.host;
	if (host && incapAPIDefinitions[swaggerKey].definition.servers && incapAPIDefinitions[swaggerKey].definition.servers.length>0) {
		if (incapAPIDefinitions[swaggerKey].definition.servers[0].url!=undefined) {
			host = incapAPIDefinitions[swaggerKey].definition.servers[0].url
		}
	}
	return (host);
}

function incapUpdateReqURL() {
	if ($(incap_req_url_sel).val()=='') {
		$(incap_req_url_sel).val($('#IncapsulaAPI #incapServer').val()+$(incap_action_sel).val()+queryStr);
		// $('#IncapsulaAPI #incapServer').val()+$(incap_action_sel).val()
	} else {
		var curReqUrl = $(incap_req_url_sel).val().split("?");
		var queryParams = [];
		$.each($('.queryParams'), function(i,input) {
			if (input.value!='') queryParams.push(input.id+"="+((timestampParam[input.id]) ? new Date(input.value).valueOf(): input.value));
		});
		$(incap_req_url_sel).val(curReqUrl[0]+"?"+queryParams.join("&"));
	}
	if (checkIncapForm()) incap_generateCodeExamples();
}

function checkIncapForm(){
	var isok = true;
	if (!($('#incapRequestUrl').val().indexOf('{') == -1)) {
		$('#incapRequestUrl').addClass('errors');
		isok=false;
	} else {
		$('#incapRequestUrl').removeClass('errors');
	}
	$.each($('#incapbodyParams .bodyParams.parent'), function(i,input) {
		var inputObj = $('#'+input.id)
		if (inputObj.val()=='' && inputObj.hasClass("parent")) {
			inputObj.val(($('#'+input.id).parent().prop("class")=='object') ? "{}" : "[]");
		}
		if (inputObj.prop("required") && inputObj.val()=='') {
			inputObj.addClass('errors');
			isok = false;
		} else if (!IsJsonString(input.value) && inputObj.val()!='') {
			inputObj.addClass('errors');
			isok = false;
		} else {
			inputObj.removeClass('errors');
		}
	});
	return isok;
}

// Update UI display/fields based on selected action
function changeAction() {
	var reqObj = {}; 
	$(incap_method_sel+' option').attr('disabled','disabled');
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	$('#incapContentType').val((curSwagger.definition.consumes!=undefined) ? curSwagger.definition.consumes[0] : "application/json");
	$("#incapServer").val(getSwHost($('#incapActions :selected').parent().attr('label')));
	var curBasePath = (curSwagger.definition.basePath!=undefined ? curSwagger.definition.basePath : '');
	var currentAction = $("#incapActions").val().substr(curBasePath.length);
	if (incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')].definition.paths[currentAction] != undefined) {
		incapCurUrlParamsAry = [];
		var actionObj = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')].definition.paths[currentAction];
		$(incap_url_param_sel+" table").html('');
		$.each(actionObj, function(method,methodObj) {
			$(incap_method_sel+' option[value="'+method+'"]').removeAttr('disabled');
			// delete methodObj.queryParams; delete methodObj.bodyParams; delete methodObj.pathParams; delete methodObj.formParams;
			methodObj.headerParams = {index:[],list:[]};
			methodObj.queryParams = {index:[],list:[]};
			methodObj.bodyParams = {index:[],list:[]};
			methodObj.pathParams = {index:[],list:[]};
			methodObj.formDataParams = {index:[],list:[]};
			
			$.each(currentAction.split("/"), function(i,paramName) {
				if (paramName.substr(0,1)=="{") methodObj.pathParams.index.push(paramName.substr(1,paramName.length-2))
			});
			$.each(methodObj.parameters, function(i,param) {
				if (param.in=="body") { // Body params always have a schema
					if (param.schema!=undefined) {
						var curParamDefinitionName = param.schema.items!=undefined ? param.schema.items['$ref'].split('/').pop() : param.schema['$ref'].split('/').pop();
						curParamDefinition = curSwagger.definition.definitions[curParamDefinitionName];
						if (curParamDefinition.properties!=undefined) {
							methodObj.bodyParams = getNestedBodyParams(methodObj.bodyParams,'',curParamDefinition);
						}
					} 
				} else {
					param.id_str = param.name;
					methodObj[param.in+"Params"].list[param.name] = param;
					if (param.in!="path") methodObj[param.in+"Params"].index.push(param.name);
				}
			});
		});
		$("#IncapsulaAPI #incapMethod").val($("#IncapsulaAPI #incapMethod option:not([disabled]):first").val());
	}
	renderParamsHTML();
	toggleincapSampleRules();
	incapUpdateReqURL();
	updateRequestData();
}

function getNestedBodyParams(bodyParamsAry,parentParamPath,curParamDefinition){
	var requiredParams = {};
	if (curParamDefinition.required!=undefined) { 
		for (i in curParamDefinition.required) { requiredParams[(parentParamPath=='') ? curParamDefinition.required[i] : parentParamPath+'.'+curParamDefinition.required[i]]=true; } 
	}
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	// console.log(curParamDefinition);
	$.each(curParamDefinition.properties, function(bodyParamName,bodyParam) {
		var curParamPath = (parentParamPath=='') ? bodyParamName : parentParamPath+'.'+bodyParamName;
		if (bodyParam.properties!=undefined) {
			bodyParamsAry = getNestedBodyParams(bodyParamsAry,curParamPath,bodyParam);
		} else {
			if (bodyParam.type=="array" && bodyParam.items["$ref"]!=undefined) {
				var curParamDefinitionName = bodyParam.items['$ref'].split('/').pop();
				// if (curParamDefinition.properties!=undefined) {
				bodyParamsAry = getNestedBodyParams(bodyParamsAry,curParamPath+"__",curSwagger.definition.definitions[curParamDefinitionName]);
				// }
			} else if (bodyParam["$ref"]!=undefined) {
				var curParamDefinitionName = bodyParam['$ref'].split('/').pop();
				bodyParamsAry = getNestedBodyParams(bodyParamsAry,curParamPath+"__",curSwagger.definition.definitions[curParamDefinitionName]);
			}
			bodyParam.name = curParamPath;
			bodyParam.id_str = curParamPath.replaceAll(".","_");
			bodyParam.required = (requiredParams[bodyParam.name]==true) ? true : false;
			bodyParamsAry.list[curParamPath] = bodyParam;
			bodyParamsAry.index.push(curParamPath);
		}
	});
	return bodyParamsAry;
}

function updateRequestData() {
	incapUpdateReqURL();
	updateRequestDataFromJsonParams();
	updateRequestDataFromFormDataParams();
}


function addObjectToParent(input){
	var parentId = input.id.replace("_add","");
	if (IsJsonString($('#'+parentId).val())){
		var curObject = {};
		// console.log("parentId="+parentId);
		$.each($('#incapbodyParams #'+parentId+"_tbl").find("input, select, textarea"), function(i,param) {
			if (!param.id.substr(parentId.length+3).includes("___") && param.value!=''){
				var paramName = ((param.id.includes("___")) ? param.id.split("___").pop() : param.id);
				var val = parseParamValue($('#'+param.id));
				if (val!=null) curObject[paramName] = val;
			}
		});
		if ($('#'+parentId).parent().prop("class")=='object') {
			$('#'+parentId).val(JSON.stringify(curObject));
		} else {
			var parentParamAry = JSON.parse($('#'+parentId).val());
			parentParamAry.push(curObject);
			$('#'+parentId).val(JSON.stringify(parentParamAry));
		}
	} else {
		$.gritter.add({ title: 'ERROR', text: "Malformed parameter: '"+$('#'+parentId).attr("title")+"' is not valid '"+$('#'+parentId).parent().prop("class")+"' syntax"});
	}
}

function parseParamValue(input){
	var val = input.val();
	if (timestampParam[input.attr("id")]) {
		val = new Date(input.val()).valueOf();
	// } else if (base_64Param[input.attr("id")]) {
	// 	val = btoa(input.val());
	} else {
		// console.log(param.id+" class="+input.parent().attr("class"));			
		switch (input.parent().attr("class")) {
			case "object":
				val = (IsJsonString(val) ? JSON.parse(val) : null)
				break;
			case "array_object":
				val = (IsJsonString(val) ? JSON.parse(val) : null)
				break;
			case "array_string":
				val = (val!=null) ? val.replaceAll("[","").replaceAll("]","").replaceAll('"',"").replaceAll("'","").split(",") : '';
				break;
			case "array_integer":
				valAry = [];
				if (val != null) {
					// $.each(val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(","), function (i, paramVal) {
					if (!Array.isArray(val)) val = val.replaceAll("[", "").replaceAll("]", "").replaceAll('"', "").replaceAll("'", "").split(",")
					$.each(val, function (i, paramVal) {
						valAry.push((!isNaN(parseInt(val, 10))) ? parseInt(paramVal, 10) : parseInt(paramVal, 10));
					});
				}
				val = valAry;
				break;
			case "integer":
				if (timestampParam[input.attr("name")]) {
					val = (!isNaN(parseInt(val,10))) ? parseInt(val,10) : "NaN";
				} else {
					val = (!isNaN(parseInt(val,10))) ? parseInt(val,10) : "NaN";
				}
				break;
			case "boolean":
				val = (val=='true') ? true : false;
				break;
			case "parent":
				val = JSON.parse(val);
				break;
			}
	}
	return val;
}

function updateRequestDataFromJsonParams(){
	if (checkIncapForm() && $('#incapbodyParams .bodyParams').length>0) {
		var reqObj = {}
		$.each($('#incapbodyParams .bodyParams.parent1'), function(i,param) {
			if ($('#'+param.id).val()!='') {
				if (reqObj[param.id]==undefined) reqObj[param.id] = (($('#'+param.id).parent().attr("class")=="object") ? {} : [] )
				reqObj[param.id] = JSON.parse(param.value);
			}
		});
		$.each($('#incapbodyParams .bodyParams.param'), function(i,param) {
			if ($('#'+param.id).val()!='' && !param.id.includes("___")) reqObj = setNestedBodyParams(reqObj,param.name.split("."),param);
		});
		// $.each($('#incapbodyParams .bodyParams.parent'), function(i,param) {
		// 	reqObj = setNestedBodyParams(reqObj,param.name.split("."),param)
		// });

		$('#incapData').val(JSON.stringify(reqObj));
	}
	incap_generateCodeExamples();
}

function updateRequestDataFromFormDataParams(){
	if ($('#incapformDataParams .formDataParams').length>0) {
		var queryParams = {};
		$.each($('#incapformDataParams .formDataParams'), function(i,input) {
			if (input.value!='') queryParams[input.id] = ((timestampParam[input.id]) ? new Date(input.value).valueOf(): (base_64Param[input.id]) ? btoa(input.value) : ($("#"+input.id).prop("multiple")) ? Array.from($("#"+input.id+" option:checked"),e=>e.value) : parseParamValue($('#'+input.id)));
		});
		$('#incapData').val(JSON.stringify(queryParams));
	}
	incap_generateCodeExamples();
}
// function updateReqURL() {
// 	$('#incapRequestUrl').val($('#incapServer').val()+$('#incapActions').val());
// 	//checkForm();
// }

function incapLoadAll() {	
	loadCredentials();
	renderIncapUsers();
	renderIncapUserGroups();
	renderIncapPolicyGroups();
	renderIncapPolcies();
	renderIncapSiteGroups();
	renderIncapACLWAFRules();
	renderIncapACLWAFGroups();
	//renderMigrationToolbar();
	$("#incapActions option:eq(0)").removeAttr('disabled').attr('selected', 'selected');
	$('#incapResult').val('');
}


// Incap credentials management
function loadCredentials(){
	if (localStorage.getItem('INCAP_USERS')==null) localStorage.setItem('INCAP_USERS','{}');
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	$("#incap_site_group_account_list").html('');
	// $("#incapAccountsList").html('');
	// $("#incapSitesAccountsList").html('');
	$('.incap_account_select').html('').removeClass('highlight');
	$('.incap_account_input').val('').removeClass('highlight').attr('placeholder','');
	$('#incap_add_new_user').removeClass('highlight');
	// .incap_account_select = #incap_site_group_account_list, #incapAccountsList, #incapSitesAccountsList, #account_id
	// .incap_account_ID_select = #incapAccountIDList, #incapSitesAccountIDList
	// .incap_account_input = #user_name, #api_id, #api_key
	$.each(INCAP_USERS, function(index_id,configObj) {
		$(".incap_account_select").append('<option title="account_id: '+configObj.account_id+' | api_id: '+configObj.api_id+'" value="'+index_id+'">'+configObj.user_name+' ('+configObj.api_id+')</option>'); 
	});
	if ($('#incapAccountsList').children('option').length==0) {
		$(".incap_account_select").addClass('highlight').html('<option value="">Add users under Settings tab</option>');
		$(".incap_account_ID_select").addClass('highlight').html('<option value="">Add users under Settings tab</option>');
		$('.incap_account_input').addClass('highlight').attr('placeholder','Add users under Settings tab');
		$('#incap_add_new_user').addClass('highlight');
	} else {
		//$("#incap_site_group_account_list").unbind().change(function(){ renderSiteGroupSites(); });
		//$("#incapAccountsList").unbind().change(function(){ renderAuth(); });
		$(".incap_account_select").unbind().change(function(){ loadSubAccounts(this); });
		$.each($(".incap_account_select"), function(i,obj) { loadSubAccounts(obj); });
		//$(".incap_account_ID_select").html('<option value="'+INCAP_USERS[$('#incapAccountsList').val()].account_id+'">User Account ('+INCAP_USERS[$('#incapAccountsList').val()].account_id+')</option>');
		//$("#destIncapAccountsList").unbind().change(function(){ renderDestAuth(); });
		//$("#incapSitesAccountsList").unbind().change(function(){ renderDestAuth(); });
	}
	renderAuth();
	renderSiteGroupSites();
	renderMigrationToolbar();
	// loadSites();
}

/* Series of call back functions to load sub account IDs in the right location when changing API_KEYs on the UI */
function loadSubAccounts(obj){
	if (obj.length!=0) {
		var authObj = getUserAuthObj($(obj).val());
		authObj.method = "query";
		if ($(obj).attr('id')=='incapAccountsList') { // API Client
			$('#incapAccountIDList').html('<option value="'+authObj.account_id+'">loading...</option>');
			//$('#get the page num id later ').val('0');
			makeIncapCall(getSwHost(apiV1SwaggerKey)+getSubAccountUrlByAccountId('#incapAccountsList'),'POST',authObj,loadSubAccountsResponse_APIClient,{},'set',"application/x-www-form-urlencoded");
		} else if ($(obj).attr('id')=='incapSitesAccountsList') { // Sites
			$('#incapSitesAccountIDList').html('<option value="'+authObj.account_id+'">loading...</option>');
			$('#incapSitesPageNum').val('0');
			makeIncapCall(getSwHost(apiV1SwaggerKey)+getSubAccountUrlByAccountId('#incapSitesAccountsList'),'POST',authObj,loadSubAccountsResponse_Sites,{},'set',"application/x-www-form-urlencoded");
		} else if ($(obj).attr('id')=='incap_migrationAction') { // Migration
			$('#incap_migrationAction').attr('disabled','disabled');
			$('#incap_migrationAction_accountIDList').html('<option value="'+authObj.account_id+'">loading...</option>').attr('disabled','disabled');
			$("#incap_migrationAction_sites").html('<option value="">loading...</option>').attr('disabled','disabled');
			$('#incap_migrationAction_page_num').val('0');
			makeIncapCall(getSwHost(apiV1SwaggerKey)+getSubAccountUrlByAccountId('#incap_migrationAction'),'POST',authObj,loadSubAccountsResponse_Migration,{},'set',"application/x-www-form-urlencoded");
		} else if ($(obj).attr('id')=='incap_site_group_account_list') { // Site Group
			$('#incap_site_group_account_ID_list').html('<option value="'+authObj.account_id+'">loading...</option>').attr('disabled','disabled');
			$('#incap_site_group_page_num').val('0');
			$("#avail_incap_group_sites").html('<option value="">loading...</option>');
			makeIncapCall(getSwHost(apiV1SwaggerKey)+getSubAccountUrlByAccountId('#incap_site_group_account_list'),'POST',authObj,loadSubAccountsResponse_SiteGroup,{},'set',"application/x-www-form-urlencoded");
		}
	}
}

function getSubAccountUrlByAccountId(apiIdIputId){
	if (localStorage.getItem('INCAP_USERS')==null) localStorage.setItem('INCAP_USERS','{}');
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	var subAccountURL = subAccountLookUpMap.default;
	if ($(apiIdIputId).val()!='') { //  && $(apiIdIputId).attr('disabled')!='disabled'
		if (INCAP_USERS[$(apiIdIputId).val()].plan_name!=undefined) {
			if (subAccountLookUpMap[INCAP_USERS[$(apiIdIputId).val()].plan_name]!=undefined) {
				subAccountURL = subAccountLookUpMap[INCAP_USERS[$(apiIdIputId).val()].plan_name].url;
			}
		}
	}
	return subAccountURL;
}

function loadSubAccountsResponse_APIClient(response){ 
	renderSubGroupOptionsHTML(response,'#incapAccountIDList'); 
	$('#incapAccountIDList').unbind().change(function(){ changeAction(); });
	renderAuth(); 
}

function loadSubAccountsResponse_Sites(response){
	renderSubGroupOptionsHTML(response,'#incapSitesAccountIDList');
	loadSites();
}

function loadSubAccountsResponse_Migration(response){
	renderSubGroupOptionsHTML(response,'#incap_migrationAction_accountIDList');
	// if (obj!=undefined) {
	// 	if (obj.id=='incap_migrationActionType' && $('#incap_migrationAction_sites').val()=='') { renderMigrationUserSites(); }
	// } else if ($('#incap_migrationAction_sites').val()=='') {
		renderMigrationUserSites(); 
	// }
}

function loadSubAccountsResponse_SiteGroup(response){
	renderSubGroupOptionsHTML(response,'#incap_site_group_account_ID_list');
	renderSiteGroupSites();
}

function renderSubGroupOptionsHTML(subGroupAry,input_id){
	var subAccountIndex = [];
	var subAccountObjAry = {};
	if (subGroupAry!=undefined) {
		if (subGroupAry.resultList!=undefined) { 
			$(input_id).html('<option value="'+$(input_id).val()+'">Parent Account ('+$(input_id).val()+')</option>');
			$.each(subGroupAry.resultList, function(i,subGroupObj) {	
				subAccountIndex.push(subGroupObj.sub_account_name+'_'+subGroupObj.sub_account_id);
				subAccountObjAry[subGroupObj.sub_account_name+'_'+subGroupObj.sub_account_id] = subGroupObj;
			});	
			subAccountIndex.sort();
			$.each(subAccountIndex, function(i,subAccountIdStr) {	
				var subGroupObj = subAccountObjAry[subAccountIdStr];
				$(input_id).append('<option value="'+subGroupObj.sub_account_id+'">'+subGroupObj.sub_account_name+' ('+subGroupObj.sub_account_id+')</option>');
			});
		} else if (subGroupAry.accounts!=undefined) { 
			$(input_id).html('<option value="'+$(input_id).val()+'">Parent Account ('+$(input_id).val()+')</option>');
			$.each(subGroupAry.accounts, function(i,subGroupObj) {	
				subAccountIndex.push(subGroupObj.account_name+'_'+subGroupObj.account_id);
				subAccountObjAry[subGroupObj.account_name+'_'+subGroupObj.account_id] = subGroupObj;
			});			
			subAccountIndex.sort();
			$.each(subAccountIndex, function(i,subAccountIdStr) {	
				var subGroupObj = subAccountObjAry[subAccountIdStr];
				$(input_id).append('<option value="'+subGroupObj.account_id+'">'+subGroupObj.account_name+' ('+subGroupObj.account_id+')</option>');
			});
		} else {
			$(input_id).html('<option value="'+$(input_id).val()+'">Account ('+$(input_id).val()+')</option>');
		}
	} else {
		$(input_id).html('<option value="'+$(input_id).val()+'">'+$(input_id).val()+'</option>');
	}
	
}

/* END subaccount functions */

function renderAuth(){
	if ($("#incapAccountsList").val()!='') {
		changeAction();
		if ($('#curSitesAccountId').val()=='') loadSites();
	}
}

function formatJSONParamObj(param){
	if ($(param).attr("type").substr(0,3)=="xs:") $(param).attr("type",$(param).attr("type").substr(3));
	if (incapJsonParamMapping[$(param).attr("name")]!=undefined) { param=incapJsonParamMapping[$(param).attr("name")]; } else { $(param).attr("values",$(param).attr("type")); }
	return param;
}

function incapResolveActionPlaceHolders(str){
	$.each(str.split('/'), function(i,param) {
		if (param.substr(0,1)=="{" && param.substr(param.length-1)=="}") {
			param = param.substr(1,param.length-2);
			str = str.replace("{"+param+"}",$("#IncapsulaAPI #"+param).val());
		}
	});
	return str;
}

function renderParamsHTML(){
	// reset the request url to pull from host/action
	$('#incapResult').val('');
	$(incap_req_url_sel).val($('#IncapsulaAPI #incapServer').val()+$(incap_action_sel).val());
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	var curBasePath = (curSwagger.definition.basePath!=undefined ? curSwagger.definition.basePath : '');
	var currentAction = $("#incapActions").val().substr(curBasePath.length);
	var methodObj = jQuery.extend(true, {}, curSwagger.definition.paths[currentAction][$(incap_method_sel).val()]);
	$('#incapData').val('');
	$.each(["bodyParams","pathParams","queryParams","formDataParams"], function(i,paramType) {
		var divId = (paramType=="bodyParams" || paramType=="formDataParams") ? divId = "body" : divId = paramType.replace("Params","");;
		$("#incap"+paramType+" table").html('');
		if (methodObj[paramType]!=undefined) {
			$.each(methodObj[paramType].index, function(i,paramName) {
				var param = methodObj[paramType].list[paramName];
				if (param.name!='api_id' && param.name!='api_key') {
					if ($('#'+param.id_str).length==0) {
						if (param.id_str.includes("___")) {
							var parentParamIndexAry = param.id_str.split("___");
							for (var i=1; i<parentParamIndexAry.length; i++) {
								var currentParamName = parentParamIndexAry[i-1];
								var childContainerId = parentParamIndexAry.slice(i).join("___");
								var currentContainerId = parentParamIndexAry.slice(0,i).join("___");
								var currentContainerParam = methodObj[paramType].list[parentParamIndexAry.slice(0,i).join("__.")];
								var parentContainerId = parentParamIndexAry.slice(0,i-1).join("___");
								if ($('.'+currentContainerId+"_tbltr").length==0) {
									var level = (currentContainerId.split("___").length);
									var required = (param.required==true) ? ' required ': '';
									var paramDataType = ((currentContainerParam.type!=undefined) ? currentContainerParam.type : 'object');
									var str = '<tr id="'+currentContainerId+'_tbltr" class="fieldwrapper '+currentContainerId+'_tbltr">';
									str += '<td valign="top" align="right" width><label title="'+currentContainerId+'" for="">';
									str += ((currentContainerParam.description!=undefined) ? '<span class="info" title="'+currentContainerParam.description+'"> </span> ' : '');
									str += ((currentContainerParam.required==true) ? '<span title="Required field" class="required">*</span> ' : '');
									str += currentParamName+': </label></td>';
									str += '<td align="left" class="'+((paramDataType=='object') ? paramDataType : paramDataType+'_object')+'">';
									str += '<textarea title="'+currentParamName+'" class="'+currentContainerId+' bodyParams parent parent'+level+' type_'+paramDataType+'" name="'+currentContainerId+'" id="'+currentContainerId+'" placeholder="'+paramDataType+'"'+required+'>';
									str += ((paramDataType=='object') ? '{}' : '[]')+'</textarea>';
									str += '<br clear="all" /><a href="javascript:void(0);" id="'+currentContainerId+'_toggle" class="toggle_param_link param_link">edit object</a>';
									str += '<fieldset id="'+currentContainerId+'_fieldset" class="nested_param"><legend>'+currentParamName+' Parameters</legend>';
									str += '<table id="'+currentContainerId+'_tbl" class="toggle_param param_tbl_level'+level+'"></table><br clear="all" />';
									str += '<a href="javascript:void(0);" id="'+currentContainerId+'_cancel" class="cancel_param_link param_link">Cancel</a>';
									str += '<a href="javascript:void(0);" id="'+currentContainerId+'_add" class="add_param_link param_link">Add</a>';
									str += '</fieldset>';
									str += '</td></tr>';
									if (parentContainerId=='') {
										$("#incap"+paramType+"_tbl").append(str);
									} else {
										$("#"+parentContainerId+"_tbl").append(str);
									}
								}
								if (param.id_str.includes("___")) {
									if (currentContainerId+"___"+param.id_str.split("___").pop()==param.id_str) {
										$("#"+currentContainerId+"_tbl").append(renderParamHTML(param,paramType));
									}
								} else {
									$("#"+currentContainerId+"_tbl").append(renderParamHTML(param,paramType));
								}
							}
						} else {
							if (param.items==undefined || (param.items!=undefined && param.items["$ref"]==undefined)) {
								$("#incap"+paramType+"_tbl").append(renderParamHTML(param,paramType));
							}
						}
					}
				}
			});
		}
	});	
	// Now that all parameters are rendered
	$.each(["bodyParams","pathParams","queryParams","formDataParams"], function(i,paramType) {
		for (var i=0; i<methodObj[paramType].index.length; i++) {
			var param = methodObj[paramType].list[methodObj[paramType].index[i]];
			if (incapGetObjectActionMapping[param.id_str]!=undefined) {
				var paramActionObj = (incapGetObjectActionMapping[param.id_str][$('#incapActions').val()]!=undefined) ? incapGetObjectActionMapping[param.id_str][$('#incapActions').val()] : incapGetObjectActionMapping[param.id_str].default;
				if (paramActionObj!=undefined) {
					if (paramActionObj.isParent==true) {
						loadParamValuesByName(param.id_str);
					} else {
						var parentPresent = false; 
						if (paramActionObj.parents!=undefined) {
							$.each(paramActionObj.parents, function(i,parentParam) { 
								if ($('#'+parentParam.id).length!=0) {
									$('#'+parentParam.id).addClass('processing');
									parentPresent = true; 
								}
							});
						}
						if (!parentPresent) {
							var str = '';
							var paramLevel = (param.id_str.includes("___") ? 'child' : 'param');
							if (paramType=='pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param.id_str+'_btn" title="Copy to Request URL">copy</a>';
							str += '<input type="text" class="'+paramType+' '+paramLevel+'" name="'+param.name+'" id="'+param.id_str+'" value="" placeholder="'+param.type+'"'+((param.required==true) ? ' required ': '')+' />';
							$('#'+param.id_str+"_field_td").html(str);
						}
					}
				}
			}
		}	
	});
	

	// toggleDcId();
	$('.param_link').button();
	$('.toggle_param_link, .cancel_param_link').button().unbind("click").click(function(){ toggleShowNestedParams(this.id.replace("_toggle","").replace("_cancel","")); })
	$('#incappathParams .ui-icon-copy').unbind("click").click(function(){ incapCopyPathParam(this); updateRequestData(); })
	$('#incapqueryParams input:not(.parent), #incapqueryParams textarea:not(.parent)').unbind().blur(function(){ incapUpdateReqURL(); });
	$('#incapqueryParams select:not(.parent)').unbind().change(function(){ incapUpdateReqURL(); });
	$('#incapbodyParams input:not(.parent), #incapbodyParams textarea.parent1').unbind().blur(function(){ if (checkIncapForm()) updateRequestDataFromJsonParams(); });
	$('#incapbodyParams textarea.parent:not(.parent1,.parent)').unbind().blur(function(){ if (checkIncapForm()); });
	
	$('#incapbodyParams select:not(.parent)').unbind().change(function(){ updateRequestDataFromJsonParams(); });
	$('#incapformDataParams input:not(.parent), #incapformDataParams textarea:not(.parent)').unbind().blur(function(){ updateRequestDataFromFormDataParams(); });
	$('#incapformDataParams select:not(.parent)').unbind().change(function(){ updateRequestDataFromFormDataParams(); });	
	$('.add_param_link').unbind().click(function(){ addObjectToParent(this); updateRequestData(); });	

	incapUpdateReqURL();
	// $(".datepicker").parent().click(function(){ $(".datepicker").trigger('blur'); });
	$(".datepicker").datetimepicker();
	updateRequestDataFromJsonParams();
	updateRequestDataFromFormDataParams();
}

function renderParamHTML(param,paramType){
	var isParent = "";
	if (incapGetObjectActionMapping[param.name]!=undefined) {
		var paramActionObj = (incapGetObjectActionMapping[param.name][$('#incapActions').val()] != undefined) ? incapGetObjectActionMapping[param.name][$('#incapActions').val()] : incapGetObjectActionMapping[param.name].default;
		if (paramActionObj.children != undefined && paramActionObj.children.length > 0) isParent="parent";
	}
	var paramLevel = (param.id_str.includes("___") ? 'child' : 'param');
	var paramValType = (param.type!=undefined ? param.type : (param.schema !=undefined && param.schema.type!=undefined ? param.schema.type : "unknown_type")); 
	var str = '<tr id="'+param.id_str+'tr" class="fieldwrapper"><td align="right"><label for="'+param.name+'">';
	if (param.description!=undefined) str += '<span class="info" title="'+filterStr(param.description)+'"> </span> '; 
	var required = (param.required==true) ? ' required ': '';
	str += ((param.required==true) ? '<span title="Required field" class="required">*</span> ' : '') + ((param.id_str.includes("___")) ? param.id_str.split("___").pop() : param.name )+': </label></td>';
	str += '<td id="'+param.id_str+'_field_td" class="'+param.type+((param.items!=undefined && param.items.type!=undefined) ? "_"+param.items.type : '')+'">';
	if (incapGetObjectActionMapping[param.id_str]!=undefined) {
		// console.log(param.id_str);
		// console.log(incapGetObjectActionMapping[param.id_str]);
		curParamObj = (incapGetObjectActionMapping[param.id_str].default == undefined) ? incapGetObjectActionMapping[param.id_str][$("#incapActions").val()] : incapGetObjectActionMapping[param.id_str].default; 
		// console.log(curParamObj);
		var multiple = (param.uniqueItems == false || (curParamObj.multiselect==true)) ? 'multiple': '';
		if (paramType=='pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param.id_str+'_btn" title="Copy to Request URL">copy</a>';
		str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + ' ' + multiple + '><option value="">loading...</option></select>';
	} else if (param.enum!=undefined) {
		str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="'+param.id_str+'"'+required+' '+((param.uniqueItems==false) ? 'multiple': '')+'>';
		if (!param.required && (param.uniqueItems==undefined && param.uniqueItems!=false)) str += '<option value="">-- select --</option>';
		$.each(param.enum, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
		str += '</select>';
	} else if (timestampParam[param.name]) {
		str += '<input type="text" class="datepicker ' + paramType + ' ' + paramLevel + ' ' + isParent + '" name="'+param.name+'" id="'+param.id_str+'" value="" placeholder="epoch timestamp"'+required+' />';
	} else if (paramValType=="boolean") {
		str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="'+param.id_str+'"'+required+'>';
		str += ((param.required) ? '' : '<option value="">-- select --</option>') +'<option value="true">true</option><option value="false">false</option>';
		str += '</select>';
	} else if (paramValType=="object") {
		str += '<textarea class="' + paramType + ' ' + paramLevel + ' ' + isParent + '"  name="'+param.name+'" id="'+param.id_str+'" style="width:200px; height: 50px;"'+required+'>'+param.jsonStr+'</textarea>';
	} else {
		if (paramType=='pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param.id_str+'_btn" title="Copy to Request URL">copy</a>';
		str += '<input type="text" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" name="'+param.name+'" id="'+param.id_str+'" value="" placeholder="'+paramValType+((param.items!=undefined && param.items.type!=undefined) ? " ("+param.items.type+")" : '')+'"'+required+' />';
	}
	str += '</td></tr>';
	return str;
}


function incapCopyPathParam(input){
	var curId = input.id.replace("_btn","");
	var inputObj = $('#'+curId);
	if (inputObj.val()!='') $(incap_req_url_sel).val($(incap_req_url_sel).val().replace("{"+curId+"}",$('#incappathParams #'+curId).val()));
	incapUpdateReqURL();
}

function loadParamValuesByName(paramName){
	if (incapGetObjectActionMapping[paramName]!=undefined) {
		var paramActionObj = (incapGetObjectActionMapping[paramName][$('#incapActions').val()]!=undefined) ? incapGetObjectActionMapping[paramName][$('#incapActions').val()] : incapGetObjectActionMapping[paramName].default;
		if (paramActionObj.copy_from_select_id!=undefined) {
			$("#accountId").html($("#incapAccountIDList").html());
			$("#"+paramName).html(($("#"+paramName).attr("required")=="required") ? '' : '<option value="">-- select --</option>').append($("#"+paramActionObj.copy_from_select_id).html())
			$("#"+paramName).unbind().change(function () { loadParamChildValues(this.id); updateRequestData(); });
			updateRequestData();
			if (paramActionObj.children != undefined && paramActionObj.children.length != 0) {
				loadParamChildValues(paramName);
			}
		} else {
			var auth = getUserAuthObj($('#incapAccountsList').val())
			auth.method = "headers";
			$("#"+paramName).addClass('processing').html('<option value="">loading...</option>');
			var contentType = (paramActionObj.definition!=undefined && incapAPIDefinitions[paramActionObj.definition].definition.consumes!=undefined) ? incapAPIDefinitions[paramActionObj.definition].definition.consumes[0] : "application/json";
			var reqObj = (contentType=="application/json") ? {"jsonData":{}} : {"postData":{}};
			var postData = (contentType=="application/json") ? reqObj["jsonData"] : reqObj["postData"] ;
			var queryParams = [];
			var curApiAction = paramActionObj.action;
	
			if (paramActionObj.parents!=undefined) {
				$.each(paramActionObj.parents, function(i,parentParam) {
					var curParentName = (parentParam.renameLookupParam==undefined) ? parentParam.id.split("___").pop() : parentParam.renameLookupParam;
					if ($('#'+parentParam.id).length!=0) {
						if (parentParam.in=="query") {
							queryParams.push(curParentName+"="+$('#'+parentParam.id).val());
						} else if (parentParam.in=="path") {
							curApiAction = curApiAction.replace("{"+curParentName+"}",$('#'+parentParam.id).val());
						} else {
							postData[curParentName] = $('#'+parentParam.id).val();
						}
					}
				});
			}
			if (paramActionObj.addedLookupParams!=undefined) {
				$.each(paramActionObj.addedLookupParams, function(i,addedParam) {
					var curParentName = (addedParam.renameLookupParam==undefined) ? addedParam.id.split("___").pop() : addedParam.renameLookupParam;
					var curParentVal = (addedParam.value!=undefined) ? addedParam.value : $('#'+addedParam.id).val();
					if (addedParam.in=="query") {
						queryParams.push(curParentName+"="+curParentVal);
					} else if (addedParam.in=="path") {
						curApiAction = curApiAction.replace("{"+curParentName+"}",curParentVal);
					} else {
						postData[curParentName] = curParentVal;
					}
				});
			}
			curApiAction += (queryParams.length!=0) ? '?'+queryParams.join("&") : '';
			makeIncapCall((paramActionObj.loadFromLocal ? "" : getSwHost(paramActionObj.definition))+curApiAction,paramActionObj.method,auth,renderParamListValues,reqObj,paramName,contentType);
		}
	}
}

function loadParamChildValues(paramName){
	var paramActionObj = (incapGetObjectActionMapping[paramName][$('#incapActions').val()]!=undefined) ? incapGetObjectActionMapping[paramName][$('#incapActions').val()] : incapGetObjectActionMapping[paramName].default;
	if (paramActionObj!=undefined){
		if (paramActionObj.children!=undefined && paramActionObj.children.length!=0) {
			$.each(paramActionObj.children, function(i,childParamName) {
				if ($('#'+childParamName).length>0) {
					loadParamValuesByName(childParamName);
				}
			});
		}
	}
}

function renderParamListValues(response,input_id) {
	var paramActionObj = (incapGetObjectActionMapping[input_id][$('#incapActions').val()]!=undefined) ? incapGetObjectActionMapping[input_id][$('#incapActions').val()] : incapGetObjectActionMapping[input_id].default;
	$("#"+input_id).removeClass('processing').html(($("#"+input_id).attr("required")=="required" || $("#"+input_id).prop("multiple")) ? '' : '<option value="">-- select --</option>');
	var paramActionObjIndex = [];
	var paramActionObjAry = {};
	if (paramActionObj.listName!=undefined) {
		$.each(response[paramActionObj.listName], function(i,subGroupObj) {	
			var displayText = getParamDisplayText(subGroupObj,paramActionObj);
			paramActionObjIndex.push(displayText+'_'+subGroupObj[paramActionObj.id]);
			paramActionObjAry[displayText+'_'+subGroupObj[paramActionObj.id]] = subGroupObj;
		});
		paramActionObjIndex.sort();
		$.each(paramActionObjIndex, function(i,paramActionIdStr) {	
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			var displayText = getParamDisplayText(subGroupObj,paramActionObj);
			var displayValue = subGroupObj[paramActionObj.id];
			$("#"+input_id).append('<option title="'+displayText+' ('+subGroupObj[paramActionObj.id]+')" value="'+subGroupObj[paramActionObj.id]+'">'+displayText+' ('+displayValue+')</option>'); 
		});
	} else if (paramActionObj.objectName!=undefined) {
		$("#"+input_id).append('<option value="'+response[paramActionObj.objectName][paramActionObj.id]+'">'+response[paramActionObj.objectName][paramActionObj.displayText]+' ('+response[paramActionObj.objectName][paramActionObj.id]+')</option>');
	} else if (Array.isArray(response)) {
		$.each(response, function(i,subGroupObj) {
			var displayText = getParamDisplayText(subGroupObj,paramActionObj);
			paramActionObjIndex.push(displayText+'_'+subGroupObj[paramActionObj.id]);
			paramActionObjAry[displayText+'_'+subGroupObj[paramActionObj.id]] = subGroupObj;
		});
		paramActionObjIndex.sort();
		$.each(paramActionObjIndex, function(i,paramActionIdStr) {	
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			var displayText = getParamDisplayText(subGroupObj,paramActionObj);
			var displayValue = subGroupObj[paramActionObj.id];
			$("#"+input_id).append('<option title="'+displayText+' ('+subGroupObj[paramActionObj.id]+')" value="'+subGroupObj[paramActionObj.id]+'">'+displayText+' ('+displayValue+')</option>');
		});	
	} else {
		if (response[paramActionObj.id]!=undefined) $("#"+input_id).append('<option value="'+response[paramActionObj.id]+'">'+response[paramActionObj.displayText]+' ('+response[paramActionObj.id]+')</option>');
	}
	if (paramActionObj.children!=undefined && paramActionObj.children.length!=0) {
		loadParamChildValues(input_id);
	}
	if ($("#"+input_id).html()=='') $("#"+input_id).html('<option value="">No Value Available</option>');
	$('#'+input_id).unbind().change(function(){ loadParamChildValues(this.id); updateRequestData(); });
	updateRequestData();
}

function getParamDisplayText(record,paramActionObj){
	var displayText = '';
	if (Array.isArray(paramActionObj.displayText)) {
		$.each(paramActionObj.displayText, function(i,attrName) {
			if (displayText!='') displayText += ' - ' 
			displayText += record[attrName];
		});
	} else {
		displayText = record[paramActionObj.displayText];
	}
	return displayText;
}


function openFilterDialog() {
	$('#filterDialog').dialog({ width:"auto", height:"auto" });
}

function toggleDcId() {
	if ($('#incapActions').val()=='/api/prov/v1/sites/incapRules/add' || $('#incapActions').val()=='/api/prov/v1/sites/incapRules/edit') {
		if ($('#action').val()=='RULE_ACTION_FORWARD_TO_DC') {
			$('#dc_idtr').show(); 
		} else {
			$('#dc_idtr').hide(); 
			$('#dc_id').val('');
		}
	} else { 
		$('#dc_idtr').show(); 
	}
}

function toggleincapSampleRules() {
	if ($('#incapActions').val()=='/api/prov/v1/sites/incapRules/add' || $('#incapActions').val()=='/api/prov/v1/sites/incapRules/edit') { $('#incapSampleRulesFS').show(); $('#incapSampleRulestr').show(); } else { $('#incapSampleRulesFS').hide(); }
}

function toggleSyntaxGuidlines() {
	if ($('#filterGuidlines').css("display")=='block') { $('#filterGuidlines').hide(); } else { $('#filterGuidlines').show(); }
}

// Settings, object management
function removeMemberAndIndexById(objAry,cur_id){
    delete objAry.members[cur_id];
    objAry.index = [];
    $.each(objAry.members, function(id,subObj) { objAry.index.push(id); });
    objAry.index.sort();
    return objAry;
}

function getUserAuthObj(user_id){
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	var userObj = INCAP_USERS[user_id];
	if (userObj!=undefined) {
		var postDataObj = {
			"api_key":userObj.api_key,
			"api_id":userObj.api_id,
			"account_id":userObj.account_id
		}
	} else {
		return null;
	}
	return postDataObj;
}

function getAuthQueryString(user_id){
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	var userObj = INCAP_USERS[user_id];
	if (userObj!=undefined) {
		return "api_id="+userObj.api_id+"&api_key="+userObj.api_key;
	} else {
		return null;
	}
}


function isValidURL(str) {
	var a  = document.createElement('a');
	a.href = str;
	return (a.host && a.host != window.location.host);
}

function renderPageNumberOptions(){
	var str = '';
	for (var i=0; i<incapDefConfig.sitePageNum; i++) {
		str += '<option value="'+i+'">'+i+'</option>';
	}
	return str;
}
