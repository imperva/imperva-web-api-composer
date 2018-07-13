var allSSWAFPolicies_src = {"webServiceCustomPolicies":{},"webApplicationCustomPolicies":{}};
var allSSWAFPolicies_dest = {"webServiceCustomPolicies":{},"webApplicationCustomPolicies":{}};
var allSSWAFPolicies_extDataSrcs = {"ipGroups":{},"dataSets":{}};
var curLoadedPolicyName = null;

function getAllWAFPolicies(){
	$('#SecureSphereAPI #SSWAFPolicies').html('<option>loading...</option>');
	$.gritter.add({ title: 'Retrieving WAF Policies', text: "Type: Web Service Custom"});
	makeSSCall('/v1/conf/webServiceCustomPolicies','GET',getAllWebAppCustomPolicies,{});
}

function getAllWebAppCustomPolicies(data){
	data.customWebPolicies.sort();
	$.each(data.customWebPolicies, function(i,policyName) { allSSWAFPolicies_src['webServiceCustomPolicies'][policyName] = true; });
	$.gritter.add({ title: 'Retrieving WAF Policies', text: "Type: Web Application Custom"});
	makeSSCall('/v1/conf/webApplicationCustomPolicies','GET',getAllWebAppCustomPoliciesResponse,{});
}

function getAllWebAppCustomPoliciesResponse(data){
	data.customWebPolicies.sort();
	$.each(data.customWebPolicies, function(i,policyName) { allSSWAFPolicies_src['webApplicationCustomPolicies'][policyName] = true; });
	renderPolicyOptions('SSWAFPolicies_src',allSSWAFPolicies_src);
	renderPolicyOptions('SSWAFPolicies_dest',allSSWAFPolicies_dest);
}

function renderPolicyOptions(selectId,policyAry){
	var str = '';
	$.each(policyAry, function(policyType,policies) {
		str += '<optgroup id="'+policyType+'" label="'+SSPolicyTypeDisplayMapping[policyType]+'">';
		var actionkeys_src = Object.keys(policies);
		$.each(actionkeys_src.sort(), function(i,policyName) {
			var isSupported=true; if (!policyAry[policyType][policyName]) { isSupported=false; }
			if (defaultADCPolicies[policyName]!=undefined) {
				if ($('#toggleADCPoliciesSS').attr('checked')=='checked') {
					if (isSupported==true) {
						str += '<option class="adc'+isSupported+'" title="ADC: '+policyName+'" value="'+policyName+'"> ⚙  '+policyName+'</option>';
					} else {
						str += '<option class="adc unsupported" title="ADC: '+policyName+'" value="'+policyName+'"><b>!</b> ⚙  '+policyName+'</option>';
					}
				}
			} else {
				if (isSupported==true) {
					str += '<option title="'+policyName+'" value="'+policyName+'">'+policyName+'</option>';
				} else {
					str += '<option title="'+policyName+'" class="unsupported" value="'+policyName+'"><b>!</b> '+policyName+'</option>';
				}
			}
		});
		str += '</optgroup>';
	});
	$("#SecureSphereAPI #"+selectId).html(str);
	$("#SecureSphereAPI #"+selectId+" option").unbind().dblclick(function() { SSLoadWAFSecurityPolicy($(this)); });
	$('#toggleADCPoliciesSS').attr('disabled',false);
}

function SSLoadWAFSecurityPolicy(curObj){
	$.gritter.add({ title: 'Loading WAF Policy', text: $(curObj).val() });
	curLoadedPolicyName = $(curObj).val();
	if ($('#SecureSphereAPI #SSActions').val()=='/v1/conf/'+$(curObj).parent().attr('id')+'/{policyName}') {
		$('#SecureSphereAPI #SSrequestUrl').val(ssDefConfig.proto+'://'+$('#SecureSphereAPI #MXServer').val()+':'+ssDefConfig.port+ssDefConfig.actionPrefix+$('#SecureSphereAPI #SSActions').val());
		$('#SecureSphereAPI #SSmethod').val('GET');
		$('#SecureSphereAPI #policyName').val(curLoadedPolicyName);
		$('#SecureSphereAPI #policyName_btn').trigger('click');
		SSUpdateJSON();
		SSUpdateCURL();
		$('#SecureSphereAPI #SSexecute').trigger('click');
	} else {
		$('#SecureSphereAPI #SSActions').val('/v1/conf/'+$(curObj).parent().attr('id')+'/{policyName}').trigger('change');
	}
	//makeSSCall('/v1/conf/'+$(curObj).parent().attr('id')+'/'+$(curObj).val(),'GET',SSLoadWAFSecurityPolicyResponse,{});
}

function moveSSPolicyRight(){
	if ($('#SecureSphereAPI #SSWAFPolicies_src option:selected').length>0) {
		$.each($('#SecureSphereAPI #SSWAFPolicies_src option:selected'), function(i,option) {
			var policyType = $(option).parent().attr('id');
			var policyName = $(option).val();
			allSSWAFPolicies_dest[policyType][policyName] = {};
			delete allSSWAFPolicies_src[policyType][policyName];
		});
		retrieveDestPolicyConfigs();
	}
}

function moveSSPolicyLeft(){
	if ($('#SecureSphereAPI #SSWAFPolicies_dest option:selected').length>0) {
		$.each($('#SecureSphereAPI #SSWAFPolicies_dest option:selected'), function(i,option) {
			var policyType = $(option).parent().attr('id');
			var policyName = $(option).val();
			allSSWAFPolicies_src[policyType][policyName] = {};
			delete allSSWAFPolicies_dest[policyType][policyName];
		});
		renderPolicyOptions('SSWAFPolicies_src',allSSWAFPolicies_src);
		renderPolicyOptions('SSWAFPolicies_dest',allSSWAFPolicies_dest);
	}
}

var curDestPolicyObj = null;
function retrieveDestPolicyConfigs(){
	$.each(allSSWAFPolicies_dest, function(policyType,policyAry) { 
		$.each(policyAry, function(policyName,policyObj) {
			if (jQuery.isEmptyObject(policyObj) && curDestPolicyObj==null) {
				$('#SecureSphereAPI #migrateSSPoliciesCURL_btn').attr('disabled','disabled');
				$('#SecureSphereAPI #migrateSSPoliciesSave_btn').attr('disabled','disabled');
				curDestPolicyObj = { "policyType":policyType, "policyName":policyName }
				makeSSCall('/v1/conf/'+policyType+'/'+policyName,'GET',retrieveDestPolicyConfigResponse,{});
			}
		});
	});
	if (curDestPolicyObj==null) {
		 retrievePolicyExtDataSrcConfigs();
	}
}

function retrieveDestPolicyConfigResponse(data){
	var isValid = true;
	var badPredicates = [];
	if (data["error-code"]==undefined && data["errors"]==undefined) {
		$.each(data.matchCriteria, function(i,predicate) {
			if (predicateWhiteList[predicate.type]==undefined) {
				isValid=false;
				badPredicates.push(predicate.type);
			} else {
				if (predicateWhiteList[predicate.type].lookup==true) {
					if (predicate.type=="sourceIpAddresses") {
						$.each(predicate.ipGroups, function(i,ipGroup) {
							allSSWAFPolicies_extDataSrcs.ipGroups[ipGroup] = {};
						});
					} else if (predicate.type=="lookupDatasetSearch") {
						$.each(predicate.searchInLookupDataset, function(i,dataSet) {
							allSSWAFPolicies_extDataSrcs.dataSets[dataSet] = {};
						});
					}/* else if (predicate.type=="datasetAttributeLookup") {
					}*/
				}
			}
		});
	}
	if (isValid==true) {
		allSSWAFPolicies_dest[curDestPolicyObj.policyType][curDestPolicyObj.policyName] = data;	
		curDestPolicyObj = null;
		retrieveDestPolicyConfigs();
	} else {
		$.gritter.add({ title: 'Unsupported predicates in policy '+curDestPolicyObj.policyName, text: badPredicates });
		allSSWAFPolicies_src[curDestPolicyObj.policyType][curDestPolicyObj.policyName] = false;
		delete allSSWAFPolicies_dest[curDestPolicyObj.policyType][curDestPolicyObj.policyName];
		curDestPolicyObj = null;
	}
	renderPolicyOptions('SSWAFPolicies_src',allSSWAFPolicies_src);
	renderPolicyOptions('SSWAFPolicies_dest',allSSWAFPolicies_dest);
}

var curExtDataSrcObj = null;
// Load data set definition first, then load data
function retrievePolicyExtDataSrcConfigs(){
	if (curExtDataSrcObj==null) {
		$.each(allSSWAFPolicies_extDataSrcs, function(extDataSrcType,extDataSrcAry) {
			$.each(extDataSrcAry, function(extDataSrcName,extDataSrcObj) {
				if (extDataSrcType=='dataSets') {
					if (jQuery.isEmptyObject(extDataSrcObj) && curExtDataSrcObj==null) {
						curExtDataSrcObj = { "extDataSrcType":extDataSrcType,"extDataSrcName":extDataSrcName,"keyColumn":{} };
						allSSWAFPolicies_extDataSrcs[curExtDataSrcObj.extDataSrcType][curExtDataSrcObj.extDataSrcName] = curExtDataSrcObj;
						makeSSCall("/v1/conf/"+extDataSrcType+"/"+extDataSrcName+'/columns','GET',retrievePolicyExtDataSrcConfigsResponse,{});
					}
				} else if (extDataSrcType=='ipGroups') {
					allSSWAFPolicies_extDataSrcs[extDataSrcType][extDataSrcName] = { "extDataSrcType":extDataSrcType,"extDataSrcName":extDataSrcName }
				} 
			});
		});
		$('#SecureSphereAPI #migrateSSPoliciesCURL_btn').attr('disabled',false); 
		$('#SecureSphereAPI #migrateSSPoliciesSave_btn').attr('disabled',false); 
		retrievePolicyExtDataSrcs()
	}
}
function retrievePolicyExtDataSrcConfigsResponse(data){
	$('#SecureSphereAPI #migrateSSPoliciesCURL_btn').attr('disabled','disabled'); 
	$('#SecureSphereAPI #migrateSSPoliciesSave_btn').attr('disabled','disabled'); 
	//allSSWAFPolicies_extDataSrcs[curExtDataSrcObj.extDataSrcType][curExtDataSrcObj.extDataSrcName] = data;
	$.each(data.columns, function(i,column) { 
		if (column.key==true) { allSSWAFPolicies_extDataSrcs[curExtDataSrcObj.extDataSrcType][curExtDataSrcObj.extDataSrcName].keyColumn = column.name; }
	});
	curExtDataSrcObj = null;
	retrievePolicyExtDataSrcConfigs();
}

// Load data ext set data
function retrievePolicyExtDataSrcs(){
	if (curExtDataSrcObj==null) {
		$.each(allSSWAFPolicies_extDataSrcs, function(extDataSrcType,extDataSrcAry) { 
			if (curExtDataSrcObj==null) {
				$.each(extDataSrcAry, function(extDataSrcName,extDataSrcObj) {
					if ((extDataSrcObj.records==undefined && extDataSrcObj.entries==undefined) && curExtDataSrcObj==null) {
						curExtDataSrcObj=allSSWAFPolicies_extDataSrcs[extDataSrcObj.extDataSrcType][extDataSrcObj.extDataSrcName];
						makeSSCall("/v1/conf/"+extDataSrcType+"/"+extDataSrcName+'/data','GET',retrievePolicyExtDataSrcsResponse,{});
					}
				});
			}
		});
		$('#SecureSphereAPI #migrateSSPoliciesCURL_btn').attr('disabled',false); 
		$('#SecureSphereAPI #migrateSSPoliciesSave_btn').attr('disabled',false); 
	}
}

function retrievePolicyExtDataSrcsResponse(data){
	if (curExtDataSrcObj.extDataSrcType=='dataSets') {
		allSSWAFPolicies_extDataSrcs[curExtDataSrcObj.extDataSrcType][curExtDataSrcObj.extDataSrcName].records = data.records;
	} else if (curExtDataSrcObj.extDataSrcType=='ipGroups') {
		allSSWAFPolicies_extDataSrcs[curExtDataSrcObj.extDataSrcType][curExtDataSrcObj.extDataSrcName].entries = data.entries;
	}
	curExtDataSrcObj = null;
	retrievePolicyExtDataSrcs();
}

function migrateSSPoliciesToCURL(){
	if ($('#SecureSphereAPI #SSWAFPolicies_dest option').length>0) {
		$('#bulk_curl_examples').html('');
		$.each($('#SecureSphereAPI #SSWAFPolicies_dest option'), function(i,option) {
			var incapPolicy = convertSSPolicy(option);
			incapPolicy.api_id = "your_api_id_here";
			incapPolicy.api_key = "your_api_key_here";
			incapPolicy.site_id = "your_site_id_here";
			$('#bulk_curl_examples').append('#CURL Request for Rule: '+incapPolicy.name+'<br />'+transformToCURL($('#incapServer').val()+'/api/prov/v1/sites/incapRules/add',incapPolicy)+'<br /><br />');
		});
	}
	$('#migrationToolsBtn').trigger("click");
}

function convertSSAndSavePolicies(){
	if ($('#SecureSphereAPI #SSWAFPolicies_dest option').length>0) {
		INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
		$.each($('#SecureSphereAPI #SSWAFPolicies_dest option'), function(i,option) {
			var incapPolicy = convertSSPolicy(option);
			var okToSave = false;
			if (INCAP_POLICY_TEMPLATES['incap_rules'][incapPolicy.name]==undefined) {
				okToSave = true;
			} else {
				if (confirm('This policy ('+incapPolicy.name+') already exists locally, would you like to overwrite it?')) {
					okToSave = true;
				}
			}
			if (okToSave==true) {
				INCAP_POLICY_TEMPLATES['incap_rules'][incapPolicy.name] = incapPolicy;
			}	
		});
		localStorage.setItem('INCAP_POLICY_TEMPLATES',JSON.stringify(INCAP_POLICY_TEMPLATES));
		renderIncapPolcies();
		$('#settingsBtn').trigger("click");
		$('#incap_policies').trigger("click");
	}
}

function convertSSPolicy(option){
	var curPolicy = allSSWAFPolicies_dest[$(option).parent().attr('id')][$(option).val()];
	var incapPolicy = {
		"enabled":"true",
		"name":option.value.replace(/[^a-z0-9]|\s+|\r?\n|\r/gmi, " "),
		"action":SS2IncapPolicyMappings["action"][curPolicy["action"]],
		"filter":""
	};
	$.each(curPolicy.matchCriteria, function(i,predicate) {
		if (incapPolicy.filter != '') { incapPolicy.filter += '%26 ' }
		incapPolicy.filter += '( ';
		var glue = '%26 '; var subOp = '!='; // for excludeAll
		if (predicate.operation=='atLeastOne') { glue = '| '; subOp='=='; } // check for atLeastOne
		if (predicate.type=="httpRequest") {
			if (incapPolicy.action=='matchAny') glue = '| ';
			$.each(predicate.matchValues, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				if (matchValue.part=="parameter") {
					incapPolicy.filter += 'ParamValue '+SS2IncapPolicyMappings["operation"][matchValue.operation]+' {"'+matchValue.name+'";"'+matchValue.value+'"} ';
				} else if (matchValue.part=='url') {
					incapPolicy.filter += 'URL '+SS2IncapPolicyMappings["operation"][matchValue.operation]+' "'+matchValue.value+'" ';
				} else if (matchValue.part=="header") {
					incapPolicy.filter += 'HeaderValue '+SS2IncapPolicyMappings["operation"][matchValue.operation]+' {"'+matchValue.name+'";"'+matchValue.value+'"} ';	
				}
			});
		} else if (predicate.type=="httpRequestAcceptLanguage") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'HeaderValue '+subOp+' {"Accept-Language";"'+matchValue+'"} ';
			});
		} else if (predicate.type=="httpRequestContentType") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'HeaderValue '+subOp+' {"Content-Type";"'+matchValue+'"} ';
			});					
		} else if (predicate.type=="httpRequestCookieName") {
			var allVals = [];
			$.each(predicate.cookieNames, function(i,cookieObj) { allVals.push(cookieObj.cookie); });
			incapPolicy.filter += 'CookieExists == "'+allVals.join('";"')+'" '; 
		} else if (predicate.type=="httpRequestFileExtension") {
			var glue = '& '; var subOp = '!=';
			if (predicate.operation=='atLeastOne') { glue = '| '; subOp='=='; }
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'URL contains "'+matchValue+'$" ';
			});
		} else if (predicate.type=="httpRequestHeaderName") {
			incapPolicy.filter += 'HeaderExists '+subOp+' "'+predicate.values.join('";"')+'" '; 
		} else if (predicate.type=="httpRequestHeaderValue") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'HeaderValue '+subOp+' {"'+predicate.name+'";"'+matchValue+'"} ';
			});
		} else if (predicate.type=="httpRequestHostName") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'HeaderValue '+subOp+' {"Host";"'+matchValue+'"} ';
			});
		} else if (predicate.type=="httpRequestMethod") {
			incapPolicy.filter += 'Method '+subOp+' '+predicate.values.join(';')+' '; 
		} else if (predicate.type=="httpRequestParameterName") {
			incapPolicy.filter += 'ParamExists '+subOp+' "'+predicate.values.join('";"')+'" '; 
		} else if (predicate.type=="httpRequestRefererUrl") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'Referrer '+subOp+' {"'+predicate.name+'";"'+matchValue+'"} ';
			});
		} else if (predicate.type=="httpRequestUrl") {
			var prefix = '';
			if (predicate.match=='prefix') { prefix = '^'; if (predicate.operation=='atLeastOne') { subOp = 'contains'; } else { subOp = 'not-contains'; } }
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'URL '+subOp+' "'+matchValue+'" ';
			});
		} else if (predicate.type=="httpRequestUserAgent") {
			$.each(predicate.values, function(i,matchValue) {
				if (i>0) incapPolicy.filter += glue;
				incapPolicy.filter += 'User-Agent '+subOp+' "'+matchValue+'" ';
			});
		} else if (predicate.type=="numberOfOccurrences") {
			
		} else if (predicate.type=="sourceGeolocation") {
			var allVals = [];
			$.each(predicate.values, function(i,country) { if (countriesTbl[country]!=undefined) { allVals.push(countriesTbl[country]); } });
			incapPolicy.filter += 'CountryCode == "'+allVals.join('";"')+'" '; 					
		} else if (predicate.type=="sourceIpAddresses") {
			var allIps = {}; var allIpsStr = '';
			if (predicate.userDefined!=undefined) { $.each(predicate.userDefined, function(i,ip) { allIps[ip]=ip; }); }
			if (predicate.ipGroups!=undefined) {
				$.each(predicate.ipGroups, function(i,ipGroupName) {
					var ipGroup = allSSWAFPolicies_extDataSrcs.ipGroups[ipGroupName];
					$.each(ipGroup.entries, function(i,entry) {
						if (entry.type=='network') {
							allIps[entry.networkAddress+'/'+entry.cidrMask]=entry.networkAddress+'/'+entry.cidrMask;
						} else if (entry.type=='single') {
							allIps[entry.ipAddressFrom]=entry.ipAddressFrom;
						} else if (entry.type=='range') {
							allIps[entry.ipAddressFrom+'-'+entry.ipAddressTo]=entry.ipAddressFrom+'-'+entry.ipAddressTo;
						}							
					});
				});
			}
			$.each(allIps, function(key,ip) { if (allIpsStr!='') { allIpsStr+=';'; } allIpsStr+=ip; });
			incapPolicy.filter += 'ClientIP '+subOp+' '+allIpsStr; 
		//} else if (predicate.type=="datasetAttributeLookup") {
		} else if (predicate.type=="lookupDatasetSearch") {
				var allValsAry = [];
				$.each(predicate.searchInLookupDataset, function(i,dataSetName) {
					var dataSetObj = allSSWAFPolicies_extDataSrcs.dataSets[dataSetName];
					$.each(dataSetObj.records, function(j,record) {
						allValsAry.push(record[dataSetObj.keyColumn]);
					});
				});
				$.each(predicate.searchInUserValues, function(i,val) { allValsAry.push(val); });
				if (predicate.field=="acceptLanguages") {
					incapPolicy.filter += 'HeaderValue '+subOp+' {"Accept-Language";"'+allValsAry+'"} ';
				} else if (predicate.field=="contentType") {
					incapPolicy.filter +=  'HeaderValue '+subOp+' {"Content-Type";"'+allValsAry+'"} ';
				} else if (predicate.field=="cookieNames") {
					incapPolicy.filter += 'CookieExists == "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="cookies") {
					incapPolicy.filter += 'CookieExists == "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="fileTypes") {
					$.each(allValsAry, function(i,val) { 
						if (i>0) incapPolicy.filter += subOp+' ';
						incapPolicy.filter += 'URL contains {"'+val+'$"} ';
					});
				} else if (predicate.field=="headers") {
					incapPolicy.filter += 'HeaderExists '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="hostNames") {
					$.each(allValsAry, function(i,val) { 
						if (i>0) incapPolicy.filter += subOp+' ';
						incapPolicy.filter += 'HeaderValue '+subOp+' {"'+val+'$"} ';
					});
				} else if (predicate.field=="methods") {
					incapPolicy.filter += 'Method '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="parameters") {
					incapPolicy.filter += 'ParamExists '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="refererHostAndURL") {
					incapPolicy.filter += 'Referrer '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="referrerHostname") {
					incapPolicy.filter += 'Referrer '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="referrerUrl") {
					incapPolicy.filter += 'Referrer '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="sourceIpAddresses") {
					incapPolicy.filter += 'ClientIP '+subOp+' '+allValsAry.join(';')+' '; 
				} else if (predicate.field=="url") {
					incapPolicy.filter += 'URL '+subOp+' "'+allValsAry.join('";"')+'" '; 
				} else if (predicate.field=="userAgent") {
					incapPolicy.filter += 'User-Agent '+subOp+' "'+allValsAry.join('";"')+'" '; 
				}
		}
		incapPolicy.filter += ')';
	});
	incapPolicy.filter = incapPolicy.filter.replace(/\(\ /g,'(').replace(/\ \)/g,')');
	return incapPolicy;
}


// transformToCURL(requestUrl,reqObj){
// $('#bulk_curl_examples').append('#CURL Request for Rule: '+curJSONObj.name+'\r\n'+transformToCURL($('#incapServer').val()+url,curReqObj)+'\r\n\r\n');

