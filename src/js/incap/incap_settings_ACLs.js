/* Start Manage Incapsula ACL/WAF Templates */
// "api.acl.blacklisted_countries","api.acl.blacklisted_urls","api.acl.blacklisted_ips","api.acl.whitelisted_ips"

function renderIncapACLWAFRules(){
    if (localStorage.getItem('INCAP_ACL_WAF_TEMPLATES')==null) localStorage.setItem('INCAP_ACL_WAF_TEMPLATES','{"nextUniqueId":1,"types":{"api.acl.blacklisted_countries":{},"api.acl.blacklisted_urls":{},"api.acl.blacklisted_ips":{},"api.acl.whitelisted_ips":{},"api.threats.backdoor":{},"api.threats.bot_access_control":{},"api.threats.cross_site_scripting":{},"api.threats.ddos":{},"api.threats.illegal_resource_access":{},"api.threats.remote_file_inclusion":{},"api.threats.sql_injection":{}}}');
    INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
	var str = '';
	$.each(INCAP_ACL_WAF_TEMPLATES.types, function(ruleType,ruleAry) {
        $.each(ruleAry, function(rule_id,ruleObj) {
            str += '<tr id="tr;|;'+ruleType+';|;'+rule_id+'">'+set_renderIncapACLWAFRuleHTML(rule_id,ruleObj,ruleType)+'</tr>';
        });
	});
	$('#incap_ACL_WAF_rule_tbl tbody').html(str);
    //changeIncapPolicyGroup();
    initACLWAFSettingsButtons();
}

function initACLWAFSettingsButtons(){ // work through adding a new user in UI, and test credentials first	
    if ($('#incap_ACL_WAF_rule_tbl tr.current').length==0) {
        $('.incap_delete_ACL_WAF_rule').unbind().removeClass('disabled').click(function(){ incapDeleteACLWAFRule(this); });
        $('.incap_edit_ACL_WAF_rule').unbind().removeClass('disabled').click(function(){ incapEditACLWAFRule(this); });
        $('#incap_add_new_ACL_WAF_rule').unbind().removeClass('disabled').click(function(){ incapAddNewACLWAFRule(); });
    } else {
        $('.incap_delete_ACL_WAF_rule').unbind().addClass('disabled');
        $('.incap_edit_ACL_WAF_rule').unbind().addClass('disabled');
        $('#incap_add_new_ACL_WAF_rule').unbind().addClass('disabled');
    }
	$('.incap_save_ACL_WAF_rule').unbind().click(function(){ incapSaveACLWAFRule(this); });
	$('.incap_cancel_ACL_WAF_rule').unbind().click(function(){ incapCancelACLWAFRule(this); });
    $('#incap_ACL_WAF_rules tr.current input, #incap_ACL_WAF_rules tr.current textarea').unbind().keyup(function(event){ 
        updateACLWAFRuleName(event,this); 
    }).blur(function(event){ 
        updateACLWAFRuleName(event,this); 
    });

}

function incapAddNewACL() {
    var str = '<tr class="new_ACL_WAF_rule current">';
	str += '<td><input type="text" class="ACL_WAF_rule_name" value="" disabled="disabled" /></td>';
	str += '<td><select class="ACL_WAF_rule_type">'+renderACLTypeOptionsHTML()+'</select></td>';
	str += '<td><input type="text" class="ACL_WAF_rule_definition" value="" /></td>';
	str += '<td class="nobr" class="td_new_ACL_WAF_rule">';
	str += '  <a class="incap_save_ACL_WAF_rule ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a class="incap_cancel_ACL_WAF_rule ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
    $('#incap_ACL_WAF_rule_tbl tbody').append(str);
	initACLWAFSettingsButtons();
}
function renderACLWAFTypeOptionsHTML(){
    var str = '';
    $.each(ACLWAFRuleNameMapping, function(rule_cat,ruleList) { 
        str += '<optgroup label="'+rule_cat+'">';
        $.each(ruleList, function(rule_id,displayName) { 
            str += '<option value="'+rule_id+'">'+rule_id+'</option>'; 
        });
        str += '</optgroup>';
    });
    return str;    
}

function incapEditACLWAFRule(obj) {
    $(obj).parent().parent().addClass("current");
    INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
    var idsAry = obj.id.split(";|;");
    var ACLWAFRuleObj = INCAP_ACL_WAF_TEMPLATES.types[idsAry[1]][idsAry[2]];
    var title_txt = 'This name value is used for display only local to this tool. The actual name attibute of any WAF or Security rules in Incapsula is not modifiable and will be droped when migrating this rule to the Incapsula API.';
    var str = '<td><input type="text" title="'+title_txt+'" class="ACL_WAF_rule_name" name="ACL_WAF_rule_name" value="'+ACLWAFRuleObj.name+'" /><br /><i>(Local display name only)<i/></td>';
	str += '<td class="ACL_WAF_rule_type">'+idsAry[1]+'</td>';
	str += '<td><textarea type="text" class="ACL_WAF_rule_definition" name="'+obj.id+';|;ACL_WAF_rule_definition" name="'+obj.id+';|;ACL_WAF_rule_definition">'+JSON.stringify(ACLWAFRuleObj)+'</textarea></td>';
	str += '<td class="nobr">';
	str += '  <a id="save;|;'+obj.id+'" class="incap_save_ACL_WAF_rule ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a id="cancel;|;'+obj.id+'" class="incap_cancel_ACL_WAF_rule ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
    $(obj).parent().parent().html(str);
    //$('#tr_'+idsAry[1]+'_'+idsAry[2]).html(str);
	initACLWAFSettingsButtons();
}

function incapSaveACLWAFRule(obj){
    var idsAry = obj.id.split(";|;");
    INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
    var ACLWAFRuleName = $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val().trim();
    var ACLWAFRuleType = $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_type').text();
    var ACLWAFRuleObj = JSON.parse($('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').val());
    ACLWAFRuleObj.id = ACLWAFRuleType;
    ACLWAFRuleObj.name = ACLWAFRuleName;
    $('#incap_ACL_WAF_rules tr.current').removeClass("current");
    INCAP_ACL_WAF_TEMPLATES.types[ACLWAFRuleType][idsAry[3]] = ACLWAFRuleObj;
    localStorage.setItem('INCAP_ACL_WAF_TEMPLATES',JSON.stringify(INCAP_ACL_WAF_TEMPLATES));
    //updateACLInACLGroup(ACLType,origACLName,newACLName);
    $.gritter.add({ title: 'SUCCESS', text: 'ACL "'+ACLWAFRuleName+'" successfully saved'});
    renderIncapACLWAFRules();
    renderMigrationToolbar();
}

function incapDeleteACLWAFRule(obj){
    INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
    var idsAry = obj.id.split(";|;");
    var ACLWAFRuleType = idsAry[1];
    var ACLWAFRuleName = $(obj).parent().parent().find(".ACL_WAF_rule_name").attr("title");
    var ACLWAFRuleIndex = idsAry[2];
	if (confirm('Are you sure you want delete the '+ACLWAFRuleType+' Rule "'+ACLWAFRuleName+' ('+ACLWAFRuleIndex+')" from this tool?')) {
		if (INCAP_ACL_WAF_TEMPLATES.types[ACLWAFRuleType][ACLWAFRuleIndex]!=undefined) {
			delete INCAP_ACL_WAF_TEMPLATES.types[ACLWAFRuleType][ACLWAFRuleIndex];
			localStorage.setItem('INCAP_ACL_WAF_TEMPLATES',JSON.stringify(INCAP_ACL_WAF_TEMPLATES));
            set_incapDeleteACLWAFRuleFromGroup(ACLWAFRuleType,ACLWAFRuleIndex);
			renderIncapACLWAFRules();
		} else {
			$.gritter.add({ title: 'Rule not found', text: ACLWAFRuleType +' Rule "'+ACLWAFRuleName+' ('+ACLWAFRuleIndex+')" currently not stored locally.'});
		}
	}
}

function incapCancelACLWAFRule(obj) {
    renderIncapACLWAFRules();
}

function set_renderIncapACLWAFRuleHTML(ACL_WAF_rule_id,ACLWAFRuleObj,ACLWAFRuleType){
    var str = '<td title="'+ACLWAFRuleObj.name+'" class="ACLattr ACL_WAF_rule_name nobr">'+ACLWAFRuleObj.name+' ('+ACL_WAF_rule_id+')</td>';
	str += '<td class="ACLWAFRuleattr ACL_WAF_rule_type">'+ACLWAFRuleType+'</td>';
	str += '<td class="ACLWAFRuleattr ACL_WAF_rule_definition">'+JSON.stringify(ACLWAFRuleObj)+'</td>';
	str += '<td class="nobr" id="td_'+ACLWAFRuleType+'_'+ACL_WAF_rule_id+'">';
	str += '  <a id="edit;|;'+ACLWAFRuleType+';|;'+ACL_WAF_rule_id+'" class="settings_btn incap_edit_ACL_WAF_rule ui-icon ui-icon-pencil" title="Edit"></a>';
	str += '  <a id="del;|;'+ACLWAFRuleType+';|;'+ACL_WAF_rule_id+'" class="settings_btn incap_delete_ACL_WAF_rule ui-icon ui-icon-trash" title="Delete"></a>';
	str += '</td>';
	return str;
}

function updateACLWAFRuleName(event,obj){
    if ($('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').val().trim()!='') {
        try {
            var isOk = false;
            var curACLWAFRuleObj = JSON.parse($('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').val());
            if ($(obj).prop("tagName")=='TEXTAREA'){
                if (curACLWAFRuleObj.name!='' && curACLWAFRuleObj.name!=undefined) {
                    isOk = true;
                    $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name, #incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').removeClass("error");
                    $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val(curACLWAFRuleObj.name);
                }
            } else {
                $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val($('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val());
                if ($('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val()!='') {
                    isOk = true;
                    curACLWAFRuleObj.name = $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name').val();
                    $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').val(JSON.stringify(curACLWAFRuleObj));
                }
            }
            if (isOk) {
                $('.incap_save_ACL_WAF_rule').unbind().removeClass('disabled').click(function(){ incapSaveACLWAFRule(this); });
                $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name, #incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').removeClass("error");
            } else {
                $.gritter.add({ title: 'ERROR', text: "ACL/WAF rule name must not be blank."});
                $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name, #incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').addClass("error");
            }
        } catch(error) {
            if (!$('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').hasClass("error")) $.gritter.add({ title: 'ERROR', text: error});
            $('.incap_save_ACL_WAF_rule').unbind().addClass('disabled');
            $('#incap_ACL_WAF_rules tr.current .ACL_WAF_rule_name, #incap_ACL_WAF_rules tr.current .ACL_WAF_rule_definition').addClass("error");
        }
    }
}

/* Start Manage Incapsula ACL Templates */