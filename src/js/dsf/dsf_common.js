var dsfActions = {};
var dsf_server_list_sel = '#DSFAPI #dsfServersList';
var dsf_server_sel = '#DSFAPI #dsfServer';
var dsf_action_sel = '#DSFAPI #dsfActions';
var dsf_token_sel = '#DSFAPI #dsfToken';
var dsf_display_name_sel = '#DSFAPI #dsfDisplayName';
var dsf_client_sel = '#DSFAPI .dsf_client';
var dsf_auth_sel = '#DSFAPI .dsf_auth';
var dsf_method_sel = '#DSFAPI #dsfMethod';
var dsf_result_sel = '#DSFAPI #dsfResult';
var dsf_req_url_sel = '#DSFAPI #dsfRequestUrl';
var dsf_content_type_sel = '#DSFAPI #dsfContentType';
var dsf_data_sel = '#DSFAPI #dsfData';
var dsf_path_param_sel = '#DSFAPI #dsfpathParams';
var dsf_body_param_sel = '#DSFAPI #dsfbodyParams';
var dsf_del_user_sel = '#dsfTokenTable .del_dsf_user';

var dsfAPIDefinitionsAry = [];
var dsfAPIDefinitionIndex = 0;
var dsfAPIDefinitionIndex_processed = 0;

$().ready(function() {
	dsfAPIDefinitionsAry = getAPIDefinitionIndexes(dsfAPIDefinitions);
	while (dsfAPIDefinitionIndex < dsfAPIDefinitionsAry.length) {
		var curApiDefName = dsfAPIDefinitionsAry[dsfAPIDefinitionIndex];
		loadDsfSwagger(dsfAPIDefinitions[curApiDefName]["endpoint"]);
        dsfAPIDefinitionIndex++;
	}
});

function loadDsfSwagger(apiDefinitionEndpoint){
	requrl = 'ajax/dsf_swagger.php?dsfAPIDefinitionIndex=' +dsfAPIDefinitionIndex+'&endpoint='+apiDefinitionEndpoint;
    jQuery.ajax ({
		url: encodeURI(requrl),
		type: "GET",
		contentType: "application/json; charset=utf-8",
		success: function(data){
			var curApiDefName = dsfAPIDefinitionsAry[data.dsfAPIDefinitionIndex];
            dsfAPIDefinitions[curApiDefName]["definition"] = data;
			dsfAPIDefinitionIndex_processed++;
			if (dsfAPIDefinitionIndex_processed == dsfAPIDefinitionsAry.length) { 
				initDsf(); 
			}
		}
	});
}

// Main AJAX function to proxy API calls
function makeDSFCall(action, method, callback, postDataObj) {
	if (action !== undefined || checkForm()) {
		var postData = $(dsf_data_sel).val();
		if (method == undefined) method = $(dsf_method_sel).val().toUpperCase();
		if (postDataObj == undefined) {
			if (method.toUpperCase() != "GET" && method.toUpperCase() != "DELETE") {
				postDataObj = { "jsonData": $('#dsfData').val() };
			} else {
				postDataObj = { "postData": ($('#dsfData').val() != '') ? JSON.parse($('#dsfData').val()) : '' };
			}
		}
		$(dsf_result_sel).val('processing...');
		var requestUrl = $(dsf_server_sel).val() + $(dsf_action_sel).val();
		if (action !== undefined) {
			requestUrl = $(dsf_server_sel).val() + dsfDefConfig.actionPrefix + action;
		} else if ($(dsf_req_url_sel).val() != ($(dsf_server_sel).val() + $(dsf_action_sel).val())) {
			requestUrl = $(dsf_req_url_sel).val();
		}
		if (method == undefined) method = $(dsf_method_sel).val();
		var reqUrl = "ajax/dsf_api.php?server=" + requestUrl;
		reqUrl += "&method=" + method.toUpperCase();
		postDataObj["headerData"] = ["Content-Type: " + $(dsf_content_type_sel).val(), "Accept: application/json", "Authorization: Bearer "+$(dsf_token_sel).val()];
		$.post(encodeURI(reqUrl), postDataObj, function (data) {
			if (data != null) {
				responseObj = data;
				$(dsf_result_sel).val(JSON.stringify(data));
				if (callback != undefined) { 
					return callback(data);
				}
			} else {
				$.gritter.add({ title: 'ERROR', text: "API response error, unable to connect to DSF."});
			}
		});
	}
}

function initDsf(){
	$.each(dsfAPIDefinitions, function(optGroup,swagger) { 		
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
		$("#dsfActions").append(str); 
	});
	
	$('#dsfActions').change(function() { dsfChangeAction(); });
	$('#dsfMethod').change(function(){ dsfRenderParamsHTML(); });
	// $('#incapAuth').change(function(){ incap_generateCodeExamples() });
	// $('#incap_migrationConfigType').change(function(){ renderMigrationToolbar_config(this); });
	// $('#incap_migrationActionType').change(function(){ renderMigrationToolbar_action(this); });

	$('#dsfexecute').click(function(){ makeDSFCall(); });
	// DSF API token management
	$('#dsfSaveToken').unbind().click(function () { dsfSaveToken(this); });
	$('#dsfDeleteToken').unbind().click(function () { renderDSFAuth(); });

	// $('#incap_configMaskSecretKey').click(function(){ incap_generateCodeExamples() });
	// $('#incapData').blur(function(){ incap_generateCodeExamples() });
	// $('#incapbodyParams input, #incapbodyParams textarea').blur(function(){ updateRequestDataFromJsonParams(); });
	// $('#incapbodyParams select, #incapAccountIDList').change(function(){ updateRequestDataFromJsonParams(); });
	// //$('#incapRequestUrl').keyup(function(){ checkForm(); });
	// // $('#incapServer').blur(function(){ incapUpdateReqURL(); });
	// $('#insertDestCreds').button().click(function(){
	// 	var curstr = $('#bulk_curl_examples').html();
	// 	if ($('#dest_site_id').val()!='') curstr = curstr.replace(/your_site_id_here/g,$('#dest_site_id').val().trim());
	// 	if ($('#dest_api_id').val().trim()!='') curstr = curstr.replace(/your_api_id_here/g,$('#dest_api_id').val().trim());
	// 	if ($('#dest_api_key').val().trim()!='') curstr = curstr.replace(/your_api_key_here/g,$('#dest_api_key').val().trim());
	// 	$('#bulk_curl_examples').html(curstr);
	// });	
	// $('.page_num').html(renderPageNumberOptions());
	// $('.page_size').val(incapDefConfig.sitePageSize);
	loadDSFCredentials();
}

// Manage credentials
function loadDSFCredentials() {
	if (localStorage.getItem('DSF_AUTH') == null) localStorage.setItem('DSF_AUTH', '{}');
	DSF_AUTH = JSON.parse(localStorage.getItem('DSF_AUTH'));
	$(dsf_server_list_sel).html('');
	$('#dsfTokenTable').html('<tr><th colspan="2">Saved DSF Tokens</th></tr>');
	$.each(DSF_AUTH, function (index_id, configObj) {
		$(dsf_server_list_sel).append('<option title="' + configObj.display_name + ' (' + configObj.host + ')" value="' + index_id + '">' + configObj.display_name + '</option>');
		$('#dsfTokenTable').append('<tr><td title="Host: ' + configObj.host + ' \nToken: ' + configObj.token+'">' + configObj.display_name + '</td><td><a id="del_' + configObj.host + '_' + configObj.token +'" title="Delete this saved DSF token." class="del_dsf_user settings_btn incap_delete_user ui-icon ui-icon-trash" href="javascript:void(0);"></a></td></tr>');
	});
	var editVerbiage = 'Add new DSF server';
	if ($(dsf_server_list_sel).children('option').length > 0) { editVerbiage = 'Edit current or add new DSF server'; }
	$(dsf_server_list_sel).append('<option value="enternewdsf">' + editVerbiage + '</option>');
	$(dsf_server_list_sel).val($("#dsfServersList option:first").val());
	$(dsf_server_list_sel).unbind().change(function () { renderDSFAuth(); });
	$(dsf_del_user_sel).unbind().click(function () { dsfDeleteToken(this); });
	
	// $(dsf_server_list_sel).val($(dsf_server_sel).val());
	renderDSFAuth();
}

function renderDSFAuth() {
	if ($(dsf_server_list_sel).val() == 'enternewdsf') {
		$(dsf_display_name_sel).parent().parent().show();
		$(dsf_server_sel).val('').addClass('highlight').attr('placeholder', 'https://192.168.1.2:8083');
		$(dsf_display_name_sel).val('').addClass('highlight').attr('placeholder', 'DSF server desc here');
		$(dsf_token_sel).val('').addClass('highlight').attr('placeholder', 'DSF token here');
		$('#dsfexecute').unbind().click(function () { makeDSFCall(); });
		$(dsf_auth_sel).show();
		$(dsf_client_sel).hide();
		// if ($('#manageDSFCredentials').css('display') == 'none') toggleDSFManageCredentials();
	} else {
		$(dsf_client_sel).show();
		$(dsf_auth_sel).hide();
		$(dsf_display_name_sel).val(DSF_AUTH[$(dsf_server_list_sel).val()].display_name);
		$(dsf_display_name_sel).parent().parent().hide();
		$(dsf_server_sel).removeClass('highlight').val(DSF_AUTH[$(dsf_server_list_sel).val()].host);
		$(dsf_server_sel).removeClass('highlight').parent().parent().hide();
		$(dsf_token_sel).removeClass('highlight').val(DSF_AUTH[$(dsf_server_list_sel).val()].token);
		// if ($('#manageDSFCredentials').css('display') != 'none') toggleDSFManageCredentials();
		$('#dsfexecute').unbind().click(function(){ makeDSFCall(); });
		dsfUpdateReqURL();
		dsfUpdateRequestData();
	}
}

function dsfSaveToken() {
	$.gritter.add({ title: 'Saving DSF Token', text: 'Testing token against DSF host: "' + $(dsf_server_sel).val() + '"' });
	makeDSFCall(dsfDefConfig.testAuthUrl, 'GET', dsfSaveTokenResponse, {});
}

function dsfSaveTokenResponse(response) {
	// response.code response.message
	$('#dsfResult').val('');
	if (response.data == undefined) {
		$.gritter.add({ title: 'ERROR', text: JSON.stringify(response) });
		$('#incap_users_tbl tr.current input').addClass("error");
	} else {
		DSF_AUTH = JSON.parse(localStorage.getItem('DSF_AUTH'));
		DSF_AUTH[$('#dsfServer').val().trim() + "_" + $('#dsfToken').val().trim()] = {
			"host": $(dsf_server_sel).val().trim(),
			"token": $(dsf_token_sel).val().trim(),
			"display_name": $(dsf_display_name_sel).val().trim()
		};
		localStorage.setItem('DSF_AUTH', JSON.stringify(DSF_AUTH));
		$('#dsfDisplayName').val('');
		$('#dsfServer').val('');
		$('#dsfToken').val('');
		loadDSFCredentials();
	}
}

function dsfDeleteToken(obj) {
	if (confirm('Are you sure you want delete the DSF server and token?')) {
		if (DSF_AUTH[obj.id.substr(4)] != undefined) {
			delete DSF_AUTH[obj.id.substr(4)];
			localStorage.setItem('DSF_AUTH', JSON.stringify(DSF_AUTH));
			loadDSFCredentials();
		} else {
			$.gritter.add({ title: 'Token not found', text: "Token not found locally." });
		}
	}
}

function dsfUpdateReqURL() {
	$(dsf_req_url_sel).val($(dsf_server_sel).val() + dsfDefConfig.actionPrefix + $(dsf_action_sel).val());
	// if ($(dsf_req_url_sel).val() == '') {
	// 	$(dsf_req_url_sel).val($(dsf_server_sel).val() + $(dsf_action_sel).val() + queryStr);
	// } else {
	// 	var curReqUrl = $(dsf_req_url_sel).val().split("?");
	// 	var queryParams = [];
	// 	$.each($('.queryParams'), function (i, input) {
	// 		if (input.value != '') queryParams.push(input.id + "=" + ((timestampParam[input.id]) ? new Date(input.value).valueOf() : input.value));
	// 	});
	// 	$(dsf_req_url_sel).val(curReqUrl[0] + "?" + queryParams.join("&"));
	// }
	// // if (checkIncapForm()) incap_generateCodeExamples();
}

function checkDsfForm() {
	var isok = true;
	if (!($(dsf_req_url_sel).val().indexOf('{') == -1)) {
		$(dsf_req_url_sel).addClass('errors');
		isok = false;
	} else {
		$(dsf_req_url_sel).removeClass('errors');
	}
	$.each($('#dsfbodyParams .bodyParams.parent'), function (i, input) {
		var inputObj = $('#' + input.id)
		if (inputObj.val() == '' && inputObj.hasClass("parent")) {
			inputObj.val(($('#' + input.id).parent().prop("class") == 'object') ? "{}" : "[]");
		}
		if (inputObj.prop("required") && inputObj.val() == '') {
			inputObj.addClass('errors');
			isok = false;
		} else if (!IsJsonString(input.value) && inputObj.val() != '') {
			inputObj.addClass('errors');
			isok = false;
		} else {
			inputObj.removeClass('errors');
		}
	});
	return isok;
}

// Update UI display/fields based on selected action
function dsfChangeAction() {
	var reqObj = {};
	$(dsf_method_sel + ' option').attr('disabled', 'disabled');
	var curSwagger = dsfAPIDefinitions[$(dsf_action_sel + ' :selected').parent().attr('label')];
	var currentAction = $("#dsfActions").val();
	if (dsfAPIDefinitions[$('#dsfActions :selected').parent().attr('label')].definition.paths[currentAction] != undefined) {
		dsfCurPathParamsAry = [];
		var actionObj = dsfAPIDefinitions[$('#dsfActions :selected').parent().attr('label')].definition.paths[currentAction];
		$(dsf_path_param_sel + " table").html('');
		$.each(actionObj, function (method, methodObj) {
			$(dsf_method_sel + ' option[value="' + method + '"]').removeAttr('disabled');
			// delete methodObj.queryParams; delete methodObj.bodyParams; delete methodObj.pathParams; delete methodObj.formParams;
			methodObj.headerParams = { index: [], list: [] };
			methodObj.queryParams = { index: [], list: [] };
			methodObj.bodyParams = { index: [], list: [] };
			methodObj.pathParams = { index: [], list: [] };
			methodObj.formDataParams = { index: [], list: [] };

			$.each(currentAction.split("/"), function (i, paramName) {
				if (paramName.substr(0, 1) == "{") methodObj.pathParams.index.push(paramName.substr(1, paramName.length - 2))
			});
			$.each(methodObj.parameters, function (i, param) {			
				param.id_str = param.name;
				methodObj[param.in + "Params"].list[param.name] = param;
				if (param.in != "path") methodObj[param.in + "Params"].index.push(param.name);
			});
			if (methodObj.requestBody != undefined) { 
				var schema = methodObj.requestBody.content["application/json"].schema;
				// either 
				// requestBody.content["application/json"].schema / examples
				// requestBody.content["application/json"].examples
				// components.schemas[curParamDefinitionName].properties
				if (schema != undefined) {
					var curParamDefinitionName = schema['$ref'].split('/').pop();
					curParamDefinition = curSwagger.definition.components.schemas[curParamDefinitionName];
					if (curParamDefinition.properties != undefined) {
						console.log("methodObj.requestBody.content[application/json]");
						console.log(methodObj.requestBody.content["application/json"]);
						curParamDefinition.examples = methodObj.requestBody.content["application/json"].examples != undefined ? methodObj.requestBody.content["application/json"].examples : undefined;
						methodObj.bodyParams = dsfGetNestedBodyParams(methodObj.bodyParams, '', curParamDefinition);
					}
				}
			}
		});
		$(dsf_method_sel).val($(dsf_method_sel+" option:not([disabled]):first").val());
	}
	dsfRenderParamsHTML();
	dsfUpdateReqURL();
	dsfUpdateRequestData();
}

function dsfGetNestedBodyParams(bodyParamsAry, parentParamPath, curParamDefinition) {
	// console.log("dsfGetNestedBodyParams()",curParamDefinition);
	// console.log(bodyParamsAry, parentParamPath, curParamDefinition);
	var requiredParams = {};
	if (curParamDefinition.required != undefined) {
		for (i in curParamDefinition.required) { requiredParams[(parentParamPath == '') ? curParamDefinition.required[i] : parentParamPath + '.' + curParamDefinition.required[i]] = true; }
	}
	var curSwagger = dsfAPIDefinitions[$(dsf_action_sel + ' :selected').parent().attr('label')];
	$.each(curParamDefinition.properties, function (bodyParamName, bodyParam) {
		var curParamPath = (parentParamPath == '') ? bodyParamName : parentParamPath + '.' + bodyParamName;
		if (bodyParam.properties != undefined) {
			bodyParamsAry = dsfGetNestedBodyParams(bodyParamsAry, curParamPath, bodyParam);
		} else {
			if (bodyParam.type == "array" && bodyParam.data["$ref"] != undefined) {
				var curParamDefinitionName = bodyParam.data['$ref'].split('/').pop();
				// if (curParamDefinition.properties!=undefined) {
				bodyParamsAry = dsfGetNestedBodyParams(bodyParamsAry, curParamPath + "__", curSwagger.definition.components.schemas[curParamDefinitionName]);
				// }
			} else if (bodyParam["$ref"] != undefined) {
				var curParamDefinitionName = bodyParam['$ref'].split('/').pop();
				bodyParamsAry = dsfGetNestedBodyParams(bodyParamsAry, curParamPath + "__", curSwagger.definition.components.schemas[curParamDefinitionName]);
			}
			bodyParam.name = curParamPath;
			bodyParam.id_str = curParamPath.replaceAll(".", "_");
			bodyParam.required = (requiredParams[bodyParam.name] == true) ? true : false;
			bodyParam.examples = curParamDefinition.examples;
			bodyParam.type = curParamDefinition.type;
			bodyParamsAry.list[curParamPath] = bodyParam;
			bodyParamsAry.index.push(curParamPath);
		}
	});
	return bodyParamsAry;
}

function dsfUpdateRequestData() {
	if (checkDsfForm() && $('#dsfbodyParams .bodyParams').length > 0) {
		var reqObj = {}
		$.each($('#dsfbodyParams .bodyParams.parent1'), function (i, param) {
			if ($('#' + param.id).val() != '') {
				if (reqObj[param.id] == undefined) reqObj[param.id] = (($('#' + param.id).parent().attr("class") == "object") ? {} : [])
				reqObj[param.id] = JSON.parse(param.value);
			}
		});
		$.each($('#dsfbodyParams .bodyParams.param'), function (i, param) {
			if ($('#' + param.id).val() != '' && !param.id.includes("___")) reqObj = setNestedBodyParams(reqObj, param.name.split("."), param);
		});
		$('#dsfData').val(JSON.stringify(reqObj));
	}
	// incap_generateCodeExamples();
}

function dsfAddObjectToParent(input) {
	var parentId = input.id.replace("_add", "");
	if (IsJsonString($('#' + parentId).val())) {
		var curObject = {};
		// console.log("parentId="+parentId);
		$.each($('#dsfbodyParams #' + parentId + "_tbl").find("input, select, textarea"), function (i, param) {
			if (!param.id.substr(parentId.length + 3).includes("___") && param.value != '') {
				var paramName = ((param.id.includes("___")) ? param.id.split("___").pop() : param.id);
				var val = parseParamValue($('#' + param.id));
				if (val != null) curObject[paramName] = val;
			}
		});
		if ($('#' + parentId).parent().prop("class") == 'object') {
			$('#' + parentId).val(JSON.stringify(curObject));
		} else {
			var parentParamAry = JSON.parse($('#' + parentId).val());
			parentParamAry.push(curObject);
			$('#' + parentId).val(JSON.stringify(parentParamAry));
		}
	} else {
		$.gritter.add({ title: 'ERROR', text: "Malformed parameter: '" + $('#' + parentId).attr("title") + "' is not valid '" + $('#' + parentId).parent().prop("class") + "' syntax" });
	}
}

function dsfRenderParamsHTML() {
	// reset the request url to pull from host/action
	$(dsf_result_sel).val('');
	dsfUpdateReqURL();
	var curSwagger = dsfAPIDefinitions[$(dsf_action_sel+' :selected').parent().attr('label')];
	var currentAction = $("#dsfActions").val();
	var methodObj = jQuery.extend(true, {}, curSwagger.definition.paths[currentAction][$(dsf_method_sel).val()]);
	$('#dsfData').val('');
	$.each(["bodyParams", "pathParams", "queryParams"], function (i, paramType) {
		var divId = (paramType == "bodyParams") ? divId = "body" : divId = paramType.replace("Params", "");;
		$("#dsf" + paramType + " table").html('');
		if (methodObj[paramType] != undefined) {
			$.each(methodObj[paramType].index, function (i, paramName) {
				var param = methodObj[paramType].list[paramName];
				if ($('#' + param.id_str).length == 0) {
					if (param.id_str.includes("___")) {
						var parentParamIndexAry = param.id_str.split("___");
						for (var i = 1; i < parentParamIndexAry.length; i++) {
							var currentParamName = parentParamIndexAry[i - 1];
							var childContainerId = parentParamIndexAry.slice(i).join("___");
							var currentContainerId = parentParamIndexAry.slice(0, i).join("___");
							var currentContainerParam = methodObj[paramType].list[parentParamIndexAry.slice(0, i).join("__.")];
							var parentContainerId = parentParamIndexAry.slice(0, i - 1).join("___");
							if ($('.' + currentContainerId + "_tbltr").length == 0) {
								var level = (currentContainerId.split("___").length);
								var required = (param.required == true) ? ' required ' : '';
								var paramDataType = ((currentContainerParam.type != undefined) ? currentContainerParam.type : 'object');
								var str = '<tr id="' + currentContainerId + '_tbltr" class="fieldwrapper ' + currentContainerId + '_tbltr">';
								str += '<td valign="top" align="right" width><label title="' + currentContainerId + '" for="">';
								str += ((currentContainerParam.description != undefined) ? '<span class="info" title="' + currentContainerParam.description + '"> </span> ' : '');
								str += ((currentContainerParam.required == true) ? '<span title="Required field" class="required">*</span> ' : '');
								str += currentParamName + ': </label></td>';
								str += '<td align="left" class="' + ((paramDataType == 'object') ? paramDataType : paramDataType + '_object') + '">';
								str += '<textarea title="' + currentParamName + '" class="' + currentContainerId + ' bodyParams parent parent' + level + ' type_' + paramDataType + '" name="' + currentContainerId + '" id="' + currentContainerId + '" placeholder="' + paramDataType + '"' + required + '>';
								str += ((paramDataType == 'object') ? '{}' : '[]') + '</textarea>';
								str += '<br clear="all" /><a href="javascript:void(0);" id="' + currentContainerId + '_toggle" class="toggle_param_link param_link">edit object</a>';
								str += '<fieldset id="' + currentContainerId + '_fieldset" class="nested_param"><legend>' + currentParamName + ' Parameters</legend>';
								str += '<table id="' + currentContainerId + '_tbl" class="toggle_param param_tbl_level' + level + '"></table><br clear="all" />';
								str += '<a href="javascript:void(0);" id="' + currentContainerId + '_cancel" class="cancel_param_link param_link">Cancel</a>';
								str += '<a href="javascript:void(0);" id="' + currentContainerId + '_add" class="add_param_link param_link">Add</a>';
								str += '</fieldset>';
								str += '</td></tr>';
								if (parentContainerId == '') {
									$("#dsf" + paramType + "_tbl").append(str);
								} else {
									$("#" + parentContainerId + "_tbl").append(str);
								}
							}
							if (param.id_str.includes("___")) {
								if (currentContainerId + "___" + param.id_str.split("___").pop() == param.id_str) {
									$("#" + currentContainerId + "_tbl").append(dsfRenderParamHTML(param, paramType));
								}
							} else {
								$("#" + currentContainerId + "_tbl").append(dsfRenderParamHTML(param, paramType));
							}
						}
					} else {
						if (param.data == undefined || (param.data != undefined && param.data["$ref"] == undefined)) {
							$("#dsf" + paramType + "_tbl").append(dsfRenderParamHTML(param, paramType));
						}
					}
				}
			});
		}
	});
	// Now that all parameters are rendered
	$.each(["bodyParams", "pathParams", "queryParams", "formDataParams"], function (i, paramType) {
		for (var i = 0; i < methodObj[paramType].index.length; i++) {
			var param = methodObj[paramType].list[methodObj[paramType].index[i]];
			// if (incapGetObjectActionMapping[param.id_str] != undefined) {
			// 	var paramActionObj = (incapGetObjectActionMapping[param.id_str][$(dsf_action_sel).val()] != undefined) ? incapGetObjectActionMapping[param.id_str][$('#incapActions').val()] : incapGetObjectActionMapping[param.id_str].default;
			// 	if (paramActionObj != undefined) {
			// 		if (paramActionObj.isParent == true) {
			// 			loadParamValuesByName(param.id_str);
			// 		} else {
			// 			var parentPresent = false;
			// 			if (paramActionObj.parents != undefined) {
			// 				$.each(paramActionObj.parents, function (i, parentParam) {
			// 					if ($('#' + parentParam.id).length != 0) {
			// 						$('#' + parentParam.id).addClass('processing');
			// 						parentPresent = true;
			// 					}
			// 				});
			// 			}
			// 			if (!parentPresent) {
							// var str = '';
							// var paramLevel = (param.id_str.includes("___") ? 'child' : 'param');
							// if (paramType == 'pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="' + param.id_str + '_btn" title="Copy to Request URL">copy</a>';
							// str += '<input type="text" class="' + paramType + ' ' + paramLevel + '" name="' + param.name + '" id="' + param.id_str + '" value="" placeholder="' + param.type + '"' + ((param.required == true) ? ' required ' : '') + ' />';
							// $('#' + param.id_str + "_field_td").html(str);
			// 			}
			// 		}
			// 	}
			// }
		}
	});


	// // toggleDcId();
	$('.param_link').button();
	$('.toggle_param_link, .cancel_param_link').button().unbind("click").click(function () { toggleShowNestedParams(this.id.replace("_toggle", "").replace("_cancel", "")); })
	$('#dsfpathParams .ui-icon-copy').unbind("click").click(function () { dsfCopyPathParam(this); updateRequestData(); })
	$('#dsfqueryParams input:not(.parent), #dsfqueryParams textarea:not(.parent)').unbind().blur(function () { dsfUpdateReqURL(); });
	$('#dsfqueryParams select:not(.parent)').unbind().change(function () { dsfUpdateReqURL(); });
	$('#dsfbodyParams input:not(.parent), #dsfbodyParams textarea.parent1').unbind().blur(function () { if (checkDsfForm()) dsfUpdateRequestData(); });
	$('#dsfbodyParams textarea.parent:not(.parent1,.parent)').unbind().blur(function () { if (checkDsfForm()); });

	$('#dsfbodyParams select:not(.parent)').unbind().change(function () { dsfUpdateRequestData(); });
	$('#dsfformDataParams input:not(.parent), #dsfformDataParams textarea:not(.parent)').unbind().blur(function () { dsfUpdateRequestData(); });
	$('#dsfformDataParams select:not(.parent)').unbind().change(function () { dsfUpdateRequestData(); });
	$('.add_param_link').unbind().click(function () { dsfAddObjectToParent(this); dsfUpdateRequestData(); });
	$(dsf_body_param_sel+' .param_example').unbind().change(function () { dsfPopulateExample(this); });

	dsfUpdateReqURL();
	// $(".datepicker").parent().click(function(){ $(".datepicker").trigger('blur'); });
	$(".datepicker").datetimepicker();
	dsfUpdateRequestData();
}

function dsfRenderParamHTML(param, paramType) {
	param.name = (param.name == "data" ? "requestBody" : param.name);
	var isParent = "";
	// if (incapGetObjectActionMapping[param.name] != undefined) {
	// 	var paramActionObj = (incapGetObjectActionMapping[param.name][$('#incapActions').val()] != undefined) ? incapGetObjectActionMapping[param.name][$('#incapActions').val()] : incapGetObjectActionMapping[param.name].default;
	// 	if (paramActionObj.children != undefined && paramActionObj.children.length > 0) isParent = "parent";
	// }
	var paramLevel = (param.id_str.includes("___") ? 'child' : 'param');
	var paramValType = (param.type != undefined ? param.type : (param.schema != undefined && param.schema.type != undefined ? param.schema.type : "unknown_type"));
	// console.log("dsfRenderParamHTML");
	// console.log(param);
	// console.log(paramType);
	// console.log("paramValType="+paramValType);
	var str = '<tr id="' + param.id_str + 'tr" class="fieldwrapper"><td align="right"><label for="' + param.name + '">';
	if (param.description != undefined) str += '<span class="info" title="' + filterStr(param.description) + '"> </span> ';
	var required = (param.required == true) ? ' required ' : '';
	str += ((param.required == true) ? '<span title="Required field" class="required">*</span> ' : '') + ((param.id_str.includes("___")) ? param.id_str.split("___").pop() : param.name) + ': </label></td>';
	str += '<td id="' + param.id_str + '_field_td" class="' + param.type + ((param.items != undefined && param.items.type != undefined) ? "_" + param.items.type : '') + '">';
	// if (incapGetObjectActionMapping[param.id_str] != undefined) {
	// 	// console.log(param.id_str);
	// 	// console.log(incapGetObjectActionMapping[param.id_str]);
	// 	curParamObj = (incapGetObjectActionMapping[param.id_str].default == undefined) ? incapGetObjectActionMapping[param.id_str][$("#incapActions").val()] : incapGetObjectActionMapping[param.id_str].default;
	// 	// console.log(curParamObj);
	// 	var multiple = (param.uniqueItems == false || (curParamObj.multiselect == true)) ? 'multiple' : '';
	// 	if (paramType == 'pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="' + param.id_str + '_btn" title="Copy to Request URL">copy</a>';
	// 	str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + ' ' + multiple + '><option value="">loading...</option></select>';
	// } else 
	if (param.schema != undefined && param.schema.enum != undefined) {
		str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + ' ' + ((param.uniqueItems == false) ? 'multiple' : '') + '>';
		if (!param.required && (param.uniqueItems == undefined && param.uniqueItems != false)) str += '<option value="">-- select --</option>';
		$.each(param.schema.enum, function (i, value) { str += '<option value="' + value + '">' + value + '</option>'; });
		str += '</select>';
	} else if (timestampParam[param.name]) {
		str += '<input type="text" class="datepicker ' + paramType + ' ' + paramLevel + ' ' + isParent + '" name="' + param.name + '" id="' + param.id_str + '" value="" placeholder="epoch timestamp"' + required + ' />';
	} else if (paramValType == "boolean") {
		str += '<select name="' + param.name + '" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" id="' + param.id_str + '"' + required + '>';
		str += ((param.required) ? '' : '<option value="">-- select --</option>') + '<option value="true">true</option><option value="false">false</option>';
		str += '</select>';
	} else if (paramValType == "object") {
		if (param.examples!=undefined) {
			str += '<select class="param_example" name="' + param.name + '_examples" id="' + param.id_str + '_examples">';
			str += '<option value="">- select example -</option>'; 
			$.each(param.examples, function (display_name, value) { 
				str += '<option value="' + display_name + '">' + display_name + '</option>'; 
			});
			str += '</select>';
		}
		str += '<textarea class="' + paramType + ' ' + paramLevel + ' ' + isParent + '"  name="' + param.name + '" id="' + param.id_str + '" style="width:200px; height: 50px;"' + required + '></textarea>';
	} else {
		if (paramType == 'pathParams') str += '<a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="' + param.id_str + '_btn" title="Copy to Request URL">copy</a>';
		str += '<input type="text" class="' + paramType + ' ' + paramLevel + ' ' + isParent + '" name="' + param.name + '" id="' + param.id_str + '" value="" placeholder="' + paramValType + ((param.items != undefined && param.items.type != undefined) ? " (" + param.items.type + ")" : '') + '"' + required + ' />';
	}
	str += '</td></tr>';
	return str;
}

function dsfPopulateExample(obj){
	var curSwagger = dsfAPIDefinitions[$(dsf_action_sel + ' :selected').parent().attr('label')];
	var paramName = obj.id.substr(0, obj.id.length - 9);
	$(dsf_body_param_sel + " #" + paramName).html("");
	var templateName = $('#'+obj.id).val();
	try {
		var curExample = dsfAPIDefinitions[$('#dsfActions :selected').parent().attr('label')].definition.paths[$("#dsfActions").val()][$(dsf_method_sel).val()].bodyParams.list[paramName].examples[templateName];
		$(dsf_body_param_sel + " #" + paramName).html(JSON.stringify(curExample.value));
		// @TODO update json from this update
	}
	catch (err) {
		$.gritter.add({ title: 'ERROR', text: "Example '" + templateName + "' not found for param '"+paramName+"' in swagger definition." });
	}
}

function dsfCopyPathParam(input) {
	var curId = input.id.replace("_btn", "");
	var inputObj = $('#' + curId);
	if (inputObj.val() != '') $(incap_req_url_sel).val($(incap_req_url_sel).val().replace("{" + curId + "}", $('#incappathParams #' + curId).val()));
	incapUpdateReqURL();
}
