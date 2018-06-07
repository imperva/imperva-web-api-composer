#
# Dockerfile for Imperva Web API Tool
#
FROM impervainc/alpine:3.7

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
	&& chmod +x /etc/init.d/services/* \
	&& chmod 0600 /etc/apache2/certs/*.key \
	&& chown apache:www-data /etc/apache2/certs/*.key \
	&& chown apache:www-data -R /var/www/apps

# Configure default command
CMD [ "/init.sh", "/usr/sbin/httpd", "-DFOREGROUND" ]

# Required build arguments
ARG RELEASE_DATE
ARG BUILD_TAG
ARG GIT_SHA1

# Image build metadata
ENV IMAGE_NAME "web-api-composer"
ENV IMAGE_VERSION "0.9.0"
ENV IMAGE_RELEASE_DATE "${RELEASE_DATE}"
ARG EXTRA_TAGS="latest beta"
LABEL \
	vendor="Imperva, Inc." \
	maintainer="Imperva GSA Team <gsa-team@imperva.com>" \
	com.imperva.image_name="${IMAGE_NAME}" \
	com.imperva.image_version="${IMAGE_VERSION}" \
	com.imperva.image_release_date="${IMAGE_RELEASE_DATE}" \
	com.imperva.image_tags="${BUILD_TAG} ${IMAGE_VERSION} ${EXTRA_TAGS}" \
	com.imperva.commit_id="${GIT_SHA1}"
