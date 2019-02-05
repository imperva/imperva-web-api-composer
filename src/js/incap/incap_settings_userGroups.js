/* Start Manage Incapsula User Groups */
var incap_availUsrGrpMembers = {"index":[],"members":{}};
var incap_selUsrGrpMembers = {"index":[],"members":{}};

function renderIncapUserGroups(){
    if (localStorage.getItem('INCAP_USER_GROUPS')==null) localStorage.setItem('INCAP_USER_GROUPS','{}');
    INCAP_USER_GROUPS = JSON.parse(localStorage.getItem('INCAP_USER_GROUPS'));
	var str = '<option value="">-- Add New Group --</option>';
	$.each(INCAP_USER_GROUPS, function(grpName,grpObj) {
        str += '<option value="'+grpName+'">'+grpName+'</option>';
	});
    $('#incap_user_groups_list').html(str).unbind().change(function(){ changeIncapUserGroup(this); });
    changeIncapUserGroup();
}

function changeIncapUserGroup(obj) {
    incap_availUsrGrpMembers = {"index":[],"members":{}};
    incap_selUsrGrpMembers = {"index":[],"members":{}};
    $('#incap_user_group_name').val('');
    INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
    var avail_str = ''; var sel_str = ''; 
    var grp_btn_str = '<a class="btn incap_save_user_group" title="Save">Save</a>';
    if ($('#incap_user_groups_list').val()=='') {
        $('#incap_user_group_name').val();
        $.each(INCAP_USERS, function(id,usrObj) { 
            incap_availUsrGrpMembers.index.push(id);
            incap_availUsrGrpMembers.members[id] = true;
            avail_str += '<option title="account_id: '+usrObj.account_id+' | api_id: '+usrObj.api_id+'" value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>'; 
        });
    } else {
        grp_btn_str += '<a class="btn incap_save_as_new_user_group" title="Save as new group">Save as new</a>';
        grp_btn_str += '<a class="btn incap_delete_user_group" title="Delete">Delete</a>';
        $('#incap_user_group_name').val($('#incap_user_groups_list').val());
        INCAP_USER_GROUPS = JSON.parse(localStorage.getItem('INCAP_USER_GROUPS'));
        var curGrp = INCAP_USER_GROUPS[$('#incap_user_groups_list').val()];
        console.log(curGrp);
        $.each(INCAP_USERS, function(id,usrObj) {
            console.log(id);
            console.log(curGrp.members[id]);
            if (curGrp.members[id]!=undefined) {
                incap_selUsrGrpMembers.index.push(id);
                incap_selUsrGrpMembers.members[id] = true;
                sel_str += '<option title="account_id: '+usrObj.account_id+' | api_id: '+usrObj.api_id+'"  value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>';
            } else { 
                incap_availUsrGrpMembers.index.push(id);
                incap_availUsrGrpMembers.members[id] = true;
                avail_str += '<option title="account_id: '+usrObj.account_id+' | api_id: '+usrObj.api_id+'"  value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>';
            }
        });
    }
    incap_selUsrGrpMembers.index.sort();
    incap_availUsrGrpMembers.index.sort();
    $("#avail_incap_group_users").html(avail_str);
    $("#selected_incap_group_users").html(sel_str);
    $("#incap_user_group_btns").html(grp_btn_str);
    initGroupSettingsButtons();
}

function initGroupSettingsButtons(){ // work through adding a new user in UI, and test credentials first
	$('.incap_save_user_group').button().unbind().click(function(){ set_incapSaveUserGroup(false); });
	$('.incap_save_as_new_user_group').button().unbind().click(function(){ set_incapSaveUserGroup(true); });
    $('.incap_delete_user_group').button().unbind().click(function(){ set_incapDeleteUserGroup(); });
}

function moveIncapUserGroupMemberRight(){
	if ($('#incap_user_groups #avail_incap_group_users option:selected').length>0) {
		$.each($('#incap_user_groups #avail_incap_group_users option:selected'), function(i,option) {
            incap_selUsrGrpMembers.index.push(option.value);
            incap_selUsrGrpMembers.members[option.value] = true;
            incap_availUsrGrpMembers = removeMemberAndIndexById(incap_availUsrGrpMembers,option.value);
        });
        renderGroupUsers();
    } else {
        $.gritter.add({ title: 'No Users Selected', text: "Please select a user to move."});	
    }    
}

function moveIncapUserGroupMemberLeft(){
	if ($('#incap_user_groups #selected_incap_group_users option:selected').length>0) {
		$.each($('#incap_user_groups #selected_incap_group_users option:selected'), function(i,option) {
            incap_availUsrGrpMembers.index.push(option.value);
            incap_availUsrGrpMembers.members[option.value] = true;
            incap_selUsrGrpMembers = removeMemberAndIndexById(incap_selUsrGrpMembers,option.value);
        });
        renderGroupUsers();
    } else {
        $.gritter.add({ title: 'No Users Selected', text: "Please select a user to move."});	
    }    
}

function renderGroupUsers() {
    INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
    var avail_str = ''; var sel_str = '';     
    $.each(incap_availUsrGrpMembers.index, function(i,id) {
        var usrObj = INCAP_USERS[id];
        avail_str += '<option title="'+usrObj.user_name+'" value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>';
    });
    $.each(incap_selUsrGrpMembers.index, function(i,id) {
        var usrObj = INCAP_USERS[id];
        sel_str += '<option title="'+usrObj.user_name+'" value="'+id+'">'+usrObj.user_name+' ('+usrObj.api_id+')</option>';
    });
    $("#avail_incap_group_users").html(avail_str);
    $("#selected_incap_group_users").html(sel_str);
}

function set_incapSaveUserGroup(saveasnew) {
    if ($('#incap_user_group_name').val().trim()!='') {
        if ($('#incap_user_groups #selected_incap_group_users option').length>0) {
            INCAP_USER_GROUPS = JSON.parse(localStorage.getItem('INCAP_USER_GROUPS'));
            if ((saveasnew==true && INCAP_USER_GROUPS[$('#incap_user_group_name').val().trim()]==undefined) || !saveasnew)  {
                if (saveasnew==false && INCAP_USER_GROUPS[$('#incap_user_groups_list').val()]!=undefined) {
                    delete INCAP_USER_GROUPS[$('#incap_user_groups_list').val()];
                }
                INCAP_USER_GROUPS[$('#incap_user_group_name').val().trim()] = incap_selUsrGrpMembers;
                localStorage.setItem('INCAP_USER_GROUPS',JSON.stringify(INCAP_USER_GROUPS));
                if (saveasnew) {
                    $.gritter.add({ title: 'Saved', text: "Saved group '"+$('#incap_user_group_name').val().trim()+"' as new group."});
                } else {
                    $.gritter.add({ title: 'Saved', text: "Updated the existing group '"+$('#incap_user_group_name').val().trim()+"'."});
                }
                renderIncapUserGroups();
            } else {
                $.gritter.add({ title: 'ERROR', text: "A group with this name '"+$('#incap_user_group_name').val().trim()+"' already exists."});	        
            }
        } else {
            $.gritter.add({ title: 'No Users Selected', text: "Please add users to this group."});	
        }    
    } else {
        $.gritter.add({ title: 'No Group Name', text: "Please enter a valid group name."});	
    }
}

function set_incapDeleteUserGroup(){
	if (confirm('Are you sure you want delete the user group ('+$('#incap_user_group_name').val()+') from this tool?')) {
        INCAP_USER_GROUPS = JSON.parse(localStorage.getItem('INCAP_USER_GROUPS'));
        if (INCAP_USER_GROUPS[$('#incap_user_group_name').val()]!=undefined) {
			delete INCAP_USER_GROUPS[$('#incap_user_group_name').val()];
			localStorage.setItem('INCAP_USER_GROUPS',JSON.stringify(INCAP_USER_GROUPS));
			renderIncapUserGroups();
		} else {
			$.gritter.add({ title: 'Group not found', text: "Group name "+$('#incap_user_group_name').val()+" is currently not stored locally."});	
		}
	}
}
/* END Manage Incapsula User Groups */

