/* BEGIN Manage User Secion */

function renderIncapUsers(){
    if (localStorage.getItem('INCAP_USERS')==null) localStorage.setItem('INCAP_USERS','{}');
    INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	var str = '';
	$.each(INCAP_USERS, function(id,usrObj) {
		str += '<tr id="tr_'+usrObj.account_id+'_'+usrObj.api_id+'">'+set_renderIncapUserHTML(usrObj)+'</tr>';		
	});
	$('#incap_users_tbl tbody').html(str);
	initUserSettingsButtons();
	loadCredentials();
}

function initUserSettingsButtons(){ // work through adding a new user in UI, and test credentials first
	if ($('#incap_users_tbl tr.current').length==0) {
		$('.incap_delete_user').unbind().removeClass('disabled').click(function(){ set_incapDeleteUser(this); });
        $('.incap_edit_user').unbind().removeClass('disabled').click(function(){ set_incapEditUser(this); });
		$('#incap_add_new_user').unbind().removeClass('disabled').click(function(){ set_incapAddNewUser(this); });
    } else {
        $('.incap_delete_user').unbind().addClass('disabled'); 
        $('.incap_edit_user').unbind().addClass('disabled'); 
		$('#incap_add_new_user').unbind().addClass('disabled'); 
    }
	$('.incap_save_user').unbind().click(function(){ set_incapSaveUser(this); });
	$('.incap_cancel_user').unbind().click(function(){ set_incapCancelUser(this); });
}

function set_incapAddNewUser() {
	var str = '<tr class="new_user current">';
	str += '<td><input type="text" class="user_name" value="" /></td>';
	str += '<td><input type="text" class="account_id" value="" /></td>';
	str += '<td><input type="text" class="api_id" value="" /></td>';
	str += '<td><input type="text" class="api_key" value="" /></td>';
	str += '<td class="td_new_user">';
	str += '  <a class="incap_save_user ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a class="incap_cancel_user ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td></tr>';
	$('#incap_users_tbl tbody').append(str);
	$('#incap_add_new_user').removeClass('highlight');
	initUserSettingsButtons();
}

function set_incapEditUser(obj) {
	var idsAry = obj.id.split(";|;");
	$(obj).parent().parent().addClass("current");
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	var usrObj = INCAP_USERS[idsAry[1]];
    var str = '<td><input type="text" class="user_name" name="'+obj.id+';|;user_name" id="'+obj.id+';|;user_name" value="'+usrObj.user_name+'" /></td>';
	str += '<td><input type="text" class="account_id" name="'+obj.id+';|;account_id" id="'+obj.id+';|;account_id" value="'+usrObj.account_id+'" readonly="readonly" /></td>';	
	str += '<td><input type="text" class="api_id" name="'+obj.id+';|;api_id" id="'+obj.id+';|;api_id" value="'+usrObj.api_id+'" readonly="readonly" /></td>';	
	str += '<td><input type="text" class="api_key" name="'+obj.id+';|;api_key" id="'+obj.id+';|;api_key" value="'+usrObj.api_key+'" /></td>';	
	str += '<td class="nobr">';
	str += '  <a id="save;|;'+obj.id+'" class="incap_save_user ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a id="cancel;|;'+obj.id+'" class="incap_cancel_user ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
	$(obj).parent().parent().html(str);
	initUserSettingsButtons();
}

function set_incapCancelUser(obj) {
    renderIncapUsers();
}

function set_renderIncapUserHTML(usrObj){
	var str = '<td class="usrattr user_name">'+usrObj.user_name+'</td>';
	str += '<td class="usrattr account_id">'+usrObj.account_id+'</td>';
	str += '<td class="usrattr api_id">'+usrObj.api_id+'</td>';
	str += '<td class="usrattr api_key">'+starStr.substr(0,usrObj.api_key.length)+'</td>';
	str += '<td id="td_'+usrObj.api_id+'">';
	str += '  <a id="edit;|;'+usrObj.api_id+'" class="settings_btn incap_edit_user ui-icon ui-icon-pencil" title="Edit"></a>';
	str += '  <a id="del;|;'+usrObj.api_id+'" class="settings_btn incap_delete_user ui-icon ui-icon-trash" title="Delete"></a>';
	str += '</td>';
	return str;
}

function set_incapSaveUser(obj) {
	$(obj).parent().parent().addClass("current");
	var auth = {
		"api_key": $('#incap_users_tbl tr.current .api_key').val(),
		"api_id": $('#incap_users_tbl tr.current .api_id').val()
	}
	var postDataObj = {
		"account_id": $('#incap_users_tbl tr.current .account_id').val()
	}
	$.gritter.add({ title: 'Saving User', text: 'Testing credentials on account ID "'+$('#incap_users_tbl tr.current .api_id').val()+'".'});
	makeIncapCall(getSwHost("cwaf_api_v1")+'/api/prov/v1/account','POST',auth,set_incapSaveUserResponse,postDataObj,'set',"application/x-www-form-urlencoded");
}

function set_incapSaveUserResponse(response){
	if (response.res != 0) {
		$.gritter.add({ title: 'ERROR', text: response.res_message });		
		$('#incap_users_tbl tr.current input').addClass("error");
	} else {
		INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
		var usrObj = {
			"user_name":$('#incap_users_tbl tr.current .user_name').val(),
			"account_id":$('#incap_users_tbl tr.current .account_id').val(),
			"api_id":$('#incap_users_tbl tr.current .api_id').val(),
			"api_key":$('#incap_users_tbl tr.current .api_key').val(),
			"plan_name": response.plan_name.substr(0,10)
		}
		INCAP_USERS[$('#incap_users_tbl tr.current .api_id').val()] = usrObj;
		localStorage.setItem('INCAP_USERS',JSON.stringify(INCAP_USERS));
		$.gritter.add({ title: 'SUCCESS', text: 'User '+$('#incap_users_tbl tr.current .user_name').val()+' ('+$('#incap_users_tbl tr.current .api_id').val()+') successfully saved'});
		renderIncapUsers();
	}
}
function set_incapDeleteUser(obj){
	var idsAry = obj.id.split(";|;");
	INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
	if (confirm('Are you sure you want delete the api_id: '+idsAry[1]+' from this tool?')) {
		if (INCAP_USERS[idsAry[1]]!=undefined) {
			delete INCAP_USERS[idsAry[1]];
			localStorage.setItem('INCAP_USERS',JSON.stringify(INCAP_USERS));
			set_incapDeleteUserFromUserGroup(idsAry[1]);
			set_incapDeleteUserFromSiteGroup(idsAry[1]);
			renderIncapUserGroups();
			renderIncapUsers();
		} else {
			$.gritter.add({ title: 'User not found', text: "User with api_id: "+idsAry[1]+" currently not stored locally."});
		}
	}
}

function set_incapBulkImportCredentials() {
	//console.log("incapBulkImportCredentials");
	//alert("Bulk Imprt Credentials");
	//renderAuth();
	//renderDestAuth();	
}
/* End Manage User Secion */

/* Start maintain User id references */
function set_incapDeleteUserFromUserGroup(cur_id){
    INCAP_USER_GROUPS = JSON.parse(localStorage.getItem('INCAP_USER_GROUPS'));
    $.each(INCAP_USER_GROUPS, function(grpName,grpObj) {
        if (grpObj.members[cur_id]!=undefined) {
            delete grpObj.members[cur_id];
            grpObj.index = [];
            $.each(grpObj.members, function(id,bool) { grpObj.index.push(id); });
        }
	});
    localStorage.setItem('INCAP_USER_GROUPS',JSON.stringify(INCAP_USER_GROUPS));
	renderIncapUserGroups();
}
function set_incapDeleteUserFromSiteGroup(cur_id){
    INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
	$.each(INCAP_SITE_GROUPS, function(name,siteGrpObj) {
		siteGrpObj.index = [];
		$.each(siteGrpObj.members, function(domain,siteObj) {
			if (siteObj.api_id==cur_id) {
				delete siteGrpObj.members[domain];
			}
	    });
		$.each(siteGrpObj.members, function(id,bool) { siteGrpObj.index.push(id); });
    });
	localStorage.setItem('INCAP_SITE_GROUPS',JSON.stringify(INCAP_SITE_GROUPS));
	renderSiteGroupSites();
}

/* End maintain User id references */
