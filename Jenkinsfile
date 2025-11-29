pipeline {
    agent any

    environment {
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Setup Python') {
            steps {
                // Forzamos bash con '''bash -c'''
                sh '''
                bash -c "
                python3 -m venv venv
                source venv/bin/activate
                pip install --upgrade pip
                pip install -r backend/requirements.txt
                "
                '''
            }
        }

        stage('Run Tests & Coverage') {
            steps {
                sh '''
                bash -c "
                export PYTHONPATH=.
                source venv/bin/activate
                pytest --cov=backend --cov-report=xml --junitxml=backend/tests/test-results/results.xml
                "
                '''
            }
        }

        stage('Upload Coverage to Codecov') {
            steps {
                sh '''
                bash -c "
                source venv/bin/activate
                bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN
                "
                '''
            }
        }
    }

    post {
        always {
            archiveArtifacts artifacts: 'coverage.xml', allowEmptyArchive: true
            junit 'backend/tests/test-results/results.xml'
        }
        success {
            echo 'Pipeline ejecutado correctamente ✅'
        }
        failure {
            echo 'Pipeline falló ❌'
        }
    }
}
