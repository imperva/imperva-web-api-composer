Examples
********

Example 1 - Build MX configuration from code
============================================

::

  import imperva_sdk

  # Settings
  app_name = "MyApp" # Name to use when creating resources
  gateway_group = "giora-tmp2" # Name of gateway group to use for KRP rules (must exist in MX)
  alias = "aa" # Name of gateway alias to use for KRP rules (must exist in MX)
  followed_action = 'splunk' # Set "Followed Action" to this "Action Set" on all policies (must exist in MX)
  cert_file = '/work/tmp/mycert.pem' # PEM file containing both public and private certificate information

  # Create site tree
  mx = imperva_sdk.MxConnection(Host="10.100.46.138", Username="admin", Password="1qa2ws3ed") # Connect to MX
  site = mx.create_site("%s site" % app_name) # Create Site
  sg = site.create_server_group("%s server group" % app_name, OperationMode='active') # Create Server Group
  ws = sg.create_web_service("%s web service" % app_name) # Create Web Service
  wa = ws.get_web_application("Default Web Application") # Get web application created by default
  wa.Name = "%s web application" % app_name # Change default web application name
  with open(cert_file, 'r') as fd: cert_data = fd.read() # Read certificate contents into cert_data
  ws.upload_ssl_certificate(SslKeyName="%s certificate" % app_name, Private=cert_data, Certificate=cert_data) # Upload SSL certificate
  ws.create_krp_rule(Alias=alias, GatewayGroup=gateway_group, GatewayPorts=[443], ServerCertificate="%s certificate" % app_name, OutboundRules=[{'priority': 1, 'internalIpHost': 'internal.server.com', 'serverPort': 80}]) # Create HTTPS->HTTP KRP rule
  ws.krp_xff_enable() # Enable XFF (useful for AWS KRP)

  # Run on all "web service custom" policies and set "Followed Action"
  for pol in mx.get_all_web_service_custom_policies():
    pol.FollowedAction = followed_action

  mx.logout() # Close connection


Example 2 - Create user defined copies of all ADC predefined policies
=====================================================================

::

  import imperva_sdk

  mx = imperva_sdk.MxConnection(Host="10.100.46.138", Username="admin", Password="1qa2ws3ed") # Connect to MX

  for pol in mx.get_all_web_service_custom_policies():
    # We'll use the "user defined" prefix to differentiate between user and predefined policies
    if not pol.Name.startswith("user defined -"): # Check that this is an ADC predefined policy
      new_pol = dict(pol) # Save policy as dictionary
      pol.Enabled = False # Disable ADC policy (we want to use the user defined)
      new_pol['Name'] = "user defined - %s" % new_pol['Name'] # Change new policy name to "user defined - " prefix
      if not mx.get_web_service_custom_policy(new_pol['Name']): # Skip if policy already exists
        try:
          mx.create_web_service_custom_policy(**new_pol) # Create user defined policy
        except Exception as e:
          print "WARNING: Failed to create '%s', error - '%s'" % (new_pol['Name'], e) # Creation can fail for example if ThreatRadar signature policies are empty

  # Now we have a replication of all of our ADC predefined policies, but because they are user defined - we can play with their Match Criteria!

  mx.logout() # Close connection

Example 3 - Copy configuration from one MX to another
=====================================================

.. note:: The configuration includes only objects that are implemented in imperva_sdk. It is not the entire MX configuration.

::

  import imperva_sdk

  # Open connection to MXs (use default credentials)
  source_mx = imperva_sdk.MxConnection("10.1.11.57")
  dest_mx = imperva_sdk.MxConnection("10.100.46.138")

  # Export configuration from source MX
  source_export = source_mx.export_to_json()

  # Import configuration to destination MX
  import_log = dest_mx.import_from_json(source_export)

  # Go over log entries and print import failures
  for log_entry in import_log:
    if log_entry['Result'] == "ERROR":
      print log_entry

  # Close connection to MXs
  source_mx.logout()
  dest_mx.logout()

Example 4 - Create MX configuration from JSON
=============================================

First we need to have an MX configuration in JSON format (this is a proprietary `imperva_sdk` format).
The easiest way to create a sample configuration is to create an export from a working MX.
The following code exports the configuration from the MX configured in `Example 1`.
We user the `Discard` parameter to remove policy `MatchCriteria` and `ApplyTo` information (which takes up most of the space and we won't be changing them in the import process)::

  import imperva_sdk
  import json
  import pprint

  # Connect to MX and export configuration
  mx = imperva_sdk.MxConnection("10.100.46.138")
  export = mx.export_to_json(Discard=['MatchCriteria', 'ApplyTo'])

  # Pretty print the JSON with pprint
  export_pretty = pprint.pformat(json.loads(export)).replace('    ', ' ')
  print export_pretty

Now we have our JSON export. In this example I'm removing all but two policies to save space, but you get the idea... 
This JSON can be modified and manipulated to fit different MXs and deployments.

:: 

  {
    u'metadata':
    {
      u'Challenge': u'k+hvfY+Vgv8a',
      u'ExportTime': u'2017-04-18 12:06:36',
      u'Host': u'10.100.46.138',
      u'SdkVersion': u'0.1.4',
      u'Version': u'12.0.0.41'
    },
    u'policies':
    {
      u'web_service_custom':
      [
        {
          u'Name': u'Automated Vulnerability Scanning',
          u'Action': u'none',
          u'DisplayResponsePage': False,
          u'Enabled': False,
          u'FollowedAction': u'splunk',
          u'OneAlertPerSession': False,
          u'SendToCd': True,
          u'Severity': u'high'
        },
        {
          u'Name': u'Malformed HTTP Attack (Non compatible HTTP Results Error code)',
          u'Action': u'none',
          u'DisplayResponsePage': False,
          u'Enabled': False,
          u'FollowedAction': u'splunk',
          u'OneAlertPerSession': False,
          u'SendToCd': True,
          u'Severity': u'high'
        }
      ]
    },
    u'sites':
    [
      {
        u'Name': u'MyApp site',
        u'server_groups':
        [
          {
            u'Name': u'MyApp server group',
            u'OperationMode': u'active',
            u'web_services':
            [
              {
                u'Name': u'MyApp web service',
                u'ForwardedClientIp':
                {
                  u'forwardClientIP': True,
                  u'forwardHeaderName': u'X-Forwarded-For'
                },
                u'ForwardedConnections':
                {
                  u'forwardedConnections':
                  [
                    {
                      u'headerName': u'X-Forwarded-For',
                      u'proxyIpGroup': u''
                    }
                  ],
                  u'useHttpForwardingHeader': True
                },
                u'Ports': [80],
                u'SslPorts': [443],
                u'SslKeys':
                [
                  {
                    u'certificate': u'',
                    u'format': u'pem',
                    u'hsm': False,
                    u'password': u'',
                    u'private': u'',
                    u'sslKeyName': u'MyApp certificate'
                   }
                ],
                u'krp_rules':
                [
                  {
                    u'Alias': u'aa',
                    u'ClientAuthenticationAuthorities': None,
                    u'GatewayGroup': u'giora-tmp2',
                    u'GatewayPorts': [443],
                    u'Name': u'giora-tmp2-aa-[443]',
                    u'OutboundRules':
                    [
                      {
                        u'clientAuthenticationRules': None,
                        u'encrypt': False,
                        u'externalHost': None,
                        u'internalIpHost': u'internal.server.com',
                        u'priority': 1,
                        u'serverPort': 80,
                        u'urlPrefix': None,
                        u'validateServerCertificate': False
                      }
                    ],
                    u'ServerCertificate': u'MyApp certificate'
                  }
                ],
                u'web_applications':
                [
                  {
                    u'IgnoreUrlsDirectories': None,
                    u'LearnSettings': u'LearnAll',
                    u'Name': u'MyApp web application',
                    u'ParseOcspRequests': False,
                    u'RestrictMonitoringToUrls': None
                  }
                ]
              }
            ]
          }
        ]
      }
    ]
  }

Let's say we saved the above JSON configuration to a file (example4.json). 
Now we can import the configuration to different MXs.
Note that to use this JSON you need certain prerequisites -

* Loaded license in MX
* Specify `certificate` and `private` in SslKeys
* Configured `GatewayGroup` and `Alias` for KRP Rules

:: 

  import imperva_sdk
  import ast
  import json

  # Get configuration from JSON file and convert it to JSON dump
  json_file = 'example4.json'
  with open(json_file, 'r') as fd:
    file_data = fd.read()
  json_dict = ast.literal_eval(file_data)
  json_text = json.dumps(json_dict)

  # Connect to MX and import configuration
  mx = imperva_sdk.MxConnection("10.100.46.138")
  log = mx.import_from_json(json_text)

  # Go over log and print errors
  for entry in log:
    if entry['Result'] == 'ERROR':  print entry

  mx.logout()


Example 5 - Swagger 2 Profile
=============================

In v12.3 SecureSphere added APIs to manage the application profile. `imperva_sdk` added support for these APIs in the WebApplication object. In addition, `imperva_sdk` provides the ability to apply a Swagger JSON as a SecureSphere profile. Many API applications can automatically generate their schema in Swagger format (URL paths, allowed methods, parameters...) - this `imperva_sdk` function enables you to automatically update your profile with a Swagger representation.

::

  import imperva_sdk
  import json

  # Connect to MX
  mx = imperva_sdk.MxConnection("10.100.73.151", Password="Barbapapa12")

  # Load swagger file as JSON
  with open('swagger_file.json', 'r') as fd:
    swagger_json = json.loads(fd.read())

  # Select Web Application
  app = mx.get_web_application(Name="app", Site="site", ServerGroup="sg", WebService="ws")

  # Apply swagger as profile
  app.update_profile(SwaggerJson=swagger_json)

  # Log out
  mx.logout()


