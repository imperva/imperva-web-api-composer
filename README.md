# Imperva Web API Composer
This web based application enables developers to quickly unit test individual API calls for both Incapsula and SecureSphere, as well as provides utilities for migrating policies and configurations between the solutions in bulk

# To run this application with docker, execute the following:
git clone https://github.com/imperva/imperva-web-api-composer.git
docker build .
docker tag <your_docker_image_id_here> apitool
docker create --name apitool -p 8080:80 -v $(pwd)/src:/var/www/apps/apitool apitool
docker start apitool

# Access app at the following:
http://localhost:8080

# First step is to add SecureSphere and Incapsula credentials
# Troubleshooting to get shell into the container
docker exec -t -i apitool /bin/bash -l
tail -Fn 100 /var/log/apache2/apitool_error_log
