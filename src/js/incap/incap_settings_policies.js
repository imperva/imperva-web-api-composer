
/* Start Manage Incapsula Policy Templates */
function renderIncapPolcies(){
    if (localStorage.getItem('INCAP_POLICY_TEMPLATES')==null) localStorage.setItem('INCAP_POLICY_TEMPLATES','{"incap_rules":{},"Redirect":{},"Rewrite":{},"Forward":{}}');
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
	var str = '';
	$.each(INCAP_POLICY_TEMPLATES, function(policyType,policyAry) {
        $.each(policyAry, function(policyName,policyObj) {
            str += '<tr id="tr;|;'+policyType+';|;'+policyName+'">'+set_renderIncapPolicyHTML(policyObj,policyType)+'</tr>';
        });
	});
	$('#incap_policies_tbl tbody').html(str);
    changeIncapPolicyGroup();
    initPolicySettingsButtons();
}

function initPolicySettingsButtons(){ // work through adding a new user in UI, and test credentials first	
    if ($('#incap_policies_tbl tr.current').length==0) { 
        $('.incap_delete_policy').unbind().removeClass('disabled').click(function(){ incapDeletePolicy(this); });
        $('.incap_edit_policy').unbind().removeClass('disabled').click(function(){ incapEditPolicy(this); }); 
        $('#incap_add_new_policy').unbind().removeClass('disabled').click(function(){ incapAddNewPolicy(); });        
    } else {
        $('.incap_delete_policy').unbind().addClass('disabled');
        $('.incap_edit_policy').unbind().addClass('disabled');
        $('#incap_add_new_policy').unbind().addClass('disabled');
    }
	$('.incap_save_policy').unbind().click(function(){ incapSavePolicy(this); });
	$('.incap_cancel_policy').unbind().click(function(){ incapCancelPolicy(this); });
    $('#incap_policies_tbl tr.current input, #incap_policies_tbl tr.current textarea').unbind().keyup(function(event){ 
        updatePolicyName(event,this); 
    }).blur(function(event){ 
        updatePolicyName(event,this); 
    });
}

function incapAddNewPolicy() {
    var str = '<tr class="new_policy current">';
	str += '<td><input type="text" class="policy_name" value="" /></td>';
	str += '<td><input type="text" class="policy_type" value="" /></td>';
	str += '<td><input type="text" class="policy_definition" value="" /></td>';
	str += '<td class="nobr" class="td_new_policy">';
	str += '  <a class="incap_save_policy ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a class="incap_cancel_policy ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
    $('#incap_policies_tbl tbody').append(str);
	initPolicySettingsButtons();
}

function incapEditPolicy(obj) {
    $(obj).parent().parent().addClass("current");
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var idsAry = obj.id.split(";|;");
    var policyObj = INCAP_POLICY_TEMPLATES[idsAry[1]][idsAry[2]];
    var str = '<td><input type="text" class="policy_name" name="'+obj.id+';|;policy_name" value="'+policyObj.name+'" />';
    str += '<input type="hidden" class="policy_name_orig" value="'+policyObj.name+'" /></td>';
	str += '<td class="policy_type">'+idsAry[1]+'</td>';
	str += '<td><textarea type="text" class="policy_definition" name="'+obj.id+';|;policy_definition">'+JSON.stringify(policyObj)+'</textarea></td>';
	str += '<td class="nobr">';
	str += '  <a id="save;|;'+obj.id+'" class="incap_save_policy ui-icon ui-icon-disk" title="Save"></a>';
	str += '  <a id="cancel;|;'+obj.id+'" class="incap_cancel_policy ui-icon ui-icon-cancel" title="Cancel"></a>';
	str += '</td>';
    $(obj).parent().parent().html(str);
    //$('#tr_'+idsAry[1]+'_'+idsAry[2]).html(str);
	initPolicySettingsButtons();
}

function incapSavePolicy(obj){
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var origPolicyName = $('#incap_policies_tbl tr.current .policy_name_orig').val();
    var newPolicyName = $('#incap_policies_tbl tr.current .policy_name').val();
    var policyType = $('#incap_policies_tbl tr.current .policy_type').html();
    var policyObj = JSON.parse($('#incap_policies_tbl tr.current .policy_definition').val());
    $('#incap_policies_tbl tr.current').removeClass("current");
    delete INCAP_POLICY_TEMPLATES[policyType][origPolicyName];
    // remove empty object attributes
		if (policyObj.from==="") delete policyObj.from;
		if (policyObj.filter==="") delete policyObj.filter;
		INCAP_POLICY_TEMPLATES[policyType][newPolicyName] = policyObj;
    localStorage.setItem('INCAP_POLICY_TEMPLATES',JSON.stringify(INCAP_POLICY_TEMPLATES).replace(/\(\ /g,'(').replace(/ \)/g,')'));
    updatePolicyInPolicyGroup(policyType,origPolicyName,newPolicyName);
    $.gritter.add({ title: 'SUCCESS', text: 'Policy "'+newPolicyName+'" successfully saved'});
    renderIncapPolcies();
    renderMigrationToolbar();
}

function incapDeletePolicy(obj){
    INCAP_POLICY_TEMPLATES = JSON.parse(localStorage.getItem('INCAP_POLICY_TEMPLATES'));
    var idsAry = obj.id.split(";|;");
    var policyType = idsAry[1];
    var policyName = idsAry[2];
	if (confirm('Are you sure you want delete the '+policyType+' policy "'+policyName+'" from this tool?')) {
		if (INCAP_POLICY_TEMPLATES[policyType][policyName]!=undefined) {
			delete INCAP_POLICY_TEMPLATES[policyType][policyName];
			localStorage.setItem('INCAP_POLICY_TEMPLATES',JSON.stringify(INCAP_POLICY_TEMPLATES));
            set_incapDeletePolicyFromGroup(policyType,policyName);
			renderIncapPolcies();
		} else {
			$.gritter.add({ title: 'Policy not found', text: policyType +' policy "'+policyName+'" currently not stored locally.'});
		}
	}
}

function incapCancelPolicy(obj) {
    renderIncapPolcies();
}

function set_renderIncapPolicyHTML(policyObj,policyType){
    var str = '<td class="policyattr policy_name">'+policyObj.name+'</td>';
	str += '<td class="policyattr policy_type">'+policyType+'</td>';
	str += '<td class="policyattr policy_definition">'+JSON.stringify(policyObj)+'</td>';
	str += '<td class="nobr" id="td_'+policyType+'_'+policyObj.name+'">';
	str += '  <a id="edit;|;'+policyType+';|;'+policyObj.name+'" class="settings_btn incap_edit_policy ui-icon ui-icon-pencil" title="Edit"></a>';
	str += '  <a id="del;|;'+policyType+';|;'+policyObj.name+'" class="settings_btn incap_delete_policy ui-icon ui-icon-trash" title="Delete"></a>';
	str += '</td>';
	return str;
}

function updatePolicyName(event,obj){
    if ($('#incap_policies_tbl tr.current .policy_definition').val().trim()!='') {
        try {
            var isOk = false;
            var curPolicyObj = JSON.parse($('#incap_policies_tbl tr.current .policy_definition').val());
            if ($(obj).prop("tagName")=='TEXTAREA'){
                if (curPolicyObj.name!='' && curPolicyObj.name!=undefined) {
                    isOk = true;
                    $('#incap_policies_tbl tr.current .policy_name, #incap_policies_tbl tr.current .policy_definition').removeClass("error");
                    $('#incap_policies_tbl tr.current .policy_name').val(curPolicyObj.name);
                }
            } else {
                $('#incap_policies_tbl tr.current .policy_name').val($('#incap_policies_tbl tr.current .policy_name').val().trim());
                if ($('#incap_policies_tbl tr.current .policy_name').val()!='') {
                    isOk = true;
                    curPolicyObj.name = $('#incap_policies_tbl tr.current .policy_name').val();
                    $('#incap_policies_tbl tr.current .policy_definition').val(JSON.stringify(curPolicyObj));
                }
            }
            if (isOk) {
                $('.incap_save_policy').unbind().removeClass('disabled').click(function(){ incapSavePolicy(this); });
                $('#incap_policies_tbl tr.current .policy_name, #incap_policies_tbl tr.current .policy_definition').removeClass("error");
            } else {
                $.gritter.add({ title: 'ERROR', text: "Policy name must not be blank."});
                $('#incap_policies_tbl tr.current .policy_name, #incap_policies_tbl tr.current .policy_definition').addClass("error");
            }
        } catch(error) {
            if (!$('#incap_policies_tbl tr.current .policy_definition').hasClass("error")) $.gritter.add({ title: 'ERROR', text: error});
            $('.incap_save_policy').unbind().addClass('disabled');
            $('#incap_policies_tbl tr.current .policy_name, #incap_policies_tbl tr.current .policy_definition').addClass("error");
        }
    }
}
/* End Manage Incapsula Policy Templates */

