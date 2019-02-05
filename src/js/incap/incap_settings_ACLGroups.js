/* Start Manage Incapsula ACL Groups */

function renderIncapACLWAFGroups(){
    renderIncapACLWAFGroupRuleTypes();
    if (localStorage.getItem('INCAP_ACL_WAF_GROUPS')==null) localStorage.setItem('INCAP_ACL_WAF_GROUPS','{}');
    INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
	var str = '<option value="">-- Add New Group --</option>';
	$.each(INCAP_ACL_WAF_GROUPS, function(id,ACLWAFObj) {
        str += '<option value="'+ACLWAFObj.name+'">'+ACLWAFObj.name+'</option>';
	});
    $('#incap_ACL_WAF_groups_list').html(str).unbind().change(function(){ changeIncapACLWAFGroup(this); });
    changeIncapACLWAFGroup();
}

function renderIncapACLWAFGroupRuleTypes(){
    var str = '';
    /*$.each(ACLWAFRuleNameMapping, function(rule_cat,ruleList) { 
        str += '<optgroup label="'+rule_cat+'">';
        $.each(ruleList, function(rule_id,displayName) { 
            str += '<option value="'+rule_id+'">'+rule_id+'</option>'; 
        });
        str += '</optgroup>';
    });*/

    $.each(ACLWAFRuleNameMapping, function(rule_cat,ruleList) {
        str += '<tr><td colspan="2"><h3>'+rule_cat+'</h3></td></tr>';
        $.each(ruleList, function(rule_id,displayName) {
            var cur_id = 'incap_ACL_WAF_'+rule_id.replace(/\./g,'_');
            str += '<tr><td><label for="'+cur_id+'">'+displayName+': </label></td><td><select class="ruleType" name="'+cur_id+'" id="'+cur_id+'" type="text">';
            str += renderIncapRuleTypeByRuleID(rule_id);
            str += '</select><br /></td></tr>';
        });
    });

    /*$.each(ACLWAFRuleNameMapping, function(rule_id,displayName) {
        var cur_id = 'incap_ACL_WAF_'+rule_id.replace(/\./g,'_');
        str += '<tr><td><label for="'+cur_id+'">'+displayName+': </label></td><td><select class="ruleType" name="'+cur_id+'" id="'+cur_id+'" type="text">';
        str += renderIncapRuleTypeByRuleID(rule_id);
        str += '</select><br /></td></tr>';
    });*/
    str += '<td colspan="2"><div id="incap_ACL_WAF_group_btns"></div></td>';
    $('#incap_ACL_WAF_groups_tbl').html(str);
}

function renderIncapRuleTypeByRuleID(ruleType) {
    var str = '<option value="">-- select rule --</option>';
    INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
    $.each(INCAP_ACL_WAF_TEMPLATES.types[ruleType], function(index,ACLWAFObject) {
        str += '<option title="'+JSON.stringify(ACLWAFObject).replace(/"/g,"'")+'"  value="'+ruleType+';|;'+index+'">'+ACLWAFObject.name+' ('+index+')</option>';
    });
    return str;
}

function changeIncapACLWAFGroup() {
    $('#incap_ACL_WAF_group_name').val('');
    $('#incap_ACL_WAF_groups_tbl .ruleType').val('');
    var grp_btn_str = '<a class="btn incap_save_ACL_WAF_group" title="Save">Save</a>';    
    if ($('#incap_ACL_WAF_groups_list').val()!='') {
        grp_btn_str += '<a class="btn incap_save_as_new_ACL_WAF_group" title="Save as new group">Save as new</a>';
        grp_btn_str += '<a class="btn incap_delete_ACL_WAF_group" title="Delete">Delete</a>';
        $('#incap_ACL_WAF_group_name').val($('#incap_ACL_WAF_groups_list').val());
        INCAP_ACL_WAF_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_TEMPLATES'));
        INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
        if (INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_groups_list').val()]!=undefined) {
            $.each(INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_groups_list').val()].members, function(ruleType,ACLWAFIndex) {
                $('#incap_ACL_WAF_'+ruleType.replace(/\./g,'_')).val(ruleType+';|;'+ACLWAFIndex);
            });
        }
    }
    $("#incap_ACL_WAF_group_btns").html(grp_btn_str);
    initIncapACLWAFGroupSettingsButtons();
}

function initIncapACLWAFGroupSettingsButtons(){ 
	$('.incap_save_ACL_WAF_group').button().unbind().click(function(){ set_incapSaveACLWAFGroup(false); });
	$('.incap_save_as_new_ACL_WAF_group').button().unbind().click(function(){ set_incapSaveACLWAFGroup(true); });
    $('.incap_delete_ACL_WAF_group').button().unbind().click(function(){ set_incapDeleteACLWAFGroup(); });
}

function set_incapSaveACLWAFGroup(saveasnew) {
    if ($('#incap_ACL_WAF_group_name').val().trim()!='') {
        $('#incap_ACL_WAF_group_name').removeClass('error');
        INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
        if ((saveasnew==true && INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_group_name').val().trim()]==undefined) || !saveasnew)  {
            if (saveasnew==false && INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_groups_list').val()]!=undefined) {
                delete INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_groups_list').val()];
            }
            INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_group_name').val().trim()] = {
                "name":$('#incap_ACL_WAF_group_name').val().trim(),
                "members":{}
            }
            $.each($('#incap_ACL_WAF_groups_tbl .ruleType'), function(i,selectObj) {
                if (selectObj.value!='') {
                    var ACLWAFAry = selectObj.value.split(';|;');
                    var ruleType = ACLWAFAry[0]; var ACLWAFIndex = ACLWAFAry[1];
                    INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_group_name').val().trim()].members[ruleType] = ACLWAFIndex;
                }
            });
            localStorage.setItem('INCAP_ACL_WAF_GROUPS',JSON.stringify(INCAP_ACL_WAF_GROUPS));
            if (saveasnew) {
                $.gritter.add({ title: 'Saved', text: "Saved group '"+$('#incap_ACL_WAF_group_name').val().trim()+"' as new group."});
            } else {
                $.gritter.add({ title: 'Saved', text: "Updated the existing group '"+$('#incap_ACL_WAF_group_name').val().trim()+"'."});
            }
            renderIncapACLWAFGroups();
        } else {
            $.gritter.add({ title: 'ERROR', text: "A group with this name '"+$('#incap_ACL_WAF_group_name').val().trim()+"' already exists."});	        
        }
        // } else {
        //     $.gritter.add({ title: 'No Policies Selected', text: "Please add policies to this group."});	
        // }    
    } else {
        $.gritter.add({ title: 'No Group Name', text: "Please enter a valid group name."});	
        $('#incap_ACL_WAF_group_name').addClass('error');
    }
}

function set_incapDeleteACLWAFGroup(){
	if (confirm('Are you sure you want delete the ACL/WAF group ('+$('#incap_ACL_WAF_group_name').val()+') from this tool?')) {
        INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));
        if (INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_group_name').val()]!=undefined) {
			delete INCAP_ACL_WAF_GROUPS[$('#incap_ACL_WAF_group_name').val()];
			localStorage.setItem('INCAP_ACL_WAF_GROUPS',JSON.stringify(INCAP_ACL_WAF_GROUPS));
			renderIncapACLWAFGroups();
		} else {
			$.gritter.add({ title: 'Group not found', text: "Group name "+$('#incap_ACL_WAF_group_name').val()+" is currently not stored locally."});
		}
	}

}

/* Start maintain ACL/WAF groups id references */
function set_incapDeleteACLWAFRuleFromGroup(ruleType,ACLWAFIndex) {
    INCAP_ACL_WAF_GROUPS = JSON.parse(localStorage.getItem('INCAP_ACL_WAF_GROUPS'));    
    $.each(INCAP_ACL_WAF_GROUPS, function(grpName,grpObj) {
        if (grpObj.members[ruleType]!=undefined) {
            if (grpObj.members[ruleType]==ACLWAFIndex) {
                delete grpObj.members[ruleType];
            }
        }
	});
    localStorage.setItem('INCAP_ACL_WAF_GROUPS',JSON.stringify(INCAP_ACL_WAF_GROUPS));
    renderIncapACLWAFGroups();
}
