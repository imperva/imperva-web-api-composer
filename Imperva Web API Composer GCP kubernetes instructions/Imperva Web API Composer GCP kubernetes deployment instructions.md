# Deploying Imperva Web API Composer to Google Cloud Platform

Open up the Web Console from the GCP dashboard.

create a deployments directory and copy the two yaml files into it.

`mkdir deployments`

**DRAG and DROP** the files into the GCP console (it puts them in the root of the home directory).  then:

`mv ~/imperva* ~/deployments`

Set your default region:

`gcloud config set compute/zone us-central1-a`

Create your cluster:

`gcloud container clusters create imperva --num-nodes 1 --scopes "https://www.googleapis.com/auth/projecthosting,storage-rw"`

Make sure it finished:

`gcloud container clusters list`

(If you just ran the above commands, you should have connection information automatically passed.  If you need to reconnect to your deployment:
`gcloud container clusters get-credentials imperva`
)

Create your deployment:

`kubectl create -f ~/deployments/imperva-web-api-composer-deployment.yaml`

Make sure it finished:

`kubectl get deployments`


Create your service:

`kubectl create -f ~/deployments/imperva-web-api-composer-service.yaml`


Get your external IP.  If it says pending, check in a minute.

`kubectl get services imperva-web-api-composer`


use your browser to connect to:

`http://externalip:8080`


To see the stats as to when the last time the image was updated, check 

`kubectl describe pods`
