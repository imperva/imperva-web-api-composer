Introduction
************
imperva-sdk is an Imperva SecureSphere Open API SDK for Python, which allows Python developers to write software that communicates with the SecureSphere MX. imperva-sdk provides an easy to use, object-oriented SDK in addition to JSON export/import capabilities.

::

  import imperva_sdk
  mx = imperva_sdk.MxConnection(Host="192.168.1.1", Username="admin", Password="admin12")
  site = mx.get_site("Default Site")
  server_group = site.create_server_group("New SG")
  server_group.OperationMode = 'active'

.. toctree::
   :maxdepth: 2
   :caption: Table Of Contents

   quickstart
   api
   examples
   info

