If configuring this application on a mac, pleas complete the following changes.  Please update all paths to reference your local environment. 

1. Update /etc/hosts file to reference your local server for impervaapi.local
	127.0.0.1 impervaapi.local

2. Make the following updates to the /etc/apache2/httpd.conf
	• Uncomment the following lines: 
		LoadModule socache_shmcb_module libexec/apache2/mod_socache_shmcb.so
		LoadModule ssl_module libexec/apache2/mod_ssl.so
		LoadModule php5_module libexec/apache2/libphp5.so
		Include /private/etc/apache2/extra/httpd-vhosts.conf
		Include /private/etc/apache2/extra/httpd-ssl.conf
	• Update <Directory /> with the following:
		<Directory />
			Require all granted
		</Directory>
	Note: If you have not yet configured your apache instnace, you can update the httpd.conf to specify a default root directory of your web server. I prefer the following standard location:
		DocumentRoot "/Users/your.username/Sites"
		<Directory "/Users/your.username/Sites">

3. Update your local Apache v-host config to reference your application files with the sfdcportal server name
	/private/etc/apache2/extra/httpd-vhosts.conf

<VirtualHost *:80>
    ServerAdmin your.username@imperva.com
    DocumentRoot "/Users/your.username/Documents/Dev/SE_Apps/impervaapi"
    ServerName impervaapi.local
    ErrorLog "/private/var/log/apache2/error_log"
    CustomLog "/private/var/log/apache2/access_log" common
    <Directory "/Users/your.username/Documents/Dev/SE_Apps/impervaapi">
		Options All
		AllowOverride All
		Order allow,deny
		Allow from all
    </Directory>
</VirtualHost>

5. Copy /etc/php.ini.default to /etc/php.ini, and make the following changes
	sudo cp /etc/php.ini.default /etc/php.ini
	short_open_tag = On
	date.timezone = "America/Los_Angeles"

6. Set permissions of all app directories to 755
	cd /Users/your.username/Dev/SE_Apps
	chmod -R 755 *

================================================================

Troubleshooting:
Use the following command to validate your apache config
sudo apachectl -S

Stop or start the service with the following
sudo apachectl stop/start/restart

Monitor the apache log to your new location:
tail -Fn 100 /var/log/apache2/error_log
