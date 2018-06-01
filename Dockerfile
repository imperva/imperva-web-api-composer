#
# Dockerfile for Imperva Web API Tool
#
FROM impervainc/alpine:3.7
LABEL maintainer="Imperva GSA Team <gsa-team@imperva.com>"

# Install packages
#   Add Apache2 and PHP7
#   Cleanup
RUN set -xe \
	&& apk update \
	&& apk upgrade \
	&& apk add apache2 apache2-ssl php7 php7-apache2 php7-common php7-curl php7-json \
	&& rm -rf /var/cache/apk/* /tmp/* /var/tmp/* \
	&& mkdir -p /var/www/apps/apitool /run/apache2

# Add files to image
COPY src /var/www/apps/apitool
COPY files /

# Configure image
RUN set -xe \
	&& chmod +x /etc/init.d/services/*

# Configure environment variables
ENV IMAGE_NAME apitool

# Configure default command
CMD [ "/init.sh", "/usr/sbin/httpd", "-DFOREGROUND" ]
