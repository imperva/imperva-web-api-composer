# Imperva Web API Composer

This web based application enables developers to quickly unit test individual API calls for both Incapsula and
SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in
bulk.

## Starting via Docker Compose

You will need to install both [Docker](https://www.docker.com/community-edition) and
[Docker Compose](https://docs.docker.com/compose/install/) on your system.

Once both tools are installed and Docker is running, simply create a **docker-compose.yml** file with the following
contents somewhere on your system:

```
version: "3"

services:
  imperva-web-api-composer:
    image: impervainc/imperva-web-api-composer:latest
    ports:
      - 8080:80
      - 8443:443
    environment:
      TZ: ${TZ:-UTC}
      CONTAINER_NAME: imperva-web-api-composer
```

You can modify the ports if you'd prefer to run HTTP and HTTPS traffic on ports other than 8080 and 8443, respectively,
on your system.

Once that file has been created, simply run:
`docker-compose -f <path to docker-compose.yml> up -d`

or if you are running `docker-compose` from the same folder as your **docker-compose.yml** file:
`docker-compose up -d`

## Updating to the Latest Version

To update the container to the latest version, simply run the following commands:

```
docker-compose -f <path to docker-compose.yml> pull
docker-compose -f <path to docker-compose.yml> up --force-recreate -d
```

or if you are running `docker-compose` from the same folder as your **docker-compose.yml** file:

```
docker-compose pull
docker-compose up --force-recreate -d
```

## Building from Source

If you wish to build locally using source files, you will need to execute the following commands:

```bash
git clone https://github.com/imperva/imperva-web-api-composer.git
cd imperva-web-api-composer
docker build -t apitool .
docker create --name apitool -p 8080:80 -p 8443:443 apitool
docker start apitool
```

## Accessing the UI

Once the container has been started, you can simply access the UI by navigating to <http://localhost:8080>.

If you wish to modify the host port(s) on which the container is running, simply update the ports in the
**docker-compose.yml** file or in the **docker create** command.

## Initial Configuration

TO DO...

## Troubleshooting

If you need to access the container in order to troubleshoot one or more errors, you should use the
**docker exec -t -i _container name_ /bin/bash -l** command to connect to the container.  Once connected,
error information can be found in the **/var/log/apache2/apitool_error_log** file.
