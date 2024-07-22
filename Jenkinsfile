pipeline {
    agent any
    triggers {
        githubPush()
    }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
        SONAR_TOKEN = credentials('sonarqube')
        DOCKERHUB_USERNAME = 'melekbadreddine'
        DOCKERHUB_REPO = 'melekbadreddine'
    }

    tools {
        maven 'Maven3'
        nodejs 'NodeJS22'
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scmGit(branches: [[name: '*/master']], extensions: [], userRemoteConfigs: [[url: 'https://github.com/MelekBadreddine/docker-api.git']])
            }
        }
        
        stage('Install Dependencies') {
            steps {
                script {
                    dir('frontend') {
                        sh 'npm install'
                    }
                }
            }
        }
        
        stage('Build and Analyze Backend') {
            steps {
                script {
                    dir('backend') {
                        withSonarQubeEnv('sonarqube') {
                        sh 'mvn clean package sonar:sonar'
                        }
                    }
                }
            }
        }

        stage('Build and Analyze Frontend') {
            steps {
                script {
                    dir('frontend') {
                        withSonarQubeEnv('sonarqube') {
                            sh 'npx sonar-scanner \
                                -Dsonar.projectKey=frontend \
                                -Dsonar.sources=src \
                                -Dsonar.host.url=$SONAR_HOST_URL \
                                -Dsonar.login=$SONAR_AUTH_TOKEN'
                            sh 'ng build --configuration production'
                        }
                    }
                }
            }
        }
        
        stage('Build Backend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/backend", "backend/").push("latest")
                }
            }
        }

        stage('Build Frontend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/frontend", "frontend/").push("latest")
                }
            }
        }
        
        stage('Trivy Scan Docker Images and Kubernetes YAML Files') {
            steps {
                script {
                    sh 'docker pull aquasec/trivy:latest'
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image ${DOCKERHUB_REPO}/backend:latest'
                    sh 'docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image ${DOCKERHUB_REPO}/frontend:latest'
                    sh 'docker run --rm -v $(pwd)/k8s:/k8s aquasec/trivy:latest fs /k8s'
                }
            }
        }

        stage('Deploy to Minikube') {
            steps {
                script {
                    withKubeConfig(caCertificate: '', clusterName: '', contextName: '', credentialsId: 'minikube-credentials', namespace: '', serverUrl: '') {
                        sh 'kubectl apply -f k8s/mysql.yaml'
                        sh 'kubectl apply -f k8s/backend.yaml'
                        sh 'kubectl apply -f k8s/frontend.yaml'
                    }
                }
            }
        }
    }

    post {
        always {
            cleanWs()
        }
    }
}
