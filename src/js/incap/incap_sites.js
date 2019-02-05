var curSites = {"sites":{}}; 
var siteTableHeaders = ["status","domain","account_id","acceleration_level","site_creation_date","active","display_name","extended_ddos","log_level"];
var loginProtectTableHeaders = ["specific_users_list","send_lp_notifications","allow_all_users","authentication_methods","urls","url_patterns"];
var jsonCustomRulesFiltersIndex = [];
var curDeleteACLObj = null;

$().ready(function() {
	//$('#account_id').blur(function(){ });
	$('#incap_sites_refresh').button({iconPosition: "beginning", icon: "ui-icon-refresh"}).click(function(){ loadSites(); });
	$('#clearCurl').button().click(function(){ $('#bulk_curl_examples').html(''); });
	$('#APITestingBtn_AddBtn').button({icon:"ui-icon-plusthick"}).click(function(){ alert('add filter'); });	
	$('#removeCurlComments').button().click(function(){
		var newAry = [];
		var curAry = $('#bulk_curl_examples').html().split('<br>');
		$.each(curAry, function(i,val) {
			if (val.trim().substr(0,1)!='#' && val.trim()!='') newAry.push(val.trim());
		});
		$('#bulk_curl_examples').html(newAry.join('<br><br>'));
	});	
	$.each(jsonCustomRulesFilters, function(key,obj) {
		jsonCustomRulesFiltersIndex.push(key);
	});
	$('#incapSitesAccountsList, #incapSitesAccountIDList').change(function(){ $('#incapSitesPageNum').val('0'); loadSites(); });
	$('#incapSitesPageNum').change(function(){ loadSites(); });
	initFilterDialog();
});

function loadSites(){
	if ($('#incapSitesAccountsList').val()!='') {
		$('#sitesContent').html('loading...');
		var postDataObj = getUserAuthObj($('#incapSitesAccountsList').val());
		postDataObj.account_id=$('#incapSitesAccountIDList').val();
		postDataObj.page_size=$('#incapSitesPageSize').val();
		postDataObj.page_num=$('#incapSitesPageNum').val();
		$.gritter.add({ title: 'Status', text: 'Loading page '+postDataObj.page_num+' (page size: '+postDataObj.page_size+') on account_id: '+postDataObj.account_id});
		makeIncapCall('/api/prov/v1/sites/list','POST',loadSitesResponse,postDataObj,'set');
	}
}

function loadSitesResponse(response){
	$.gritter.add({ title: 'Status', text: "Successfully retrieved sites, puling down ADR rules for each site."});
	curSites.siteIndex = [];
	curSites.sites = {};
	$.each(response.sites, function(i,site) { 
		if (site.account_id==$('#incapSitesAccountIDList').val()) {
			curSites.siteIndex.push(site.domain+';|;'+site.site_id);
			curSites.sites[site.site_id] = site; 
		}
	});
	curSites.siteIndex.sort();
	var str = '';
	$.each(curSites.siteIndex, function(i,siteIdStr) {
		var site = curSites.sites[siteIdStr.substr(siteIdStr.indexOf(';|;')+3)];
		str += '<fieldset><legend>Site: <a target="_blank" href="https://my.incapsula.com/dashboard?isolated=true&accountId='+$('#incapSitesAccountsList').val()+'&timeFrame=last_7_days&extSiteId='+site.site_id+'">'+site.domain+' ('+site.site_id+')</a></legend>';
		str += '<table id="site_'+site.site_id+'_tbl" title="'+site.domain+' ('+site.site_id+')" class="tablesorter"><thead><tr>';
		$.each(siteTableHeaders, function(i,header) { str += '<th title="'+header+'">'+header+'</th>'; });
		str += '</tr></thead><tbody><tr>';
		$.each(siteTableHeaders, function(i,header) {
			if (site[header]==undefined) {
				str += '<td>N/A</th>';
			} else if (header.indexOf('date') != -1) {
				str += '<td>'+getDate(site[header])+'</th>';
			} else {
				str += '<td>'+site[header]+'</th>';
			}
		});
		str += '</tr></tbody></table>';
		/*if (site.dns != undefined && site.original_dns != undefined) {
			str += '<table id="dns_'+site.site_id+'_tbl" title="DNS" class="tablesorter"><thead>';
			str +='<tr><th colspan="3">Original DNS</th><th colspan="3">Current DNS</th></tr>';
			str +='<tr><th>DNS Record Name</th><th>Set Type To</th><th>Set Data To</th><th>DNS Record Name</th><th>Set Type To</th><th>Set Data To</th></tr>';
			str += '</thead><tbody>';
			str += '<tr><td>'+site.original_dns[0].dns_record_name+'</td><td>'+site.original_dns[0].set_type_to+'</td><td>'+site.original_dns[0].set_data_to.join(',')+'</td>';
			str += '<td>'+site.dns[0].dns_record_name+'</td><td>'+site.dns[0].set_type_to+'</td><td>'+site.dns[0].set_data_to.join(',')+'</td></tr>';
			str += '<tr><td>'+site.original_dns[1].dns_record_name+'</td><td>'+site.original_dns[1].set_type_to+'</td><td>'+site.original_dns[1].set_data_to.join(',')+'</td>';
			str += '<td>'+site.dns[1].dns_record_name+'</td><td>'+site.dns[1].set_type_to+'</td><td>'+site.dns[1].set_data_to.join(',')+'</td></tr>';
			str += '</tbody></table>';
		}*/
		if (site.login_protect !== undefined) {
			str += '<table id="loginProtect_'+site.site_id+'_tbl" title="Login Protect" class="tablesorter"><thead><tr><th>Login Protect</th>';
			$.each(loginProtectTableHeaders, function(i,header) { str += '<th title="'+header+'">'+header+'</th>'; });
			str += '</tr></thead><tbody><tr><td>enabled: '+site.login_protect.enabled+'</td>';
			$.each(loginProtectTableHeaders, function(i,header) {
				str += '<td>'+JSON.stringify(site.login_protect[header])+'</th>';
			});
			str += '</tr></tbody></table>';
		}
		var divId = 'site_'+site.site_id+'_rules_tbl';

		if (site.security !== undefined) {
			if (site.security.acls !== undefined) {
				if (site.security.acls.rules !== undefined) {
					if (site.security.acls.rules.length>0) {
						str += '<table id="site_'+site.site_id+'_acls_tbl" class="tablesorter"><thead><tr><th>';
						str += '<a href="javascript:void(0)" id="site_'+site.site_id+'_acls" title="Create CURL samples for all rules in Migration Tools tab" class="ui-icon ui-icon-newwin copyAllAcls"> </a>';
						str += '</th><th></th><th>Security Rules</th><th>JSON</th><th></th></tr></thead><tbody>';
						$.each(site.security.acls.rules, function(i,ruleObj) {
							str += '<tr id="'+ruleObj.id+'">';
							str += '<td><a href="javascript:void(0)" id="acls|'+ruleObj.id.replace(/\./g,'_')+'" title="Copy individual rule" class="ui-icon ui-icon-copy copyRule"> </a></td>';
							str += '<td class="min"><a href="javascript:void(0)" id="'+ruleObj.id+'" title="Save individual Rule" class="ui-icon ui-icon-disk saveACLWAFRule"> </a></td>';
							str += '<td>'+ruleObj.name+'</td><td class="json" id="json_'+ruleObj.id.replace(/\./g,'_')+'">'+JSON.stringify(ruleObj)+'</td>';
							str += '<td class="min"><a href="javascript:void(0)" id="'+$('#incapSitesAccountsList').val()+'_'+site.site_id+'_'+ruleObj.id+'" title="Delete individual Rule" class="ui-icon ui-icon-trash deleteACLWAFRule"> </a></td>';
							str += '</tr>';
						});
						str += '</tbody></table>';
					}
				}
			}
			if (site.security.waf !== undefined) {
				if (site.security.waf.rules !== undefined) {
					str += '<table id="site_'+site.site_id+'_acls_tbl" class="tablesorter"><thead><tr><th>';
					str += '<a href="javascript:void(0)" id="site_'+site.site_id+'_acls" title="Create CURL samples for all rules in Migration Tools tab" class="ui-icon ui-icon-newwin copyAllAcls"> </a>';
					str += '</th><th></th><th>WAF Rules</th><th>JSON</th></tr></thead><tbody>';
					$.each(site.security.waf.rules, function(i,ruleObj) {
						if (ruleObj.id!=='api.threats.customRule') {
							str += '<tr id="'+ruleObj.id+'">';
							str += '<td><a href="javascript:void(0)" id="acls|'+ruleObj.id.replace(/\./g,'_')+'" title="Copy individual rule" class="ui-icon ui-icon-copy copyRule"> </a></td>';
							str += '<td class="min"><a href="javascript:void(0)" id="'+ruleObj.id+'" title="Save individual ACL" class="ui-icon ui-icon-disk saveACLWAFRule"> </a></td>';
							str += '<td>'+ruleObj.name+'</td><td class="json" id="json_'+ruleObj.id.replace(/\./g,'_')+'">'+JSON.stringify(ruleObj)+'</td>';
							//str += '<td class="min"><a href="javascript:void(0)" id="'+$('#incapSitesAccountsList').val()+'_'+site.site_id+'_'+ruleObj.id+'" title="Delete individual ACL" class="ui-icon ui-icon-trash deleteACLWAFRule"> </a></td>';
							str += '</tr>';
						}
					});
					str += '</tbody></table>';
				}
			}
		}		
		str += '<div id="'+divId+'"></div></fieldset>';
		//$.gritter.add({ title: 'Status', text: "Loading rules for site:"+site.site_id});
		var postDataObj = getUserAuthObj($('#incapSitesAccountsList').val());
		postDataObj.site_id = site.site_id;
		makeIncapCall('/api/prov/v1/sites/incapRules/list','POST',loadRulesResponse,postDataObj,divId);
	});
	$('#sitesContent').html(str);
	$('.saveACLWAFRule').unbind().click(function(){ incapSaveACLWAFRuleTemplate(this.id); });
	$('.deleteACLWAFRule').unbind().click(function(){ incapDeleteACLWAFRuleFromSite(this); });
	$('.copyRule').unbind().click(function(){ copyElementHelper(this.id); });
	$('.copyAllAcls').unbind().click(function(){ 
		createAllRulesSampleCURL(this.id,"/api/prov/v1/sites/configure/acl"); 
	});
	if (str=='') $('#sitesContent').html('<p>No sites found...</p>');
}
function loadRulesResponse(response,input_id) {
	var confAry = input_id.split('_');
	curSites.sites[confAry[1]].rules = response;
	var str = '';
	//$.gritter.add({ title: 'Status', text: "Successfully retrieved ADR rules."+input_id});
	if (response.incap_rules != undefined) {
		if (response.incap_rules.All != undefined) {
			str += '<table class="tablesorter"><thead><tr>';
			str += '<th class="min"><a href="javascript:void(0)" id="site_'+confAry[1]+'_rules|incap_rules" title="Create CURL samples for all Incap Rules in Migration Tools tab" class="ui-icon ui-icon-newwin copyAllIncapRules"> </a></th>';
			str += '<th class="min"><!--a href="javascript:void(0)" id="site_'+confAry[1]+'_rules|incap_rules" title="Save all rules locally as templates" class="ui-icon ui-icon-disk saveAllIncapRules"> </a--></th>';
			str += '<th>Incap Rules</th><th>JSON</th><th class="min"></th></tr></thead><tbody>';
			$.each(response.incap_rules.All, function(i,ruleObj) {
				str += '<tr>';
				str += '<td class="min"><a href="javascript:void(0)" id="incap_rules|'+ruleObj.id.replace(/\./g,'_')+'" title="Copy individual rule" class="ui-icon ui-icon-copy copyRule"> </a></td>';
				str += '<td class="min"><a href="javascript:void(0)" id="{\'ruleType\':\'incap_rules\',\'id\':\''+ruleObj.id.replace(/\./g,'_')+'\'}" title="Save individual rule" class="ui-icon ui-icon-disk saveRule"> </a></td>';
				str += '<td>'+ruleObj.name+'</td><td class="json" id="json_'+ruleObj.id.replace(/\./g,'_')+'">'+JSON.stringify(ruleObj)+'</td>';
				str += '<td class="min"><a href="javascript:void(0)" id="'+$('#incapSitesAccountsList').val()+'_'+ruleObj.id+'" title="Delete individual rule" class="ui-icon ui-icon-trash deleteRule"> </a></td>';
				str += '</tr>';
			});
			str += '</tbody></table>';
		}
	}

	if (response.delivery_rules != undefined) {
		$.each(response.delivery_rules, function(ruleType,ruleAry) {
			str += '<table class="tablesorter"><thead><tr>';
			str += '<th><a href="javascript:void(0)" id="site_'+confAry[1]+'_rules|ADR_'+ruleType+'" title="Create CURL samples for all ADR rules in Migration Tools tab" class="ui-icon ui-icon-newwin copyAllIncapRules"> </a></th>';
			str += '<th><!--a href="javascript:void(0)" id="site_'+confAry[1]+'_rules|ADR_'+ruleType+'" title="Save all rules locally as templates" class="ui-icon ui-icon-disk saveAllIncapRules"> </a--></th>';
			str += '<th>ADR Rules - '+ruleType+'</th><th>JSON</th><th class="min"></tr></thead><tbody>';
			$.each(ruleAry, function(i,ruleObj) {
				str += '<tr>';
				str += '<td><a href="javascript:void(0)" id="ADR_'+ruleType+'|'+ruleObj.id.replace(/\./g,'_')+'" title="Copy individual rule" class="ui-icon ui-icon-copy copyRule"> </a></td>';
				str += '<td><a href="javascript:void(0)" id="{\'ruleType\':\''+ruleType+'\',\'id\':\''+ruleObj.id.replace(/\./g,'_')+'\'}" title="Save individual rule" class="ui-icon ui-icon-disk saveRule"> </a></td>';
				//str += '<td><a href="javascript:void(0)" id="ADR_'+ruleType+'|'+ruleObj.id.replace(/\./g,'_')+'" title="Save individual rule" class="ui-icon ui-icon-disk saveRule"> </a></td>';
				str += '<td class="rule_name">'+ruleObj.name+'</td><td class="json" id="json_'+ruleObj.id+'">'+JSON.stringify(ruleObj)+'</td>';
				str += '<td class="min"><a href="javascript:void(0)" id="'+$('#incapSitesAccountsList').val()+'_'+ruleObj.id+'" title="Delete individual rule" class="ui-icon ui-icon-trash deleteRule"> </a></td>';
				str += '</tr>';
			});
			str += '</tbody></table>';
		});
	}
	$('#'+input_id).html(str);
	$('.copyRule').unbind().click(function(){ copyElementHelper(this.id); });
	$('.copyAllIncapRules').unbind().click(function(){ 
		//createAllRulesSampleCURL(this.id,"/api/prov/v1/sites/incapRules/add"); 
	});
	$('.saveRule').unbind().click(function(){ incapSavePolicyTemplate(this.id); });
	$('.saveAllIncapRules').unbind().click(function(){ incapSaveAllPolicyTemplates(); });
	$('.deleteRule').unbind().click(function(){ incapDeletePolicyFromSite(this.id); });
}

function incapSaveAllPolicyTemplates(id) {
    // alert('incapSaveAllPolicyTemplates');
}

/* START Manage Policy Functions */
function incapSavePolicyTemplate(cur_id) {
	var curPolicyIndexObj = JSON.parse(cur_id.replace(/'/g,'"'));
	var curPolicyObj = JSON.parse($('#json_'+curPolicyIndexObj.id).text());
	delete curPolicyObj.id;
	delete curPolicyObj.last_7_days_requests_count;
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var okToSave = false;
    if (INCAP_POLICY_TEMPLATES[curPolicyIndexObj.ruleType][curPolicyObj.name]==undefined) {
        okToSave = true;
    } else {
        if (confirm('This policy ('+curPolicyObj.name+') already exists locally, would you like to overwrite it?')) {
			okToSave = true;
			$.gritter.add({ title: 'Saved', text: "Saved policy '"+curPolicyObj.name+"'."});
        }
    }
    if (okToSave==true) {
			if (curPolicyObj.from==="") delete curPolicyObj.from;
			if (curPolicyObj.filter==="") delete curPolicyObj.filter;
			//curPolicyObj.filter = $("<div/>").html(curPolicyObj.filter).text();
			INCAP_POLICY_TEMPLATES[curPolicyIndexObj.ruleType][curPolicyObj.name] = curPolicyObj;
    }
    localStorage.setItem('INCAP_POLICY_TEMPLATES',JSON.stringify(INCAP_POLICY_TEMPLATES));
    renderIncapPolcies();
	renderMigrationToolbar();
}

function incapDeletePolicyFromSite(cur_id) {
	var idAry = cur_id.split('_');
	var rule_name = $('#'+cur_id).parent().parent().find('.rule_name').html();
	if (confirm('Are you sure you want delete the policy "'+rule_name+'" ('+idAry[1]+') from this tool?')) {
		$('#'+cur_id).parent().parent().remove();
		var postDataObj = getUserAuthObj(idAry[0]);
		postDataObj.rule_id = idAry[1];
		makeIncapCall('/api/prov/v1/sites/incapRules/delete','POST',incapDeletePolicyFromSiteResponse,postDataObj,'set');
	}
}

function incapDeletePolicyFromSiteResponse(response){
    if (response.res_message==undefined) {
        $.gritter.add({ title: 'SUCCESS', text: "Policy deleted from Incapsula site."});
    } else {
        $.gritter.add({ title: 'ERROR', text: "Unable to delete this policy from the site in Incapsula - "+response.res_message});
		loadSites();
    }
}
/* END Manage Policy Functions */

/* START Manage ACL Functions */
function incapSaveACLWAFRuleTemplate(cur_id) {
	var curACLObj = JSON.parse($('#json_'+cur_id.replace(/\./g,'_')).text());
	if (curACLObj.geo!==undefined){
		if (curACLObj.geo.continents!==undefined) curACLObj.continents=curACLObj.geo.continents;
		if (curACLObj.geo.countries!==undefined) curACLObj.countries=curACLObj.geo.countries;
		delete curACLObj.geo;
	}
	INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
	INCAP_ACL_WAF_TEMPLATES.types[curACLObj.id][INCAP_ACL_WAF_TEMPLATES.nextUniqueId] = curACLObj;
	//console.log(curACLObj);
	$.gritter.add({ title: 'Saved', text: "Saved Security/WAF rule '"+curACLObj.name+" ("+INCAP_ACL_WAF_TEMPLATES.nextUniqueId+")'."});
	INCAP_ACL_WAF_TEMPLATES.nextUniqueId++;
	localStorage.setItem('INCAP_ACL_WAF_TEMPLATES',JSON.stringify(INCAP_ACL_WAF_TEMPLATES));
	renderIncapACLWAFRules();
	renderMigrationToolbar();
}


function incapDeleteACLWAFRuleFromSite(obj) {
	var okToDelete = true;
	if (obj!=undefined) {
		var idAry = obj.id.split('_'); // api_key/site_id/rule_id
		curDeleteACLObj = JSON.parse($(obj).parent().parent().addClass("current").find('.json').text());
		if (confirm('Are you sure you want delete the Security/WAF rule '+curDeleteACLObj.name+' ('+curDeleteACLObj.id+') and all current exceptions from the site in Incapsula?')) {
			// console.log("okToDelete1="+okToDelete);
			curDeleteACLObj.api_id = idAry[0]; 
			curDeleteACLObj.site_id=idAry[1];
		} else {
			console.log("okToDelete2="+okToDelete);
			okToDelete = false;
		}
	}
	if (okToDelete==true) {
		// console.log("okToDelete=true | "+okToDelete);
		// console.log(curDeleteACLObj);
		var hasMoreExceptions = false;
		if (curDeleteACLObj.exceptions!=undefined) {
			if (curDeleteACLObj.curExceptionIndex==undefined) curDeleteACLObj.curExceptionIndex = 0;
			if (curDeleteACLObj.exceptions[curDeleteACLObj.curExceptionIndex]!=undefined) {
				var postDataObj = getUserAuthObj(curDeleteACLObj.api_id);
				delete postDataObj.account_id;
				postDataObj.site_id=curDeleteACLObj.site_id;
				postDataObj.rule_id=curDeleteACLObj.id;
				postDataObj.whitelist_id=curDeleteACLObj.exceptions[curDeleteACLObj.curExceptionIndex].id;
				postDataObj.delete_whitelist=true;
				hasMoreExceptions=true;
				// console.log('postDataObj.whitelist_id='+postDataObj.whitelist_id);
				// console.log('hasMoreExceptions='+hasMoreExceptions);
				// console.log('makeIncapCall(/api/prov/v1/sites/configure/whitelists)');
				// console.log(postDataObj);
				makeIncapCall('/api/prov/v1/sites/configure/whitelists','POST',incapDeleteACLWAFRuleFromSiteResponse,postDataObj,'set');
			}
		}
		if (hasMoreExceptions==false) {
			// console.log("okToDelete=="+okToDelete+" | hasMoreExceptions=="+hasMoreExceptions);
			// console.log('hasMoreExceptions='+hasMoreExceptions);
			var postDataObj = getUserAuthObj(curDeleteACLObj.api_id);
			var curDefRuleObj = defaultRuleConfigMapping[curDeleteACLObj.id];
			curDefRuleObj.api_id = postDataObj.api_id;
			curDefRuleObj.api_key = postDataObj.api_key;
			curDefRuleObj.site_id = curDeleteACLObj.site_id;
			curDefRuleObj.rule_id=curDeleteACLObj.id;
			makeIncapCall(incapCopyObjectURLMappings[curDeleteACLObj.id].action,'POST',incapDeleteACLWAFRuleFromSiteResponse,curDefRuleObj,'set');
			curDeleteACLObj.isComplete = true;
		}
	} else {
		// console.log("okToDelete!=true | "+okToDelete);
	}

}

function incapDeleteACLWAFRuleFromSiteResponse(response){
	if (!(parseInt(response.res)==0 && response.res_message.toUpperCase()=="OK")) {
		$.gritter.add({ title: 'ERROR', text: 'Error deleting exception or reverting Security/WAF rule - '+response.res_message});
    } else {
		$('#sitesContent tr.current').remove();
		if (curDeleteACLObj.isComplete!=true) {
			$.gritter.add({ title: 'SUCCESS', text: 'Deleted exception ('+curDeleteACLObj.exceptions[curDeleteACLObj.curExceptionIndex].id+') from rule ('+curDeleteACLObj.rule_id+')'});
			curDeleteACLObj.curExceptionIndex++;
			incapDeleteACLWAFRuleFromSite();
		} else {
			//curDeleteACLObj = null;		
		}
	}
}
/* END Manage ACL Functions */

function initFilterDialog(){
	$('#filterDialog_allowedFilters').autocomplete({ 
		minLength:0,
		source: jsonCustomRulesFiltersIndex,
		//_renderMenu: function(ul, items) { $(ul).css("overflow","scroll").css("height","280px"); },
		focus: function(event,ui) {
			$('#filterDialogSample').html('');
			$(this).val(ui.item.label);
			return false;
		},
		select: function(event,ui) {
			$(this).val(ui.item.label);
			try { 
				$('#filterDialogSample').html("Example: "+jsonCustomRulesFilters[ui.item.label].example); 
			} catch(err) { }
			return false;
		}
	}).keyup(function(){
    	if ($(this).val().trim()=='') $('#filterDialogSample').html("");
	}).click(function(){
		if ($(this).val().trim()=='') $(this).autocomplete("search", "");
	});
}

function copyElementHelper(str) {
	var confAry = str.split('|');
	//alert(str);
	$('#incapActions').val(incapCopyObjectURLMappings[confAry[0]].action).trigger("change");
	var curJson = JSON.parse($('#json_'+confAry[1]).html());
	delete curJson.id;
	delete curJson.last_7_days_requests_count;
	copyElement(confAry[0],curJson);
	$('#incapSampleRules').val('');
	toggleincapSampleRules();
	$('#IncapsulaAPIBtn').trigger("click");
}

function copyElement(rule_type,ruleObj) {
	$('#incapJSONparams input').val('');
	$('#incapJSONparams textarea').val('');
	$('#incapJSONparams select').val('');
	$.each(ruleObj, function(id,val) {
		if (id=='geo') {
			$.each(val, function(sub_id,sub_val) {
				if (incapJsonParamMapping[sub_id].type=='multi') {
					$.each(sub_val, function(i,objValue){
						  $('#incapJSONparams #'+sub_id+' option[value='+objValue+']').attr('selected', true);
					});
				} else if (typeof(val)=='object'){
					$('#incapJSONparams #'+sub_id).val(JSON.stringify(sub_val));
				} else {
					$('#incapJSONparams #'+sub_id).val(sub_val);
				}	
			});
		} else if (id=='filter') {
			//$('#incapJSONparams #'+id).val(decodeURI(JSON.stringify(val)));
			$('#incapJSONparams #'+id).val(val.replace(/&amp;/g,"&").replace(/&lt;/g,"<").replace(/&gt;/g,">"));
		} else {
			if (incapJsonParamMapping[id]!=undefined) {
				if (incapJsonParamMapping[id].type=='multi') {
					$.each(val, function(i,objValue){
						  $('#incapJSONparams #'+id+' option[value='+objValue+']').attr('selected', true);
					});
				} else if(typeof(val)=='object'){
					$('#incapJSONparams #'+id).val(JSON.stringify(val));
				} else {
					$('#incapJSONparams #'+id).val(val);
				}
			} else {
				$.gritter.add({ title: 'Error: Unmapped Parameter', text: id });
			} 
		}
	});	
	if ($('#incapActions').val()=='/api/prov/v1/sites/incapRules/add' || $('#incapActions').val()=='/api/prov/v1/sites/incapRules/edit') {
		$('#incapActions').unbind().change(function(){ toggleDcId(); updateJSON(); });
		toggleDcId();
	}
	updateJSON();
}

function createAllRulesSampleCURL(linkId,url) {
	if (url=="/api/prov/v1/sites/incapRules/add") {
		$('#incap_eventLogs').append('########## Site Incap and ADR Rules ##########<br />');
	} else if (url=="/api/prov/v1/sites/configure/acl") {
		$('#incap_eventLogs').append('########## Site ACL Rules ##########<br /><br />');
	}
	//console.log($('#'+linkId+'_tbl td.json'));
	$.each($('#'+linkId+'_tbl td.json'), function(i,jsonTd) {
		var curJSONObj = JSON.parse($(jsonTd).html());
		var curReqObj = {};
		$.each(curReqObj, function(key,val) { if (val.trim()=='') delete curReqObj[key]; });		
		curReqObj['api_id'] = 'your_api_id_here';
		curReqObj['api_key'] = 'your_api_key_here';
		curReqObj['site_id'] = 'your_site_id_here';
		if (curJSONObj['dc_id']!=undefined) curJSONObj['dc_id']='your_dc_id_here';
		if (url=="/api/prov/v1/sites/configure/acl") curJSONObj = moveNestedAttributesUp(curJSONObj,["geo"]);
		var actionFieldObj = incapApiActions["Site Management"][url];
		$.each(actionFieldObj, function(i,fieldName) {
			if (curJSONObj[fieldName]!=undefined) {
				curReqObj[fieldName] = curJSONObj[fieldName];
			}/* else if ($('#'+fieldName).length>0) {
				curReqObj[fieldName] = $('#'+fieldName).val();
			}*/
		});
		$('#incap_eventLogs').append('#Original JSON for rule: '+curJSONObj.name+'<br /># '+$(jsonTd).html()+'<br />');
		$('#incap_eventLogs').append('#CURL Request for Rule: '+curJSONObj.name+'<br />'+incap_transformToCURL($('#incapServer').val()+url,curReqObj,false)+'<br /><br />');
	});
	$('#migrationToolsBtn').trigger("click");
}

function moveNestedAttributesUp(obj,attrAry){
	$.each(attrAry, function(i,attr) {
		if (obj[attr]!=undefined) {
			$.each(obj[attr], function(nestedAttrKey,nestedAttrVal) {
				obj[nestedAttrKey] = nestedAttrVal;
			});
			delete obj[attr];
		}
	});
	return obj;
}

function copyACLsToAllSites(linkId,str) {
	/*$('#bulk_curl_examples').append('########## Sample Site ACL Rules ##########\r\n');
	$.each($('#'+linkId+'_tbl td.json'), function(i,jsonTd) {
		var curJSONObj = JSON.parse($(jsonTd).html());
		var curReqObj = {};
		$.each(curReqObj, function(key,val) { if (val.trim()=='') delete curReqObj[key]; });
		curReqObj['api_id'] = 'your_api_id_here';
		curReqObj['api_key'] = 'your_api_key_here';
		curReqObj['site_id'] = 'your_site_id_here';
		if (curJSONObj['dc_id']!=undefined) curJSONObj['dc_id']='your_dc_id_here';
		if (curJSONObj[]!=undefined){
			
		} 
		var actionFieldObj = incapApiActions["Site Management"][url];
		$.each(actionFieldObj, function(i,fieldName) {
			if (curJSONObj[fieldName]!=undefined) {
				curReqObj[fieldName] = curJSONObj[fieldName];
			}
		});
		$('#bulk_curl_examples').append('#Original JSON for rule: '+curJSONObj.name+'\r\n# '+$(jsonTd).html()+'\r\n');
		$('#bulk_curl_examples').append('#CURL Request for Rule: '+curJSONObj.name+'\r\n'+transformToCURL($('#server').val()+url,curReqObj)+'\r\n\r\n');
	});
	$('#migrationToolsBtn').trigger("click");*/
}

function getDate(timestamp){
	var curDate = new Date();
	curDate.setTime(timestamp);
	var dateStr = curDate.getFullYear()+'/'+pad(curDate.getMonth(),2)+'/'+pad(curDate.getMonth(),2)+' '+pad(curDate.getHours(),2)+':'+pad(curDate.getMinutes(),2)+':'+pad(curDate.getSeconds(),2);
	return	dateStr;
}
function pad(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
}

function removeSpecialChars(str){
	return str.replace(/[`~!@#$%^&*()_|+\-=?;:'",.<>\{\}\[\]\\\/]/gi, '').replace(/\s\s+/g, ' ');	
}