pipeline {
    agent any
    triggers {
        githubPush()
    }
    environment {
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
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
        
        stage('Build Backend') {
            steps {
                script {
                    dir('backend') {
                        sh 'mvn clean package'
                    }
                }
            }
        }

        stage('Build Frontend') {
            steps {
                script {
                    dir('frontend') {
                        sh 'ng build --configuration production'
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

        stage('Deploy to Minikube') {
            steps {
                script {
                    withKubeConfig(caCertificate: '', clusterName: '', contextName: '', credentialsId: 'minikube', namespace: '', serverUrl: '') {
                        sh 'kubectl apply -f k8s'
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
