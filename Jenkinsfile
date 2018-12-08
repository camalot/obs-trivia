#!groovy
import com.bit13.jenkins.*

if(env.BRANCH_NAME ==~ /master$/) {
		return
}


node ("node") {
	def ProjectName = "obs-trivia"
	def slack_notify_channel = null
	def MAJOR_VERSION = 1
	def MINOR_VERSION = 0


	properties ([
		buildDiscarder(logRotator(numToKeepStr: '25', artifactNumToKeepStr: '25')),
		disableConcurrentBuilds(),
		pipelineTriggers([
			pollSCM('H/30 * * * *')
		]),
	])

	env.PROJECT_MAJOR_VERSION = MAJOR_VERSION
	env.PROJECT_MINOR_VERSION = MINOR_VERSION

	env.CI_BUILD_VERSION = Branch.getSemanticVersion(this)
	env.CI_DOCKER_ORGANIZATION = Accounts.GIT_ORGANIZATION
	env.CI_PROJECT_NAME = ProjectName
	currentBuild.result = "SUCCESS"

	def errorMessage = null
	wrap([$class: 'TimestamperBuildWrapper']) {
		wrap([$class: 'AnsiColorBuildWrapper', colorMapName: 'xterm']) {
			Notify.slack(this, "STARTED", null, slack_notify_channel)
			try {
				withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: env.CI_DOCKER_HUB_CREDENTIAL_ID,
								usernameVariable: 'DOCKER_HUB_USERNAME', passwordVariable: 'DOCKER_HUB_PASSWORD']]) {

					withCredentials([[$class: 'UsernamePasswordMultiBinding', credentialsId: env.CI_ARTIFACTORY_CREDENTIAL_ID,
													usernameVariable: 'ARTIFACTORY_USERNAME', passwordVariable: 'ARTIFACTORY_PASSWORD']]) {
						stage ("install" ) {
							env.CT_TWITCH_USERNAME = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_USERNAME")
							env.CT_TWITCH_OAUTH = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_OAUTH")
							env.CT_TWITCH_OAUTH_API = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_OAUTH_API")
							env.CT_TWITCH_CLIENTID = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_CLIENTID")
							env.CT_TWITCH_CLIENTSECRET = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_CLIENTSECRET")
							env.CT_TWITCH_CHANNELS = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_TWITCH_CHANNELS")
							env.CT_MONGODB_DATABASE = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_DATABASE")
							env.CT_MONGODB_HOST = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_HOST")
							env.CT_MONGODB_PORT = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_PORT")
							env.CT_MONGODB_ARGS = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_ARGS")
							env.CT_MONGODB_AUTHDB = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_AUTHDB")
							env.CT_MONGODB_ROOT_PASSWORD = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_ROOT_PASSWORD")
							env.CT_MONGODB_ROOT_USERNAME = SecretsVault.get(this, "secret/${env.CI_PROJECT_NAME}", "CT_MONGODB_ROOT_USERNAME")

							deleteDir()
							Branch.checkout(this, env.CI_PROJECT_NAME)
							Pipeline.install(this)
							Node.createAuthenticationFile(this, env.CI_DOCKER_ORGANIZATION)
						}
						stage ("lint") {
							sh script: "${WORKSPACE}/.deploy/lint.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}'"
						}
						stage ("build") {
							sh script: "${WORKSPACE}/.deploy/build.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}'"
						}
						stage ("test") {
							sh script: "${WORKSPACE}/.deploy/test.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}'"
						}
						stage ("deploy") {
							sh script: "${WORKSPACE}/.deploy/deploy.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}'"
						}
						stage ('publish') {
							sh script:  "${WORKSPACE}/.deploy/validate.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}'"

							Branch.publish_to_master(this)
							Pipeline.publish_buildInfo(this)
						}
						stage ('run') {
							sh script:  "${WORKSPACE}/.deploy/run.sh -n '${env.CI_PROJECT_NAME}' -v '${env.CI_BUILD_VERSION}' -o '${env.CI_DOCKER_ORGANIZATION}' -f"
						}
					}
				}
			} catch(err) {
				currentBuild.result = "FAILURE"
				errorMessage = err.message
				throw err
			}
			finally {
				Pipeline.finish(this, currentBuild.result, errorMessage)
			}
		}
	}
}
