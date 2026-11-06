// Viximate: one Next.js service, deployed to this server with Docker.
//
//   Branch   Host port   Container               Public URL
//   main     6016        viximate-frontend       https://viximate.com
//   dev      6017        viximate-frontend-dev   https://dev.viximate.com
//
// Containers bind to 127.0.0.1 and nginx on this server handles TLS.
// The Jenkins job only builds main and dev.
// Lint, types and the build check run in Husky, so they are not repeated here.
// The app reads no env vars. When it needs some, upload a Secret file, wrap the
// deploy in withCredentials([file(...)]) and pass it with docker run --env-file.

pipeline {
  agent any

  options {
    timestamps()
    disableConcurrentBuilds()
    timeout(time: 45, unit: 'MINUTES')
    skipDefaultCheckout()
    // Keep build history: do not discard after one day.
  }

  environment {
    DOCKER_BUILDKIT = '1'
  }

  stages {
    stage('Prepare Workspace') {
      steps {
        sh '''
          set -e
          # Reclaim root-owned leftovers so the wipe and checkout cannot fail.
          docker run --rm -v "$PWD":/w -w /w alpine:3.20 \
            chown -R "$(id -u):$(id -g)" /w 2>/dev/null || true
        '''
        script {
          try {
            cleanWs(deleteDirs: true, disableDeferredWipeout: true, notFailBuild: false)
          } catch (Throwable err) {
            // Throwable: a missing plugin raises NoSuchMethodError, not an Exception.
            echo "cleanWs unavailable or failed, using shell wipe: ${err}"
            sh 'find . -mindepth 1 -maxdepth 1 -exec rm -rf {} +'
          }

          def scmVars = checkout scm
          // Multibranch jobs set BRANCH_NAME; plain Pipeline jobs only have origin/<branch>.
          def branch = env.BRANCH_NAME ?: scmVars.GIT_BRANCH ?: ''
          def isProd = ['main', 'master', 'origin/main', 'origin/master'].contains(branch)

          env.DEPLOY_BRANCH = branch
          env.DEPLOY_SUFFIX = isProd ? '' : '-dev'
          env.HOST_PORT = isProd ? '6016' : '6017'
          env.IMAGE = "viximate-frontend${env.DEPLOY_SUFFIX}"
          env.CONTAINER = "viximate-frontend${env.DEPLOY_SUFFIX}"
          env.GIT_SHORT_SHA = sh(script: 'git rev-parse --short HEAD', returnStdout: true).trim()
        }
        echo "Branch ${env.DEPLOY_BRANCH} @ ${env.GIT_SHORT_SHA} deploys to port ${env.HOST_PORT}"
      }
    }

    stage('Build Image') {
      steps {
        sh '''#!/bin/bash
set -euo pipefail
docker build \
  -t "${IMAGE}:${BUILD_NUMBER}" \
  -t "${IMAGE}:latest" \
  .
'''
      }
    }

    stage('Deploy') {
      steps {
        sh '''#!/bin/bash
set -euo pipefail
docker rm -f "$CONTAINER" 2>/dev/null || true
docker run -d \
  --name "$CONTAINER" \
  --restart unless-stopped \
  -p "127.0.0.1:${HOST_PORT}:3000" \
  "${IMAGE}:latest"
'''
      }
    }

    stage('Smoke Test') {
      steps {
        sh '''#!/bin/bash
set -euo pipefail
for i in $(seq 1 30); do
  if curl -fsS "http://127.0.0.1:${HOST_PORT}/" >/dev/null \
    && curl -fsS "http://127.0.0.1:${HOST_PORT}/about" >/dev/null; then
    echo "Smoke test passed on port ${HOST_PORT}"
    exit 0
  fi
  sleep 2
done
echo "Smoke test failed on port ${HOST_PORT}"
docker logs --tail 200 "$CONTAINER" || true
exit 1
'''
      }
    }
  }

  post {
    always {
      sh '''
        docker run --rm -v "$PWD":/w -w /w alpine:3.20 \
          chown -R "$(id -u):$(id -g)" /w 2>/dev/null || true
      '''
      script {
        try {
          cleanWs(deleteDirs: true, disableDeferredWipeout: true, notFailBuild: true)
        } catch (Throwable err) {
          echo "cleanWs skipped, using shell wipe: ${err}"
          sh 'find . -mindepth 1 -maxdepth 1 -exec rm -rf {} + || true'
        }
      }
    }
    failure {
      echo 'Pipeline failed. Check the stage logs above.'
    }
    success {
      echo "Deployed ${env.DEPLOY_BRANCH} @ ${env.GIT_SHORT_SHA} on port ${env.HOST_PORT}"
    }
  }
}
