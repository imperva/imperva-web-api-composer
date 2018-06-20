#!/bin/bash
#
# SFDC Portal container initialization script
#
set -e

# Command is '/usr/sbin/httpd' so need to modify a few things
if [ "$1" == "/usr/sbin/httpd" ]; then

	# Secure SSL certificates
	chgrp -R apache /etc/apache2/certs/*

fi

# Execute the command
exec "$@"
