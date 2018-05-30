# Imperva Web API Composer
This web based application enables developers to quickly unit test individual API calls for both Incapsula and SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in bulk

# Initial installation:
git clone https://github.com/imperva/imperva-web-api-composer.git

docker build .

docker tag <your_docker_image_id_here> apitool

docker create --name apitool -p 8080:80

docker start apitool

Access the app at the following url: 
http://localhost:8080

First step is to add SecureSphere and Incapsula credentials


Troubleshooting to get shell into the container

docker exec -t -i apitool /bin/bash -l

tail -Fn 100 /var/log/apache2/apitool_error_log
