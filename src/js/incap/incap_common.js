var incapActions = {};
var dynamicParams = {
	"queryParams":{index:0,list:[]},
	"pathParams":{index:0,list:[]},
	"bodyParams":{index:0,list:[]},
	"formParams":{index:0,list:[]}
}
var incap_action_sel = '#IncapsulaAPI #incapActions';
var incap_method_sel = '#IncapsulaAPI #incapMethod';
var incap_req_url_sel = '#IncapsulaAPI #incapRequestUrl';
var incap_data_sel = '#IncapsulaAPI #incapData';
var incap_url_param_sel = '#IncapsulaAPI #incapURLparams';
var apiDefinitionIndex = 0;
var apiDefinitionIndex_processed = 0;

$().ready(function() {
	$("#mainNav").tabs();
	apiDefinitionsAry = getAPIDefinitionIndexes();
	while (apiDefinitionIndex < apiDefinitionsAry.length) {
		var curApiDefName = apiDefinitionsAry[apiDefinitionIndex];
		loadcwafswagger(incapAPIDefinitions[curApiDefName]["endpoint"]);
		apiDefinitionIndex++;
	}
});

function loadcwafswagger(apiDefinitionEndpoint,callback){
	// requrl = (apiDefinitionEndpoint.substr(0, 4).toLowerCase()=="http") ? 'ajax/incap_swagger.php?apiDefinitionIndex='+apiDefinitionIndex+'&endpoint='+apiDefinitionEndpoint : apiDefinitionEndpoint+'?apiDefinitionIndex='+apiDefinitionIndex;
	requrl = 'ajax/incap_swagger.php?apiDefinitionIndex='+apiDefinitionIndex+'&endpoint='+apiDefinitionEndpoint;
	jQuery.ajax ({
		url: encodeURI(requrl),
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			var curApiDefName = apiDefinitionsAry[data.apiDefinitionIndex];
			$.gritter.add({ title: 'Processing...', text: "loading Swagger: "});
			incapAPIDefinitions[curApiDefName]["definition"] = data;
			apiDefinitionIndex_processed++;
			if (apiDefinitionIndex_processed == apiDefinitionsAry.length) { 
				initIncap(); 
			}
		}
	});
}

function getAPIDefinitionIndexes(){
	var apiDefinitionsAry = [];
	$.each(incapAPIDefinitions, function(name,obj) { apiDefinitionsAry.push(name); });
	return apiDefinitionsAry;
}

function initIncap(){
	$.each(incapAPIDefinitions, function(optGroup,swagger) { 
		var str = '<optgroup label="'+optGroup+'">';
		$.each(swagger.definition.paths, function(action,actionObj) {	
			str += '<option value="'+swagger.definition.basePath+action+'">'+swagger.definition.basePath+action+'</option>';
		});
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
	$('#incapMethod').change(function(){
		renderParamsHTML();
	});
	$('#incap_migrationConfigType').change(function(){ renderMigrationToolbar_config(this); });
	$('#incap_migrationActionType').change(function(){ renderMigrationToolbar_action(this); });

	$('#execute').click(function(){ makeIncapCall(); });
	// Incapsula API credential management
	$('#incapSaveCredentials').click(function(){ incapSaveCredentials(); });
	$('#incapDeleteCredentials').click(function(){ incapDeleteCredentials(); });
	$('#incapDeleteAllCredentials').click(function(){ incapDeleteAllCredentials(); });
	$('#incapBulkImportCredentials').click(function(){ incapBulkImportCredentials(); });

	$('#incap_configMaskSecretKey').click(function(){ updateRequestData(); });
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
function makeIncapCall(apiUrl,method,auth,callback,postDataObj,input_id, contentType) {
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	if (contentType==undefined) contentType = ((curSwagger.definition.consumes!=undefined) ? curSwagger.definition.consumes[0] : "application/json");
	if ((input_id==undefined) || auth==undefined || auth==null) {
		var auth_tmp = getUserAuthObj($('#incapAccountsList').val());
		auth = {"api_id":auth_tmp.api_id,"api_key":auth_tmp.api_key}
		// if (auth.api_key.substr(0,10)=='**********') auth.api_key = auth_tmp.api_key;
		// $('#incapResult').val('processing...');
	} else if (input_id=='dest') {
		auth['api_key'] = $('#dest_api_key').val();
		auth['api_id'] = $('#dest_api_id').val();
	} else if (input_id=='set') {
		// do nothing as the credentials are passed into the PostDataObj as an input to the function
	} else {
		var auth_tmp = getUserAuthObj($('#incapAccountsList').val());
		auth = {"api_id":auth_tmp.api_id,"api_key":auth_tmp.api_key}
	}
	if (method==undefined) method = $('#incapMethod').val().toUpperCase();
	if (postDataObj==undefined){
		if (method.toUpperCase()!="GET" && method.toUpperCase()!="DELETE") {
			if (contentType=="application/json"){
				postDataObj = {"jsonData":$('#incapData').val()};
			} else {
				postDataObj = JSON.parse($('#incapData').val());
				// postDataObj = JSON.parse($('#incapData').val());
			}
		}
	}
	
	if (apiUrl==undefined) {
		apiUrl = $('#incapRequestUrl').val();
	}
	var requestUrlAry = apiUrl.split("?");
	var curRequestUrl = requestUrlAry.shift();
	var paramsAry = ["api_id="+auth.api_id,"api_key="+auth.api_key];
	if (requestUrlAry.join().trim()!='') paramsAry = paramsAry.concat(requestUrlAry);

	var reqUrl = "ajax/incap_api_post.php?server="+curRequestUrl+"?"+encodeURIComponent(paramsAry.join("&"));
	reqUrl += "&contentType="+contentType;
	reqUrl += "&method="+method;
	
	$.post(encodeURI(reqUrl), postDataObj, function(data) {
		// $('#incapResult').val('');
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

function getSwHost(swagerKey){
	return "https://"+incapAPIDefinitions[incapAPIKeyMap[swagerKey].displayName].definition.host;
}

// function incap_transformToCURL(requestUrl,reqObj,maskSecretKey){
// 	var curlStr = "curl '"+requestUrl+"'";
// 	$.each(reqObj, function(param,val) {
// 		if (maskSecretKey==true && param=='api_key') {
// 			curlStr += " --data-urlencode '"+param+'='+starStr.substr(0,val.length)+"'";
// 		// } else if (param=='filter') {
// 		// 	curlStr += " --data-urlencode '"+param+'='+val.replace(/\ /g,'\+')+"'";
// 		} else {
// 			curlStr += " --data-urlencode '"+param+'='+val+"'";
// 		}
// 	});
// 	curlStr = curlStr.replace(/\(\ /g,'(').replace(/ \)/g,')');
// 	return curlStr;
// }


function incap_transformToCURL(requestUrl=$('#incapRequestUrl').val(),auth=getUserAuthObj($('#incapAccountsList').val()),reqObj=$('#incapData').val(),maskSecretKey=$('#incap_configMaskSecretKey').is(":checked")){
	var curlStr = '';
	if (!$('#incapRequestUrl').hasClass('errors')) {
		// $('#incapServer').val()+$('#incapActions').val(),reqObj,$('#incap_configMaskSecretKey').is(":checked")
		var requestUrlAry = requestUrl.split("?");
		var curRequestUrl = requestUrlAry.shift();
		var paramsAry = ["api_id="+auth.api_id,"api_key="+((maskSecretKey) ? starStr.substr(0,auth.api_key.length) : auth.api_key)];
		if (requestUrlAry.join().trim()!='') paramsAry = paramsAry.concat(requestUrlAry);
		var method = $('#incapMethod').val();
		
		// Check for content type and format
		var reqData = $('#incapData').val();
		if ($('#incapContentType').val()=='application/json') {
			curlStr = "curl -k -X "+method.toUpperCase()+" '"+curRequestUrl+"?"+paramsAry.join("&")+"'"+(($('#incapData').val()!='{}') ? " --data-raw '"+reqData+"'" : '');
		} else {
			curlStr = "curl -k -X "+method.toUpperCase()+" '"+curRequestUrl+"?"+paramsAry.join("&")+"'";			
			if ($('#incapData').val()!='{}' && $('#incapData').val()!='') {
				$.each(JSON.parse($('#incapData').val()),function(paramName,paramValue){
					curlStr += " --data-urlencode '"+paramName+"="+paramValue+"'";
				});
			}
		}
		// curlStr = curlStr.replace(/\(\ /g,'(').replace(/ \)/g,')');
	}
	return curlStr;
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
	if (checkIncapForm()) $('#incapCurlExample').val(incap_transformToCURL());
}

function checkIncapForm(){
	var isok = true;
	if (!($('#incapRequestUrl').val().indexOf('{') == -1)) {
		$('#incapRequestUrl').addClass('errors');
		isok=false;
	} else {
		$('#incapRequestUrl').removeClass('errors');
	}
	return isok;
}

// Update UI display/fields based on selected action
function changeAction() {
	var reqObj = {}; 
	dynamicParams = {
		"headerParams":{index:0,list:[]},
		"queryParams":{index:0,list:[]},
		"pathParams":{index:0,list:[]},
		"bodyParams":{index:0,list:[]},
		"formDataParams":{index:0,list:[]}
	}
	$(incap_method_sel+' option').attr('disabled','disabled');
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	$('#incapContentType').val((curSwagger.definition.consumes!=undefined) ? curSwagger.definition.consumes[0] : "application/json");
	$("#incapServer").val("https://"+curSwagger.definition.host);
	var currentAction = $("#incapActions").val().substr(curSwagger.definition.basePath.length);
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
			$.each(methodObj.parameters, function(i,param) {
				if (param.in=="body") {
					if (param.schema!=undefined) {
						var curParamDefinitionName = param.schema.items!=undefined ? param.schema.items['$ref'].split('/').pop() : param.schema['$ref'].split('/').pop();
						curParamDefinition = curSwagger.definition.definitions[curParamDefinitionName];
						if (curParamDefinition.properties!=undefined) {
							methodObj.bodyParams = getNestedBodyParams(methodObj.bodyParams,'',curParamDefinition);
						}
						// param = getNestedParamProperties(curSwagger.definition.definitions[curParamDefinition]);
					} 
				} else {
					param.id_str = param.name;
					methodObj[param.in+"Params"].list[param.name] = param;
					methodObj[param.in+"Params"].index.push(param.name);
				}
			});
		});
		$(incap_method_sel+" option:not([disabled]):first").attr('selected', 'selected');
	}
	renderParamsHTML();
	toggleincapSampleRules();
	incapUpdateReqURL();
	updateRequestData();
}

function getNestedBodyParams(bodyParamsAry,parentParamPath,curParamDefinition){
	$.each(curParamDefinition.properties, function(bodyParamName,bodyParam) {
		var curParamPath = (parentParamPath=='') ? bodyParamName : parentParamPath+'.'+bodyParamName;
		if (bodyParam.properties!=undefined) {
			bodyParamsAry = getNestedBodyParams(bodyParamsAry,curParamPath,bodyParam);
		} else {
			bodyParam.name = curParamPath;
			bodyParam.id_str = curParamPath.replaceAll(".","_");
			bodyParamsAry.list[curParamPath] = bodyParam;
			bodyParamsAry.index.push(curParamPath);
		}
	});
	return bodyParamsAry;
}

function updateRequestData() {
	updateRequestDataFromJsonParams();
	updateRequestDataFromFormDataParams();
}

function setNestedBodyParams(curObject,curPathAry,param){
	if (curPathAry.length>1) {
		var parentName = curPathAry.shift();
		if (curObject[parentName]==undefined) curObject[parentName] = {};
		curObject[parentName] = setNestedBodyParams(curObject[parentName],curPathAry,param);
	} else {
		var input = $('#'+param.name.replaceAll(".","_"))
		var val = input.val();
		if (timestampParam[input.attr("id")]) {
			val = new Date(input.val()).valueOf();
		} else {
			switch (input.parent().attr("class")) {
				case "array_string":
					val = val.replaceAll("[","").replaceAll("]","").replaceAll('"',"").replaceAll("'","").split(",");
					break;
				case "array_integer":
					valAry = [];
					$.each(val.replaceAll("[","").replaceAll("]","").replaceAll('"',"").replaceAll("'","").split(","), function(i,paramVal) {
						valAry.push((!isNaN(parseInt(val,10))) ? parseInt(paramVal,10) : parseInt(paramVal,10));
					});
					val = valAry;
					break;
				case "integer":
					if (timestampParam[param.name]) {
						val = (!isNaN(parseInt(val,10))) ? parseInt(val,10) : "NaN";
					} else {
						val = (!isNaN(parseInt(val,10))) ? parseInt(val,10) : "NaN";
					}
					break;
				case "boolean":
					val = (val=='true') ? true : false;
					break;
			}
		}
		curObject[curPathAry[0]] = val;
	}
	return curObject;
}

function updateRequestDataFromJsonParams(){
	if ($('#incapbodyParams .bodyParams').length>0) {
		var reqObj = {}
		$.each($('#incapbodyParams .bodyParams'), function(i,param) {
			// alert(param.name+"=="+$('#'+param.name).val());
			if ($('#'+param.name.replaceAll(".","_")).val()!='') reqObj = setNestedBodyParams(reqObj,param.name.split("."),param)
		});
		$('#incapData').val(JSON.stringify(reqObj));
	}
	$('#incapCurlExample').val(incap_transformToCURL());
	
	// toggleDcId();
	// var reqObj = getUserAuthObj($('#incapAccountsList').val());
	// delete reqObj.account_id;

	// if (incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()] != undefined) {
	// 	$.each(incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()], function(i,paramName) {
	// 		if (incapJsonParamMapping[paramName]!=undefined) {
	// 			if (paramName=='account_id') {
	// 				reqObj['account_id'] = $('#incapAccountIDList').val();
	// 			} else {
	// 				var param = incapJsonParamMapping[paramName];
	// 				if (incapJsonParamMapping[paramName].values!=undefined && $('#'+paramName).val()!=null) {
	// 					if (typeof($('#'+paramName).val())=='object') {
	// 						reqObj[paramName] = $('#'+paramName).val().join();
	// 						//reqObj[paramName] = JSON.stringify($('#'+paramName).val());
	// 					} else if ($('#'+paramName).val().trim()!='') {
	// 						//if (paramName=='api_id' || paramName=='api_key' || paramName=='account_id') reqObj[paramName] = $('#'+paramName).val();
	// 						if (param.type=='list') {
	// 							reqObj[paramName] = $('#'+paramName).val();
	// 							//reqObj[paramName] = param.values.substr(1,(param.values.length-2)).split(',');
	// 						} else if (param.type=='obj') {
	// 							reqObj[paramName] = JSON.parse($('#'+paramName).val());
	// 						} else if (param.type=='int') {
	// 							reqObj[paramName] = parseInt($('#'+paramName).val(),10);
	// 						} else if (param.type=='boolean') {
	// 							var boolVal = false; if ($('#'+paramName).val()=='true') boolVal = true;
	// 							reqObj[paramName] = boolVal;
	// 						} else {
	// 							reqObj[paramName] = $('#'+paramName).val();
	// 						}
	// 					}
	// 				}
	// 			}
	// 		}
	// 	});
	// }
	// var dupReqObj = jQuery.extend(true, {}, reqObj);
	// if (dupReqObj.api_key!=undefined && $('#incap_configMaskSecretKey').is(":checked")) dupReqObj.api_key = starStr.substr(0,dupReqObj.api_key.length);
	
	
	// $('#incapData').val(JSON.stringify(dupReqObj));
	// $('#incapJSONparams input').unbind().blur(function(){ updateJSON(); });
	// $('#incapJSONparams textarea').unbind().blur(function(){ updateJSON(); });
	// $('#incapJSONparams select').unbind().change(function(){ updateJSON(); });
	//if ($('#incapActions').val()=='/api/prov/v1/sites/incapRules/add' || $('#incapActions').val()=='/api/prov/v1/sites/incapRules/edit') {
		//$('#action').unbind().change(function(){ toggleDcId(); updateJSON(); });
	//}
	// $.each(incapGetObjectActionMapping, function(input_id,inputObj) {
	// 	if ($('#'+input_id).length==1) $('#'+input_id).unbind().change(function(){ loadParamChildValues(this.id); updateJSON(); });
	// });
	// $('#incapCurlExample').val(incap_transformToCURL($('#incapServer').val()+$('#incapActions').val(),reqObj,$('#incap_configMaskSecretKey').is(":checked")));
}

function updateRequestDataFromFormDataParams(){
	if ($('#incapformDataParams .formDataParams').length>0) {
		var queryParams = {};
		$.each($('#incapformDataParams .formDataParams'), function(i,input) {
			if (input.value!='') queryParams[input.id] = ((timestampParam[input.id]) ? new Date(input.value).valueOf(): input.value);
		});
		$('#incapData').val(JSON.stringify(queryParams));
	}
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
	loadSites();
}

/* Series of call back functions to load sub account IDs in the right location when changing API_KEYs on the UI */
function loadSubAccounts(obj){
	var authObj = getUserAuthObj($(obj).val());
	if ($(obj).attr('id')=='incapAccountsList') { // API Client
		$('#incapAccountIDList').html('<option value="'+authObj.account_id+'">loading...</option>');
		//$('#get the page num id later ').val('0');
		// TODO: load definition host dynamically from separate function
		makeIncapCall(getSwHost("cwaf_api_v1")+getSubAccountUrlByAccountId('#incapAccountsList'),'POST',authObj,loadSubAccountsResponse_APIClient,{},'set',"application/x-www-form-urlencoded");
	} else if ($(obj).attr('id')=='incapSitesAccountsList') { // Sites
		$('#incapSitesAccountIDList').html('<option value="'+authObj.account_id+'">loading...</option>');
		$('#incapSitesPageNum').val('0');
		makeIncapCall(getSwHost("cwaf_api_v1")+getSubAccountUrlByAccountId('#incapSitesAccountsList'),'POST',authObj,loadSubAccountsResponse_Sites,{},'set',"application/x-www-form-urlencoded");
	} else if ($(obj).attr('id')=='incap_migrationAction') { // Migration
		$('#incap_migrationAction').attr('disabled','disabled');
		$('#incap_migrationAction_accountIDList').html('<option value="'+authObj.account_id+'">loading...</option>').attr('disabled','disabled');
    	$("#incap_migrationAction_sites").html('<option value="">loading...</option>').attr('disabled','disabled');
		$('#incap_migrationAction_page_num').val('0');
		makeIncapCall(getSwHost("cwaf_api_v1")+getSubAccountUrlByAccountId('#incap_migrationAction'),'POST',authObj,loadSubAccountsResponse_Migration,{},'set',"application/x-www-form-urlencoded");
	} else if ($(obj).attr('id')=='incap_site_group_account_list') { // Site Group
		$('#incap_site_group_account_ID_list').html('<option value="'+authObj.account_id+'">loading...</option>').attr('disabled','disabled');
		$('#incap_site_group_page_num').val('0');
		$("#avail_incap_group_sites").html('<option value="">loading...</option>');
		makeIncapCall(getSwHost("cwaf_api_v1")+getSubAccountUrlByAccountId('#incap_site_group_account_list'),'POST',authObj,loadSubAccountsResponse_SiteGroup,{},'set',"application/x-www-form-urlencoded");
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

// // Create flow for rendering, and looking up query params as well as path params
// @TODO: get dynamic params passing in param type, and create separate render function for each param type for dynamic calls back recursively 
function incapGetDynamicParams(curObj, paramType) {
	// dynamicParams
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')].definition;
	// console.log(curSwagger);
	var currentAction = $("#incapActions").val().substr(curSwagger.basePath.length);
	// console.log(currentAction);
	// console.log("incap_method_sel="+incap_method_sel);
	// console.log($(incap_method_sel).val());
	var methodObj = jQuery.extend(true, {}, curSwagger.paths[currentAction][$(incap_method_sel).val()]);
	// console.log(methodObj);
	// console.log("curObj");
	// console.log(curObj);
	if (curObj!=undefined) setCurrentIncapQueryParamIndex(curObj);
	// console.log(curObj);
	// console.log("incapCurQueryParamsIndex="+incapCurQueryParamsIndex);
	if (incapCurQueryParamsAry.length>(incapCurQueryParamsIndex)) {
		$('#IncapsulaAPI #'+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).html('<option value="">loading...</option>');
		for (var i=(incapCurQueryParamsIndex+1); i<incapCurQueryParamsAry.length; i++) {
			$('#IncapsulaAPI #'+incapCurQueryParamsAry[i].name).html('');
		}
		var curParam = incapCurQueryParamsAry[incapCurQueryParamsIndex].name;
		if (incapJsonParamMapping[curParam]!=undefined) {
			var curAction = null;
			try { curAction = incapResolveActionPlaceHolders(incapJsonParamMapping[curParam].getAPIurlMapping.default.url); } catch(err) {}
			if (curAction==null && incapJsonParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()]!=undefined) {
				curAction = incapResolveActionPlaceHolders(incapJsonParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()].url);
			}
			if (curAction!=null && curAction!=undefined) {
				// makeIncapCall(paramActionObj.action,'POST',renderParamListValues,reqObj,paramName);
				makeIncapCall(getSwHost("cwaf_api_v1")+curAction,'GET',null,incapRenderQueryParams,{},"application/x-www-form-urlencoded");
			} else {
				if (incapJsonParamMapping[curParam].type=="list") {
					$('#IncapsulaAPI #'+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).html('');
					$.each(incapJsonParamMapping[curParam].values, function(i,value) { 
						$('#IncapsulaAPI #'+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).append('<option value="'+value+'">'+value+'</option>'); 
					});
				} else if (incapJsonParamMapping[curParam].type=='boolean') {
					$('#IncapsulaAPI #'+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).html('<option value="true">true</option><option value="false">false</option>');
				} else if (incapJsonParamMapping[curParam].type=='string') {
					$('#IncapsulaAPI #'+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).html('<option value="'+incapJsonParamMapping[curParam].values+'">'+incapJsonParamMapping[curParam].values+'</option>');
				}
			}
		} else {
			for (var i=(incapCurQueryParamsIndex); i<incapCurQueryParamsAry.length; i++) {
				$('#IncapsulaAPI #'+incapCurQueryParamsAry[i].name).html('<option value="">Not Currently Available</option>');
			}
		}
	}
}

function setCurrentIncapQueryParamIndex(obj){
	var curIndex = 0;
	$.each(incapCurQueryParamsAry, function(i,param){ param.isCurObj=false; });
	if (obj!=undefined) {
		$.each(incapCurQueryParamsAry, function(i,param){ if (param.name==obj.id) incapCurQueryParamsIndex=(i+1); });
	}
	return curIndex;
}

// function incapRenderQueryParams(data){
// 	debugger
// 	var tmpAry = {"list":[]};
// 	console.log("incapRenderQueryParams");
// 	console.log(incapCurQueryParamsAry);
// 	console.log("incapCurQueryParamsIndex="+incapCurQueryParamsIndex);
// 	console.log(incapCurQueryParamsAry[incapCurQueryParamsIndex]);
// 	console.log(incapJsonParamMapping[incapCurQueryParamsAry[incapCurQueryParamsIndex].name]);

// 	try { 
// 		if (incapJsonParamMapping[incapCurQueryParamsAry[incapCurQueryParamsIndex].name].getAPIurlMapping.default!=undefined){

// 		}
// 	} catch(err) {}	
// 	// populateSelect(incapCurQueryParamsAry[incapCurQueryParamsIndex].name,data);
// 	// $("#IncapsulaAPI #"+incapCurQueryParamsAry[incapCurQueryParamsIndex].name).unbind().change(function(){ incapGetURLParams(this); });
// 	// if (incapCurQueryParamsAry[incapCurQueryParamsIndex].name=='policyName') {
// 	// 	$('#IncapsulaAPI #policyName').val(curLoadedPolicyName);
// 	// 	$(ss_method_sel).val('GET');
// 	// 	$('#IncapsulaAPI #policyName_btn').trigger('click');
// 	// 	SSUpdateJSON();
// 	// 	$('#IncapsulaAPI #execute').trigger('click');
// 	// }
// 	// incapCurQueryParamsIndex++;
// 	// incapGetURLParams();
// }

// function incapGetPathParams(curObj) {
// 	var curSwagger = incapApiActions[$('#incapActions :selected').parent().attr('label')];
// 	var currentAction = $("#incapActions").val().substr(curSwagger.basePath.length);
// 	var methodObj = jQuery.extend(true, {}, curSwagger.paths[currentAction][$(incap_method_sel).val()]);
// 	// console.log(methodObj);
// 	if (curObj!=undefined) setCurrentIncapPathParamIndex(curObj);
// 	if (incapCurPathParamsAry.length>(incapCurPathParamsIndex)) {
// 		$('#IncapsulaAPI #'+incapCurPathParamsAry[incapCurPathParamsIndex].name).html('<option value="">loading...</option>');
// 		for (var i=(incapCurPathParamsIndex+1); i<incapCurPathParamsAry.length; i++) {
// 			$('#IncapsulaAPI #'+incapCurPathParamsAry[i].name).html('');
// 		}
// 		var curParam = incapCurPathParamsAry[incapCurPathParamsIndex].name;
// 		if (incapJsonParamMapping[curParam]!=undefined) {
// 			var curAction = null;
// 			try { curAction = incapResolveActionPlaceHolders(incapJsonParamMapping[curParam].getAPIurlMapping.default.url); } catch(err) {}
// 			if (curAction==null && incapJsonParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()]!=undefined) {
// 				curAction = incapResolveActionPlaceHolders(incapJsonParamMapping[curParam].getAPIurlMapping[$(ss_action_sel).val()].url);
// 			}
// 			if (curAction!=null && curAction!=undefined) {
// 				// makeIncapCall(paramActionObj.action,'POST',renderParamListValues,reqObj,paramName);
// 				makeIncapCall(curAction,'GET',incapRenderPathParams,{});
// 			} else {
// 				if (incapJsonParamMapping[curParam].type=="list") {
// 					$('#IncapsulaAPI #'+incapCurPathParamsAry[incapCurPathParamsIndex].name).html('');
// 					$.each(incapJsonParamMapping[curParam].values, function(i,value) { 
// 						$('#IncapsulaAPI #'+incapCurPathParamsAry[incapCurPathParamsIndex].name).append('<option value="'+value+'">'+value+'</option>'); 
// 					});
// 				} else if (incapJsonParamMapping[curParam].type=='boolean') {
// 					$('#IncapsulaAPI #'+incapCurPathParamsAry[incapCurPathParamsIndex].name).html('<option value="true">true</option><option value="false">false</option>');
// 				} else if (incapJsonParamMapping[curParam].type=='string') {
// 					$('#IncapsulaAPI #'+incapCurPathParamsAry[incapCurPathParamsIndex].name).html('<option value="'+incapJsonParamMapping[curParam].values+'">'+incapJsonParamMapping[curParam].values+'</option>');
// 				}
// 			}
// 		} else {
// 			for (var i=(incapCurPathParamsIndex); i<incapCurPathParamsAry.length; i++) {
// 				$('#IncapsulaAPI #'+incapCurPathParamsAry[i].name).html('<option value="">Not Currently Available</option>');
// 			}
// 		}
// 	}
// }

// function setCurrentIncapPathParamIndex(obj){
// 	var curIndex = 0;
// 	$.each(incapCurPathParamsAry, function(i,param){ param.isCurObj=false; });
// 	if (obj!=undefined) {
// 		$.each(incapCurPathParamsAry, function(i,param){ if (param.name==obj.id) incapCurPathParamsIndex=(i+1); });
// 	}
// 	return curIndex;
// }

// function incapRenderPathParams(data){
// 	var tmpAry = {"list":[]};
// 	console.log(incapCurPathParamsAry);
// 	try { 
// 		if (incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default!=undefined){

// 		}

// 		// if (incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default!=undefined){
// 		// 	if (incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default.nestedItemName!=undefined) {
// 		// 		var nestedMappingObj = incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default;
// 		// 		$.each(data,function(i, ary){
// 		// 			if (nestedMappingObj.nestedItemLevel==0) { 
// 		// 				tmpAry.list.push(ary[incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default.nestedItemName]); 
// 		// 			} else if (nestedMappingObj.nestedItemLevel==1 && ary.length!=0) { 
// 		// 				$.each(ary,function(i, obj){ 
// 		// 					tmpAry.list.push(obj[incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default.nestedItemName]); 
// 		// 				}); 
// 		// 			} 
// 		// 		});
// 		// 		data = tmpAry;
// 		// 	} 
// 		// } else if (incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping[$('#incapActions').val()]!=undefined) {
// 		// 	var nestedMappingObj = incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping[$('#incapActions').val()];
// 		// 	$.each(data,function(i, ary){
// 		// 		if (nestedMappingObj.nestedItemLevel==0) { 
// 		// 			if (nestedMappingObj.nestedItemName!=undefined) {
// 		// 				tmpAry.list.push(ary[nestedMappingObj.nestedItemName]); 
// 		// 				// debugger
// 		// 			} else {
// 		// 				tmpAry.list.push(ary[nestedMappingObj]); 
// 		// 				// debugger
// 		// 			}
// 		// 		} else if (nestedMappingObj.nestedItemLevel==1 && ary.length!=0) { 
// 		// 			// $.each(ary,function(i, obj){ 
// 		// 			// 	if (nestedMappingObj.nestedItemName!=undefined) {
// 		// 			// 		tmpAry.list.push(obj[incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMappingnestedItemName]); 
// 		// 			// 		debugger
// 		// 			// 	} else {
// 		// 			// 		tmpAry.list.push(obj[incapJsonParamMapping[incapCurPathParamsAry[incapCurPathParamsIndex].name].getAPIurlMapping.default.nestedItemName]); 
// 		// 			// 		debugger
// 		// 			// 	}
// 		// 			// }); 
// 		// 		} 
// 		// 	});
// 		// 	data = tmpAry;
// 		// }
// 	} catch(err) {}	
// 	// populateSelect(incapCurUrlParamsAry[incapCurPathParamsIndex].name,data);
// 	// $("#IncapsulaAPI #"+incapCurUrlParamsAry[incapCurPathParamsIndex].name).unbind().change(function(){ incapGetURLParams(this); });
// 	// if (incapCurUrlParamsAry[incapCurPathParamsIndex].name=='policyName') {
// 	// 	$('#IncapsulaAPI #policyName').val(curLoadedPolicyName);
// 	// 	$(ss_method_sel).val('GET');
// 	// 	$('#IncapsulaAPI #policyName_btn').trigger('click');
// 	// 	SSUpdateJSON();
// 	// 	$('#IncapsulaAPI #execute').trigger('click');
// 	// }
// 	// incapCurPathParamsIndex++;
// 	// incapGetPathParams();
// }

function renderParamsHTML(){
	// reset the request url to pull from host/action
	$(incap_req_url_sel).val($('#IncapsulaAPI #incapServer').val()+$(incap_action_sel).val());
	var curSwagger = incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')];
	var currentAction = $("#incapActions").val().substr(curSwagger.definition.basePath.length);
	var methodObj = jQuery.extend(true, {}, curSwagger.definition.paths[currentAction][$(incap_method_sel).val()]);
	$('#incapData').val('');
	$.each(["bodyParams","pathParams","queryParams","formDataParams"], function(i,paramType) {
		var divId = (paramType=="bodyParams" || paramType=="formDataParams") ? divId = "body" : divId = paramType.replace("Params","");;
		$("#incap"+paramType+" table").html('');
		if (methodObj[paramType]!=undefined) {
			// if (methodObj[paramType].index.length>0 && paramType=="bodyParams"){
			// 	var paramsAreAllComplex = true;
			// 	$.each(methodObj[paramType].index, function(i,paramName) {
			// 		if (methodObj[paramType].list[paramName].type!="object") isComplexObject=false;
			// 	});
			// }
			// if (paramsAreAllComplex) {
			// 	console.log(methodObj);
			// 	var str = '<tr id="jsonBodytr" class="fieldwrapper"><td align="right"><label for="jsonBody">';
			// 	str += '<span class="info" title="jsonBody"> </span> JSON Body: </label></td><td>';
			// 	str += '<textarea class="'+paramType+'"  name="jsonBody" id="jsonBody" style="width:200px; ">{}</textarea>';
			// 	str += '</td></tr>';
			// 	$("#incap"+paramType+" table").append(str);
			// } else {
			$.each(methodObj[paramType].index, function(i,paramName) {
				var param = methodObj[paramType].list[paramName];
				if (param.name!='api_id' && param.name!='api_key' && param.name!='account_id') {
					// var displayName = param.name.replace(/([A-Z])/g, ' $1').replace('ip','IP').replace('id','ID').replace('Db ','DB ').replace('-',' ').replace('ip','IP').replace('_',' ');
					//displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
					var str = '<tr id="'+param.id_str+'tr" class="fieldwrapper"><td align="right"><label for="'+param.name+'">';
					if (param.description!=undefined) str += '<span class="info" title="'+param.description+'"> </span> '; 
					str += param.name+': </label></td><td class="'+param.type+((param.items!=undefined && param.items.type!=undefined) ? "_"+param.items.type : '')+'">';
					if (incapGetObjectActionMapping[param.name]!=undefined) {
						if (paramType=='pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="'+param.id_str+'_btn" title="Copy to Request URL">copy</a>';
						str += '<select name="'+param.name+'" class="'+paramType+'" id="'+param.id_str+'"><option value="">loading...</option></select>';
					} else if (param.enum!=undefined) {
						str += '<select name="'+param.name+'" class="'+paramType+'" id="'+param.id_str+'">';
						if (param.required!=true) str += '<option value="">-- select --</option>';
						$.each(param.enum, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
						str += '</select>';
					} else if (timestampParam[param.name]) {
						str += '<input type="text" class="datepicker '+paramType+'" name="'+param.name+'" id="'+param.id_str+'" value="" placeholder="epoch timestamp" />';
					} else if (param.type=="boolean") {
						str += '<select name="'+param.name+'" class="'+paramType+'" id="'+param.id_str+'">';
						str += '<option value="">-- select --</option><option value="true">true</option><option value="false">false</option>';
						str += '</select>';
					} else if (param.type=="object") {
						str += '<textarea class="'+paramType+'"  name="'+param.name+'" id="'+param.id_str+'" style="width:200px; height: 50px;">'+param.jsonStr+'</textarea>';
					} else {
						str += '<input type="text" class="'+paramType+'" name="'+param.name+'" id="'+param.id_str+'" value="" placeholder="'+param.type+'" />';
					}
					str += '</td></tr>';
					$("#incap"+paramType+" table").append(str);
				}
			});
			// }
		}
	});	
	$.each(incapAPIDefinitions[$('#incapActions :selected').parent().attr('label')].definition.paths[currentAction][$('#incapMethod').val()].parameters, function(i,param) {
		if (incapGetObjectActionMapping[param.name]!=undefined) {
			var paramActionObj = incapGetObjectActionMapping[param.name];
			if (paramActionObj.isParent==true) {
				loadParamValuesByName(param.name);
			} else {
				var parentPresent = false; 
				if (paramActionObj.parents!=undefined) $.each(paramActionObj.parents, function(i,parentId) { if ($('#'+parentId)!=undefined) parentPresent=($('#'+parentId).addClass('processing')) ? false : true; });
				if (parentPresent) loadParamValuesByName(param.name);
			}
		}
	});
	// toggleDcId();
	$('#incappathParams .ui-icon-copy').unbind("click").click(function(){ incapCopyPathParam(this); })
	$('#incapqueryParams input, #incapqueryParams textarea').unbind().blur(function(){ incapUpdateReqURL(); });
	$('#incapqueryParams select').unbind().change(function(){ incapUpdateReqURL(); });
	$('#incapbodyParams input, #incapbodyParams textarea').unbind().blur(function(){ updateRequestDataFromJsonParams(); });
	$('#incapbodyParams select').unbind().change(function(){ updateRequestDataFromJsonParams(); });
	$('#incapformDataParams input, #incapformDataParams textarea').unbind().blur(function(){ updateRequestDataFromFormDataParams(); });
	$('#incapformDataParams select').unbind().change(function(){ updateRequestDataFromFormDataParams(); });	

	incapUpdateReqURL();
	// $(".datepicker").parent().click(function(){ $(".datepicker").trigger('blur'); });
	$(".datepicker").datetimepicker();
	updateRequestDataFromJsonParams();
	updateRequestDataFromFormDataParams();
}

function incapCopyPathParam(input){
	var curId = input.id.replace("_btn","");
	var inputObj = $('#'+curId);
	if (inputObj.val()!='') $(incap_req_url_sel).val($(incap_req_url_sel).val().replace("{"+curId+"}",$('#incappathParams #'+curId).val()));
	incapUpdateReqURL();
}

function loadParamValuesByName(paramName){
	if (incapGetObjectActionMapping[paramName]!=undefined) {
		var paramActionObj = incapGetObjectActionMapping[paramName];
		$("#"+paramName).addClass('processing').html('<option value="">loading...</option>');
		var reqObj = {};
		if (paramActionObj.parents!=undefined) {
			$.each(paramActionObj.parents, function(i,parentId) {
				if ($('#'+parentId)!=undefined) {
					reqObj[parentId] = $('#'+parentId).val();
				}
			});
		}
		if (paramName=='site_id') {
			reqObj.account_id=$('#incapAccountIDList').val();
			reqObj.page_size=$('#incapSitesPageSize').val();
			reqObj.page_num=$('#incapSitesPageNum').val();
		}
		makeIncapCall(getSwHost("cwaf_api_v1")+paramActionObj.action,'POST',null,renderParamListValues,reqObj,paramName,"application/x-www-form-urlencoded");
	}
}

function loadParamChildValues(paramName){
	var paramActionObj = incapGetObjectActionMapping[paramName];
	if (paramActionObj.children!=undefined && paramActionObj.children.length!=0) {
		$.each(paramActionObj.children, function(i,childParamName) {
			if ($('#'+childParamName).length>0) {
				loadParamValuesByName(childParamName);
			}
		});
	}
}

function renderParamListValues(response,input_id) {
	// debugger
	// console.log("===========renderParamListValues(response,input_id)==============");
	// console.log(response);
	// console.log(input_id);
	// debugger
	// TODO: Render parent and child params, specifically dc_id
	var paramActionObj = incapGetObjectActionMapping[input_id];
	// console.log("paramActionObj");
	// console.log(paramActionObj);
	$("#"+input_id).removeClass('processing').html('');
	if (input_id=='dc_id') $("#"+input_id).html('<option value="">-- select --</option>');
	// debugger
	if (paramActionObj.displayText!='' && paramActionObj.displayText!=undefined) {
		var paramActionObjIndex = [];
		var paramActionObjAry = {};
		$.each(response[paramActionObj.listName], function(i,subGroupObj) {	
			// console.log(subGroupObj);
			paramActionObjIndex.push(subGroupObj[paramActionObj.displayText]+'_'+subGroupObj[paramActionObj.id]);
			paramActionObjAry[subGroupObj[paramActionObj.displayText]+'_'+subGroupObj[paramActionObj.id]] = subGroupObj;
		});	
		paramActionObjIndex.sort();
		// console.log(paramActionObjIndex);
		$.each(paramActionObjIndex, function(i,paramActionIdStr) {	
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			$("#"+input_id).append('<option value="'+subGroupObj[paramActionObj.id]+'">'+subGroupObj[paramActionObj.displayText]+' ('+subGroupObj[paramActionObj.id]+')</option>');
		});
	} else {
		$.each(response[paramActionObj.listName], function(i,subGroupObj) {
			$("#"+input_id).append('<option value="'+subGroupObj[paramActionObj.id]+'">'+subGroupObj[paramActionObj.id]+'</option>');
		});	
	}
	if (paramActionObj.children!=undefined && paramActionObj.children!=length!=0) {
		loadParamChildValues(input_id);
	}
	$('#'+input_id).unbind().change(function(){ loadParamChildValues(this.id); updateRequestData(); });
	updateRequestData();
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
