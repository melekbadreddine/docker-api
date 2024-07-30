pipeline {
    agent any
    triggers {
        githubPush()
    }
    environment {
        RELEASE = "1.0.0"
        DOCKERHUB_REPO = 'melekbadreddine'
        DOCKERHUB_USERNAME = 'melekbadreddine'
        IMAGE_TAG = "${RELEASE}-${BUILD_NUMBER}"
        SONAR_TOKEN = credentials('sonarqube')
        JENKINS_API_TOKEN = credentials('jenkins')
        DOCKERHUB_CREDENTIALS = credentials('dockerhub')
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
                            sh '''
                                npx sonar-scanner \
                                    -Dsonar.projectKey=frontend \
                                    -Dsonar.sources=. \
                                    -Dsonar.host.url=http://52.143.128.221:9000 \
                                    -Dsonar.login=${SONAR_TOKEN}
                            '''
                            sh 'ng build --configuration production'
                        }
                    }
                }
            }
        }

        stage('TRIVY FS SCAN') {
            steps {
                sh "trivy fs . > trivyfs.txt"
            }
        }
        
        stage('Build and Push Backend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/backend", "backend/").push("${IMAGE_TAG}")
                }
            }
        }

        stage('Build and Push Frontend Image') {
            steps {
                script {
                    docker.build("${DOCKERHUB_REPO}/frontend", "frontend/").push("${IMAGE_TAG}")
                }
            }
        }

        stage('Trivy Scan Docker Images') {
            steps {
                script {
                    sh "docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${DOCKERHUB_REPO}/backend:${IMAGE_TAG} --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table > trivy_backend.txt"
                    sh "docker run -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy image ${DOCKERHUB_REPO}/frontend:${IMAGE_TAG} --no-progress --scanners vuln --exit-code 0 --severity HIGH,CRITICAL --format table > trivy_frontend.txt"
                }
            }
        }

        stage("Trigger CD Pipeline") {
            steps {
                script {
                    sh "curl -v -k --user melekbadreddine:${JENKINS_API_TOKEN} -X POST -H 'cache-control: no-cache' -H 'content-type: application/x-www-form-urlencoded' --data 'IMAGE_TAG=${IMAGE_TAG}' 'http://52.143.128.221:8080/job/docker-api-cd/buildWithParameters?token=gitops-token'"
                }
            }
        }
    }

    post {
        always {
            emailext attachLog: true,
                subject: "'${currentBuild.result}'",
                body: "Project: ${env.JOB_NAME}<br/>" +
                    "Build Number: ${env.BUILD_NUMBER}<br/>" +
                    "URL: ${env.BUILD_URL}<br/>",
                to: 'mbadreddine5@gmail.com',                              
                attachmentsPattern: 'trivyfs.txt,trivy_backend.txt,trivy_frontend.txt'
        }
    }
}
