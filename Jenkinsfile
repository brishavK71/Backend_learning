pipeline {
    agent any

    environment {
        // Replace these with your own Docker Hub credentials and repository details
        DOCKERHUB_CREDENTIALS = 'docker_credentials_id'
        DOCKERHUB_REPO = 'brishavk71/nodeapitest'
    }

    stages {
        stage('Checkout') {
            steps {
                // Checkout the code from GitHub
                git branch: 'main', url: 'https://github.com/brishavK71/Backend_learning.git'
            }
        }

        stage('Build Docker Image') {
            steps {
                script {
                    // Build the Docker image
                    docker.build("${DOCKERHUB_REPO}:latest")
                }
            }
        }

        stage('Push Docker Image') {
            steps {
                script {
                    // Login to Docker Hub
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKERHUB_CREDENTIALS}") {
                        // Push the Docker image
                        docker.image("${DOCKERHUB_REPO}:latest").push()
                    }
                }
            }
        }
    }

    post {
        always {
            // Clean up workspace after build
            cleanWs()
        }
        success {
            // Notify of success (Optional, you can integrate with Slack or Email)
            echo 'Docker image successfully built and pushed to Docker Hub!'
        }
        failure {
            // Notify of failure (Optional, you can integrate with Slack or Email)
            echo 'Build or push failed.'
        }
    }
}