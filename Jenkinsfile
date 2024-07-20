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

        stage('Docker Login') {
            steps {
                script {
                    sh "echo ${DOCKERHUB_CREDENTIALS_PSW} | docker login -u ${DOCKERHUB_USERNAME} --password-stdin"
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
                    withKubeConfig(caCertificate: '', clusterName: 'minikube', contextName: 'minikube', credentialsId: 'minikube', namespace: '', restrictKubeConfigAccess: false, serverUrl: 'https://192.168.49.2:8443') {
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
