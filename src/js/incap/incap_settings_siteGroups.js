/* Start Manage Incapsula Site Groups */
var incap_availSites = {"index":[],"members":{},"cur_account_sites":{},"processing":false};
var incap_selSites = {"index":[],"members":{}};

$().ready(function() {
    $('#incap_site_group_account_ID_list').change(function(){ 
        $('#incap_site_group_page_num').val('0'); 
        renderSiteGroupSites(); 
    });    
    $('#incap_site_group_page_num').change(function(){ 
        $('#incap_site_group_account_ID_list').attr('disabled','disabled'); 
        renderSiteGroupSites(); 
    });
});

// Render the current list of sites to select from based on what API key is displayed in the incap_site_group_account_list select
function renderSiteGroupSites(){
    if (!incap_availSites.processing) {
        incap_availSites.processing=true;
        INCAP_USERS = JSON.parse(localStorage.getItem('INCAP_USERS'));
        if ($("#incap_site_group_account_list").val()!='') {
            var auth = INCAP_USERS[$("#incap_site_group_account_list").val()];
            var postDataObj = {
                "page_size":$('#incap_site_group_page_size').val(),
                "page_num":$('#incap_site_group_page_num').val(),
                "account_id":$('#incap_site_group_account_ID_list').val()
            }
            $("#avail_incap_group_sites").html('<option value="">loading...</option>').attr('disabled',false);
            $('#moveIncapSiteGroupMemberRight').unbind();
            $('#moveIncapSiteGroupMemberLeft').unbind();
            $('#incap_site_groups_list').attr('disabled','disabled');
            $('#incap_site_group_account_list').attr('disabled','disabled');
            $.gritter.add({ title: 'Status', text: "Loading sites for api_id:"+auth.api_id});
            makeIncapCall(getSwHost("cwaf_api_v1")+'/api/prov/v1/sites/list', 'POST', auth, postDataObj, renderSiteGroupSitesResponse, 'set',"application/x-www-form-urlencoded");
        }
    }
}
// callback function to process the response of loading sites
function renderSiteGroupSitesResponse(response){
    console.log(response);
    alert(response);
    incap_availSites = {"index":[],"members":{},"cur_account_sites":{},"processing":false};
    var api_id = $('#incap_site_group_account_list').val();
    $("#avail_incap_group_sites").html('');
    $('#moveIncapSiteGroupMemberRight').click(function(){ moveIncapSiteGroupMemberRight() });
    $('#moveIncapSiteGroupMemberLeft').click(function(){ moveIncapSiteGroupMemberLeft() });
    $('#incap_site_groups_list, #incap_site_group_account_ID_list').attr('disabled',false);
    $('#incap_site_group_account_list').attr('disabled',false);

    $.each(response.sites, function(i,siteObj) { 
        var minSiteObj = {
            "site_id":siteObj.site_id,
            "domain":siteObj.domain,
            "account_id":siteObj.account_id,
            "api_id":api_id,
            "DCs":{}
        }
        incap_availSites.cur_account_sites[siteObj.account_id+"_"+siteObj.site_id] = true;
        if (incap_selSites.members[siteObj.domain]==undefined && siteObj.account_id==$('#incap_site_group_account_ID_list').val()) { 
            incap_availSites.index.push(siteObj.domain);
            incap_availSites.members[siteObj.domain] = minSiteObj;
        }
    });
    //$.each(incap_availSites.members, function(domain,siteObj) {  });
    if (incap_availSites.index.length>0) {
        incap_availSites.index.sort();
        $.each(incap_availSites.index, function(i,domain) {  
            var siteObj = incap_availSites.members[domain];
            $("#avail_incap_group_sites").append('<option title="api_id: '+siteObj.api_id+' | account_id: '+siteObj.account_id+' | site_id: '+siteObj.site_id+' | domain: '+domain+'" value="'+domain+'">'+domain+' ('+siteObj.site_id+')</option>');  
        });
    } else {
        $("#avail_incap_group_sites").html('<option>No sites for accout ('+$('#incap_site_group_account_ID_list').val()+') found on this page of sites...</option>').attr('disabled','disabled');
    }
    incap_availSites.processing=false;
}
// Render list of available site groups from INCAP_SITE_GROUPS
function renderIncapSiteGroups(){
    if (localStorage.getItem('INCAP_SITE_GROUPS')==null) localStorage.setItem('INCAP_SITE_GROUPS','{}');
    INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
	var str = '<option value="">-- Add New Group --</option>';
	$.each(INCAP_SITE_GROUPS, function(name,siteGrpObj) {
        str += '<option value="'+name+'">'+name+'</option>';
    });
    $('#incap_site_groups_list').html(str).unbind().change(function(){ changeIncapSiteGroup(this); });
    changeIncapSiteGroup();
}
// Change the site group, populate the selected from what is stored locally, and call renderSiteGroupSites() to populate the available sites
function changeIncapSiteGroup(obj) {
    incap_availSites = {"index":[],"members":{},"processing":false};
    incap_selSites = {"index":[],"members":{}};
    $('#incap_site_group_name').val('');
    var grp_btn_str = '<a class="btn incap_save_site_group" title="Save">Save</a>';
    var avail_str = ''; var sel_str = ''; 
    if ($('#incap_site_groups_list').val()=='') {
        $('#incap_site_group_name').val('');
    } else {
        grp_btn_str += '<a class="btn incap_save_as_new_site_group" title="Save as new group">Save as new</a>';
        grp_btn_str += '<a class="btn incap_delete_site_group" title="Delete">Delete</a>';
        $('#incap_site_group_name').val($('#incap_site_groups_list').val());
        INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
        var curGrp = INCAP_SITE_GROUPS[$('#incap_site_groups_list').val()];
        curGrp.index.sort();
        incap_selSites = curGrp;
        $.each(curGrp.index, function(i,domain) {
            var siteObj = curGrp.members[domain];
            sel_str += '<option title="api_id: '+siteObj.api_id+' | account_id: '+siteObj.account_id+' | site_id: '+siteObj.site_id+' | domain: '+domain+'" value="'+domain+'">'+domain+' ('+siteObj.site_id+')</option>';
        });
    }
    $("#avail_incap_group_sites").html(avail_str);
    $("#selected_incap_group_sites").html(sel_str);
    $("#incap_site_group_btns").html(grp_btn_str);
    initIncapSiteGroupSettingsButtons();
    renderSiteGroupSites();    
}

function initIncapSiteGroupSettingsButtons(){ 
	$('.incap_save_site_group').button().unbind().click(function(){ set_incapSaveSiteGroup(false); });
	$('.incap_save_as_new_site_group').button().unbind().click(function(){ set_incapSaveSiteGroup(true); });
    $('.incap_delete_site_group').button().unbind().click(function(){ set_incapDeleteSiteGroup(); });
}

function moveIncapSiteGroupMemberRight(){
	if ($('#incap_site_groups #avail_incap_group_sites option:selected').length>0) {
		$.each($('#incap_site_groups #avail_incap_group_sites option:selected'), function(i,option) {
            var curSiteObj = incap_availSites.members[option.value];
            incap_selSites.index.push(curSiteObj.domain);
            incap_selSites.members[curSiteObj.domain] = curSiteObj;
            incap_availSites = removeMemberAndIndexById(incap_availSites,option.value);
        });
        incap_selSites.index.sort();
        renderIncapGroupSites();
    } else {
        $.gritter.add({ title: 'No Sites Selected', text: "Please select a site to move."});	
    }    
}

function moveIncapSiteGroupMemberLeft(){
	if ($('#incap_site_groups #selected_incap_group_sites option:selected').length>0) {
		$.each($('#incap_site_groups #selected_incap_group_sites option:selected'), function(i,option) {
            var curSiteObj = incap_selSites.members[option.value];
            if (incap_availSites.cur_account_sites[curSiteObj.account_id+"_"+curSiteObj.site_id]!=undefined) {
                incap_availSites.index.push(curSiteObj.domain);
                incap_availSites.members[curSiteObj.domain] = curSiteObj;
            }
            incap_availSites.index.sort();
            incap_selSites = removeMemberAndIndexById(incap_selSites,option.value);
        });
        renderIncapGroupSites();
    } else {
        $.gritter.add({ title: 'No Sites Selected', text: "Please select a site to move."});	
    }    
}

function renderIncapGroupSites() {
    INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
    var avail_str = ''; var sel_str = '';
    $.each(incap_availSites.index, function(i,domain) {
        var siteObj = incap_availSites.members[domain];
        avail_str += '<option title="api_id: '+siteObj.api_id+' | account_id: '+siteObj.account_id+'" value="'+domain+'">'+domain+' ('+siteObj.site_id+')</option>';
    });
    $.each(incap_selSites.index, function(i,domain) {
        var siteObj = incap_selSites.members[domain];
        sel_str += '<option title="api_id: '+siteObj.api_id+' | account_id: '+siteObj.account_id+'" value="'+domain+'">'+domain+' ('+siteObj.site_id+')</option>';
    });
    $("#avail_incap_group_sites").html(avail_str);
    $("#selected_incap_group_sites").html(sel_str);
}

function set_incapSaveSiteGroup(saveasnew) {
    if ($('#incap_site_group_name').val().trim()!='') {
        if ($('#incap_site_groups #selected_incap_group_sites option').length>0) {
            INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
            if ((saveasnew==true && INCAP_SITE_GROUPS[$('#incap_site_group_name').val().trim()]==undefined) || (!saveasnew))  {
                var oktosave = true;
                if (INCAP_SITE_GROUPS[$('#incap_site_group_name').val().trim()]!=undefined && $('#incap_site_group_name').val().trim()!=$('#incap_site_groups_list').val()) {
                    if (confirm("A group with this name '"+$('#incap_site_group_name').val().trim()+"' already exists, would you like to overwrite it?")) { oktosave=true; } else { oktosave=false; }
                }
                if (oktosave) {
                    if (saveasnew==false && INCAP_SITE_GROUPS[$('#incap_site_groups_list').val()]!=undefined) {
                        delete INCAP_SITE_GROUPS[$('#incap_site_groups_list').val()];
                    }
                    // INCAP_SITE_GROUPS[$('#incap_site_group_name').val().trim()] = incap_selSites; 
                    // localStorage.setItem('INCAP_SITE_GROUPS',JSON.stringify(INCAP_SITE_GROUPS));
                    if (saveasnew) {
                        $.gritter.add({ title: 'Saved', text: "Saving group '"+$('#incap_site_group_name').val().trim()+"' as new group."});
                    } else {
                        $.gritter.add({ title: 'Saved', text: "Updating the existing group '"+$('#incap_site_group_name').val().trim()+"'."});
                    }
                    $("#avail_incap_group_sites").html('<option value="">loading...</option>');
                    $.gritter.add({ title: 'PROCESSING', text: "Loading Data Center IDs for all selected sites."});
                    incap_selSites.curIndex=0;
                    loadSiteGroupDataCenters();
                    renderMigrationToolbar_action();
                }
            } else {
                $.gritter.add({ title: 'ERROR', text: "A group with this name '"+$('#incap_site_group_name').val().trim()+"' already exists."});	        
            }
        } else {
            $.gritter.add({ title: 'No Sites Selected', text: "Please add sites to this group."});	
        }    
    } else {
        $.gritter.add({ title: 'No Group Name', text: "Please enter a valid group name."});	
    }
}

function loadSiteGroupDataCenters(){
    if (incap_selSites.index[incap_selSites.curIndex]!=undefined){
        var siteObj = incap_selSites.members[incap_selSites.index[incap_selSites.curIndex]];
        postDataObj = { "site_id":siteObj.site_id }
        makeIncapCall(getSwHost("cwaf_api_v1")+'/api/prov/v1/sites/dataCenters/list', null, postDataObj, 'POST',loadSiteGroupDataCentersResponse,'set',"application/x-www-form-urlencoded");
    } else {
        INCAP_SITE_GROUPS[$('#incap_site_group_name').val().trim()] = incap_selSites; 
        localStorage.setItem('INCAP_SITE_GROUPS',JSON.stringify(INCAP_SITE_GROUPS));
        renderIncapSiteGroups();
    }
}

function loadSiteGroupDataCentersResponse(response){
    var siteObj = incap_selSites.members[incap_selSites.index[incap_selSites.curIndex]];
    if (siteObj.DCs==undefined) siteObj.DCs = {};
    $.each(response.DCs, function(i,DCObj) { if (DCObj.contentOnly=="true") { siteObj.DCs[DCObj.id] = DCObj.name; } });
    incap_selSites.curIndex++;
    loadSiteGroupDataCenters(); 
}

function set_incapDeleteSiteGroup(){
	if (confirm('Are you sure you want delete the site group ('+$('#incap_site_group_name').val()+') from this tool?')) {
        INCAP_SITE_GROUPS = JSON.parse(localStorage.getItem('INCAP_SITE_GROUPS'));
        if (INCAP_SITE_GROUPS[$('#incap_site_group_name').val()]!=undefined) {
			delete INCAP_SITE_GROUPS[$('#incap_site_group_name').val()];
			localStorage.setItem('INCAP_SITE_GROUPS',JSON.stringify(INCAP_SITE_GROUPS));
            renderIncapSiteGroups();
            renderMigrationToolbar_action();
		} else {
			$.gritter.add({ title: 'Group not found', text: "Group name "+$('#incap_site_group_name').val()+" is currently not stored locally."});	
		}
	}
}

/* End Manage Incapsula Site Groups */