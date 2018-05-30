Quickstart
**********
Using imperva-sdk is as easy as using the MX UI.

Installation
============
You can install imperva-sdk on pretty much any machine with Python version 2.6+ (tested with 2.6, 2.7, 3.3 and 3.6)
The only requirement is the Python `requests <http://docs.python-requests.org/en/master/>`_ library.

1. Download

Download the latest imperva-sdk package from the `Downloads`_ section.

2. Unpack and Install the package

::

  $ tar xf imperva-sdk-*.tar.gz
  $ cd imperva-sdk-*
  $ python setup.py install

You can also install the package with pip (or any other Python package manager).

3. Start using imperva-sdk

::

  import imperva_sdk
  mx = imperva_sdk.MxConnection("1.2.3.4")
  sites = mx.get_all_sites()

Downloads
=========

imperva-sdk downloads:

=======  ===============================  ==============================================================
Version  Development Status               Download
=======  ===============================  ==============================================================
0.1.8    Latest in progress               :download:`imperva-sdk-latest-wip.tar.gz </imperva-sdk-latest-wip.tar.gz>`
0.1.7    Latest stable package            :download:`imperva-sdk-latest.tar.gz </imperva-sdk-latest.tar.gz>`
0.1.8    Beta                             :download:`imperva-sdk-0.1.8.tar.gz </imperva-sdk-0.1.8.tar.gz>`
0.1.7    Beta                             :download:`imperva-sdk-0.1.7.tar.gz </imperva-sdk-0.1.7.tar.gz>`
=======  ===============================  ==============================================================

Using imperva-sdk
=================
This is just a small sample of what you can do with imperva-sdk. Make sure you check out the :doc:`api` for more information.

::

  import imperva_sdk

  # Create a connection to the MX
  mx = imperva_sdk.MxConnection(Host="10.1.11.100", Port=8083, Username="admin", Password="1qa2ws3ed")

  # Display MX version
  mx.Version
  u'12.0.0.41'

  # Create Site
  site = mx.create_site("Gioras Site")

  # Create Server Group
  server_group = site.create_server_group("Gioras Server Group")

  # Create Web Service
  web_service = server_group.create_web_service("Gioras Web Service")

  # Change Server Group Operation Mode from Simulation to Active
  server_group.OperationMode
  'simulation'
  server_group.OperationMode = 'active'

  # Create KRP Rule
  krp_rule = web_service.create_krp_rule(Alias="alias name", GatewayGroup="gg name", GatewayPorts=[80], OutboundRules=[{'priority': 1, 'internalIpHost': 'www.imperva.com', 'serverPort': 80}])

  # Display Site in JSON (Python dict) format. Check out the export_to_json and import_from_json functions as well.
  dict(site)
  {'server_groups': [{'web_services': [{'krp_rules': [{'OutboundRules': [{u'internalIpHost': u'www.imperva.com', u'encrypt': False, 'clientAuthenticationRules': None, 'urlPrefix': None, 'priority': 1, u'serverPort': 80, 'externalHost': None, u'validateServerCertificate': False}], 'GatewayPorts': [80], 'GatewayGroup': u'gg name', 'Alias': u'alias name', 'ClientAuthenticationAuthorities': None, 'ServerCertificate': None}], 'SslPorts': [443], 'Name': u'Gioras Web Service', 'Ports': [80]}], 'Name': u'Gioras Server Group', 'OperationMode': u'active'}], 'Name': 'Gioras Site'}

  # Delete Site
  mx.delete_site(site.Name)
