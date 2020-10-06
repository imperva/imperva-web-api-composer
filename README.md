# Imperva Web API Composer

[![pipeline status](https://gitlab.com/imperva-community/public/tools/imperva-web-api-composer/badges/master/build.svg)](https://gitlab.com/imperva-community/public/tools/imperva-web-api-composer/pipelines)
[![license](https://img.shields.io/badge/license-imperva--community-blue.svg)](https://gitlab.com/imperva-community/public/tools/imperva-web-api-composer/blob/master/LICENSE.md)
[![support](https://img.shields.io/badge/support-community-blue.svg)](https://gitlab.com/imperva-community)

## Description

This web based application enables developers to quickly unit test individual API calls for both Incapsula and SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in bulk.

## Prerequisites

- Install [Docker Compose](https://github.com/docker/compose) on the system.
- Review the [Alpine Linux Container README](https://gitlab.com/imperva-community/public/docker/alpine).
- Choose a location on the system in which to store your settings and logs.

## Container Setup

To deploy a container based on this image, follow the steps below.  The instructions assume you have chosen **/opt/docker/imperva-web-api-composer** as a base folder for storing settings and data.  If you choose a different path, please update the path in the commands below accordingly.

1. On the Docker host, create the **docker-compose.yml** file inside the **/opt/docker/imperva-web-api-composer** folder. A sample **docker-compose.yml** file is included in this repository.
1. Change into the **/opt/docker/imperva-web-api-composer** folder.
   - `host# cd /opt/docker/imperva-web-api-composer`
1. Pull the latest image from the registry:
   - `host# docker-compose pull`
1. Use **docker-compose** to bring up the container:
   - `host# docker-compose up -d`

You can modify the ports mapped by the sample **docker-compose.yml** file if you'd prefer to run HTTP and HTTPS traffic on ports other than 8080 and 8443, respectively, on your system.

## Accessing the UI

Once the container has been started, you can simply access the UI by navigating to <http://localhost:8080>.  If you've chosen an alternate port other than 8080, be sure to connect to it instead.

## Initial Configuration

TO DO...

## Troubleshooting

If you need to access the container in order to troubleshoot one or more errors, you should use the `docker exec -t -i _container id_ /bin/ash` command to connect to the container replacing **_ _container id_ _** with the actual ID of the container shown in the first column when you run `docker ps -a`.  

Once connected, error information can be found in the **/var/log/apache2/apitool_error_log** file.

## Updating and Upgrading the Container

In the future, you can update the container by simply re-running **docker-compose pull** followed by **docker-compose up --force-recreate** from the **/opt/docker/imperva-web-api-composer** folder.  These commands will automatically pull the latest version of the image(s) from the registry and replace it without affecting your data or configurations.

## Additional Help or Questions

If you have questions, find bugs or need additional help, please send an email to:
[gsa-team@imperva.com](mailto:gsa-team@imperva.com).

## Links

- [Alpine Linux Container](https://gitlab.com/imperva-community/public/docker/alpine)
- [Docker Compose](https://github.com/docker/compose/)
