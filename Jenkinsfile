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
                                -Dsonar.host.url=http://localhost:9000 \
                                -Dsonar.login=$SONAR_TOKEN'
                            sh 'ng build --configuration production'
                        }
                    }
                }
            }
        }
        
        stage('Build and Push Backend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/backend", "backend/").push("latest")
                }
            }
        }

        stage('Build and Push Frontend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/frontend", "frontend/").push("latest")
                }
            }
        }
        
        stage('Trivy Scan Docker Images') {
            steps {
                script {
                    sh "trivy image ${DOCKERHUB_REPO}/backend:latest"
                    sh "trivy image ${DOCKERHUB_REPO}/frontend:latest"
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
