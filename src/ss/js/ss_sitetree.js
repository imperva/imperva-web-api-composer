/*
siteName
	gatewayGroupName
	serverGroupName
	protectedIP []
	services []
		serviceName
		serviceType
		ports []
		applications []
			applicationName
			databaseName
			schemaName
*/

$(document).ready(function() {
    if(isAPIAvailable()) {
      $('#tool_importSiteTree').bind('change', parseSiteTreeCsv);
    } else {
    	alert("jQuery file API is not available for your browser/OS.");
    }
});
var siteTreeCSVdata = {};
var siteTreeCSVheaders = [];

function parseSiteTreeCsv(evt) {
    var files = evt.target.files; // FileList object
    var file = files[0];
    // read the file metadata
    var output = ''
        output += 'File Name: ' + escape(file.name) + '\n';
        output += 'FileType: ' + (file.type || 'n/a') + '\n';
        output += 'FileSize: ' + file.size + ' bytes\n';
        output += 'LastModified: ' + (file.lastModifiedDate ? file.lastModifiedDate.toLocaleDateString() : 'n/a') + '\n';
	$('#automationLog').val(output);

    var reader = new FileReader();
    reader.readAsText(file);
    reader.onload = function(event){
		var csv = event.target.result;
		var data = $.csv.toArrays(csv);
		var isFirstRow = true;
		for(var row in data) {
			if (isFirstRow) {
				isFirstRow=false;
				for(var item in data[row]) { siteTreeCSVheaders[data[row][item]] = parseInt(item,10); }
			} else {
				//for(var item in data[row]) {
					var siteName = data[row][siteTreeCSVheaders['siteName']];
					if (siteName!='') {
						if (siteTreeCSVdata[siteName]==undefined) siteTreeCSVdata[siteName] = {"isProcessed":false};
						var serverGroupName = data[row][siteTreeCSVheaders['serverGroupName']];
						if (String.trim(serverGroupName)!='') {
							if (siteTreeCSVdata[siteName].serverGroups==undefined) {
								siteTreeCSVdata[siteName].serverGroups = {};
							}
							siteTreeCSVdata[siteName].serverGroups[serverGroupName] = {"isProcessed":false};

							var gatewayGroupName = data[row][siteTreeCSVheaders['gatewayGroupName']];
							if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].gatewayGroupName==undefined && gatewayGroupName!='') {
								siteTreeCSVdata[siteName].serverGroups[serverGroupName].gatewayGroupName = gatewayGroupName;
							}
							var protectedIP = data[row][siteTreeCSVheaders['protectedIP']];
							if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].protectedIPs==undefined) {
								siteTreeCSVdata[siteName].serverGroups[serverGroupName].protectedIPs = [];
							}
							if (String.trim(protectedIP)!='') siteTreeCSVdata[siteName].serverGroups[serverGroupName].protectedIPs.push(protectedIP);

							var serviceName = data[row][siteTreeCSVheaders['serviceName']];
							if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].services==undefined) {
								siteTreeCSVdata[siteName].serverGroups[serverGroupName].services = {};
							}
							if (String.trim(serviceName)!='') {
								siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName] = {"isProcessed":false};

								var serviceType = data[row][siteTreeCSVheaders['serviceType']];
								if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].serviceType==undefined) {
									siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].serviceType = serviceType;
								}

								var port = data[row][siteTreeCSVheaders['port']];
								if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].ports==undefined) {
									siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].ports = [];
								}
								if (String.trim(port)!='') siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].ports.push(port);

								var applicationName = data[row][siteTreeCSVheaders['applicationName']];
								if (String.trim(applicationName)!='') {
									if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications==undefined) {
										siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications = [];
									}
									siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications[applicationName] = {"isProcessed":false};
								}

								var schema = data[row][siteTreeCSVheaders['schema']];
								var database = data[row][siteTreeCSVheaders['database']];
								if (String.trim(schema)!='' || String.trim(schema)!='') {
									if (schema=='') schema='any';
									if (database=='') database='any';
									if (siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications[applicationName].dbmapping==undefined) {
										siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications[applicationName].dbmapping = [];
									}
									var dbmappingObj = {"database":database,"schema":schema};
									siteTreeCSVdata[siteName].serverGroups[serverGroupName].services[serviceName].applications[applicationName].dbmapping.push(dbmappingObj);
								}
							}
						}
					}
				//}
			}
		}
		reader.onerror = function(){ alert('Unable to read ' + file.fileName); };
		createSites();
	}
}

function createSites() {
	$.each(siteTreeCSVdata, function(siteName,site) {
		$('#automationLog').val($('#automationLog').val()+'\r'+"Creating site: "+siteName);
		makeCall('/v1/conf/sites/'+siteName,'POST',createSitesProcessResponse,{"siteName":siteName});
		$.each(siteTreeCSVdata[siteName].serverGroups, function(serverGroupName,serverGroup) {
			createServerGroups({"siteName":siteName});
			addProtectedIps({"siteName":siteName,"serverGroupName":serverGroupName});
			$.each(serverGroup.services, function(serviceName,service) {
				createDbServices({"siteName":siteName,"serverGroupName":serverGroupName,"serviceName":serviceName});
				$.each(service.applications, function(dbApplicationName,application) {
					createDbApplications({"siteName":siteName,"serverGroupName":serverGroupName,"serviceName":serviceName,"dbApplicationName":dbApplicationName});
				});
			});
		});
	});
}
function createSitesProcessResponse(data){
	$('#automationLog').val($('#automationLog').val()+'\r'+"Creating site response:\n"+JSON.stringify(data));
	//createServerGroups(data);
}

function createServerGroups(stateData) {
	//$('#automationLog').append('\r'+"Create site response: "+data);
	$.each(siteTreeCSVdata[stateData.siteName].serverGroups, function(serverGroupName,serverGroup) {
		$('#automationLog').val($('#automationLog').val()+'\r'+"Creating "+serverGroupName+" server group to "+stateData.siteName);
		stateData.serverGroupName = serverGroupName;
		makeCall('/v1/conf/serverGroups/'+stateData.siteName+"/"+serverGroupName,'POST',createServerGroupsProcessResponse,{});
	});
}
function createServerGroupsProcessResponse(data){
	$('#automationLog').val($('#automationLog').val()+'\r'+"Creating Server Group response:\n"+JSON.stringify(data));
	//addProtectedIps(data);
}

function addProtectedIps(stateData){
	var serverGroup = siteTreeCSVdata[stateData.siteName].serverGroups[stateData.serverGroupName];
	$.each(serverGroup.protectedIPs, function(i,ip) {
		$('#automationLog').val($('#automationLog').val()+'\r'+"Adding "+ip+" server group "+stateData.serverGroupName);
		makeCall('/v1/conf/serverGroups/'+stateData.siteName+'/'+stateData.serverGroupName+'/protectedIPs/'+ip+'?gatewayGroup='+serverGroup.gatewayGroupName,'POST',addProtectedIpsProcessResponse,{});
	});
}

function addProtectedIpsProcessResponse(data){
	$('#automationLog').val($('#automationLog').val()+'\r'+"addProtectedIpsProcessResponse:\n"+JSON.stringify(data));
}

function createDbServices(stateData) {
	//$('#automationLog').append('\r'+"Create site response: "+stateData);
	//$.each(siteTreeCSVdata[stateData.siteName][stateData.serverGroupName].services, function(serviceName,service) {
		$('#automationLog').append('\r'+"Creating service: "+stateData.serviceName);
		//stateData.serviceName = serviceName;
		//$('#data').val();
		var service = siteTreeCSVdata[stateData.siteName].serverGroups[stateData.serverGroupName].services[stateData.serviceName];
		var dbmapping = JSON.parse('{"db-service-type":"'+service.serviceType+'","ports":""}');
		dbmapping.ports = service.ports;
		//$('#data').val(JSON.stringify(dbmapping));
		makeCall('/v1/conf/dbServices/'+stateData.siteName+"/"+stateData.serverGroupName+"/"+stateData.serviceName,'POST',createDbServicesProcessResponse,dbmapping);
	//});
}
function createDbServicesProcessResponse(data) {
	$('#automationLog').val($('#automationLog').val()+'\r'+"createDbServicesProcessResponse:\n"+JSON.stringify(data));
}

function createDbApplications(stateData) {
	//$('#automationLog').append('\r'+"Create site response: "+stateData);
	//$.each(siteTreeCSVdata[stateData.siteName][stateData.serverGroupName].services, function(serviceName,service) {
		$('#automationLog').append('\r'+"Creating DB Application: "+stateData.dbApplicationName);
		makeCall('/v1/conf/dbApplications/'+stateData.siteName+"/"+stateData.serverGroupName+"/"+stateData.serviceName+"/"+stateData.dbApplicationName,'POST',createDbApplicationsProcessResponse,{});
	//});
}
function createDbApplicationsProcessResponse(data){
	$('#automationLog').val($('#automationLog').val()+'\r'+"createDbApplicationsProcessResponse:\n"+JSON.stringify(data));
}

function createDbApplicationMapping(stateData) {
	$('#automationLog').append('\r'+"Creating DB Application: "+stateData.dbApplicationName);
	var dbapps = siteTreeCSVdata[stateData.siteName].serverGroups[stateData.serverGroupName].services[stateData.serviceName].applications[stateData.dbApplicationName].dbmapping;
	//$('#data').val(JSON.stringify(dbapps));
	makeCall('/v1/conf/dbApplications/'+stateData.siteName+"/"+stateData.serverGroupName+"/"+stateData.serviceName+"/"+stateData.dbApplicationName,'PUT',createDbApplicationMappingProcessResponse,dbapps);
}
function createDbApplicationMappingProcessResponse(data){
	$('#automationLog').val($('#automationLog').val()+'\r'+"createDbApplicationMappingProcessResponse:\n"+JSON.stringify(data));
}




function isAPIAvailable() {
    // Check for the various File API support.
    if (window.File && window.FileReader && window.FileList && window.Blob) {
      // Great success! All the File APIs are supported.
      return true;
    } else {
      // source: File API availability - http://caniuse.com/#feat=fileapi
      // source: <output> availability - http://html5doctor.com/the-output-element/
      document.writeln('The HTML5 APIs used in this form are only available in the following browsers:<br />');
      // 6.0 File API & 13.0 <output>
      document.writeln(' - Google Chrome: 13.0 or later<br />');
      // 3.6 File API & 6.0 <output>
      document.writeln(' - Mozilla Firefox: 6.0 or later<br />');
      // 10.0 File API & 10.0 <output>
      document.writeln(' - Internet Explorer: Not supported (partial support expected in 10.0)<br />');
      // ? File API & 5.1 <output>
      document.writeln(' - Safari: Not supported<br />');
      // ? File API & 9.2 <output>
      document.writeln(' - Opera: Not supported');
      return false;
    }
}



/* Automation Tools */
/* 
	siteName
	serverGroupName
	protectedIP
	-serverIP
	-serverHostname
	-serverOsType
	-serverUsername
	-serverPassword
	serviceName
	serviceType
	ports
	applicationName
	databaseName
	schemaName
	-databaseOwner
	-tableGroups
	-dataMaskingSettings
	gatewayGroupName
*/