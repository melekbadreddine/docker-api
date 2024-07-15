#!/bin/bash
if minikube status &> /dev/null; then
    BASE_URL=$(minikube service backend-service --url)
else
    BASE_URL="http://localhost:8080"
fi
sed -i "s|baseUrl: ''|baseUrl: '$BASE_URL'|g" src/environments/environment.ts
