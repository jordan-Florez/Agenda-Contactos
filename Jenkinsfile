pipeline {
    agent any

    environment {
        # La credencial de Codecov que configuraste en Jenkins
        CODECOV_TOKEN = credentials('CODECOV_TOKEN')
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                script {
                    sh '''
                    python3 -m venv venv
                    source venv/bin/activate
                    pip install --upgrade pip
                    pip install -r requirements.txt
                    '''
                }
            }
        }

        stage('Run Tests') {
            steps {
                script {
                    // Ejecutar pytest con cobertura
                    sh 'PYTHONPATH=. venv/bin/pytest --cov=backend --cov-report=xml'
                }
            }
        }
    }

    post {
        always {
            // Todo lo que toque archivos o workspace debe estar dentro de node
            node {
                echo "Archiving coverage report..."
                archiveArtifacts artifacts: 'coverage.xml', allowEmptyArchive: true

                echo "Uploading coverage to Codecov..."
                sh 'bash <(curl -s https://codecov.io/bash) -t $CODECOV_TOKEN || echo "Codecov upload failed"'
            }
        }
    }
}
