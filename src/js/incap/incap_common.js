var incapActions = {};

$().ready(function() {
	$("#mainNav").tabs();
	$.each(incapApiActions, function(optGroup,actions) { 
		var str = '<optgroup label="'+optGroup+'">';
		$.each(actions, function(action,obj) { str += '<option value="'+action+'">'+action+'</option>'; });
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
		renderJSONParamsHTML();
	});
	$('#incap_migrationConfigType').change(function(){ renderMigrationToolbar_config(this); });
	$('#incap_migrationActionType').change(function(){ renderMigrationToolbar_action(this); });

	$('#execute').click(function(){ makeIncapCall(); });
	// Incapsula API credential management
	$('#incapSaveCredentials').click(function(){ incapSaveCredentials(); });
	$('#incapDeleteCredentials').click(function(){ incapDeleteCredentials(); });
	$('#incapDeleteAllCredentials').click(function(){ incapDeleteAllCredentials(); });
	$('#incapBulkImportCredentials').click(function(){ incapBulkImportCredentials(); });

	$('#incap_configMaskSecretKey').click(function(){ updateJSON(); });
	$('#incapJSONparams input, #incapJSONparams textarea').blur(function(){ updateJSON(); });
	$('#incapJSONparams select, #incapAccountIDList').change(function(){ updateJSON(); });
	//$('#incapRequestUrl').keyup(function(){ checkForm(); });
	$('#incapServer').blur(function(){ updateReqURL(); });
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
});

// Main AJAX function to proxy API calls
function makeIncapCall(action,method,callback,postDataObj,input_id) {
	if ((input_id==undefined) || postDataObj==undefined) {
		var postDataObj_tmp = getUserAuthObj($('#incapAccountsList').val());
		postDataObj = JSON.parse($('#incapData').val());
		if (postDataObj.api_key.substr(0,10)=='**********') postDataObj.api_key = postDataObj_tmp.api_key;
		$('#incapResult').val('processing...');
	} else if (input_id=='dest') {
		postDataObj['api_key'] = $('#dest_api_key').val();
		postDataObj['api_id'] = $('#dest_api_id').val();		
	} else if (input_id=='set') {
		// do nothing as the credentials are passed into the PostDataObj as an input to the function
	} else {
		var postDataObj_tmp = getUserAuthObj($('#incapAccountsList').val());
		postDataObj['api_key'] = postDataObj_tmp.api_key;
		postDataObj['api_id'] = postDataObj_tmp.api_id;
	}
	var requestUrl = $('#incapServer').val()+$('#incapActions').val();
	if (action!=undefined) {
		requestUrl = $('#incapServer').val()+action;
	} else if ($('#incapRequestUrl').val() != ($('#incapServer').val()+$('#incapActions').val())) {
		requestUrl = $('#incapRequestUrl').val();
	}
	if (method==undefined) method = $('#incapMethod').val();
	var reqUrl = "ajax/incap_api_post.php?server="+requestUrl;
	reqUrl += "&contentType="+$('#contentType').val();
	reqUrl += "&method="+method;
	$.post(encodeURI(reqUrl), postDataObj, function(data) {
		if (data!=null) {
			responseObj = data;
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
			$.gritter.add({ title: 'ERROR', text: "API response is null, unable to connect to Incapsula."});
		}
	});
}

function incap_transformToCURL(requestUrl,reqObj,maskSecretKey){
	var curlStr = "curl '"+requestUrl+"'";
	$.each(reqObj, function(param,val) {
		if (maskSecretKey==true && param=='api_key') {
			curlStr += " --data-urlencode '"+param+'='+starStr.substr(0,val.length)+"'";
		// } else if (param=='filter') {
		// 	curlStr += " --data-urlencode '"+param+'='+val.replace(/\ /g,'\+')+"'";
		} else {
			curlStr += " --data-urlencode '"+param+'='+val+"'";
		}
	});
	curlStr = curlStr.replace(/\(\ /g,'(').replace(/ \)/g,')');
	return curlStr;
}


// Update UI display/fields based on selected action
function changeAction() {
	updateReqURL();
	renderJSONParamsHTML();
	toggleincapSampleRules();
	updateJSON();
}
function updateJSON(){
	toggleDcId();
	//var reqObj = {};
	var reqObj = getUserAuthObj($('#incapAccountsList').val());
	delete reqObj.account_id;
	// reqObj['api_key'] = userObj_tmp.api_key;
	// reqObj['api_id'] = userObj_tmp.api_id;
	if (incapApiActions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()] != undefined) {
		$.each(incapApiActions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()], function(i,paramName) {
			if (incapApiActions) 
			if (incapJsonParamMapping[paramName]!=undefined) {
				if (paramName=='account_id') {
					reqObj['account_id'] = $('#incapAccountIDList').val();
				} else {
					var param = incapJsonParamMapping[paramName];
					if (incapJsonParamMapping[paramName].values!=undefined && $('#'+paramName).val()!=null) {
						if (typeof($('#'+paramName).val())=='object') {
							reqObj[paramName] = $('#'+paramName).val().join();
							//reqObj[paramName] = JSON.stringify($('#'+paramName).val());
						} else if ($('#'+paramName).val().trim()!='') {
							//if (paramName=='api_id' || paramName=='api_key' || paramName=='account_id') reqObj[paramName] = $('#'+paramName).val();
							if (param.type=='list') {
								reqObj[paramName] = $('#'+paramName).val();
								//reqObj[paramName] = param.values.substr(1,(param.values.length-2)).split(',');
							} else if (param.type=='obj') {
								reqObj[paramName] = JSON.parse($('#'+paramName).val());
							} else if (param.type=='int') {
								reqObj[paramName] = parseInt($('#'+paramName).val(),10);
							} else if (param.type=='boolean') {
								var boolVal = false; if ($('#'+paramName).val()=='true') boolVal = true;
								reqObj[paramName] = boolVal;
							} else {
								reqObj[paramName] = $('#'+paramName).val();
							}
						}
					}
				}
			}
		});
	}
	var dupReqObj = jQuery.extend(true, {}, reqObj);
	if (dupReqObj.api_key!=undefined && $('#incap_configMaskSecretKey').is(":checked")) dupReqObj.api_key = starStr.substr(0,dupReqObj.api_key.length);
	$('#incapData').val(JSON.stringify(dupReqObj));
	$('#incapJSONparams input').unbind().blur(function(){ updateJSON(); });
	$('#incapJSONparams textarea').unbind().blur(function(){ updateJSON(); });
	$('#incapJSONparams select').unbind().change(function(){ updateJSON(); });
	//if ($('#incapActions').val()=='/api/prov/v1/sites/incapRules/add' || $('#incapActions').val()=='/api/prov/v1/sites/incapRules/edit') {
		//$('#action').unbind().change(function(){ toggleDcId(); updateJSON(); });
	//}
	$.each(incapGetObjectActionMapping, function(input_id,inputObj) {
		if ($('#'+input_id).length==1) $('#'+input_id).unbind().change(function(){ loadParamChildValues(this.id); updateJSON(); });
	});
	$('#incapCurlExample').val(incap_transformToCURL($('#incapServer').val()+$('#incapActions').val(),reqObj,$('#incap_configMaskSecretKey').is(":checked")));
}

function updateReqURL() {
	$('#incapRequestUrl').val($('#incapServer').val()+$('#incapActions').val());
	//checkForm();
}

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
	var postDataObj = getUserAuthObj(obj.value);
	if (obj.id=='incapAccountsList') { // API Client
		$('#incapAccountIDList').html('<option value="'+postDataObj.account_id+'">loading...</option>');
		//$('#get the page num id later ').val('0');
		makeIncapCall(getSubAccountUrlByAccountId('#incapAccountsList'),'POST',loadSubAccountsResponse_APIClient,postDataObj,'set');
	} else if (obj.id=='incapSitesAccountsList') { // Sites
		$('#incapSitesAccountIDList').html('<option value="'+postDataObj.account_id+'">loading...</option>');
		$('#incapSitesPageNum').val('0');
		makeIncapCall(getSubAccountUrlByAccountId('#incapSitesAccountsList'),'POST',loadSubAccountsResponse_Sites,postDataObj,'set');
	} else if (obj.id=='incap_migrationAction') { // Migration
		$('#incap_migrationAction').attr('disabled','disabled');
		$('#incap_migrationAction_accountIDList').html('<option value="'+postDataObj.account_id+'">loading...</option>').attr('disabled','disabled');;
    	$("#incap_migrationAction_sites").html('<option value="">loading...</option>').attr('disabled','disabled');
		$('#incap_migrationAction_page_num').val('0');
		makeIncapCall(getSubAccountUrlByAccountId('#incap_migrationAction'),'POST',loadSubAccountsResponse_Migration,postDataObj,'set');
	} else if (obj.id=='incap_site_group_account_list') { // Site Group
		$('#incap_site_group_account_ID_list').html('<option value="'+postDataObj.account_id+'">loading...</option>').attr('disabled','disabled');
		$('#incap_site_group_page_num').val('0');
		$("#avail_incap_group_sites").html('<option value="">loading...</option>');
		makeIncapCall(getSubAccountUrlByAccountId('#incap_site_group_account_list'),'POST',loadSubAccountsResponse_SiteGroup,postDataObj,'set');
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
	renderSubGroupOptionsHTML(response,'#incapAccountIDList'); renderAuth(); 
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
		} else {
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

function renderJSONParamsHTML(){
	$("#incapJSONparams table").html('');
	$.each(incapApiActions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()], function(i,paramName) {
		if (incapJsonParamMapping[paramName]!=undefined) {
			var param = incapJsonParamMapping[paramName];
			if (paramName!='api_id' && paramName!='api_key' && paramName!='account_id') {
				//var displayName = paramName.replace(/([A-Z])/g, ' $1').replace('ip','IP').replace('id','ID').replace('Db ','DB ').replace('-',' ').replace('ip','IP').replace('_',' ');
				//displayName = displayName.substr(0,1).toUpperCase()+displayName.substr(1);
				var str = '<tr id="'+paramName+'tr" class="fieldwrapper"><td align="right"><label for="'+paramName+'">';
				if (param.desc!=undefined) str += '<span class="info" title="'+param.desc+'"> </span> '; 
				if (paramName=='filter') {
					str += '<a href="https://docs.incapsula.com/Content/IncapRules/syntax-guide.htm" target="_new">'+paramName+'</a>: </label></td><td>';
					str += '<textarea class="'+param.type+'" name="'+paramName+'" id="'+paramName+'" readonly="readonly" onclick="openFilterDialog()" style="width:200px;">'+JSON.stringify(param.values)+'</textarea>';
				} else {
					str += paramName+': </label></td><td>';				
					if (param.type=="list") {
						var parentPresent = true;
						if (incapGetObjectActionMapping[paramName]!=undefined) {
							var paramActionObj = incapGetObjectActionMapping[paramName];
							if (paramActionObj.parents!=undefined) {
								parentPresent = false;								
								$.each(incapApiActions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()], function(i,paramName) {
									$.each(paramActionObj.parents, function(i,parentId) { if (paramName==parentId) parentPresent=true; });
								});
							}
						}
						if (parentPresent==true) {
							str += '<select name="'+paramName+'" id="'+paramName+'">';
							$.each(param.values, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
							str += '</select>';
						} else {
							str += '<input type="text" class="'+param.type+'" name="'+paramName+'" id="'+paramName+'" value="" />';
						}
					} else if (param.type=="listPair") {
						str += '<select name="'+paramName+'" id="'+paramName+'" class="multi">';
						$.each(param.values, function(i,paramObj) { 
							str += '<option value="'+paramObj.val+'">'+paramObj.displayText+'</option>'; 
						});
						str += '</select>';
					} else if (param.type=="multi") {
						str += '<select multiple name="'+paramName+'" id="'+paramName+'" class="multi">';
						$.each(param.values, function(i,value) { str += '<option value="'+value+'">'+value+'</option>'; });
						str += '</select>';
					} else if (param.type=="boolean") {
						str += '<select name="'+paramName+'" id="'+paramName+'">';
						str += '<option value="true">true</option><option value="false">false</option>';
						str += '</select>';
					} else if (param.type=="array" || param.type=="obj") {
						str += '<textarea class="'+param.type+'" name="'+paramName+'" id="'+paramName+'" style="width:200px;">'+JSON.stringify(param.values)+'</textarea>';
					} else {
						str += '<input type="text" class="'+param.type+'" name="'+paramName+'" id="'+paramName+'" value="'+param.values+'" />';
					}
				}
				str += '</td></tr>';
				$("#incapJSONparams table").append(str);
			}
		} else {
			var str = '<tr id="'+paramName+'tr" class="fieldwrapper"><td align="right"><label for="'+paramName+'">'+paramName+': </label></td><td>';
			str += '<input type="text" class="'+paramName+'" name="'+paramName+'" id="'+paramName+'" value="" />';
			str += '</td></tr>';
			$("#incapJSONparams table").append(str);
			$.gritter.add({ title: 'Error', text: "Unmapped Parameter: "+paramName});
		}
	});
	$.each(incapApiActions[$('#incapActions :selected').parent().attr('label')][$("#incapActions").val()], function(i,paramName) {
		if (incapGetObjectActionMapping[paramName]!=undefined) {
			var paramActionObj = incapGetObjectActionMapping[paramName];
			if (paramActionObj.isParent==true) {
				loadParamValuesByName(paramName);
			} else {
				var parentPresent = false; 
				$.each(paramActionObj.parents, function(i,parentId) { if ($('#'+parentId)!=undefined) parentPresent=true; });
				if (parentPresent) loadParamValuesByName(paramName);
			}
		}
	});
	toggleDcId();
	$('#incapJSONparams input, #incapJSONparams textarea').unbind().blur(function(){ updateJSON(); });
	$('#incapJSONparams select').unbind().change(function(){ updateJSON(); });
	updateJSON();
}

function loadParamValuesByName(paramName){
	if (incapGetObjectActionMapping[paramName]!=undefined) {
		var paramActionObj = incapGetObjectActionMapping[paramName];
		$("#"+paramName).html('<option value="">loading...</option>');
		var reqObj = {};
		if (paramActionObj.parents!=undefined) {
			$.each(paramActionObj.parents, function(i,parentId) {
				if ($('#'+parentId)!=undefined) {
					reqObj[parentId] = $('#'+parentId).val();
				}
			});
		}
		makeIncapCall(paramActionObj.action,'POST',renderParamListValues,reqObj,paramName);
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
	var paramActionObj = incapGetObjectActionMapping[input_id];
	$("#"+input_id).html('');
	if (input_id=='dc_id') $("#"+input_id).html('<option value="">-- select --</option>');
	if (paramActionObj.displayText!='' && paramActionObj.displayText!=undefined) {
		var paramActionObjIndex = [];
		var paramActionObjAry = {};
		$.each(response[paramActionObj.listName], function(i,subGroupObj) {	
			paramActionObjIndex.push(subGroupObj[paramActionObj.displayText]+'_'+subGroupObj[paramActionObj.id]);
			paramActionObjAry[subGroupObj[paramActionObj.displayText]+'_'+subGroupObj[paramActionObj.id]] = subGroupObj;
		});	
		paramActionObjIndex.sort();
		$.each(paramActionObjIndex, function(i,paramActionIdStr) {	
			var subGroupObj = paramActionObjAry[paramActionIdStr];
			$("#"+input_id).append('<option value="'+subGroupObj[paramActionObj.id]+'">'+subGroupObj[paramActionObj.displayText]+' ('+subGroupObj[paramActionObj.id]+')</option>');
		});
	} else {
		$.each(response[paramActionObj.listName], function(i,subGroupObj) {
			$("#"+input_id).append('<option value="'+subGroupObj[paramActionObj.id]+'">'+subGroupObj[paramActionObj.id]+'</option>');
		});	
	}
	var paramActionObj = incapGetObjectActionMapping[input_id];
	if (paramActionObj.children!=undefined && paramActionObj.children!=length!=0) {
		loadParamChildValues(input_id);
	}
	$('#'+input_id).unbind().change(function(){ loadParamChildValues(this.id); updateJSON(); });
	updateJSON();
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
