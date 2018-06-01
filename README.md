# Imperva Web API Composer

This web based application enables developers to quickly unit test individual API calls for both Incapsula and
SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in
bulk.

## Starting via Docker Compose

You will need to install both [Docker](https://www.docker.com/community-edition) and
[Docker Compose](https://docs.docker.com/compose/install/) on your system.

Once both tools are installed and Docker is running, download the **docker-compose.yml** file from the repository
and run:
`docker-compose up -d`

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
