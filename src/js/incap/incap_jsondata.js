var subAccountLookUpMap = {
	"Reseller":{"url":"/api/prov/v1/accounts/list","attr":"accounts"},
	"Enterprise":{"url":"/api/prov/v1/accounts/listSubAccounts","attr":"resultList"},
	"default":{"url":"/api/prov/v1/accounts/listSubAccounts","attr":"resultList"}
}

incapAPIDefinitions = {
	"Cloud WAF API (v1)":{
		"endpoint":"cwaf-v1-swagger.json",
		"definition":{}
	},
	"Cloud WAF API (v2)":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-application-security/attach/cloud-waf-api.yaml",
		"definition":{}
	},
	"Account Take Over":{
		"endpoint":"https://docs-be.imperva.com/bundle/account-takeover/attach/cloud-ato-api.yaml",
		"definition":{}
	},
	"API Security":{
		"endpoint":"https://docs-be.imperva.com/bundle/api-security/attach/api-security-swagger.yaml",
		"definition":{}
	},
	"Attack Analytics":{
		"endpoint":"https://docs-be.imperva.com/bundle/Attack-Analytics/attach/attack-analytics-api.yaml",
		"definition":{}
	},
	"Audit Trail":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-application-security/attach/audit-trail-api.yaml",
		"definition":{}
	},
	"Policy Management":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-application-security/attach/policies-api.yaml",
		"definition":{}
	},
	"Performance Settings":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-application-security/attach/performance-api.yaml",
		"definition":{}
	},
	"Reputation Intelligence":{
		"endpoint":"https://docs-be.imperva.com/bundle/ip-reputation/attach/reputation-intelligence-api.yaml",
		"definition":{}
	},
	"Role Management":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-application-security/attach/role-management-api.yaml",
		"definition":{}
	},
	"Cloud Data Security":{
		"endpoint":"https://docs-be.imperva.com/bundle/cloud-data-security/attach/b17.yaml",
		"definition":{}
	}
}

incapAPIKeyMap = {
	"cwaf_api_v1":{ "displayName":"Cloud WAF API (v1)" },
	"cwaf_api_v2":{ "displayName":"Cloud WAF API (v2)" },
	"api_security":{ "displayName":"API Security" },
	"ato":{ "displayName":"Account Take Over" },
	"attack_analytics":{ "displayName":"Attack Analytics" },
	"audit_trail":{ "displayName":"Audit Trail" },
	"policy_management":{ "displayName":"Policy Management" },
	"performance_settings":{ "displayName":"Performance Settings" },
	"reputation_intelligence":{ "displayName":"Reputation Intelligence" },
	"role_management":{ "displayName":"Role Management" }
}

var incapGetObjectActionMapping = {
	// must map all params here as a list below as follows:
	// "site_id":{"name":"site_id","type":"list","values":[]},
	"site_id":{
		"definition":"Cloud WAF API (v1)",
		"isParent":true,
		"action":"/api/prov/v1/sites/list",
		"listName":"sites", // objectName, listName
		"id":"site_id",
		"displayText":"domain",
		"children":["dc_id"]
	},
	"dc_id":{
		"definition":"Cloud WAF API (v1)",
		"action":"/api/prov/v1/sites/dataCenters/list",
		"listName":"DCs", // objectName, listName
		"id":"id",
		"displayText":"name",
		"parents":["site_id"]
	},
	"siteId":{
		"definition":"Cloud WAF API (v1)",
		"isParent":true,
		"action":"/api/prov/v1/sites/list",
		"listName":"sites", // objectName, listName
		"id":"site_id",
		"displayText":"domain",
		"children":["apiId","ruleId"]
	},
	"apiId":{
		"definition":"API Security",
		"isParent":true,
		"action":"/api-security",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"siteName",
		"parents":["siteId"]
	},
	"endpointId":{
		"definition":"API Security",
		"action":"/api-security/endpoint/{apiId}",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"path",
		"parents":["apiId"]
	},
	"ruleId":{
		"definition":"Performance Settings",
		"action":"/api/prov/v2/sites/{siteId}/settings/cache/rules",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"path",
		"parents":["siteId"]
	},
	"incidentId":{
		"definition":"Attack Analytics",
		"action":"/analytics/v1/incidents",
		"id":"id",
		"displayText":"main_sentence"
	},
	"assetId":{
		"definition":"Policy Management",
		"action":"/policies/v2/policies",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"name"
	},
	"assetType":{
		"definition":"Policy Management",
		"action":"/policies/v2/policies",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"name"
	},
	"policyId":{
		"definition":"Policy Management",
		"isParent":true,
		"action":"/policies/v2/policies",
		"listName":"value", // objectName, listName
		"id":"id",
		"displayText":"name"
	},
	"accountId":{
		"definition":"Cloud WAF API (v1)",
		"isParent":true,
		"action":"/api/prov/v1/account",
		// "objectName":"account", // objectName, listName
		"id":"account_id",
		"displayText":"account_name"
	},
	"caid":{
		"definition":"Cloud WAF API (v1)",
		"isParent":true,
		"action":"/api/prov/v1/account",
		// "objectName":"account", // objectName, listName
		"id":"account_id",
		"displayText":"account_name"
	}
	
	
	
	/*,
	"rule_id":{"action":"/sites/dataCenters/list","listName":"DCs","id":"id","displayText":"name"},
	"config_id":{"name":"config_id","type":"string","values":""},
	"dc_id":{"name":"dc_id","type":"string","values":""},
	"logs_account_id":{"name":"logs_account_id","type":"int","values":""},
	"parent_id":{"name":"parent_id","type":"int","values":""},
	"plan_id":{"name":"plan_id","type":"string","values":""},
	"ref_id":{"name":"ref_id","type":"string","values":""},*/
}

var timestampParam = {
	"duration":true,
	"from_timestamp":true,
	"to_timestamp":true,
	"start":true,
	"end":true
}

var incapCopyObjectURLMappings = {
	"incap_rules":{"displayText":"Incap Rules","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"ADR_Forward":{"displayText":"ADR Forward","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"ADR_Redirect":{"displayText":"ADR Redirect","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"ADR_Rewrite":{"displayText":"ADR Rewrite","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"Forward":{"displayText":"ADR Forward","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"Redirect":{"displayText":"ADR Redirect","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"Rewrite":{"displayText":"ADR Rewrite","action":"/api/prov/v1/sites/incapRules/add","type":"incap_rules"},
	"login_protect":{"displayText":"Login Protect","action":"/api/prov/v1/sites/lp/configure"},
	"acls":{"displayText":"ACLs","action":"/api/prov/v1/sites/configure/acl","type":"acl"},
	"api.acl.blacklisted_countries":{"displayText":"Visitors from blacklisted Countries","action":"/api/prov/v1/sites/configure/acl","type":"Security/ACL"},
	"api.acl.blacklisted_ips":{"displayText":"Visitors from blacklisted IPs","action":"/api/prov/v1/sites/configure/acl","type":"Security/ACL"},
	"api.acl.whitelisted_ips":{"displayText":"Visitors from whitelisted IPs","action":"/api/prov/v1/sites/configure/acl","type":"Security/ACL"},
	"api.acl.blacklisted_urls":{"displayText":"Visitors from blacklisted URLs","action":"/api/prov/v1/sites/configure/acl","type":"Security/ACL"},
	"api.threats.backdoor":{"displayText":"Backdoor Protect","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.bot_access_control":{"displayText":"Bot Access Control","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.cross_site_scripting":{"displayText":"Cross Site Scripting","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.ddos":{"displayText":"DDOS","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.illegal_resource_access":{"displayText":"Illegal Resource Access","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.remote_file_inclusion":{"displayText":"Remote File Inclusion","action":"/api/prov/v1/sites/configure/security","type":"WAF"},
	"api.threats.sql_injection":{"displayText":"SQL Injection","action":"/api/prov/v1/sites/configure/security","type":"WAF"}
	//"dns":{"displayText":"DNS","action":""},
	/*"ips":{"displayText":"IPs","action":""}
	"original_dns":{"displayText":"IPs","action":""},
	"performance_configuration":{"displayText":"IPs","action":""},
	"res":{"displayText":"IPs","action":""},
	"sealLocation":{"displayText":"IPs","action":""},
	"security":{"displayText":"IPs","action":""},
	"siteDualFactorSettings":{"displayText":"IPs","action":""},
	"ssl":{"displayText":"IPs","action":""},
	"warnings":{"displayText":"IPs","action":""},*/
}

var defaultRuleConfigMapping = {
	"api.acl.blacklisted_countries":{ "rule_id":"api.acl.blacklisted_countries" },
	"api.acl.blacklisted_ips":{ "rule_id":"api.acl.blacklisted_ips" },
	"api.acl.whitelisted_ips":{ "rule_id":"api.acl.whitelisted_ips" },
	"api.acl.blacklisted_urls":{ "rule_id":"api.acl.blacklisted_urls" },
	"api.threats.backdoor":{ "rule_id":"api.threats.backdoor","action":"api.threats.action.quarantine_url" },
	"api.threats.bot_access_control":{ "rule_id":"api.threats.bot_access_control","action":"api.threats.action.block_request" },
	"api.threats.cross_site_scripting":{ "rule_id":"api.threats.cross_site_scripting","action":"api.threats.action.block_request" },
	"api.threats.ddos":{ 
		"rule_id":"api.threats.ddos",
		"action":"api.threats.action.block_request",
		"ddos_traffic_threshold":1000,
		"activation_mode":"api.threats.ddos.activation_mode.auto"
	},
	"api.threats.illegal_resource_access":{ "rule_id":"api.threats.illegal_resource_access","action":"api.threats.action.alert" },
	"api.threats.remote_file_inclusion":{ "rule_id":"api.threats.remote_file_inclusion","action":"api.threats.action.block_request" },
	"api.threats.sql_injection":{ "rule_id":"api.threats.sql_injection","action":"api.threats.action.alert" }	
}

var ACLWAFRuleNameMapping = {
	"Security Rules":{
		"api.acl.blacklisted_countries":"Visitors from blacklisted Countries",
		"api.acl.blacklisted_ips":"Visitors from blacklisted IPs",
		"api.acl.whitelisted_ips":"Visitors from whitelisted IPs",
		"api.acl.blacklisted_urls":"Visitors from blacklisted URLs"
	},
	"WAF Rules":{
		"api.threats.backdoor":"Backdoor Protect",
		"api.threats.bot_access_control":"Bot Access Control",
		"api.threats.cross_site_scripting":"Cross Site Scripting (XSS)",
		"api.threats.ddos":"DDoS",
		"api.threats.illegal_resource_access":"Illegal Resource Access",
		"api.threats.remote_file_inclusion":"Remote File Inclusion",
		"api.threats.sql_injection":"SQL Injection"
	}
}
// Use jsonParamMapping to override or hardcode param values/objects in the event they are not parsed from the WADL/XSD correctly
// obj, array (any structure of nested objects), list (hard-coded set of values displayed in dropdown),listPair {"displayText":"","val":""} multi, string, boolean, int, filter (special case for filter paramater)
var incapJsonParamMapping = {
	"extSiteId":{"description":"Numeric identifier of the account to operate on",
		"type":"string","values":"48295835"},
	"allow_caching":{"description":"",
		"type":"list","values":["","true","false"]},
	"access_key":{"description":"S3 access key.",
		"type":"string","values":""},
	"account_id":{"description":"Numeric identifier of the account to operate on",
		"type":"int","values":""},
	"account_name":{"description":"Account Name",
		"type":"string","values":""},
	"action":{
		"type":"listPair","values":[
			{"displayText":"Redirect (ADR)","val":"RULE_ACTION_REDIRECT"},
			{"displayText":"Rewrite URL (ADR)","val":"RULE_ACTION_REWRITE_URL"},
			{"displayText":"Rewrite Header (ADR)","val":"RULE_ACTION_REWRITE_HEADER"},
			{"displayText":"Rewrite Cookie (ADR)","val":"RULE_ACTION_REWRITE_COOKIE"},
			{"displayText":"Delete Header (ADR)","val":"RULE_ACTION_DELETE_HEADER"},
			{"displayText":"Delete Cookie (ADR)","val":"RULE_ACTION_DELETE_COOKIE"},
			{"displayText":"Forward to Data Center (ADR)","val":"RULE_ACTION_FORWARD_TO_DC"},
			{"displayText":"Alert (IncapRule)","val":"RULE_ACTION_ALERT"},
			{"displayText":"Block Request (IncapRule)","val":"RULE_ACTION_BLOCK"},
			{"displayText":"Block Session (IncapRule)","val":"RULE_ACTION_BLOCK_USER"},
			{"displayText":"Block Ip (IncapRule)","val":"RULE_ACTION_BLOCK_IP"},
			{"displayText":"Require Cookie Support (IncapRule)","val":"RULE_ACTION_RETRY"},
			{"displayText":"Require JavaScript Support (IncapRule)","val":"RULE_ACTION_INTRUSIVE_HTML"},
			{"displayText":"Require CAPCHA Support (IncapRule/ADR)","val":"RULE_ACTION_CAPTCHA"}
		]},
	"activation_mode":{"description":"One of the following: off (security measures are disabled even if site is under a DDoS attack), auto (security measures will be activated automatically when the system suspects site is under a DDoS attack), on (security measures are enabled even if site is not under a DDoS attack). The syntax is as follows: api.threats.ddos.activation_mode.( e.g. for 'off', use 'api.threats.ddos.activation_mode.off' ).",
		"type":"list","values":["","api.threats.ddos.activation_mode.on","api.threats.ddos.activation_mode.off","api.threats.ddos.activation_mode.auto"]},
	"add_missing":{"description":"Add cookie or header if it doesn't exist (Rewrite cookie rule only)",
		"type":"string","values":""},
	"aggressive_cache_duration":{"description":"",
		"type":"string","values":""},
	"allow_all_users":{"description":"",
		"type":"string","values":""},
	"always_cache_resource_duration":{"description":"",
		"type":"string","values":""},
	"always_cache_resource_pattern":{"description":"",
		"type":"string","values":""},
	"always_cache_resource_url":{"description":"",
		"type":"string","values":""},
	"api_id":{"description":"API authentication identifier",
		"type":"int","values":""},
	"api_key":{"description":"API authentication identifier",
		"type":"string","values":""},
	"authentication_methods":{"description":"Comma seperated list of allowed authentication methods sms | email | ga",
		"type":"string","values":"sms,email,ga"},
	"block_bad_bots":{"description":"Whether or not to block bad bots. One of: true, false",
		"type":"list","values":["","true","false"]},
	"bps":{"description":"Number of bits per second.",
		"type":"int","values":""},
	"bucket_name":{"description":"S3 bucket name.",
		"type":"string","values":""},
	"cache_mode":{"description":"disable | static_only | static_and_dynamic | aggressive : default Static_Only.",
		"type":"list","values":["static_only","disable","static_and_dynamic","aggressive"]},
	"cahce_headers":{"description":"",
		"type":"string","values":""},
	"certificate":{"description":"",
		"type":"string","values":""},
	"challenge_suspected_bots":{"description":"Whether or not to send a challenge to clients that are suspected to be bad bots (CAPTCHA for example). One of: true, false",
		"type":"list","values":["","true","false"]},
	"clear_always_cache_rules":{"description":"",
		"type":"string","values":""},
	"clear_cache_headers_rules":{"description":"",
		"type":"string","values":""},
	"clear_never_cache_rules":{"description":"",
		"type":"string","values":""},
	"client_app_types":{"description":"",
		"type":"string","values":""},
	"client_apps":{"description":"",
		"type":"string","values":""},
	"config_id":{"description":"The Logs Collector configuration identifier",
		"type":"string","values":""},
	"connection_name":{"description":"The connection to send a notification for. Enter the connection name as it appears in the Management Console’s Protection Settings page. For example, Test_GRE_Tunnel.",
		"type":"string","values":""},
	"content":{"description":"The injected HTML snippet, Base64-encoded.",
		"type":"string","values":""},
	"continents":{"description":"Continents by code",
		"type":"multi","values":["AF","AN","AS","EU","NA","OC","SA"]},
	"countries":{"description":"Countries by code",
		"type":"multi","values":["AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BV","BR","VG","IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","HK","MO","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SZ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN","VI","WF","EH","YE","ZM","ZW"]},
	"country":{"description":"Country by code",
		"type":"list","values":["","AF","AX","AL","DZ","AS","AD","AO","AI","AQ","AG","AR","AM","AW","AU","AT","AZ","BS","BH","BD","BB","BY","BE","BZ","BJ","BM","BT","BO","BA","BW","BV","BR","VG","IO","BN","BG","BF","BI","KH","CM","CA","CV","KY","CF","TD","CL","CN","HK","MO","CX","CC","CO","KM","CG","CD","CK","CR","CI","HR","CU","CY","CZ","DK","DJ","DM","DO","EC","EG","SV","GQ","ER","EE","ET","FK","FO","FJ","FI","FR","GF","PF","TF","GA","GM","GE","DE","GH","GI","GR","GL","GD","GP","GU","GT","GG","GN","GW","GY","HT","HM","VA","HN","HU","IS","IN","ID","IR","IQ","IE","IM","IL","IT","JM","JP","JE","JO","KZ","KE","KI","KP","KR","KW","KG","LA","LV","LB","LS","LR","LY","LI","LT","LU","MK","MG","MW","MY","MV","ML","MT","MH","MQ","MR","MU","YT","MX","FM","MD","MC","MN","ME","MS","MA","MZ","MM","NA","NR","NP","NL","AN","NC","NZ","NI","NE","NG","NU","NF","MP","NO","OM","PK","PW","PS","PA","PG","PY","PE","PH","PN","PL","PT","PR","QA","RE","RO","RU","RW","BL","SH","KN","LC","MF","PM","VC","WS","SM","ST","SA","SN","RS","SC","SL","SG","SK","SI","SB","SO","ZA","GS","SS","ES","LK","SD","SR","SJ","SZ","SE","CH","SY","TW","TJ","TZ","TH","TL","TG","TK","TO","TT","TN","TR","TM","TC","TV","UG","UA","AE","GB","US","UM","UY","UZ","VU","VE","VN","VI","WF","EH","YE","ZM","ZW"]},
	"dc_id":{"description":"Data Center ID",
		"type":"list","values":[]},
	"data_storage_region":{"description":"The data region to use.",
		"type":"list","values":["APAC","EU","US","DEFAULT"]},
	"ddos_traffic_threshold":{"description":"Consider site to be under DDoS if the request rate is above this threshold.",
		"type":"list","values":['',10, 20, 50, 100, 200, 500, 750, 1000, 2000, 3000, 4000, 5000]},
	"destination_account_id":{"description":"The numeric identifier of the account which the site will be moved to.",
		"type":"int","values":""},
	"delete_content":{"description":"The injected HTML snippet, Base64-encoded.",
		"type":"list","values":["","true","false"]},
	"delete_whitelist":{"description":"An optional boolean parameter, in case it is set to 'true' and a whitelist id is sent, then the whitelist will be deleted",
		"type":"list","values":["","true"]},
	"destination_folder":{"description":"The path to the directory on the SFTP server.",
		"type":"string","values":"true"},
	"displayName":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"domain":{"description":"The domain name of the site. For example: www.example.com, hello.example.com, example.com",
		"type":"string","values":""},
	"dynamic_cache_duration":{"description":"",
		"type":"string","values":""},
	"email":{"description":"Email address. For example: brian@example.com",
		"type":"string","values":""},
	"enable":{"description":"",
		"type":"string","values":""},
	"enabled":{"description":"",
		"type":"list","values":["","true","false"]},
	"end":{"description":"End time in epoch",
		"type":"datepicker","values":""},
	"event_type":{"description":"A comma separated list of specific event types. Any of: GRE_TUNNEL_UP,GRE_TUNNEL_DOWN, ORIGIN_CONNECTION_GRE_UP,ORIGIN_CONNECTION_GRE_DOWN,ORIGIN_CONNECTION_ECX_UP,ORIGIN_CONNECTION_ECX_DOWN,ORIGIN_CONNECTION_CROSS_CONNECT_UP,ORIGIN_CONNECTION_CROSS_CONNECT_DOWN,DDOS_START_IP_RANGE,DDOS_STOP_IP_RANGE,DDOS_QUIET_TIME_IP_RANGE,EXPORTER_NO_DATA, EXPORTER_BAD_DATA, EXPORTER_GOOD_DATA, MONITORING_CRITICAL_ATTACK, PROTECTED_IP_STATUS_UP, PROTECTED_IP_STATUS_DOWN, PER_IP_DDOS_START_IP_RANGE.",
		"type":"string","values":"GRE_TUNNEL_UP,GRE_TUNNEL_DOWN,ORIGIN_CONNECTION_GRE_UP,ORIGIN_CONNECTION_GRE_DOWN,ORIGIN_CONNECTION_ECX_UP,ORIGIN_CONNECTION_ECX_DOWN,ORIGIN_CONNECTION_CROSS_CONNECT_UP,ORIGIN_CONNECTION_CROSS_CONNECT_DOWN,DDOS_START_IP_RANGE,DDOS_STOP_IP_RANGE,DDOS_QUIET_TIME_IP_RANGE,EXPORTER_NO_DATA,EXPORTER_BAD_DATA,EXPORTER_GOOD_DATA,MONITORING_CRITICAL_ATTACK,PROTECTED_IP_STATUS_UP,PROTECTED_IP_STATUS_DOWN,PER_IP_DDOS_START_IP_RANGE"},
	"exporter_ip":{"description":"The exporter IP to send a notification for. For example, 1.1.1.1. The exporter IP can be found in the Management Console’s Monitoring Settings page.",
		"type":"string","values":"1.1.1.1"},
	"filter":{"description":"Rule will trigger only a request that matches this filter. Filter guidelines can be found here.",
		"type":"filter","values":[]},
	"force_ssl":{"description":"This is a tmp desc",
		"type":"list","values":["","true","false"]},
	"format":{"description":"",
		"type":"string","values":""},
	/*"from":{"description":"Pattern to rewrite. RULE_ACTION_REWRITE_URL - Url to rewrite. RULE_ACTION_REWRITE_HEADER - Header value to rewrite. RULE_ACTION_REWRITE_COOKIE - Cookie value to rewrite.",
		"type":"listPair","values":[
			{"displayText":"Rewrite URL","val":"RULE_ACTION_REWRITE_URL"},
			{"displayText":"Rewrite Header","val":"RULE_ACTION_REWRITE_HEADER"},
			{"displayText":"Rewrite Cookie","val":"RULE_ACTION_REWRITE_COOKIE"}
		]},*/
	"from":{"description":"Pattern to rewrite. RULE_ACTION_REWRITE_URL - Url to rewrite. RULE_ACTION_REWRITE_HEADER - Header value to rewrite. RULE_ACTION_REWRITE_COOKIE - Cookie value to rewrite.",
		"type":"string","values":""},
	"granularity":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"host":{"description":"",
		"type":"string","values":""},
	"host_name":{"description":"",
		"type":"string","values":""},
	"id_enabled":{"description":"",
		"type":"string","values":""},
	"include_ad_rules":{"description":"This is a tmp desc",
		"type":"list","values":["","Yes","No"]},
	"include_incap_rules":{"description":"This is a tmp desc",
		"type":"list","values":["","Yes","No"]},
	"ip":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"ips":{"description":"A comma seperated list of IPs or IP ranges, e.g: 192.168.1.1, 192.168.1.1-192.168.1.100 or 192.168.1.1/24",
		"type":"string","values":""},
	"ip_prefix":{"description":"Specific Protected IP or IP&nbsp;range. For example, 1.1.1.0/24.",
		"type":"string","values":"1.1.1.0/24"},
	"ip_protection":{"description":"The IP to send a notification for. For example, 1.1.1.1.",
		"type":"string","values":"1.1.1.0/24."},
	"is_content":{"description":"",
		"type":"list","values":["","Yes"]},
	"is_email_verified":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"is_phone_verified":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"is_standby":{"description":"",
		"type":"list","values":["","Yes"]},
	"is_test_mode":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"lb_algorithm":{"description":"Data center load balancing algorithm. Possible values are:\rLB_LEAST_PENDING_REQUESTS - Server with least pending requests\rLB_LEAST_OPEN_CONNECTIONS = Server with least open connections\rLB_SOURCE_IP_HASH - Server by IP hash]\rRANDOM - Random server",
		"type":"list","values":["","LB_LEAST_PENDING_REQUESTS","LB_LEAST_OPEN_CONNECTIONS","LB_SOURCE_IP_HASH","RANDOM"]},
	"list_live_visits":{"description":"This is a tmp desc",
		"type":"list","values":["","true","false"]},
	"location":{"description":"The location of the injection inside the URL ('head' or 'body_end').",
		"type":"list","values":["","head","body_end"]},	
	"log_level":{"description":"Available only for Enterprise Plan customers that purchased the Logs Integration SKU. (optional)",
		"type":"list","values":["default","none","full","security"]},
	"logs_account_id":{"description":"Numeric identifier of the account that purchased the logs integration SKU and which collects the logs. If not specified, operation will be performed on the account identified by the authentication parameters.  Available only for Enterprise Plan customers that purchased the Logs Integration SKU. (optional)",
		"type":"int","values":""},
	"logs_collector_type":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"logs_config_new_status":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"max_events":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"name":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"never_cache_resource_url":{"description":"",
		"type":"string","values":""},
	"never_cahce_resource_pattern":{"description":"",
		"type":"string","values":""},
	"organization":{"description":"The legal name of your organization. This should not be abbreviated or include suffixes such as Inc., Corp., or LLC. (optional)",
		"type":"string","values":""},
	"organization_unit":{"description":"The division of your organization handling the certificate. For example, 'IT Department'. (optional)",
		"type":"string","values":""},
	"packet_type":{"description":"Packet type. (UDP, TCP, DNS, DNS_RESPONSE, ICMP, SYN, FRAG, LARGE_SYN, NTP, NETFLOW, SSDP, GENERAL)",
		"type":"list","values":["","UDP","TCP","DNS","DNS_RESPONSE","ICMP","SYN","FRAG","LARGE_SYN","NTP","NETFLOW","SSDP","GENERAL"]},
	"page_num":{"description":"The page to return starting from 0. Default: 0",
		"type":"int","values":"0"},
	"page_size":{"description":"The number of objects to return in the response. Default: 50",
		"type":"int","values":"100"},
	"param":{"description":"active: active | bypass ;\nsite_ip: 1.2.3.4,,some.cname.com (comma separated)\ndomain_validation: email | html | dns \napprover: my.approver@email.com\nignore_ssl: true | ''\nacceleration_level: none | standard | aggressive \nseal_location: api.seal_location.bottom_left | \n\t\tapi.seal_location.none | \n\t\tapi.seal_location.right_bottom | \n\t\tapi.seal_location.right | \n\t\tapi.seal_location.left | \n\t\tapi.seal_location.bottom_right | \n\t\tapi.seal_location.bottom \ndomain_redirect_to_full: true | '' ;\nremove_ssl: true | '' ;\nref_id: string (free-text/unique identifier)",
		"type":"list","values":["active","site_ip","domain_validation","approver","ignore_ssl","acceleration_level","seal_location","domain_redirect_to_full","remove_ssl","ref_id"]},
	"parameters":{"description":"",
		"type":"string","values":""},
	"parent_id":{"description":"The newly created account's parent id. If not specified, the invoking account will be assigned as the parent account. (optional)",
		"type":"int","values":""},
	"password":{"description":"",
		"type":"string","values":""},
	"passphrase":{"description":"",
		"type":"string","values":""},
	"phone":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"plan_id":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"pps":{"description":"Number of packets per second.",
		"type":"int","values":""},
	"priority":{"description":"",
		"type":"string","values":""},
	"private_key":{"description":"",
		"type":"string","values":""},
	"protected_app":{"description":"This is a tmp desc",
		"type":"list","values":["joomla","wordpress","phpBB"]},
	"protocol":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"public_key":{"description":"The public key file(2048bit) in base64 format (without password protection)",
		"type":"string","values":""},
	"purge_pattern":{"description":"This is a tmp desc",
		"type":"string","values":"^Resource_name$"},
	"quarantined_urls":{"description":"A comma seperated list of encoded URLs to be kept in quarantine",
		"type":"string","values":""},
	"ref_id":{"description":"Customer specific identifier for this operation. (optional)",
		"type":"string","values":""},
	"report":{"description":"",
		"type":"string","values":""},
	"resource_pattern":{"description":"",
		"type":"string","values":""},
	"resource_url":{"description":"",
		"type":"string","values":""},
	"resp_format":{"description":"This is a tmp desc",
		"type":"list","values":["json","apache","nginx","iptables","text"]},
	"response_code":{"description":"This is a tmp desc",
		"type":"list","values":["",301, 302, 303, 307, 308]},
	"revision_id":{"description":"",
		"type":"string","values":""},
	"rewrite_name":{"description":"Name of cookie or header to rewrite. Applies only for RULE_ACTION_REWRITE_COOKIE and RULE_ACTION_REWRITE_HEADER",
		"type":"string","values":""},
	"rule_id":{"description":"The id of the acl, e.g api.acl.blacklisted_ips:\r\n• api.acl.blacklisted_countries - Visitors from blacklisted countries/continents\r\n• api.acl.blacklisted_urls - Visitors from blacklisted URLs\r\n• api.acl.blacklisted_ips - Visitors from blacklisted IPs\r\n• api.acl.whitelisted_ips - Visitors from whitelisted IPs\n\r\n\rBlacklisted URLs Example:\r\nrule_id=api.acl.blacklisted_urls\r\nurls=%2Fadmin%2Fdashboard%2Fstats%3Fx%3D1%26y%3D2%23z%3D3,%2Fadmin\r\nurl_patterns=contains,equals\r\n\r\nBlacklisted Countries Example:\r\nrule_id=api.acl.blacklisted_countries\r\ncountries=CA,US\r\ncontinents=SA\r\n\r\nBlacklisted IPs Example:\r\nrule_id=api.acl.blacklisted_ips\r\nips=1.2.3.4,192.168.1.1-192.168.1.100,192.168.1.1/24\r\n\r\nWhitelisted IPs Example:\r\nrule_id=api.acl.whitelisted_ips\r\nips=1.2.3.4\r\n\r\nDelete the IPs ACL Example (send an empty list of IPs):\r\nrule_id=api.acl.blacklisted_ips\r\nips=\r\n",
		"type":"list","values":["","api.acl.blacklisted_countries","api.acl.blacklisted_ips","api.acl.blacklisted_urls","api.acl.whitelisted_ips","api.threats.backdoor","api.threats.bot_access_control","api.threats.cross_site_scripting","api.threats.ddos","api.threats.illegal_resource_access","api.threats.remote_file_inclusion","api.threats.sql_injection"]},
	"save_on_success":{"description":"Save on success.",
		"type":"list","values":["","true","false"]},
	"secret_key":{"description":"S3 secret key.",
		"type":"string","values":""},
	"security_rule_action":{"description":"The action that should be taken when a threat is detected, for example: api.threats.action.block_ip. Different actions are allowed per different threats, e.g. backdoors may only be quarantined, ignored or trigger an alert. For possible values see below:\r\n\r\n• api.threats.action.disabled - Threat is not blocked, site owner is not notified.\r\n• api.threats.action.alert - Threat is not blocked, site owner is notified.\r\n• api.threats.action.block_request - Threat blocked by stopping the request, site owner is notified.\r\n• api.threats.action.block_user - Threat blocked by stopping the request. Additional requests by the client application will be automatically blocked for a duration of several minutes. Site owner is notified.\r\n• api.threats.action.block_ip - Threat blocked by stopping the request. Additional requests from the same IP addresses will be automatically blocked for a duration of several minutes. Site owner is notified.\r\n• api.threats.action.quarantine_url - Relevant only for Backdoor Protect. When detecting a backdoor, additional requests to the URL of the backdoor will be automatically blocked. Site owner is notified.",
		"type":"list","values":["","api.threats.action.disabled","api.threats.action.alert","api.threats.action.block_request","api.threats.action.block_user","api.threats.action.block_ip","api.threats.action.quarantine_url"]},
	"security":{"description":"The security settings of the site",
		"type":"string","values":""},
	"send_lp_notifications":{"description":"This is a tmp desc",
		"type":"list","values":["","true","false"]},
	"send_site_setup_emails":{"description":"This is a tmp desc",
		"type":"list","values":["","true","false"]},
	"server_address":{"description":"",
		"type":"string","values":""},
	"server_id":{"description":"",
		"type":"string","values":""},
	"should_purge_all_site_resources":{"description":"",
		"type":"string","values":""},
	"should_send_activation_email":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"site_id":{"description":"Numeric identifier of the site to operate on.","description":"This is a tmp desc",
		"type":"list","values":[]},
	"site_ip":{"description":"This is a tmp desc",
		"type":"int","values":""},
	"sms_text":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"specific_users_list":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"start":{"description":"Start time in epoch",
		"type":"datepicker","values":""},
	"state":{"description":"The state/region where your organization is located. This should not be abbreviated.",
		"type":"string","values":""},
	"stats":{"description":"This is a tmp desc",
		"type":"list","values":["visits_timeseries","hits_timeseries","bandwidth_timeseries","requests_geo_dist_summary","visits_dist_summary","caching","caching_timeseries","threats"]},
	"sub_account_name":{"description":"The name of the sub account.",
		"type":"string","values":""},
	"support_all_tls_versions":{"description":"This is a tmp desc",
		"type":"list","values":["","true","false"]},
	"tests":{"description":"",
		"type":"string","values":""},
	"time_range":{"description":"Time range to fetch data for. See the introduction of the API documentation for a detailed description ",
		"type":"list","values":["today","last_7_days","last_30_days","last_90_days","month_to_date","custom"]},
	/*"to":{"description":"Pattern to change to. RULE_ACTION_REWRITE_URL - Url to change to. RULE_ACTION_REWRITE_HEADER - Header value to change to. RULE_ACTION_REWRITE_COOKIE - Cookie value to change to",
		"type":"listPair","values":[
			{"displayText":"Rewrite URL","val":"RULE_ACTION_REWRITE_URL"},
			{"displayText":"Rewrite Header","val":"RULE_ACTION_REWRITE_HEADER"},
			{"displayText":"Rewrite Cookie","val":"RULE_ACTION_REWRITE_COOKIE"}
		]},*/
	"to":{"description":"Pattern to change to. RULE_ACTION_REWRITE_URL - Url to change to. RULE_ACTION_REWRITE_HEADER - Header value to change to. RULE_ACTION_REWRITE_COOKIE - Cookie value to change to",
		"type":"string","values":""},
	"traffic":{"description":"Specific traffic. One of: Total, Passed, Blocked.",
		"type":"list","values":["","Total","Passed","Blocked"]},
	"type":{"description":"The api key of the event type, such as audit.account_login.",
		"type":"string","values":""},
	"url":{"description":"The URL where the content is injected.",
		"type":"string","values":""},
	"url_patterns":{"description":"A comma seperated list of url patterns, one or multiple of: contains | equals | prefix | suffix | not_equals | not_contain | not_prefix | not_suffix. The patterns should be in accordance with the matching urls sent by the urls parameter.",
		"type":"string","values":"contains,equals,prefix,suffix,not_equals,not_contain,not_prefix,not_suffix"},
	"urls":{"description":"This is a tmp desc",
		"type":"string","values":"/admin,index.php"},
	"user_agents":{"description":"",
		"type":"string","values":""},
	"user_name":{"description":"Username",
		"type":"string","values":""},
	"value":{"description":"Value",
		"type":"string","values":""},
	"visit_id":{"description":"This is a tmp desc",
		"type":"string","values":""},
	"whitelist_id":{"description":"The id (an integer) of the whitelist to be set. This field is optional - in case no id is supplied, a new whitelist will be created",
		"type":"string","values":""}
};
//ip_prefix","traffic","traffic_type","pop"

var incapSampleRules = {
	"Incap Rules":[
		{"enabled":"true","name":"Chrome Require JS","action":"RULE_ACTION_INTRUSIVE_HTML","filter":" ClientId == 3"},
		{"enabled":"true","name":"Block Vulnerability Scanners","action":"RULE_ACTION_BLOCK","filter":" ClientType == VulnerabilityScanner | ClientType == DDoSBot"},
		{"enabled":"true","name":"Demo_test","action":"RULE_ACTION_INTRUSIVE_HTML","filter":"HeaderExists != \"User-Agent\" & URL == \"/checkout.jsp\" & ( CountryCode == RU | CountryCode == CN )"},
		{"enabled":"true","name":"Registration Validation","action":"RULE_ACTION_CAPTCHA","filter":" URL contains \"register.jsp\" & ClientType != Browser"},
		{"enabled":"false","name":"Dev Access","action":"RULE_ACTION_ALERT","filter":" ClientIP != 73.193.83.231 | ClientType != SearchBot"}
	],
	"Redirect Rules":[
		{"to":"https://www.sprvda.com$2","enabled":"true","priority":"27","response_code":"302","name":"Redirect to HTTPS & www","action":"RULE_ACTION_REDIRECT","from":"*://sprvda.com*","filter":""},
		{"to":"$scheme","enabled":"true","priority":"10","name":"Add X-Forwarded-Proto Header","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":"","rewrite_name":"X-Forwarded-Proto"},
		{"to":"!browser","enabled":"true","priority":"10","name":"Client Type != Browser","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType != Browser","rewrite_name":"ClientId"},
		{"to":"$latitude","enabled":"true","priority":"10","name":"Geo Data Enrichment - Latitude","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":"","rewrite_name":"Incap-Geo-Latitude"},
		{"to":"$longitude","enabled":"true","priority":"10","name":"Geo Data Enrichment - Longitude","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":"","rewrite_name":"Incap-Geo-Longitude"},
		{"to":"$city","enabled":"true","priority":"10","name":"Geo Data Enrichment - City","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":"","rewrite_name":"Incap-Geo-City"},
		{"to":"Browser","enabled":"true","priority":"10","name":"Incap-Client-Type = Browser","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == Browser","rewrite_name":"Incap-Client-Type"},
		{"to":"ClickBot","enabled":"true","priority":"10","name":"Incap-Client-Type = ClickBot","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == ClickBot","rewrite_name":"Incap-Client-Type"},
		{"to":"CommentSpamBot","enabled":"true","priority":"10","name":"Incap-Client-Type CommentSpamBot","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == CommentSpamBot","rewrite_name":"Incap-Client-Type"},
		{"to":"Unknown","enabled":"true","priority":"10","name":"Incap-Client-Type = Unknown","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == Unknown","rewrite_name":"Incap-Client-Type"},
		{"to":"HackingTool","enabled":"true","priority":"11","name":"Incap-Client-Type = HackingTool","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == HackingTool","rewrite_name":"Incap-Client-Type"},
		{"to":"MaskingProxy","enabled":"true","priority":"11","name":"Incap-Client-Type = MaskingProxy","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == MaskingProxy","rewrite_name":"Incap-Client-Type"},
		{"to":"VulnerabilityScanner","enabled":"true","priority":"12","name":"Incap-Client-Type = VulnerabilityScanner","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientType == VulnerabilityScanner","rewrite_name":"Incap-Client-Type"},
		{"to":"PhantomJS","enabled":"true","priority":"13","name":"Incap-Client-ID = PhantomJS","action":"RULE_ACTION_REWRITE_HEADER","from":"","allow_caching":"false","filter":" ClientId == 417","rewrite_name":"Incap-Client-ID"}
	],
	"Forward Rules":[
		{"enabled":"false","priority":"33","name":"Forward Beta Customers to New DC","dc_id":"1121887","action":"RULE_ACTION_FORWARD_TO_DC","allow_caching":"false","filter":" ClientIP == 73.193.83.231"},
		{"enabled":"false","priority":"33","name":"Forward Search Crawler Traffic to SEO Origin","dc_id":"1121887","action":"RULE_ACTION_FORWARD_TO_DC","allow_caching":"false","filter":" ClientType == Crawler"}
	]
}

