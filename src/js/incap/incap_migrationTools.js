/* START Manage Migration Tools */

var incap_migUserSites = {"index":[],"members":{},"processing":false};
var incap_curMigDestSiteIterator = {"index":[],"sites":{}}; // "www.test.com":{"site_id":123,"domain":"www.test.com","account_id":123,"api_id":"123"}
var incap_curMigPolicies = {"curIndex":0,"index":[]};
var incap_curMigRules = {"curIndex":0,"index":[],"existingExceptions":[]}; // rule_id;|;ruleIndex:[exceptionId1,exceptionId2,exceptionId3]
var incap_curMigSiteObj = null;
var migDisplayText = {
    "INCAP_POLICY_TEMPLATES":"policy",
    "INCAP_POLICY_GROUPS":"policy group",
    "INCAP_ACL_WAF_TEMPLATES":"security/WAF rule",
    "INCAP_ACL_WAF_GROUPS":"security/WAF group",
    "INCAP_USERS":"API user",
    "INCAP_USER_GROUPS":"API user group",
    "INCAP_SITES":"site",
    "INCAP_SITE_GROUPS":"bulk site group"
}

$().ready(function() {
	$('#runMigration').button().unbind().click(function(){ loadMigrationConfigs(); });	
    $('#clearEventLog').button().click(function(){ if (confirm('Are you sure you want clear the event log?')) { $('#incap_eventLogs').html(''); } });	
	$('#migrate_sites_refresh').button({iconPosition: "beginning", icon: "ui-icon-refresh"}).click(function(){ 
        // renderMigrationUserSites(); 
        loadSubAccounts($('#incap_migrationAction'));
    });	
});

function renderMigrationToolbar(){
    renderMigrationToolbar_config();
    renderMigrationToolbar_action();
}

function renderMigrationToolbar_config(){
    var curMigConfig = $('#incap_migrationConfigType').val();
    var str = '<tr>';
    str += '<td align="right"><label class="header" for="incap_migrationConfig">Migrate '+migDisplayText[curMigConfig]+'</label></td>';
    str += '<td><select class="auto" id="incap_migrationConfig">'+mig_renderSelectOptions(curMigConfig)+'</select>';
    if (curMigConfig=='INCAP_POLICY_GROUPS' || curMigConfig=='INCAP_ACL_WAF_GROUPS') {
        str += ' <b>(<span id="incap_migrationConfig_stats">loading...</span>)</b>';
    }
    str += '</td></tr>';
    $('#incap_migrationToolbar_config').html(str);
    
    $('#incap_migrationConfig').unbind();
    if ($('#incap_migrationConfigType').val()=='INCAP_POLICY_TEMPLATES') {
        $('#incap_migrationConfig').change(function(){ renderIncapPolicyRuleTblHTML(); });
        $('#incap_migrationAction_sites').change(function(){ renderIncapPolicyRuleTblHTML(); });
    } else if ($('#incap_migrationConfigType').val()=='INCAP_POLICY_GROUPS') {
        $('#incap_migrationConfig').change(function(){ renderPolicyGroupStats(); renderIncapPolicyRuleTblHTML(); });
        renderPolicyGroupStats();
    } else if ($('#incap_migrationConfigType').val()=='INCAP_ACL_WAF_GROUPS') {
        $('#incap_migrationConfig').change(function(){ renderACLGroupStats(); });
        renderACLGroupStats();
    }
    renderIncapPolicyRuleTblHTML();
}

function renderMigrationToolbar_action(){
    var curMigConfig = $('#incap_migrationConfigType').val();
    var curMigAction = $('#incap_migrationActionType').val();
    var str = '<tr>';
    // debugger
    if (curMigAction=="INCAP_SITES") {
        var curUserObj = getUserAuthObj($('#incapAccountsList').val());
        if (curUserObj!=null && curUserObj!=undefined) {
            // debugger
            str += '<td><b>to </b></td>';
            str += '<td><select class="auto incap_account_select" id="incap_migrationAction">'+mig_renderSelectOptions('INCAP_USERS')+'</select></td>';
            str += '<td><b> account ID </b></td>';
            str += '<td><select class="auto" id="incap_migrationAction_accountIDList"><option value="'+curUserObj.account_id+'">Parent Account ('+curUserObj.account_id+')</option></select></td>';
            str += '<td><b> on site </b></td>';
            str += '<td><select class="auto" id="incap_migrationAction_sites"><option value="">loading...</option></select></td>';
            str += '<td> - sites by page <select class="auto" id="incap_migrationAction_page_num">'+renderPageNumberOptions()+'</select>';
            str += '<input name="incap_migrationAction_page_size" id="incap_migrationAction_page_size" value="'+incapDefConfig.sitePageSize+'" type="hidden" /></td>';
        }
    } else if (curMigAction=='INCAP_USERS') {
        // debugger
        str += '<td><b> to all sites on </b></td>';
        str += '<td><select class="auto" id="incap_migrationAction">'+mig_renderSelectOptions(curMigAction)+'</select></td>';
        str += '<td><b>\'s '+migDisplayText[curMigAction]+' account (<span id="incap_migrationAction_stats">loading...</span>)</b></td>';
    } else if (curMigAction=='INCAP_USER_GROUPS') {
        // debugger
        str += '<td><b> to all sites on all accounts in </b></td>';
        str += '<td><select class="auto" id="incap_migrationAction">'+mig_renderSelectOptions(curMigAction)+'</select></td>';
        str += '<td><b> '+migDisplayText[curMigAction]+' (<span id="incap_migrationAction_stats">loading...</span>)</b></td>';
    } else if (curMigAction=='INCAP_SITE_GROUPS') {
        // debugger
        str += '<td><b> to </b></td>';
        str += '<td><select class="auto" id="incap_migrationAction">'+mig_renderSelectOptions(curMigAction)+'</select></td>';
        str += '<td><b>'+migDisplayText[curMigAction]+' (<span id="incap_migrationAction_stats">loading...</span>)</b></td>';
    }
    str += '</tr>';
    $('#incap_migrationToolbar_action').html(str);

    $('#incap_migrationAction').unbind();
    $('#incap_migrationAction_accountIDList').unbind();
    // debugger
    if ($('#incap_migrationActionType').val()=='INCAP_SITES') {
        // debugger
        $('#incap_migrationAction').change(function(){ loadSubAccounts(this); });
        loadSubAccounts($('#incap_migrationAction'));
        $('#incap_migrationAction_accountIDList').change(function(){ $('#incap_migrationAction_page_num').val('0'); renderMigrationUserSites(); });
        $('#incap_migrationAction_page_num').change(function(){ renderMigrationUserSites(); });        
        //$('#incap_migrationAction').change(function(){ renderMigrationUserSites(); renderIncapPolicyRuleTblHTML(); });
        // if (obj!=undefined) {
        //     if (obj.id=='incap_migrationActionType' && $('#incap_migrationAction_sites').val()=='') { renderMigrationUserSites(); }
        // } else if ($('#incap_migrationAction_sites').val()=='') {
        //     renderMigrationUserSites(); 
        // }
    } else if ($('#incap_migrationActionType').val()=='INCAP_SITE_GROUPS') {
        // debugger
        $('#incap_migrationAction').change(function(){ renderSiteGroupStats(); renderIncapPolicyRuleTblHTML(); });
        renderSiteGroupStats();
    }
    // debugger
    renderIncapPolicyRuleTblHTML();
}

function mig_renderSelectOptions(curMigConfig){
    var str = '';
    if (curMigConfig=='incap_migUserSites') {
        if (incap_migUserSites.index.length!=0) {
            $.each(incap_migUserSites.index, function(i,domain) {
                var siteObj = incap_migUserSites.members[domain];
                str += '<option title="account_id: '+siteObj.account_id+' | api_id: '+siteObj.api_id+' | site_id: '+siteObj.site_id+' | domain: '+domain+'" value="'+siteObj.account_id+';|;'+siteObj.api_id+';|;'+siteObj.site_id+';|;'+domain+'">'+domain+' ('+siteObj.site_id+')</option>';  
            });
            incap_migUserSites.processing=false;
        } else {
            str += '<option value="">loading...</option>';
        }
    } else {
        var RECORDS = JSON.parse(localStorage.getItem(curMigConfig));
        //str += '<option value="">-- select a policy --</option>';
        if (RECORDS!=undefined) {
            if (curMigConfig=='INCAP_POLICY_TEMPLATES') {
                $.each(RECORDS, function(policyType,policyAry) {
                    $.each(policyAry, function(policyName,policyObj) {
                        str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyType+";|;"+policyName+'">'+policyName+' ('+policyType+')</option>';
                    });
                });
            } else if (curMigConfig=='INCAP_ACL_WAF_TEMPLATES') {
                $.each(RECORDS.types, function(ruleType,ruleAry) {
                    $.each(ruleAry, function(ruleIndex,ruleObj) {
                        str += '<option title="'+JSON.stringify(ruleObj).replace(/"/g,"'")+'" value="'+ruleType+";|;"+ruleIndex+'">'+ruleObj.name+'-'+ruleIndex+' ('+ruleObj.id+')</option>';
                    });
                });
            } else if (curMigConfig=='INCAP_USERS') {
                $.each(RECORDS, function(id,usrObj) {
                    str += '<option title="account_id: '+usrObj.account_id+' | api_id: '+usrObj.api_id+'" value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>';
                });
            } else if (curMigConfig=='INCAP_SITES') {

            } else {
                $.each(RECORDS, function(name,obj) {
                    str += '<option title="'+JSON.stringify(obj).replace(/"/g,"'")+'"  value="'+name+'">'+name+'</option>';
                });
            }
        }
        if (str=='') str += '<option value="">no records found</option>';
    }
    return str;
}

// function renderDestAuth(){
// 	/*var curConfig = INCAP_USERS[$("#destIncapAccountsList").val()];
// 	$('#dest_api_id').val(curConfig.api_id);
// 	$('#dest_api_key').val(curConfig.api_key);
// 	$("#dest_site_id").html('<option value="">loading...</option>');
// 	$.gritter.add({ title: 'Status', text: "Loading sites for api_id:"+curConfig.api_id});
// 	makeIncapCall('/api/prov/v1/sites/list','POST',renderDestSites,{},'dest');*/
// }

// function renderDestSites(response){
// 	/*$("#dest_site_id").html('');
// 	$.each(response.sites, function(i,site) {
// 		$("#dest_site_id").append('<option value="'+site.site_id+'">'+site.domain+' ('+site.site_id+')</option>');
// 	});*/
// }

/* Start state of action and config changes in UI */
function renderMigrationUserSites(){
    // //$('#incap_migrationConfig').attr('disabled','disabled');
    $('#incap_migrationAction').attr('disabled','disabled');
    $('#incap_migrationAction_accountIDList, #incap_migrationAction_page_num').attr('disabled','disabled');
    $('#incap_migrationActionType').attr('disabled','disabled');    
    if (!incap_migUserSites.processing) {        
        INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
        if ($("#incap_migrationAction").val()!='') {
            var curConfig = INCAP_USERS[$("#incap_migrationAction").val()];
            delete curConfig.user_name;
            curConfig.account_id = $('#incap_migrationAction_accountIDList').val();
            curConfig.page_size = $('#incap_migrationAction_page_size').val();
            curConfig.page_num = $('#incap_migrationAction_page_num').val();
            //$('#incap_migrationConfig').attr('disabled','disabled');
            $('#incap_migrationAction').attr('disabled','disabled');
            $('#incap_migrationActionType').attr('disabled','disabled');
            $('#runMigration').addClass('disabled').unbind();
            $('#incap_migrationAction_accountIDList, #incap_migrationAction_page_num').attr('disabled','disabled');
            $("#incap_migrationAction_sites").html('<option value="">loading...</option>').attr('disabled','disabled');;
            $.gritter.add({ title: 'Status', text: "Loading sites for api_id:"+curConfig.api_id});
            incap_migUserSites = {"index":[],"members":{},"processing":true};
            makeIncapCall('/api/prov/v1/sites/list','POST',renderMigrationUserSitesResponse,curConfig,'set');
        }
    }
}

function renderMigrationUserSitesResponse(response){
    var api_id = $('#incap_migrationAction').val();
    //incap_migUserSites.index = [];    
    $.each(response.sites, function(i,siteObj) { 
        if (siteObj.account_id==$('#incap_migrationAction_accountIDList').val()) {
            var minSiteObj = {
                "site_id":siteObj.site_id,
                "domain":siteObj.domain,
                "account_id":siteObj.account_id,
                "api_id":api_id,
                "DCs":{}
            }
            incap_migUserSites.index.push(siteObj.domain);
            incap_migUserSites.members[siteObj.domain] = minSiteObj;
        }
    });
    //$.each(incap_availSites.members, function(domain,siteObj) {  });
    incap_migUserSites.curIndex=0;
    incap_migUserSites.index.sort();
    loadMigSiteDataCenters();
}

function loadMigSiteDataCenters(){
    if (incap_migUserSites.index[incap_migUserSites.curIndex]!=undefined){
            var siteObj = jQuery.extend(true, {}, incap_migUserSites.members[incap_migUserSites.index[incap_migUserSites.curIndex]]);
            var postDataObj = jQuery.extend(true, {}, getUserAuthObj(siteObj.api_id));
            postDataObj.site_id = siteObj.site_id;
            makeIncapCall('/api/prov/v1/sites/dataCenters/list','POST',loadMigSiteDataCentersResponse,postDataObj,'set');
    } else {
        //$('#incap_migrationConfig').attr('disabled',false);
        $('#incap_migrationActionType').attr('disabled',false);
        $('#incap_migrationAction').attr('disabled',false);
        $('#incap_migrationAction_accountIDList, #incap_migrationAction_page_num').attr('disabled',false);
        $("#incap_migrationAction_sites").attr('disabled',false);
        $('#runMigration').button().removeClass('disabled').unbind().click(function(){ loadMigrationConfigs(); });
        $("#incap_migrationAction_sites").html('');
        incap_migUserSites.index.sort();
        if (incap_migUserSites.index.length>0) {
            $.each(incap_migUserSites.index, function(i,domain) {
                var siteObj = incap_migUserSites.members[domain];
                $("#incap_migrationAction_sites").append('<option title="account_id: '+siteObj.account_id+' | api_id: '+siteObj.api_id+' | site_id: '+siteObj.site_id+' | domain: '+domain+'" value="'+siteObj.account_id+';|;'+siteObj.api_id+';|;'+siteObj.site_id+';|;'+domain+'">'+domain+' ('+siteObj.site_id+')</option>');  
            });
            $('#runMigration').button().unbind().click(function(){ loadMigrationConfigs(); });	
            if (incap_migUserSites.index.length>5) {
                // todo
            }
        } else {
            $('#runMigration').addClass('disabled').unbind();
            $("#incap_migrationAction_sites").append('<option value="">No sites found</option>');  
        }
        incap_migUserSites.processing=false;
        renderIncapPolicyRuleTblHTML();
    }
}

function loadMigSiteDataCentersResponse(response){
    var siteObj = incap_migUserSites.members[incap_migUserSites.index[incap_migUserSites.curIndex]];
    if (siteObj.DCs==undefined) siteObj.DCs = {};
    $.each(response.DCs, function(i,DCObj) { 
        if (DCObj.contentOnly=="true") {
            siteObj.DCs[DCObj.id] = DCObj.name;
        }
    });
    incap_migUserSites.curIndex++;
    loadMigSiteDataCenters();
}

function renderIncapPolicyRuleTblHTML(){
    $('#incap_migrationPolicyRuleConfigDiv').html('');
    if ($('#incap_migrationConfigType').val()=='INCAP_POLICY_GROUPS' || $('#incap_migrationConfigType').val()=='INCAP_POLICY_TEMPLATES') {
        var renderPolicyConfigs = false;
        var str = '<hr /><span>Select site specific ADR rule configurations (ADR Redirect/Forward):</span>';
        str += '<table id="incap_migrationPolicyRuleConfigTbl"><tr><th>Site Name</th><th>Policy Name</th><th>Policy Type</th><th>Policy Config</th></tr>';
        if ($('#incap_migrationConfigType').val()=='INCAP_POLICY_TEMPLATES') {
            if ($('#incap_migrationAction_sites').val()!='' && $('#incap_migrationAction_sites').val()!=undefined) {
                var policyAry = $('#incap_migrationConfig').val().split(';|;'); //[policyType;|;policyName]
                var siteAry = $('#incap_migrationAction_sites').val().split(';|;'); //account_id;|;api_id;|;site_id;|;domain
                var siteObj = incap_migUserSites.members[siteAry[3]];
                if (policyAry[0]=='Forward' || policyAry[0]=='Redirect') { 
                    if (siteObj!=undefined) str += renderIncapPolicyRowHTML(siteObj,policyAry); renderPolicyConfigs=true; 
                }
            }
        } else if ($('#incap_migrationConfigType').val()=='INCAP_POLICY_GROUPS'){
            if ($('#incap_migrationActionType').val()=='INCAP_SITES') {
                var siteAry = $('#incap_migrationAction_sites').val().split(';|;'); //account_id;|;api_id;|;site_id;|;domain
                var siteObj = incap_migUserSites.members[siteAry[3]];
                $.each(INCAP_POLICY_GROUPS[$('#incap_migrationConfig').val()].members, function(id,policyIndexObj) { 
                    var policyAry = id.split(';|;'); //[policyType;|;policyName]
                    if (policyAry[0]=='Forward' || policyAry[0]=='Redirect') { 
                        if (siteObj!=undefined){ 
                            str += renderIncapPolicyRowHTML(siteObj,policyAry); 
                            renderPolicyConfigs=true; 
                        }
                    }
                });
            } else if ($('#incap_migrationActionType').val()=='INCAP_SITE_GROUPS') {
                INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
                $.each(incap_migUserSites.members, function(domain,siteObj) {                    
                    $.each(INCAP_POLICY_GROUPS[$('#incap_migrationConfig').val()].members, function(id,policyIndexObj) { 
                        var policyAry = id.split(';|;'); //[policyType;|;policyName]
                        if (policyAry[0]=='Forward' || policyAry[0]=='Redirect') { 
                            if (siteObj!=undefined) {
                                str += renderIncapPolicyRowHTML(siteObj,policyAry); 
                                renderPolicyConfigs=true; 
                            }
                        }
                    });
                });
            }
        }
        str += '</table>';
        if (renderPolicyConfigs) {
            $('#incap_migrationPolicyRuleConfigDiv').html(str); 
            //$('#incap_migrationPolicyRuleConfigTbl').DataTable();
        }
    }
}
function renderIncapPolicyRowHTML(siteObj,policyAry){ // [policyType,policyName]
    var str = '';
    if (policyAry[0]=='Forward' || policyAry[0]=='Redirect') {
        var cur_id = siteObj.site_id+'_'+policyAry[1].replace(/\ /g,'_');
        str += '<tr id="'+cur_id+'" class="'+policyAry[0]+'"><td>'+siteObj.domain+'</td><td>'+policyAry[1]+'</td><td>'+policyAry[0]+'</td><td>';
        // if (policyAry[0]=='' || policyAry[0]=='') {
        //     str += '<input title="Enter redirect URL for ('+siteObj.domain+') on policy ('+policyAry[1]+')" class="migRuleConfig" type="text" id="'+cur_id+'" value="" />';
        // } else {
            if (policyAry[0]=='Redirect') {
                str += '<label for="'+cur_id+'_from">From (optional): </label>';
                str += '<input placeholder="https://www.site1.com/*" class="migRuleConfig from" id="'+cur_id+'_from" value="" /><br />';
                str += '<label for="'+cur_id+'_from">To: </label>';
                str += '<input placeholder="https://www.site2.com/$1" class="migRuleConfig" id="'+cur_id+'_to" value="" /><br />';
                str += '<label for="'+cur_id+'_response_code">Response Code: </label>';
                str += '<select class="migRuleConfig" id="'+cur_id+'_response_code">';
                str += '  <option value="301">301</option>';
                str += '  <option value="302" selected="selected">302</option>';
                str += '  <option value="303">303</option>';
                str += '  <option value="307">307</option>';
                str += '  <option value="308">308</option>';
                str += '</select>';
            } else {
                str += '<label for="'+cur_id+'_dc_id">Data Center:<br /><i>(Content Only)</i></label>';
                str += '<select title="Select the data center to be used in the Forward rule" class="migRuleConfig" id="'+cur_id+'_dc_id"><option value="">-- select DC --</option>';
                $.each(siteObj.DCs, function(dc_id,name) {
                    str += '<option title="dc_id: '+dc_id+' | DC name: '+name+'" value="'+dc_id+'">'+name+' ('+dc_id+')</option>';
                });
                str += '</select>';
            }
        // }
        str += '</td></tr>';
    }
    return str;
}

function renderSiteGroupStats(){
    INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
    if (INCAP_SITE_GROUPS[$('#incap_migrationAction').val()]!=undefined) {
        $('#incap_migrationAction_stats').html(INCAP_SITE_GROUPS[$('#incap_migrationAction').val()].index.length+' sites');
        incap_migUserSites = INCAP_SITE_GROUPS[$('#incap_migrationAction').val()];
        renderIncapPolicyRuleTblHTML();
    }
}

function renderACLGroupStats(){
    var index = 0;
    INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
    $.each(INCAP_ACL_WAF_GROUPS[$('#incap_migrationConfig').val()].members, function(id,ACLWAFRuleObj) { index++; });
    $('#incap_migrationConfig_stats').html(index+' rules');  
}

function renderPolicyGroupStats(){
    var index = 0;
    INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
    $.each(INCAP_POLICY_GROUPS[$('#incap_migrationConfig').val()].members, function(id,policyObj) { index++; });
    $('#incap_migrationConfig_stats').html(index+' policies');  
}

/* End state of action and config changes in UI */

function loadMigrationConfigs(){
    if (validateRuleConfigs()) {
        incap_curMigDestSiteIterator = {"curIndex":0,"index":[],"sites":{}}; 
        incap_curMigPolicies = {"curIndex":0,"index":[]};
        INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
        INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
        incap_curMigRules = {"curIndex":0,"index":[],"currentExceptions":[]};
        INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
        INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
        var curMigConfigType = $('#incap_migrationConfigType').val();
        if (curMigConfigType=='INCAP_POLICY_TEMPLATES') {
            var policyAry = $('#incap_migrationConfig').val().split(';|;');
            incap_curMigPolicies.index.push($('#incap_migrationConfig').val());
            if (incap_curMigPolicies[policyAry[0]]==undefined) incap_curMigPolicies[policyAry[0]]={};
            incap_curMigPolicies[policyAry[0]][policyAry[1]] = INCAP_POLICY_TEMPLATES[policyAry[0]][policyAry[1]];
        } else if (curMigConfigType=='INCAP_POLICY_GROUPS') {
            var policyGroupObj = INCAP_POLICY_GROUPS[$('#incap_migrationConfig').val()];
            $.each(policyGroupObj.members, function(policy_id,bool) {
                var policyAry = policy_id.split(';|;');
                incap_curMigPolicies.index.push(policy_id);
                if (incap_curMigPolicies[policyAry[0]]==undefined) incap_curMigPolicies[policyAry[0]]={};
                incap_curMigPolicies[policyAry[0]][policyAry[1]] = INCAP_POLICY_TEMPLATES[policyAry[0]][policyAry[1]];    
            });
        } else if (curMigConfigType=='INCAP_ACL_WAF_TEMPLATES') {
            var ruleAry = $('#incap_migrationConfig').val().split(';|;');
            incap_curMigRules.index.push($('#incap_migrationConfig').val());
            if (incap_curMigRules[ruleAry[0]]==undefined) incap_curMigRules[ruleAry[0]]={};
            var ruleObj = INCAP_ACL_WAF_TEMPLATES.types[ruleAry[0]][ruleAry[1]];
            incap_curMigRules[ruleAry[0]][ruleAry[1]] = ruleObj;
            if (ruleObj.exceptions!=undefined) {
                incap_curMigRules.currentExceptions[ruleAry[0]+';|;'+ruleAry[1]] = {"members":[],"curIndex":0};
                $.each(ruleObj.exceptions, function(i,exObj) {
                    delete exObj.id;
                    incap_curMigRules.currentExceptions[ruleAry[0]+';|;'+ruleAry[1]].members.push(exObj);
                });            
            }
        } else if (curMigConfigType=='INCAP_ACL_WAF_GROUPS') {
            var ruleGroupObj = INCAP_ACL_WAF_GROUPS[$('#incap_migrationConfig').val()];
            $.each(ruleGroupObj.members, function(rule_id,ruleIndex) {
                incap_curMigRules.index.push(rule_id+';|;'+ruleIndex);
                if (incap_curMigRules[rule_id]==undefined) incap_curMigRules[rule_id]={};
                var ruleObj = INCAP_ACL_WAF_TEMPLATES.types[rule_id][ruleIndex];
                incap_curMigRules[rule_id][ruleIndex] = ruleObj;
                if (ruleObj.exceptions!=undefined) {
                    incap_curMigRules.currentExceptions[rule_id+';|;'+ruleIndex] = {"members":[],"curIndex":0};
                    $.each(ruleObj.exceptions, function(i,exObj) {
                        delete exObj.id;
                        incap_curMigRules.currentExceptions[rule_id+';|;'+ruleIndex].members.push(exObj);
                    });            
                }
            });
        }

        var curMigActionType = $('#incap_migrationActionType').val();
        INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
        if (curMigActionType=='INCAP_SITES') {
            var siteAry = $('#incap_migrationAction_sites').val().split(';|;'); // account_id;|;api_id;|;site_id;|;domain
            var userObj = INCAP_USERS[siteAry[1]];
            incap_curMigDestSiteIterator.sites[siteAry[3]] = { "account_id":siteAry[0], "api_id":siteAry[1], "api_key":userObj.api_key, "domain":siteAry[3], "site_id":siteAry[2] };
            incap_curMigDestSiteIterator.index.push(siteAry[3]);
            $('#incap_eventLogs').append('<span>########## Starting Migration - Event Logs ##########</span><br /><br />');
            // runMigration();
            loadCurMigrationSiteObj();
        } else if (curMigActionType=='INCAP_SITE_GROUPS') {
            INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
            var curSiteGroupObj = INCAP_SITE_GROUPS[$('#incap_migrationAction').val()];
            $.each(curSiteGroupObj.members, function(domain,siteObj) {
                siteObj.api_key = INCAP_USERS[siteObj.api_id].api_key;
                incap_curMigDestSiteIterator.sites[domain] = siteObj;
                incap_curMigDestSiteIterator.index.push(domain);
            });
            $('#incap_eventLogs').append('<span>########## Starting Migration - Event Logs ##########</span><br /><br />');
            // runMigration();
            loadCurMigrationSiteObj();
        } else if (curMigActionType=='INCAP_USERS') {
            
        } else if (curMigActionType=='INCAP_USER_GROUPS') {

        }
    }
}

function loadCurMigrationSiteObj() {
    if (incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]!=undefined) {
        var curSiteObj = jQuery.extend(true, {}, incap_curMigDestSiteIterator.sites[incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]]);
        delete curSiteObj.DCs;
		$('#incap_eventLogs').append('<span>########## Loading site config for '+curSiteObj.domain+' ('+curSiteObj.site_id+') ##########</span><br />');
        delete curSiteObj.domain;
        $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+'/api/prov/v1/sites/status',curSiteObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
        makeIncapCall('/api/prov/v1/sites/status','POST',loadCurMigrationSiteObjResponse,curSiteObj,'set');
        scrollDownInLog();
    } else {
        $('#incap_eventLogs').append('<span class="res_error">(ERROR):<br />Site not found, local data store malformed.</span><br /><br />');
    }
}

function loadCurMigrationSiteObjResponse(response){
    if (!(parseInt(response.res)==0 && response.res_message.toUpperCase()=="OK")) {
        $('#incap_eventLogs').append('<span class="res_error">#RESPONSE (ERROR):<br />'+JSON.stringify(response)+'</span><br /><br />');
    } else {
        $('#incap_eventLogs').append('Loaded site config successfully for '+response.domain+' ('+response.site_id+')<br /><br />');
        incap_curMigSiteObj = response;
        incap_curMigSiteObj.existingExceptions = {"index":[],"curExceptionIndex":0}; // {"api.threats.bot_access_control":{"ids":[],"curIndex":0}}
        $.each(incap_curMigSiteObj.security.waf.rules, function(i,ruleObj) {
            if (ruleObj!=null) {
                if (ruleObj.exceptions!=undefined) {
                    incap_curMigSiteObj.existingExceptions.index.push(ruleObj.id);
                    incap_curMigSiteObj.existingExceptions[ruleObj.id] = {"ids":[],"curIndex":0};
                    $.each(ruleObj.exceptions, function(i,exObj) {
                        incap_curMigSiteObj.existingExceptions[ruleObj.id].ids.push(exObj.id);
                    });
                }
            }
        });
        if (incap_curMigSiteObj.security.acls!=undefined) {
            $.each(incap_curMigSiteObj.security.acls.rules, function(i,ruleObj) {
                if (ruleObj!=null) {
                    if (ruleObj.exceptions!=undefined) {
                        incap_curMigSiteObj.existingExceptions.index.push(ruleObj.id);
                        incap_curMigSiteObj.existingExceptions[ruleObj.id] = {"ids":[],"curIndex":0};
                        $.each(ruleObj.exceptions, function(i,exObj) {
                            incap_curMigSiteObj.existingExceptions[ruleObj.id].ids.push(exObj.id);
                        });
                    }
                }
            });
        }
        if (incap_curMigPolicies.index.length>0) {
            loadCurMigrationSitePolicies();
        } else {
            runMigration();
        }
    }
    scrollDownInLog();
}

function loadCurMigrationSitePolicies(){
    var curSiteObj = jQuery.extend(true, {}, incap_curMigDestSiteIterator.sites[incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]]);
    delete curSiteObj.domain;
    delete curSiteObj.DCs;
    $('#incap_eventLogs').append('<span>########## Loading site incap_rules and ADR policies for '+incap_curMigSiteObj.site_id+' ('+incap_curMigSiteObj.domain+') ##########</span><br />');
    $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+'/api/prov/v1/sites/incapRules/list',curSiteObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
    makeIncapCall('/api/prov/v1/sites/incapRules/list','POST',loadCurMigrationSitePoliciesResponse,curSiteObj,'set');
    scrollDownInLog();
}

function loadCurMigrationSitePoliciesResponse(response) {    
    if (parseInt(response.res)!=0) {
        $('#incap_eventLogs').append('<span class="res_error">#RESPONSE (ERROR):<br />'+JSON.stringify(response)+'</span><br /><br />');
    } else {
        $('#incap_eventLogs').append('Loaded site incap_rules and ADR policies successfully<br /><br />');
        incap_curMigSiteObj.existingPolicies = {};
        if (response.incap_rules!=undefined) {
            if (response.incap_rules.All!=undefined) {
                incap_curMigSiteObj.existingPolicies.incap_rules = {};
                $.each(response.incap_rules.All, function(i,ruleObj) {
                    if (incap_curMigSiteObj.existingPolicies.incap_rules[ruleObj.name]==undefined) incap_curMigSiteObj.existingPolicies.incap_rules[ruleObj.name] = {"index":[],curIndex:0};
                    incap_curMigSiteObj.existingPolicies.incap_rules[ruleObj.name].index.push(ruleObj.id);
                });
            }
        }
        if (response.delivery_rules!=undefined) {
            incap_curMigSiteObj.existingPolicies.delivery_rules = {};
            $.each(response.delivery_rules, function(ruleType,ruleAry) {
                if (incap_curMigSiteObj.existingPolicies[ruleType]==undefined) incap_curMigSiteObj.existingPolicies[ruleType] = {};                
                $.each(ruleAry, function(i,ruleObj) {
                    if (incap_curMigSiteObj.existingPolicies[ruleType][ruleObj.name]==undefined) incap_curMigSiteObj.existingPolicies[ruleType][ruleObj.name] = {"index":[],curIndex:0};    
                    incap_curMigSiteObj.existingPolicies[ruleType][ruleObj.name].index.push(ruleObj.id);
                });
            });
        }
    }
    scrollDownInLog();
    runMigration();
}

function runMigration(){
    if (validateRuleConfigs()) {
        // siteObj = account_id,api_id,site_id,domain
        if (incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]!=undefined) {
            var curSiteObj = jQuery.extend(true, {}, incap_curMigDestSiteIterator.sites[incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]]);
            if (incap_curMigPolicies.index[incap_curMigPolicies.curIndex]!=undefined) {
                // check to see if there are any more incap_rules or ADR rules to process
                var policyIdAry = incap_curMigPolicies.index[incap_curMigPolicies.curIndex].split(';|;'); // policyType;|;policyName
                var curPolicyObj = jQuery.extend(true, {}, incap_curMigPolicies[policyIdAry[0]][policyIdAry[1]]);
                curPolicyObj.api_id = curSiteObj.api_id;
                curPolicyObj.api_key = curSiteObj.api_key;
                curPolicyObj.site_id = curSiteObj.site_id;
                $('#incap_eventLogs').append('<span>#CURL REQUEST - Create Rule: '+curPolicyObj.name+'</span><br />');
                var cur_id = curSiteObj.site_id+'_'+curPolicyObj.name.replace(/\ /g,'_');
                if ($('#'+cur_id).length==1) {
                    if ($('#'+cur_id).hasClass("Redirect")) {
                        if ($('#'+cur_id+'_from').val()!=undefined) curPolicyObj.from = $('#'+cur_id+'_from').val();
                        curPolicyObj.to = $('#'+cur_id+'_to').val();
                        curPolicyObj.response_code = $('#'+cur_id+'_response_code').val();
                    } else {
                        curPolicyObj.dc_id = $('#'+cur_id+'_dc_id').val();
                    }                
                }
                $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+incapCopyObjectURLMappings[policyIdAry[0]].action,curPolicyObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
                makeIncapCall(incapCopyObjectURLMappings[policyIdAry[0]].action,'POST',runMigrationResponse,curPolicyObj,'set');
                scrollDownInLog();
            } else if (incap_curMigRules.index[incap_curMigRules.curIndex]!=undefined) {
                // check to see if there are any ACLs or WAF rules to process
                var removeExistingExceptionsComplete = false;
                if (incap_curMigSiteObj.existingExceptions.index[incap_curMigSiteObj.existingExceptions.curExceptionIndex]!=undefined) {
                    // check to see if there are any existing exceptions to remove first
                    var cur_rule_id = incap_curMigSiteObj.existingExceptions.index[incap_curMigSiteObj.existingExceptions.curExceptionIndex];
                    var curExp = incap_curMigSiteObj.existingExceptions[cur_rule_id];
                    if (curExp.ids[curExp.curIndex]!=undefined) {
                        // there are more exceptions to process
                        delete curSiteObj.account_id;
                        delete curSiteObj.DCs;
                        curSiteObj.rule_id = cur_rule_id;
                        curSiteObj.whitelist_id = curExp.ids[curExp.curIndex];
                        curSiteObj.delete_whitelist=true;
                        if (curExp.curIndex==0) $('#incap_eventLogs').append('<span>#Found '+curExp.ids.length+' existing exception on rule ('+curSiteObj.rule_id+') for site ('+incap_curMigSiteObj.domain+')</span><br /><br />');
                        $('#incap_eventLogs').append('<span>#CURL REQUEST - Removing existing exception ('+curExp.curIndex+'); id ('+curSiteObj.whitelist_id+') on rule ('+curSiteObj.rule_id+') for site ('+incap_curMigSiteObj.domain+')</span><br />');
                        $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+"/api/prov/v1/sites/configure/whitelists",curSiteObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
                        makeIncapCall("/api/prov/v1/sites/configure/whitelists",'POST',deleteRuleExceptionsFromSiteResponse,curSiteObj,'set');
                        scrollDownInLog();
                    } else {
                        removeExistingExceptionsComplete=true;
                    }
                } else {
                    removeExistingExceptionsComplete=true;
                }
                if (removeExistingExceptionsComplete==true) {
                    // All rule exceptions are removed for this rule, add the rule now.
                    var ruleAry = incap_curMigRules.index[incap_curMigRules.curIndex].split(';|;'); // rule_id;|;ruleIndex
                    var curRuleObj = jQuery.extend(true, {}, incap_curMigRules[ruleAry[0]][ruleAry[1]]);
                    curRuleObj.api_id = curSiteObj.api_id;
                    curRuleObj.api_key = curSiteObj.api_key;
                    curRuleObj.site_id = curSiteObj.site_id;
                    curRuleObj.rule_id = ruleAry[0];
                    delete curRuleObj.id;
                    delete curRuleObj.exceptions;
                    delete curRuleObj.name;
                    if (curRuleObj.isCreated!=true) {
                        if ($.isArray(curRuleObj.countries)) curRuleObj.countries = curRuleObj.countries.join(',');
                        if ($.isArray(curRuleObj.continents)) curRuleObj.continents = curRuleObj.continents.join(',');
                        if (curRuleObj.ips!=undefined) curRuleObj.ips = curRuleObj.ips.join(',');
                        if (curRuleObj.client_app_types!=undefined) curRuleObj.client_app_types = curRuleObj.client_app_types.join(',');
                        if (curRuleObj.client_apps!=undefined) curRuleObj.client_apps = curRuleObj.client_apps.join(',');
                        if (curRuleObj.urls!=undefined) {
                            var urlTmpAry = jQuery.extend(true, {}, curRuleObj.urls);
                            curRuleObj.urls = [];
                            curRuleObj.url_patterns = [];
                            $.each(urlTmpAry, function(j,curUrlObj) {
                                curRuleObj.urls.push(curUrlObj.value);
                                curRuleObj.url_patterns.push(curUrlObj.pattern);
                            });
                            curRuleObj.urls = curRuleObj.urls.join(','); 
                            curRuleObj.url_patterns = curRuleObj.url_patterns.join(',');
                        }
                        if (curRuleObj.geo!=undefined) {
                            if (curRuleObj.geo.continents!=undefined) curRuleObj.continents = curRuleObj.geo.continents.join(',');
                            if (curRuleObj.geo.countries!=undefined) curRuleObj.countries = curRuleObj.geo.countries.join(',');
                            delete curRuleObj.geo;
                        }
                        if (incapCopyObjectURLMappings[ruleAry[0]].type=='WAF' && curRuleObj.rule_id!='api.threats.bot_access_control' && curRuleObj.rule_id!='api.threats.ddos') {
                            curRuleObj.security_rule_action = curRuleObj.action;
                            delete curRuleObj.action;
                        } 
                        incap_curMigRules[ruleAry[0]][ruleAry[1]].isCreated='processing';
                        $('#incap_eventLogs').append('<span>#CURL REQUEST - Creating Rule - Local Name ('+incap_curMigRules[ruleAry[0]][ruleAry[1]].name+') | Incapsula Rule Name ('+incapCopyObjectURLMappings[curRuleObj.rule_id].displayText+') | rule_id ('+curRuleObj.rule_id+') </span><br />');
                        $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+incapCopyObjectURLMappings[ruleAry[0]].action,curRuleObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
                        makeIncapCall(incapCopyObjectURLMappings[ruleAry[0]].action,'POST',runMigrationResponse,curRuleObj,'set');
                        scrollDownInLog();
                    } else {
                        if (incap_curMigRules.currentExceptions[incap_curMigRules.index[incap_curMigRules.curIndex]]!=undefined) {
                            var curExceptionObj = jQuery.extend(true, {}, incap_curMigRules.currentExceptions[incap_curMigRules.index[incap_curMigRules.curIndex]]);
                            var curExceptionMember = curExceptionObj.members[curExceptionObj.curIndex];
                            if (curExceptionMember!=undefined) {
                                delete curRuleObj.ips;
                                delete curRuleObj.client_app_types;
                                delete curRuleObj.client_apps;
                                delete curRuleObj.urls;
                                delete curRuleObj.geo;
                                delete curRuleObj.isCreated;
                                $.each(curExceptionMember.values, function(i,curExceptionMemberObj) {
                                    if (curExceptionMemberObj.ips!=undefined) {
                                        curRuleObj.ips = curExceptionMemberObj.ips.join(',');
                                    } else if (curExceptionMemberObj.client_app_types!=undefined) {
                                        curRuleObj.client_app_types = curExceptionMemberObj.client_app_types.join(',');
                                    } else if (curExceptionMemberObj.client_apps!=undefined) {
                                        curRuleObj.client_apps = curExceptionMemberObj.client_apps.join(',');
                                    } else if (curExceptionMemberObj.urls!=undefined) {
                                        curRuleObj.urls = []; 
                                        curRuleObj.url_patterns = [];
                                        $.each(curExceptionMemberObj.urls, function(j,curUrlObj) {
                                            curRuleObj.urls.push(curUrlObj.value);
                                            curRuleObj.url_patterns.push(curUrlObj.pattern);
                                        });
                                        curRuleObj.urls = curRuleObj.urls.join(','); 
                                        curRuleObj.url_patterns = curRuleObj.url_patterns.join(',');
                                    } else if (curExceptionMemberObj.geo!=undefined) {
                                        if (curExceptionMemberObj.geo.continents!=undefined) curRuleObj.continents = curExceptionMemberObj.geo.continents.join(',');
                                        if (curExceptionMemberObj.geo.countries!=undefined) curRuleObj.countries = curExceptionMemberObj.geo.countries.join(',');
                                    }
                                });
                                if (curExceptionObj.curIndex==0) $('#incap_eventLogs').append('<span>#Creating '+curExceptionObj.members.length+' Rule Exception on ('+incap_curMigRules[ruleAry[0]][ruleAry[1]].name+')</span><br /><br />');
                                $('#incap_eventLogs').append('<span>#CURL REQUEST - Create Rule Exception on ('+incap_curMigRules[ruleAry[0]][ruleAry[1]].name+') - exception ('+curExceptionObj.curIndex+')</span><br />');
                                $('#incap_eventLogs').append(incap_transformToCURL($('#incapServer').val()+'/api/prov/v1/sites/configure/whitelists',curRuleObj,$('#incap_migrationConfigMaskSecretKey').is(":checked"))+'<br /><br />');
                                makeIncapCall('/api/prov/v1/sites/configure/whitelists','POST',runMigrationResponse,curRuleObj,'set');
                                scrollDownInLog();
                            }
                        }
                    }
                }
            } else {
                $('#incap_eventLogs').append('<span>########## Migration Complete ##########</span><br /><br />');            
            }
        } else {
            $('#incap_eventLogs').append('<span>########## Migration Complete ##########</span><br /><br />');
        }
    }
}

function runMigrationResponse(response){
    processRunMigrationResponse(response);
    // check to see if there are any rules, and if there are outstanding exceptions to process
    var curRuleHasExceptions = false;
    if (incap_curMigRules.index[incap_curMigRules.curIndex]!=undefined) {
        var curRuleAry = incap_curMigRules.index[incap_curMigRules.curIndex].split(';|;'); // rule_id;|;ruleIndex
        var curRuleObj = incap_curMigRules[curRuleAry[0]][curRuleAry[1]];
        if (curRuleObj.isCreated=='processing') {
            // if rule is processing, mark a isCreated
            curRuleObj.isCreated=true;
            // Check if rule has exceptions, set curRuleHasExceptions to process the first exception
            if (incap_curMigRules.currentExceptions[incap_curMigRules.index[incap_curMigRules.curIndex]]!=undefined) {
                curRuleHasExceptions=true;
            }
        } else if (curRuleObj.isCreated==true) {
            // If rule has already been processed, and first exception has been processed, check for other exceptions
            var curExceptionObj = incap_curMigRules.currentExceptions[incap_curMigRules.index[incap_curMigRules.curIndex]];
            if (curExceptionObj.members[(curExceptionObj.curIndex+1)]!=undefined) {
                curExceptionObj.curIndex++;
                curRuleHasExceptions=true;
            }
        }
    }    
    // Process policies, existing exceptions, rules, rule exceptions, then iterate on to the next site
    if (incap_curMigPolicies.index[(incap_curMigPolicies.curIndex+1)]!=undefined) {
        incap_curMigPolicies.curIndex++;
        runMigration();
    } else if (curRuleHasExceptions==true) {
        runMigration();
    } else if (incap_curMigRules.index[(incap_curMigRules.curIndex+1)]!=undefined) {
        var ruleAry = incap_curMigRules.index[incap_curMigRules.curIndex].split(';|;'); // rule_id;|;ruleIndex
        incap_curMigRules.curIndex++;
        runMigration();
    } else {
        if (incap_curMigDestSiteIterator.index[(incap_curMigDestSiteIterator.curIndex+1)]!=undefined) {
            incap_curMigDestSiteIterator.curIndex++;
            incap_curMigPolicies.curIndex = 0;
            incap_curMigRules.curIndex = 0;
            $.each(incap_curMigRules.index, function(i,curRuleIndexStr) {
                var curRuleResetAry = curRuleIndexStr.split(';|;'); // rule_id;|;ruleIndex
                incap_curMigRules[curRuleResetAry[0]][curRuleResetAry[1]].isCreated=false;
            });
            loadCurMigrationSiteObj();
        } else {
            $('#incap_eventLogs').append('<span>########## Migration Complete [runMigrationResponse()] ##########</span><br /><br />');
            scrollDownInLog();
        }
    }    
}

function processRunMigrationResponse(response){
    // Render current response first
    if (parseInt(response.res)!=0) {
        $('#incap_eventLogs').append('<span class="res_error">#RESPONSE (ERROR):<br />'+JSON.stringify(response)+'</span><br /><br />');
    } else {
        if (parseInt(response.res)==0 && response.acceleration_level!=undefined) {
           $('#incap_eventLogs').append('<span>#RESPONSE: (minimizing JSON response)</span><br />{"res": 0,"res_message": "OK"...}<br /><br />');
        } else {
            $('#incap_eventLogs').append('<span>#RESPONSE:</span><br />'+JSON.stringify(response)+'<br /><br />');
        }
    }
    scrollDownInLog();
}

function deleteRuleExceptionsFromSiteResponse(response){
    processRunMigrationResponse(response);
    var curSiteObj = incap_curMigDestSiteIterator.sites[incap_curMigDestSiteIterator.index[incap_curMigDestSiteIterator.curIndex]];
    var cur_rule_id = incap_curMigSiteObj.existingExceptions.index[incap_curMigSiteObj.existingExceptions.curExceptionIndex];
    incap_curMigSiteObj.existingExceptions[cur_rule_id].curIndex++;
    runMigration();
}

function validateRuleConfigs(){
    var isok = true;    
    $('.migRuleConfig').removeClass('error');
    $.each($('.migRuleConfig'), function(i,option) {
        //if ($(option).hasClass("from")) 
        if (option.value=='') {
            if ($(option).hasClass('from')) {
                
            } else {
                isok = false;
                $(option).addClass('error');
            }
        } else if ($(option).is('input')) {
            if (!isValidURL(option.value)) {
                isok = false;
                $(option).addClass('error');
            }
        }
    });
    if (!isok) $.gritter.add({ title: 'ERROR', text: "Missing required fields, please select data centers, and add redirect rule urls for each rule."});
    return isok;
}
/* END Manage Migration Tools */

function scrollDownInLog(){
    if ($('#incap_tailEventLogs').is(":checked")) {
        $('#incap_eventLogs').scrollTop($('#incap_eventLogs')[0].scrollHeight);
    }
}
