
dsfAPIDefinitions = {
	// "Universal Settings Console (4.12-v1)": {
	// 	"endpoint": "https://docs-be.imperva.com/bundle/v4.12-sonar-user-guide/page/usc-swagger-v4.12-v1.yaml",
	// 	"definition": {}
	// },
	"Universal Settings Console (4.12-v2)":{
		"endpoint":"https://docs-be.imperva.com/bundle/v4.12-sonar-user-guide/page/usc-swagger-v4.12-v2.yaml",
		"definition":{}
	}
}

var incapGetObjectActionMapping = {
	// Example Param Structure:
	// "paramNameHere"
	//   "default or /api/action":{
	//   "loadFromLocal": true
	/********** specify action and responose attributes to parse and populate from api  ************/
	//    "action":"/api-security/api/{siteId}",
	// 	  "definition":"Cloud WAF API (v1)", // see incapAPIDefinitions
	// 	  "method":"POST",
	// 	  "listName":"resultList", // objectName, listName
	// 	  "id":"sub_account_id",
	// 	  "displayText":"sub_account_name"
	//	  "addedLookupParams":[
	//	    {"id":"incapAccountIDList","in":"body","renameLookupParam":"account_id"},
	//		{"id":"page_size","in":"body","value":"100"},
	//		{"id":"page_num","in":"body","value":"0"}
	//	  ],
	// 	  
	/********** OR copy_from_select_id to copy contents from existing select (like sub accounts) **************/
	// 	  "copy_from_select_id":"incapAccountIDList", 

	// 	  "isParent":true, // if top level param

	//    "parents":[
	// 	     {"id":"siteId","in":"path"}  // path/body/query
	//    ],
	//    "children":["endpointId"]  // child dependant dynamic params
	//   }
	// }
	"id": {
		"/api/v2/cloud-accounts/{id}": {
			"isParent": true,
			"action": "/api/v2/cloud-accounts",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "cloudAccountId"
		},
		"/api/v2/cloud-accounts/{id}/operations/sync-with-gateway": {
			"isParent": true,
			"action": "/api/v2/cloud-accounts",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "cloudAccountId"
		},
		"/api/v2/cloud-accounts/{id}/operations/test-connection": {
			"isParent": true,
			"action": "/api/v2/cloud-accounts",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "cloudAccountId"
		},
		"/api/v2/cloud-accounts/{id}/operations/trigger-discovery": {
			"isParent": true,
			"action": "/api/v2/cloud-accounts",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "cloudAccountId"
		},
		"/api/v2/cloud-accounts/{id}/scheduled-discovery": {
			"isParent": true,
			"action": "/api/v2/cloud-accounts",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "cloudAccountId"
		},
		"/api/v2/data-sources/{id}": {
			"isParent": true,
			"action": "/api/v2/data-sources",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "dataSourceId"
		},
		"/api/v2/data-sources/{id}/operations/disable-audit-collection": {
			"isParent": true,
			"action": "/api/v2/data-sources",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "dataSourceId"
		},
		"/api/v2/data-sources/{id}/operations/enable-audit-collection": {
			"isParent": true,
			"action": "/api/v2/data-sources",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "dataSourceId"
		},
		"/api/v2/data-sources/{id}/operations/sync-with-gateway": {
			"isParent": true,
			"action": "/api/v2/data-sources",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "dataSourceId"
		},
		"/api/v2/data-sources/{id}/operations/test-connection": {
			"isParent": true,
			"action": "/api/v2/data-sources",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "dataSourceId"
		},
		"/api/v2/log-aggregators/{id}": {
			"isParent": true,
			"action": "/api/v2/log-aggregators",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "logAggregatorId"
		},
		"/api/v2/log-aggregators/{id}/operations/disable-audit-collection": {
			"isParent": true,
			"action": "/api/v2/log-aggregators",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "logAggregatorId"
		},
		"/api/v2/log-aggregators/{id}/operations/enable-audit-collection": {
			"isParent": true,
			"action": "/api/v2/log-aggregators",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "logAggregatorId"
		},
		"/api/v2/log-aggregators/{id}/operations/sync-with-gateway": {
			"isParent": true,
			"action": "/api/v2/log-aggregators",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "logAggregatorId"
		},
		"/api/v2/log-aggregators/{id}/operations/test-connection": {
			"isParent": true,
			"action": "/api/v2/log-aggregators",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "logAggregatorId"
		},
		"/api/v2/others/{id}": {
			"isParent": true,
			"action": "/api/v2/others",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "othersId"
		},
		"/api/v2/others/{id}/operations/sync-with-gateway": {
			"isParent": true,
			"action": "/api/v2/others",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "othersId"
		},
		"/api/v2/others/{id}/operations/test-connection": {
			"isParent": true,
			"action": "/api/v2/others",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "othersId"
		},
		"/api/v2/secret-managers/{id}": {
			"isParent": true,
			"action": "/api/v2/secret-managers",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "secretManagerId"
		},
		"/api/v2/secret-managers/{id}/operations/sync-with-gateway": {
			"isParent": true,
			"action": "/api/v2/secret-managers",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "secretManagerId"
		},
		"/api/v2/secret-managers/{id}/operations/test-connection": {
			"isParent": true,
			"action": "/api/v2/secret-managers",
			"method": "GET",
			"listName": "data", // objectName, listName
			"id": "id",
			"displayText": "secretManagerId"
		}
	}
}
//syncType, purpose