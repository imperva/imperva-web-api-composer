<!DOCTYPE html> 
<html>
<head>
<meta http-equiv="content-type" content="text/html; charset=UTF-8">
<title>Imperva API Tools</title>
<link rel="shortcut icon" type="image/ico" href="/images/favicon.ico" />
<link type="text/css" href="js/jquery-ui/css/black-tie/jquery-ui-1.8.17.custom.css" rel="stylesheet" />	
<link type="text/css" href="js/jquery-ui/css/datatables.min.css" rel="stylesheet" />	
<link type="text/css" href="js/jquery-ui/css/gritter/jquery.gritter.css" rel="stylesheet" />	
<script src="js/jquery-ui/js/jquery-1.7.1.min.js"></script>
<script src="js/jquery-ui/js/jquery-ui-1.8.17.custom.min.js"></script>
<script src="js/jquery-ui/plugins/jquery.csv.js"></script>
<script src="js/jquery-ui/plugins/jquery.gritter.js"></script>
<script src="js/jquery-ui/plugins/datatables.min.js"></script>
<link type="text/css" href="css/common.css" rel="stylesheet" />	
<script src="js/settings.js"></script>
<!--script src="auth.js"></script-->
<script src="js/countries.js"></script>
<script src="js/common.js"></script>
<script src="js/incap/incap_jsondata.js"></script>
<script src="js/incap/incap_ruleFilters.js"></script>
<script src="js/incap/incap_settings_users.js"></script>
<script src="js/incap/incap_settings_userGroups.js"></script>
<script src="js/incap/incap_settings_policies.js"></script>
<script src="js/incap/incap_settings_policyGroups.js"></script>
<script src="js/incap/incap_settings_ACLs.js"></script>
<script src="js/incap/incap_settings_ACLGroups.js"></script>
<script src="js/incap/incap_settings_siteGroups.js"></script>
<script src="js/incap/incap_migrationTools.js"></script>
<script src="js/incap/incap_common.js"></script>
<script src="js/incap/incap_sites.js"></script>
<script src="js/ss/ss_default_ADC_policies.js"></script>
<script src="js/ss/ss_jsondata.js"></script>
<script src="js/ss/ss_common.js"></script>
<script src="js/ss/ss_policyMigration.js"></script>
<script>
$.extend($.gritter.options, {
	//class_name: 'gritter-light', // for light notifications (can be added directly to $.gritter.add too)
	position: 'top-right', // possibilities: bottom-left, bottom-right, top-left, top-right
	fade_in_speed: 100, // how fast notifications fade in (string or int)
	fade_out_speed: 100, // how fast the notices fade out
	time: 2000 // hang on the screen for...
});
</script>
<style>
</style>
</head>
<body>
	<div id="wrapper">
		<div id="header" class="ui-widget">
			<div id="logo" class="ui-corner-all dropshadow"></div>
		</div>
		<div id="contentWrapper" class="ui-widget">
			<div class="ui-widget-header ui-corner-top">
				<h1>Imperva Web API Composer</h1>
			</div>
			<div id="mainNav" class="ui-widget-content content">
				<ul>
					<li><a id="SecureSphereAPIBtn" href="#SecureSphereAPI">SecureSphere API Client</a></li>
					<!--li><a id="SecureSpherePolicyBtn" href="#SecureSpherePolicy">SecureSphere Policy Migration</a></li-->
					<li><a id="IncapsulaAPIBtn" href="#IncapsulaAPI">Incapsula API Client</a></li>
					<li><a id="incapsitesBtn" href="#incapsites">Incapsula Sites</a></li>
					<li><a id="migrationToolsBtn" href="#migrationTools">Migration Tools</a></li>
					<li><a id="settingsBtn" href="#settings">Settings</a></li>
				</ul>
				<div id="SecureSphereAPI">
					<table>
						<tr>
							<td></td>
							<td valign="top">
								<div id="logoutDiv" style="float:right;"><span id="curUser"></span>	
									<input id="logout" value="logout" onclick="window.location.reload();" type="submit" /></div>
								<input id="SSlogin" value="login" onclick="login()" type="submit" style="float:right;"/>
								<input id="SSexecute" value="execute call" onclick="makeSSCall()" type="submit" /> 
								<!--input id="loadSiteTreeData" value="Load Site Tree Data" onclick="loadSites()" type="submit" /--> 
							</td>
						<tr>
							<td valign="top" style="padding: 0px 10px 0px 0px;">
								<fieldset>
									<legend>API Request Configs</legend>
									<table class="tableColL">
										<tr id="jsessionidtr"><td align="right"><label for="jsessionid">JSESSIONID: </label></td>
										  <td><input id="jsessionid" style="width: 200px;" value="" type="text" readonly />
										  </td></tr>
										<tr><td align="right"><label for="MXServers">MX Servers: </label></td>
										  <td><select id="MXServers"></select></td></tr>
										<tr>
										<tr><td align="right"><label for="MX_display_name">MX Display Name: </label></td>
										  <td><input id="MX_display_name" style="width: 200px;" placeholder="Your MX Name" value="" type="text" /></td></tr>
										<tr>
										<tr><td align="right"><label for="MXServer">MX Server: </label></td>
										  <td><input id="MXServer" style="width: 200px;" placeholder="https://192.168.1.2:8083" value="" type="text" /></td></tr>
										<tr>
										  <td align="right" style="border: 1px solid red;">
											<label for="SSActions">Action: </label>
										  </td>
										  <td>
											<select name="SSActions" id="SSActions">
												<option value="/v1/auth/session">/v1/auth/session</option>
											</select></td>
										</tr>
										<tr>
										  <td align="right" style="border: 1px solid red;"><label for="SSmethod">Method: </label></td>
										  <td>
											<select id="SSmethod">
												<option value="POST">POST</option>
												<option value="GET">GET</option>
												<option value="PUT">PUT</option>
												<option value="DELETE">DELETE</option>
											</select>
										  </td>
										</tr>
										<tr>
										   <td align="right">
											 <label for="contentType">Content-Type</label>
										   </td>
										   <td>
												<select id="SScontentType">
													<option selected="selected">application/json</option>
													<!--option>application/x-www-form-urlencoded</option-->
													<!--option>application/csv</option-->
												</select>
										   </td>
										</tr>
										<tr><td align="right"></td>
											<td><a href="javascript:toggleSSManageCredentials();" id="manageSSCredentialsBtn">+ <span>Manage MX API Credentials</span></a>
												<div id="manageSSCredentials">
													<input id="ssSaveCredentials" value="Save this MX and API user" type="submit" title="Add these credentials to the list for reuse" /><br />
													<input id="ssDeleteCredentials" value="Delete this MX and API user" type="submit" title="Remove these credentials by Account ID from the list" /><br />
												</div>
											</td>
										</tr>
									</table>
								</fieldset>
								<fieldset id="SSURLparams">
									<legend>URL Request Parameters</legend>
									<table class="tableColL">
										<!--tr id="siteNametr" class="fieldwrapper"><td align="right"><label for="siteName">Site Name: </label></td>
										  <td><a href="javascript:void(0)" class="ui-icon ui-icon-copy" id="siteName_btn" title="Copy to Request URL">copy</a>
										  <select name="siteName" id="siteName" class="min"><option value="">select</option></select></td></tr-->
									</table>
								</fieldset>
								<fieldset id="SSJSONparams">
									<legend>JSON Request Parameters</legend>
									<table class="tableColL">
										<tr id="SSusernametr" class="fieldwrapper"><td align="right"><label for="SSusername">Username: </label></td>
											<td><input type="text" class="text" name="SSusername" id="SSusername" value="" /></td></tr>
										<tr id="SSpasswordtr" class="fieldwrapper"><td align="right"><label for="SSpassword">Password: </label></td>
											<td><input type="password" class="text" name="SSpassword" id="SSpassword" value="" /></td></tr>
									</table>
								</fieldset>
							</td>
							<td valign="top">
								<label for="SSrequestUrl">Request URL: </label><br clear="all" />
								<textarea id="SSrequestUrl" name="SSrequestUrl"></textarea><br clear="all" /><br />
								<label for="SSdata">Request Data: </label><span id="SSrequestUrlSpan"></span><br clear="all" />
								<textarea id="SSdata" style="resize: vertical;"></textarea><br clear="all" /><br clear="all" />
								<label for="SScurlUrl">CURL Request: </label><br clear="all" />
								<textarea id="SScurlUrl" style="resize: vertical;"></textarea><br clear="all" />
								<a style="float: right;" href="assets/CURL_API_Samples_SecureSphere.zip" target="_blank">Download SecureSphere CURL Samples</a><br clear="all" />
								<label for="SSresult">Response:</label><br clear="all" />
								<textarea id="SSresult" style="resize: vertical;"></textarea><br clear="all" /><br />
								<a href="http://jsonformatter.curiousconcept.com/" target="_blank">JSON Formatter</a>
							</td>
							<td valign="top" style="padding: 0px 10px 0px 20px;">
								<fieldset id="SSPolicyMigration">
									<legend>WAF Security Policy Migration to Incapsula</legend>
									<a href="javascript:void(0);" class="button" id="ss_policies_refresh">Refresh Policies</a><br clear="all" />
									<table>
										<tr>
											<td valign="top">
												<label for="SSWAFPolicies_src">Source Security Policies:</label><br clear="all" />
												<select multiple="multiple" class="multiPolicy" id="SSWAFPolicies_src" name="SSWAFPolicies_src[]" title="Double-click a policy name to see the configuration">
													<!--option selected="selected" label="All" value="">All</option>
													<optgroup label="All" class="fruit">
														<option label="apple" value="1">Apple</option>
														<option label="pear" value="2">Pear</option>
														<option label="orange" value="3">Orange</option>
													</optgroup>
													<optgroup label="" class="berries">
														<option label="strawberry" value="4">Strawberry</option>
														<option label="raspberry" value="5">Raspberry</option>
														<option label="blueberry" value="6">Blueberry</option>
													</optgroup-->
												</select>
											</td>
											<td valign="center">
												<a href="javascript:void(0);" id="moveSSPolicyRight" class="aarowBtn" title="Move right" onclick="moveSSPolicyRight()">▶️</a><br />
												<a href="javascript:void(0);" id="moveSSPolicyLeft" class="aarowBtn"  title="Move left" onclick="moveSSPolicyLeft()">◀️</a>
											</td>
											<td valign="top">
												<label for="SSWAFPolicies_dest">Migrate to Incapsula:</label><br clear="all" />
												<select title="SS WAF Security Policies" multiple="multiple" class="multiPolicy" id="SSWAFPolicies_dest" name="SSWAFPolicies_dest[]"></select>

											</td>
										</tr>
										<tr>
											<td><span>Show Default ADC Policies: </span><input  id="toggleADCPoliciesSS" name="toggleADCPoliciesSS" onclick="renderPolicyOptions('SSWAFPolicies_src',allSSWAFPolicies_src);" type="checkbox" disabled="disabled" /></td>
											<td></td>
											<td><a href="assets/policy_predicate_mapping.xlsx">See Policy Mapping</a></td>
										</tr>
									</table><br clear="all" />
									<input id="migrateSSPoliciesSave_btn" class="btn" title="Convert and Save" value="Convert and Save" onclick="convertSSAndSavePolicies()" type="submit" disabled="disabled" />
									<input id="migrateSSPoliciesCURL_btn" class="btn" title="Convert to CURL" value="Convert to CURL" onclick="migrateSSPoliciesToCURL()" type="submit" disabled="disabled" />
								</fieldset>
							</td>
						</tr>
					</table><br clear="all" />
				</div>
				<!--div id="SecureSpherePolicy">
					
				</div-->
				<div id="IncapsulaAPI">
					<table>
						<tr>
							<td></td>
							<td valign="top">
								<input id="execute" value="execute call" type="submit" /> 
							</td>
						<tr>
							<td valign="top" style="padding: 0px 10px 0px 0px;">
								<fieldset>
									<legend>Request Configs</legend>
									<table class="tableColL">
										<tr id="incapAccountsListtr">
											<td align="right"><label for="incapAccountsList">API ID: </label></td>
											<td><select name="incapAccountsList" class="incap_account_select" id="incapAccountsList"></select></td>
										</tr>
										<tr id="incapAccountIDListtr">
											<td align="right"><label for="incapAccountIDList">Account ID: </label></td>
											<td><select name="incapAccountIDList" class="incap_account_ID_select" id="incapAccountIDList"></select></td>
										</tr>
										<!--tr id="user_nametr"><td align="right"><label for="user_name">Display Name: </label></td>
											<td><input id="user_name" class="incap_account_input" style="width: 200px;" value="" type="text" /></td></tr>
										<tr id="account_idtr"><td align="right"><label for="account_id">Account ID: </label></td>
											<td><select name="account_id" class="incap_account_select" id="account_id"></select></td></tr>
										<tr id="api_idtr"><td align="right"><label for="api_id">API ID: </label></td>
											<td><input id="api_id" style="width: 200px;" value="" type="text" /></td></tr>
										<tr id="api_keytr"><td align="right"><label for="api_key">API Key: </label></td>
											<td><input id="api_key" style="width: 200px;" value="" type="password" /></td></tr>
									</table>
								</fieldset>
								<fieldset>
									<legend>Request Configs</legend>
									<table class="tableColL"-->
										<tr><td align="right"><label for="incapServer">Server: </label></td>
										  <td><input id="incapServer" style="width: 200px;" value="" type="text" readonly="readonly" /></td></tr>
										<tr>
										  <td align="right" style="border: 1px solid red;">
											<label for="incapActions">Action: </label>
										  </td>
										  <td>
										  	<select name="incapActions" id="incapActions"></select></td>
										</tr>
										<tr>
										  <td align="right" style="border: 1px solid red;"><label for="incapMethod">Method: </label></td>
										  <td>
											<select id="incapMethod">
												<option value="POST">POST</option>
												<!--option value="GET">GET</option>
												<option value="PUT">PUT</option>
												<option value="DELETE">DELETE</option-->
											</select>
										  </td>
										</tr>
										<tr>
										   <td align="right">
											 <label for="contentType">Content-Type</label>
										   </td>
										   <td>
												<select id="contentType">
													<option selected="selected">application/json</option>
													<!--option>application/x-www-form-urlencoded</option-->
													<!--option>application/csv</option-->
												</select>
										   </td>
										</tr>
									</table>
								</fieldset>
								<fieldset id="incapSampleRulesFS">
									<legend>Sample Rules</legend>
									<table class="tableColL">
										<tr id="incapSampleRulestr" class="fieldwrapper"><td align="right"><label for="incapSampleRules"><span class="info" title="Select a sample rule from a commonly used list"> </span>Sample Rules: </label></td>
										  <td><select name="incapSampleRules" id="incapSampleRules" class="min"><option value="">-- select --</option></select></td>
										</tr>
									</table>
								</fieldset>
								<fieldset id="incapJSONparams">
									<legend>JSON Request Parameters</legend>
									<table class="tableColL"></table>
								</fieldset>
							</td>
							<td valign="top">
								<label for="incaprequestUrl">Request URL: </label><br clear="all" />
								<textarea id="incapRequestUrl" style="height: 40px;" name="incapRequestUrl"></textarea><br clear="all" /><br />
								<span style="float: right;">
									<label for="incap_configMaskSecretKey">Mask secret key: </label>
									<input id="incap_configMaskSecretKey" type="checkbox" checked="checked" value="maskSecretKey" />
								</span>
								<label for="incapData">Request Data: </label><span id="incaprequestdataspan"></span><br clear="all" />
								<textarea id="incapData" style="height: 60px;" ></textarea><br clear="all" /><br clear="all" />
								<label for="incapCurlExample">CURL Example: </label><span id="incapcurlexamplespan"></span><br clear="all" />
								<textarea id="incapCurlExample" style="height: 60px;"></textarea><br clear="all" />
								<a style="float: right;" href="assets/CURL_API_Samples_Incapsula.zip" target="_blank">Download Incapsula CURL Samples</a><br clear="all" />
								<label for="incapResult">Response:</label><br clear="all" />
								<textarea id="incapResult"></textarea><br clear="all" /><br />
								<a href="https://my.incapsula.com/api/docs/v1" target="_blank">Incapsula API Documentation</a><br />
								<a href="http://jsonformatter.curiousconcept.com/" target="_blank">JSON Formatter</a>
							</td>
						</tr>
					</table><br clear="all" />
				</div>
				<div id="incapsites">
					<a href="javascript:void(0);" class="button" id="incap_sites_refresh">Refresh Sites</a>
					<table><tr>
						<td>
							<label for="incapSitesAccountsList">API ID:</label>
							<select name="incapSitesAccountsList" class="incap_account_select" id="incapSitesAccountsList"></select>
						</td>
						<td id="incapSitesAccountIDListTd">
							<label for="incapSitesAccountIDList">Account ID:</label>
							<select name="incapSitesAccountIDList" class="incap_account_ID_select" id="incapSitesAccountIDList"></select>
						</td>
						<td id="incapSitesPageNumTd">
							<label for="incapSitesPageNum">Sites by page: </label>
							<select name="incapSitesPageNum" id="incapSitesPageNum" class="page_num"></select>
							<input name="incapSitesPageSize" id="incapSitesPageSize" class="page_size" type="hidden" value="100" />
						</td>
					</tr></table><br clear="all" />
					<div id="sitesContent"></div>
				</div>
				<div id="migrationTools">
					<div class="ui-widget-header ui-corner-top">
						<!--a href="javascript:void(0);" style="margin: 3px 15px 0px 0px;" class="button" id="removeCurlComments">Remove Comments</a-->
						<div id="migrationToolsButtons">
							<a href="javascript:void(0);" style="margin: 3px 15px 0px 0px;" class="button" id="runMigration">Run</a>
							<a href="javascript:void(0);" style="margin: 3px 15px 0px 0px;" class="button" id="clearEventLog">Clear Log</a>
						</div>
						<div class="formbox2">
							<table class="tableColL">
								<tr>
									<td align="right"><label class="header" for="incap_migrationConfigType">Action: Migrate </label></td>
									<td>
										<select class="auto" name="incap_migrationConfigType" id="incap_migrationConfigType">
											<option value="INCAP_POLICY_TEMPLATES">Individual Policy</option>
											<option value="INCAP_POLICY_GROUPS">Policy Group</option>
											<option value="INCAP_ACL_WAF_TEMPLATES">Individual Security/WAF Rule</option>
											<option value="INCAP_ACL_WAF_GROUPS">Security/WAF Rule Group</option>
										</select>
									</td><td> to </td>
									<!--td align="right"><label class="header" for="incap_migrationAction">Migration Action: </label></td-->
									<td>
										<select class="auto" name="incap_migrationActionType" id="incap_migrationActionType">
											<option value="INCAP_SITES">To Individual Site</option>
											<option value="INCAP_SITE_GROUPS">To Bulk Site Group</option>
											<option value="INCAP_USERS" disabled="disabled">To User/Account (All Sites)</option>
											<option value="INCAP_USER_GROUPS" disabled="disabled">To User/Account Group (All Sites)</option>
										</select>
									</td>
								</tr>
							</table>
						</div><br clear="all" />
					</div>
					<div class="ui-widget-content ui-corner-bottom" style="padding: 0px 15px 0px 15px;">
						<fieldset style="padding: 0px 5px 10px 15px;">
							<legend>Migration Options</legend>
							<div style="float: right;">
								<label class="header" for="incap_migrationConfigMaskSecretKey">Mask secret key in event logs: </label>
								<input id="incap_migrationConfigMaskSecretKey" type="checkbox" checked="checked" value="maskSecretKey" />
							</div><br clear="all" />
							<table id="incap_migrationToolbar_config"></table>
							<table id="incap_migrationToolbar_action"></table>
							<div id="incap_migrationPolicyRuleConfigDiv"></div>
						</fieldset>
						<div class="col">
							<div style="float: right; padding: 0px 15px 0px 0px;">
								<label class="header" for="incap_tailEventLogs">Tail logs: </label>
								<input id="incap_tailEventLogs" type="checkbox" checked="checked" value="incap_tailEventLogs" />
							</div>
							<label for="incap_eventLogs">Event Logs: </label>
							<div contentEditable="true" style="width: 99%; height: 400px; margin: 5px 0px 10px 0px;" id="incap_eventLogs" class="textarea"></div>
						</div>
					</div>
				</div>
				<div id="settings">
					<div id="settingsNav">
						<table>
							<tr valign="top">
								<td style="width: 13em;">		
									<ul>
										<li><span>Incapsula</span></li>
										<li><a href="#incap_users" title="Manage Incapsula Users">Users</a></li>
										<li><a href="#incap_user_groups" title="Manage Incapsula User Groups">User Groups</a></li>
										<li><a href="#incap_policies" title="Manage Incapsula Policies">Policies</a></li>
										<li><a href="#incap_policy_groups" title="Manage Incapsula Policy Groups">Policy Groups</a></li>
										<li><a href="#incap_ACL_WAF_rules" title="Manage Incapsula Security and WAF Rules">Security/WAF Rules</a></li>
										<li><a href="#incap_ACL_WAF_groups" title="Manage Incapsula Security and WAF Rule Groups">Security/WAF Groups</a></li>
										<li><a href="#incap_site_groups" title="Manage Incapsula Bulk Site Groups">Bulk Site Groups</a></li>
										<!--li><span>SecureSphere</span></li>
										<li><a href="#ss_policy_groups" title="Manage SecureSphere Policy Groups">Policy Groups</a></li-->
									</ul>
								</td>
								<td>
									<div id="incap_users">
										<fieldset>
											<legend>Manage Incapsula Users</legend>
											<table id="incap_users_tbl">
												<thead><tr><th>Username</th><th>Account ID</th><th>API ID</th><th>API KEY</th><th><a id="incap_add_new_user" style="padding:0px;" title="Add new Incapsula API user" class="ui-icon ui-icon-plusthick"></a></th></tr></thead>
												<tbody></tbody>
											</table>
										</fieldset>
									</div>
									<div id="incap_user_groups">
										<fieldset>
											<legend>Manage Incapsula API User Groups</legend>
											<table id="incap_user_groups_tbl">
												<tr>
													<td colspan="3">
														<label for="incap_user_groups_list">Incapsula API User Groups: </label>
														<select name="incap_user_groups_list" id="incap_user_groups_list">
														</select>
													</td>
												</tr>
												<tr><td colspan="3"><hr /></td></tr>
												<tr>
													<td colspan="3"><label for="incap_user_group_name">API User Group Name: </label>
													<input name="incap_user_group_name" id="incap_user_group_name" type="text" /><br /></td>
												</tr>
												<tr>
													<td>
														<label for="avail_incap_group_users">Available Incapsula API Users</label>
														<select multiple class="multi" id="avail_incap_group_users" name="avail_incap_group_users"></select>
													</td>
													<td valign="center" align="center">
														<a href="javascript:void(0);" id="moveIncapUserGroupMemberRight" class="aarowBtn" title="Move right" onclick="moveIncapUserGroupMemberRight()">▶️</a><br />
														<a href="javascript:void(0);" id="moveIncapUserGroupMemberLeft" class="aarowBtn"  title="Move left" onclick="moveIncapUserGroupMemberLeft()">◀️</a>
													</td>
													<td>
														<label for="selected_incap_group_users">API Users in Group</label>
														<select multiple class="multi" id="selected_incap_group_users" name="selected_incap_group_users"></textarea>
													</td>
												</tr>
												<tr>
													<td colspan="3">
														<div id="incap_user_group_btns"></div>
													</td>
												</tr>
											</table>
										</fieldset>
									</div>
									<div id="incap_policies">
										<fieldset>
											<legend>Manage Incapsula Policies</legend>
											<table id="incap_policies_tbl" class="top">
												<thead>
													<tr>
														<th class="nobr">Policy Name</th>
														<th class="nobr">Policy Type</th>
														<th class="nobr">Definition (JSON)</th>
														<th class="nobr"><!--a id="incap_add_new_policy" title="Add new Incapsula policy" class="ui-icon ui-icon-plusthick"></a--></th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</fieldset>
									</div>
									<div id="incap_policy_groups">
										<fieldset>
											<legend>Manage Incapsula Policy Template Groups</legend>
											<table id="incap_policy_groups_tbl">
												<tr>
													<td colspan="3">
														<label for="incap_policy_groups_list">Incapsula Policy Template Groups: </label>
														<select name="incap_policy_groups_list" id="incap_policy_groups_list"></select>
													</td>
												</tr>
												<tr><td colspan="3"><hr /></td></tr>
												<tr>
													<td colspan="3"><label for="incap_policy_group_name">Policy Template Group Name: </label>
													<input name="incap_policy_group_name" id="incap_policy_group_name" type="text" /><br /></td>
												</tr>
												<tr>
													<td>
														<label for="avail_incap_group_policies">Available Incapsula Policy Templates</label>
														<select multiple class="multi" id="avail_incap_group_policies" name="avail_incap_group_policies"></select>
													</td>
													<td valign="center" align="center">
														<a href="javascript:void(0);" id="moveIncapPolicyGroupMemberRight" class="aarowBtn" title="Move right" onclick="moveIncapPolicyGroupMemberRight()">▶️</a><br />
														<a href="javascript:void(0);" id="moveIncapPolicyGroupMemberLeft" class="aarowBtn"  title="Move left" onclick="moveIncapPolicyGroupMemberLeft()">◀️</a>
													</td>
													<td>
														<label for="selected_incap_group_policies">Policy Templates in Group</label>
														<select multiple class="multi" id="selected_incap_group_policies" name="selected_incap_group_policies"></textarea>
													</td>
												</tr>
												<tr>
													<td colspan="3">
														<div id="incap_policy_group_btns"></div>
													</td>
												</tr>
											</table>
										</fieldset>
									</div>
									<div id="incap_ACL_WAF_rules">
										<fieldset>
											<legend>Manage Incapsula Security/WAF Rules</legend>
											<table id="incap_ACL_WAF_rule_tbl" class="top">
												<thead>
													<tr>
														<th class="nobr">Rule Name (Index ID)</th>
														<th class="nobr">Rule Type (rule_id)</th>
														<th class="nobr">Definition (JSON)</th>
														<th class="nobr"><!--a id="incap_add_new_ACL" title="Add new Incapsula ACL" class="ui-icon ui-icon-plusthick"></a--></th>
													</tr>
												</thead>
												<tbody></tbody>
											</table>
										</fieldset>
									</div>
									<div id="incap_ACL_WAF_groups">
										<fieldset>
											<legend>Manage Incapsula Security/WAF Rule Groups</legend>
											<table>
												<tr>
													<td><label for="incap_ACL_WAF_groups_list">Incapsula Security/WAF Groups: </label></td>
													<td><select name="incap_ACL_WAF_groups_list" id="incap_ACL_WAF_groups_list"></select></td>
												</tr>
												<tr><td colspan="2"><hr /></td></tr>
												<tr>
													<td><label for="incap_ACL_WAF_group_name">Security/WAF Group Name: </label></td>
													<td><input name="incap_ACL_WAF_group_name" id="incap_ACL_WAF_group_name" type="text" /></td>
												</tr>
											</table>
											<table id="incap_ACL_WAF_groups_tbl">
											</table>
										</fieldset>
									</div>
									<div id="incap_site_groups">
										<fieldset>
											<legend>Manage Incapsula Bulk Site Groups</legend>
											<table id="incap_site_groups_tbl">
												<tr>
													<td colspan="3">
														<label for="incap_site_groups_list">Incapsula Bulk Site Groups: </label>
														<select name="incap_site_groups_list" id="incap_site_groups_list">
														</select>
													</td>
												</tr>
												<tr><td colspan="3"><hr /></td></tr>
												<tr>
													<td colspan="3"><label for="incap_site_group_name">Bulk Site Group Name: </label>
													<input name="incap_site_group_name" id="incap_site_group_name" type="text" /><br /></td>
												</tr>
												<tr>
													<td>
														<label for="avail_incap_group_sites">Available Incapsula sites</label>
														<select multiple class="multi" id="avail_incap_group_sites" name="avail_incap_group_sites"></select>
													</td>
													<td valign="center" align="center">
														<a href="javascript:void(0);" id="moveIncapSiteGroupMemberRight" class="aarowBtn" title="Move right">▶️</a><br />
														<a href="javascript:void(0);" id="moveIncapSiteGroupMemberLeft" class="aarowBtn"  title="Move left">◀️</a>
													</td>
													<td>
														<label for="selected_incap_group_sites">Sites in Group</label>
														<select multiple class="multi" id="selected_incap_group_sites" name="selected_incap_group_sites"></textarea>
													</td>
												</tr>
												<tr>
													<td colspan="3" class="group_site_settings">
														<label for="incap_site_group_account_list">Load Sites from: </label>
														<select name="incap_site_group_account_list" class="incap_account_select" id="incap_site_group_account_list" type="text"></select>
													</td>
												</tr>
												<tr>
													<td colspan="3" class="group_site_settings">
														<label for="incap_site_group_account_ID_list">From Account: </label>
														<select name="incap_site_group_account_ID_list" class="incap_account_ID_select" id="incap_site_group_account_ID_list" type="text"></select>
													</td>
												</tr>
												<tr>
													<td colspan="3" class="group_site_settings">
														<label for="incap_site_group_page_num">Sites by page: </label>
														<select name="incap_site_group_page_num" id="incap_site_group_page_num" class="page_num"></select>
														<input name="incap_site_group_page_size" id="incap_site_group_page_size" class="page_size" type="hidden" value="100" />
													</td>
												</tr>
												<tr>
													<td colspan="3">
														<div id="incap_site_group_btns"></div>
													</td>
												</tr>
											</table>
										</fieldset>
									</div>
									<!--div id="ss_policy_groups">
										<h2>Manage SecureSphere Policy Groups</h2>
										<p>Mauris eleifend est et turpis. Duis id erat. Suspendisse potenti. Aliquam vulputate, pede vel vehicula accumsan, mi neque rutrum erat, eu congue orci lorem eget lorem. Vestibulum non ante. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce sodales. Quisque eu urna vel enim commodo pellentesque. Praesent eu risus hendrerit ligula tempus pretium. Curabitur lorem enim, pretium nec, feugiat nec, luctus a, lacus.</p>
										<p>Duis cursus. Maecenas ligula eros, blandit nec, pharetra at, semper at, magna. Nullam ac lacus. Nulla facilisi. Praesent viverra justo vitae neque. Praesent blandit adipiscing velit. Suspendisse potenti. Donec mattis, pede vel pharetra blandit, magna ligula faucibus eros, id euismod lacus dolor eget odio. Nam scelerisque. Donec non libero sed nulla mattis commodo. Ut sagittis. Donec nisi lectus, feugiat porttitor, tempor ac, tempor vitae, pede. Aenean vehicula velit eu tellus interdum rutrum. Maecenas commodo. Pellentesque nec elit. Fusce in lacus. Vivamus a libero vitae lectus hendrerit hendrerit.</p>
									</div-->
								</td>
							</tr>
						</table>
					</div>
				</div>
				<div class="ui-widget-content ui-corner-bottom footer">
					<p>Copyright ©<?=date("Y")?> Imperva. All Rights Reserved.  <a href="#">Privacy &amp; Legal</a></p>
				</div>
			</div>
			<div id="footer">
			</div>
		</div>
	</div>
	<div id="filterDialog">
		<table>
			<thead><tr><th>if</th><th>operator</th><th>value</th><th></th></tr></thead>
			<tbody>
				<tr>
					<td><input type="text" class="text listInput" id="filterDialog_allowedFilters" name="filterDialog_allowedFilters"></td>
					<td>
						<select id="filterDialog_allowedOperators" name="filterDialog_allowedOperators">
							<option value="&lt;=">&lt;=</option>
							<option value="&lt;">&lt;</option>
							<option value="==">==</option>
							<option value="!=">!=</option>
							<option value="&gt;=">&gt;</option>
							<option value="&gt;=">&gt;=</option>
						</select>
					</td>
					<td><input type="text" class="text" id="filterDialog_value" style="width: 290px;" name="APITestingBtnvalue" /></td>
					<td><a href="javascript:void(0);" class="button" id="APITestingBtn_AddBtn">Add</a></td>
				</tr>
				<tr>
					<td colspan="4">
						<p id="filterDialogSample"></p>
						<textarea name="filterDialog_editor" id="filterDialog_editor" style="width: 620px"></textarea><br clear="all" />
						<p>See <a href="https://docs.incapsula.com/Content/IncapRules/syntax-guide.htm">Incapsula Documentation Syntax Guide</a>.</p>
						<p>Your filter must follow the <a onclick="toggleSyntaxGuidlines()" href="javascript:void(0);">rules filter syntax</a>.</p>
						<div id="filterGuidlines" style="display: none;"> 
							<h4>Syntax Guidlines</h4><hr />
							<div class="modal-body">
							<table>
								<thead>
									<tr><th>Operator</th><th>Syntax</th><th>Example</th></tr>
								</thead>
								<tbody>
									<tr>
										<td>AND</td>
										<td><code>&amp;</code></td>
										<td><code><span>URL</span> <span class="cm-operator">==</span> <span class="cm-string">"/admin"</span> <span class="cm-boolean-operator">&amp;</span> <span class="cm-filter">CountryCode</span> <span class="cm-operator">==</span> <span class="cm-string">GB</span> </code></td>
									</tr>
									<tr>
										<td>OR</td>
										<td class="text-center"><code>|</code></td>
										<td> <code> <span class="cm-filter">ClientIP</span> <span class="cm-operator">==</span> <span class="cm-string">192.168.1.1</span> <span class="cm-boolean-operator">&amp;</span> <span class="cm-bracket">(</span> <span class="cm-filter">URL</span> <span class="cm-operator">==</span> <span class="cm-string">"/admin"</span> <span class="cm-operator">|</span> <span class="cm-filter">QueryString</span> <span class="cm-operator">!=</span> <span class="cm-string">"s=search"</span> <span class="cm-bracket">)</span> </code> </td>
									</tr>
									<tr>
										<td>Multi values</td>
										<td class="text-center"><code>;</code></td>
										<td> <code> <span class="cm-filter">URL</span> <span class="cm-operator">==</span> <span class="cm-string">"/admin"</span> <span class="cm-boolean-operator">;</span> <span class="cm-string">"/home"</span> </code> </td>
									</tr>
									<tr>
										<td>Quote escaping</td>
										<td class="text-center"><code>\"</code></td>
										<td><code> <span class="cm-string">A</span> <span class="cm-boolean-operator">&amp;</span> <span class="cm-string">B</span> <span class="cm-boolean-operator">&amp;</span> <span class="cm-string">(C | D)</span> <span class="cm-boolean-operator">&amp;</span> <span class="cm-string">F</span> <span class="cm-bracket">* Mixed AND/OR operators cannot be enclosed</span> </code> </td>
									</tr>
									<tr>
										<td>Filter logic</td> 
										<td class="text-center"><code>()</code></td> 
										<td> <code> <span class="cm-filter">URL</span> </code> </td> 
									</tr>
								</tbody>
							</table>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</body>
</html>