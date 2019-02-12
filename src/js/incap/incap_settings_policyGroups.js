/* Start Manage Incapsula Policy Groups */

var incap_availPolicyTemplates = {};
var incap_selPolicyTemplates = {};
function renderIncapPolicyGroups(){
    if (localStorage.getItem('INCAP_POLICY_GROUPS')==null) localStorage.setItem('INCAP_POLICY_GROUPS','{}');
    INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
	var str = '<option value="">-- Add New Group --</option>';
	$.each(INCAP_POLICY_GROUPS, function(id,grpObj) {
        str += '<option value="'+grpObj.name+'">'+grpObj.name+'</option>';
	});
    $('#incap_policy_groups_list').html(str).unbind().change(function(){ changeIncapPolicyGroup(this); });
    changeIncapPolicyGroup();
}

function changeIncapPolicyGroup() {
    incap_availPolicyTemplates = {};
    incap_selPolicyTemplates = {};
    $('#incap_policy_group_name').val('');
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var avail_str = ''; var sel_str = ''; 
    var grp_btn_str = '<a class="btn incap_save_policy_group" title="Save">Save</a>';
    if (INCAP_POLICY_TEMPLATES!=undefined) {
        if ($('#incap_policy_groups_list').val()=='') {
            $('#incap_policy_group_name').val();
            $.each(INCAP_POLICY_TEMPLATES, function(policyType,policyAry) { 
                $.each(policyAry, function(policyName,policyObj) { 
                    incap_availPolicyTemplates[policyType+";|;"+policyName] = true;
                    avail_str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyType+";|;"+policyName+'">'+policyName+' ('+policyType+')</option>';
                });
            });
        } else {
            grp_btn_str += '<a class="btn incap_save_as_new_policy_group" title="Save as new group">Save as new</a>';
            grp_btn_str += '<a class="btn incap_delete_policy_group" title="Delete">Delete</a>';
            $('#incap_policy_group_name').val($('#incap_policy_groups_list').val());
            INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
            var curGrp = INCAP_POLICY_GROUPS[$('#incap_policy_groups_list').val()];
            $.each(INCAP_POLICY_TEMPLATES, function(policyType,policyAry) { 
                $.each(policyAry, function(policyName,policyObj) {
                    if (curGrp.members[policyType+";|;"+policyName]!=undefined) {
                        incap_selPolicyTemplates[policyType+";|;"+policyName] = true;
                        sel_str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyType+";|;"+policyName+'">'+policyName+' ('+policyType+')</option>';
                    } else { 
                        incap_availPolicyTemplates[policyType+";|;"+policyName] = true;
                        avail_str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyType+";|;"+policyName+'">'+policyName+' ('+policyType+')</option>';
                    }
                });
            });
        }
        $("#avail_incap_group_policies").html(avail_str);
        $("#selected_incap_group_policies").html(sel_str);
        $("#incap_policy_group_btns").html(grp_btn_str);
        initIncapPolicyGroupSettingsButtons();
    }
}

function initIncapPolicyGroupSettingsButtons(){ 
	$('.incap_save_policy_group').button().unbind().click(function(){ set_incapSavePolicyGroup(false); });
	$('.incap_save_as_new_policy_group').button().unbind().click(function(){ set_incapSavePolicyGroup(true); });
    $('.incap_delete_policy_group').button().unbind().click(function(){ set_incapDeletePolicyGroup(); });
}

function moveIncapPolicyGroupMemberRight(){
	if ($('#incap_policy_groups #avail_incap_group_policies option:selected').length>0) {
		$.each($('#incap_policy_groups #avail_incap_group_policies option:selected'), function(i,option) {
            incap_selPolicyTemplates[option.value] = true;
			delete incap_availPolicyTemplates[option.value];
        });
        renderIncapGroupPolicies();
    } else {
        $.gritter.add({ title: 'No Policies Selected', text: "Please select a policy to move."});	
    }    
}

function moveIncapPolicyGroupMemberLeft(){
	if ($('#incap_policy_groups #selected_incap_group_policies option:selected').length>0) {
		$.each($('#incap_policy_groups #selected_incap_group_policies option:selected'), function(i,option) {
            incap_availPolicyTemplates[option.value] = true;
			delete incap_selPolicyTemplates[option.value];
        });
        renderIncapGroupPolicies();
    } else {
        $.gritter.add({ title: 'No Policies Selected', text: "Please select a policy to move."});	
    }    
}

function renderIncapGroupPolicies() {
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var avail_str = ''; var sel_str = '';
    $.each(incap_availPolicyTemplates, function(policyId,bool) {
        var policyIdAry = policyId.split(";|;");
        var policyObj = INCAP_POLICY_TEMPLATES[policyIdAry[0]][policyIdAry[1]];
        avail_str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyIdAry[0]+";|;"+policyObj.name+'">'+policyObj.name+' ('+policyIdAry[0]+')</option>';
    });
    $.each(incap_selPolicyTemplates, function(policyId,bool) {
        var policyIdAry = policyId.split(";|;");
        var policyObj = INCAP_POLICY_TEMPLATES[policyIdAry[0]][policyIdAry[1]];
        sel_str += '<option title="'+JSON.stringify(policyObj).replace(/"/g,"'")+'" value="'+policyIdAry[0]+";|;"+policyObj.name+'">'+policyObj.name+' ('+policyIdAry[0]+')</option>';
    });
    $("#avail_incap_group_policies").html(avail_str);
    $("#selected_incap_group_policies").html(sel_str);
}

function set_incapSavePolicyGroup(saveasnew) {
    if ($('#incap_policy_group_name').val().trim()!='') {
        if ($('#incap_policy_groups #selected_incap_group_policies option').length>0) {
            INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
            if ((saveasnew==true && INCAP_POLICY_GROUPS[$('#incap_policy_group_name').val().trim()]==undefined) || !saveasnew)  {
                if (saveasnew==false && INCAP_POLICY_GROUPS[$('#incap_policy_groups_list').val()]!=undefined) {
                    delete INCAP_POLICY_GROUPS[$('#incap_policy_groups_list').val()];
                }
                INCAP_POLICY_GROUPS[$('#incap_policy_group_name').val().trim()] = {
                    "name":$('#incap_policy_group_name').val().trim(),
                    "members":{}
                } 
                $.each(incap_selPolicyTemplates, function(policyId,policyObj) {
                    INCAP_POLICY_GROUPS[$('#incap_policy_group_name').val().trim()].members[policyId] = true;
                });                
                localStorage.setItem('INCAP_POLICY_GROUPS',JSON.stringify(INCAP_POLICY_GROUPS));
                if (saveasnew) {
                    $.gritter.add({ title: 'Saved', text: "Saved group '"+$('#incap_policy_group_name').val().trim()+"' as new group."});
                } else {
                    $.gritter.add({ title: 'Saved', text: "Updated the existing group '"+$('#incap_policy_group_name').val().trim()+"'."});
                }
                renderIncapPolicyGroups();
                renderMigrationToolbar_config();
            } else {
                $.gritter.add({ title: 'ERROR', text: "A group with this name '"+$('#incap_policy_group_name').val().trim()+"' already exists."});	        
            }
        } else {
            $.gritter.add({ title: 'No Policies Selected', text: "Please add policies to this group."});	
        }    
    } else {
        $.gritter.add({ title: 'No Group Name', text: "Please enter a valid group name."});	
    }
}

function set_incapDeletePolicyGroup(){
	if (confirm('Are you sure you want delete the policy group ('+$('#incap_policy_group_name').val()+') from this tool?')) {
        INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
        if (INCAP_POLICY_GROUPS[$('#incap_policy_group_name').val()]!=undefined) {
			delete INCAP_POLICY_GROUPS[$('#incap_policy_group_name').val()];
			localStorage.setItem('INCAP_POLICY_GROUPS',JSON.stringify(INCAP_POLICY_GROUPS));
            renderIncapPolicyGroups();
            renderMigrationToolbar_config();
		} else {
			$.gritter.add({ title: 'Group not found', text: "Group name "+$('#incap_policy_group_name').val()+" is currently not stored locally."});	
		}
	}

}

/* End Manage Incapsula Policy Groups */

/* Start maintain policy groups id references */
function updatePolicyInPolicyGroup(policyType,origPolicyName,newPolicyName){
    INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
	$.each(INCAP_POLICY_GROUPS, function(id,grpObj) {
        if (grpObj.members[policyType+";|;"+origPolicyName]!=undefined) {
            delete grpObj.members[policyType+";|;"+origPolicyName];
            grpObj.members[policyType+";|;"+newPolicyName] = true;
        }
	});
    localStorage.setItem('INCAP_POLICY_GROUPS',JSON.stringify(INCAP_POLICY_GROUPS));
    renderIncapPolicyGroups();
    renderMigrationToolbar_config()
}

function set_incapDeletePolicyFromGroup(policyType,policyName){
    INCAP_POLICY_GROUPS = JSON.parse(localStorage.getItem('INCAP_POLICY_GROUPS'));
    $.each(INCAP_POLICY_GROUPS, function(grpName,grpObj) {
        if (grpObj.members[policyType+";|;"+policyName]!=undefined) {
            delete grpObj.members[policyType+";|;"+policyName];
        }
	});
    localStorage.setItem('INCAP_POLICY_GROUPS',JSON.stringify(INCAP_POLICY_GROUPS));
    renderIncapPolicyGroups();
}


