pipeline {
    // Agente que construye la imagen a partir de tu Dockerfile y la usa
    agent {
        dockerfile {
            dir 'backend'
            filename 'Dockerfile'
            // IMPORTANTE: Estos argumentos fuerzan al contenedor a permanecer activo y 
            // a ejecutar como root para evitar problemas de permisos de usuario.
            args '-u root cat'
        }
    }

    environment {
        // Asegúrate de que este ID de credencial exista en Jenkins
        CODECOV_TOKEN = credentials('codecov-token-id')
    }

    stages {
        stage('Checkout') {
            steps {
                echo 'Descargando código fuente...'
                // El checkout se ejecuta en el agente Jenkins HOST antes de que el contenedor se inicie
                checkout scm
            }
        }

        stage('Run Tests & Generate Reports') {
            steps {
                echo 'Ejecutando tests y generando reportes de cobertura...'
                // Los comandos se ejecutan DENTRO del contenedor Docker
                sh '''
                    # Ejecutar tests: 
                    # --cov=backend: Mide cobertura del módulo 'backend'
                    # --cov-report=xml:coverage.xml: Genera reporte de cobertura para Codecov
                    # --junitxml=results.xml: Genera reporte de JUnit para Jenkins
                    pytest --cov=backend --cov-report=xml:coverage.xml --junitxml=results.xml
                '''
            }
        }

        stage('Upload coverage') {
            steps {
                echo 'Subiendo cobertura a Codecov...'
                // Sube el reporte XML usando el token
                sh "codecov -t $CODECOV_TOKEN -f coverage.xml"
            }
        }
    }

    post {
        always {
            echo 'Archivando resultados de tests...'
            // Archiva los resultados de JUnit generados. Ahora debería funcionar.
            junit '**/results.xml'
        }
        success {
            echo '✅ Pipeline finalizó correctamente.'
        }
        failure {
            echo '❌ Pipeline falló. Revisar logs de tests y cobertura.'
        }
    }
}