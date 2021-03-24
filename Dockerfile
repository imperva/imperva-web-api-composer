FROM alpine:3.12

ENV VERSION=2.0.4
# Install packages and remove default server definition
RUN apk --no-cache add php7 php7-fpm php7-opcache php7-mysqli php7-json php7-openssl php7-curl \
    php7-zlib php7-xml php7-phar php7-intl php7-dom php7-xmlreader php7-ctype php7-session \
    php7-mbstring php7-gd nginx supervisor curl && \
    rm /etc/nginx/conf.d/default.conf

RUN set -xe \
	&& apk update \
	&& apk upgrade \
	&& apk add --no-cache apache2 apache2-ssl php7 php7-apache2 php7-common php7-curl php7-json php7-pecl-yaml php7-pear php7-dev gcc musl-dev make

RUN apk add --no-cache --virtual .build-deps \
    g++ make autoconf yaml-dev
RUN pecl channel-update pecl.php.net

RUN set -xe \
	&& apk add --update --no-cache yaml \
	&& pecl install yaml --nodeps --ignore-errors \
  	&& php -m; \
	sh -c "echo 'extension=yaml.so' >> /etc/php7/php.ini" \
	sh -c "echo 'nameserver 8.8.8.8' > /etc/resolv.conf"

# Configure nginx
COPY config/nginx.conf /etc/nginx/nginx.conf

# Configure PHP-FPM
COPY config/fpm-pool.conf /etc/php7/php-fpm.d/www.conf
COPY config/php.ini /etc/php7/conf.d/custom.ini

# Configure supervisord
COPY config/supervisord.conf /etc/supervisor/conf.d/supervisord.conf

# Setup document root
RUN mkdir -p /var/www/html

# Add files to image
COPY src /var/www/html
COPY settings.json /var/www/html

# Make sure files/folders needed by the processes are accessable when they run under the nobody user
RUN chown -R nobody.nobody /var/www/html && \
  chown -R nobody.nobody /run && \
  chown -R nobody.nobody /var/lib/nginx && \
  chown -R nobody.nobody /var/log/nginx

# Switch to use a non-root user from here on
USER nobody

# Add application
WORKDIR /var/www/html
COPY --chown=nobody src/ /var/www/html/

 # Expose the port nginx is reachable on
EXPOSE 8080

# Let supervisord start nginx & php-fpm
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Configure a healthcheck to validate that everything is up&running
HEALTHCHECK --timeout=10s CMD curl --silent --fail http://127.0.0.1:8080/fpm-ping

CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]

# Required build arguments
ARG NAME
ARG VERSION
ARG RELEASE_DATE
ARG GIT_SHA1
ARG TAGS

# Image build metadata
ENV IMAGE_NAME "${NAME}"
ENV IMAGE_VERSION "${VERSION}"
ENV IMAGE_RELEASE_DATE "${RELEASE_DATE}"
LABEL \
	vendor="Imperva, Inc." \
	maintainer="Imperva OCTO Team <octo@imperva.com>" \
	com.imperva.image_name="${IMAGE_NAME}" \
	com.imperva.image_version="${IMAGE_VERSION}" \
	com.imperva.image_release_date="${IMAGE_RELEASE_DATE}" \
	com.imperva.image_tags="${TAGS}" \
	com.imperva.commit_id="${GIT_SHA1}"
