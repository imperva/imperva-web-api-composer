# Imperva Web API Composer
This web based application enables developers to quickly unit test individual API calls for both Incapsula and SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in bulk

## Running the tool
You will need to install both [Docker](https://www.docker.com/community-edition) and 
[Docker Compose](https://docs.docker.com/compose/install/) on your system.

Once both tools are installed and Docker is running, download the **docker-compose.yml** file from the repository and run:
`docker-compose up -d`

You should be able to access the tool at <http://localhost:8080>.  If you wish to modify the local port(s) on which the container is
running, simply update the ports in the **docker-compose.yml** file.

## Building from Source:
git clone https://github.com/imperva/imperva-web-api-composer.git

`docker build .`
`docker tag <your_docker_image_id_here> apitool`
`docker create --name apitool -p 8080:80`
`docker start apitool`

Access the app at the following url: 
http://localhost:8080

First step is to add SecureSphere and Incapsula credentials
Troubleshooting to get shell into the container

`docker exec -t -i apitool /bin/bash -l`
`tail -Fn 100 /var/log/apache2/apitool_error_log`
