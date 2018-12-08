#!/usr/bin/env bash

set -e;

base_dir=$(dirname "$0");
# shellcheck source=/dev/null
source "${base_dir}/shared.sh";

get_opts() {
	while getopts ":v:n:o:f" opt; do
		case $opt in
			v) export opt_version="$OPTARG";
			;;
			n) export opt_name="$OPTARG";
			;;
			o) export opt_org="$OPTARG";
			;;
			f) export opt_force=1;
			;;
			\?) __error "Invalid option '-${OPTARG}'";
			;;
	  esac;
	done;

	return 0;
};


get_opts "$@";

FORCE_DEPLOY=${opt_force:-0};
BUILD_PROJECT="${opt_project_name:-"${CI_PROJECT_NAME}"}";
BUILD_VERSION="${opt_version:-"${CI_BUILD_VERSION:-"1.0.0-snapshot"}"}";
BUILD_ORG="${opt_org:-"${CI_DOCKER_ORGANIZATION}"}";
PULL_REPOSITORY="${DOCKER_REGISTRY}";

[[ -z "${PULL_REPOSITORY// }" ]] && __error "Environment Variable 'DOCKER_REGISTRY' missing or is empty";
[[ -z "${BUILD_PROJECT// }" ]] && __error "Environment Variable 'CI_PROJECT_NAME' missing or is empty";
[[ -z "${BUILD_VERSION// }" ]] && __error "Environment variable 'CI_BUILD_VERSION' missing or is empty";
[[ -z "${BUILD_ORG// }" ]] && __error "Environment variable 'CI_DOCKER_ORGANIZATION' missing or is empty";

[[ -z "${CT_TWITCH_USERNAME// }" ]] && __error "Environment variable 'CT_TWITCH_USERNAME' missing or is empty";
[[ -z "${CT_TWITCH_OAUTH// }" ]] && __error "Environment variable 'CT_TWITCH_OAUTH' missing or is empty";
[[ -z "${CT_TWITCH_OAUTH_API// }" ]] && __error "Environment variable 'CT_TWITCH_OAUTH_API' missing or is empty";
[[ -z "${CT_TWITCH_CLIENTID// }" ]] && __error "Environment variable 'CT_TWITCH_CLIENTID' missing or is empty";
[[ -z "${CT_TWITCH_CLIENTSECRET// }" ]] && __error "Environment variable 'CT_TWITCH_CLIENTSECRET' missing or is empty";
[[ -z "${CT_TWITCH_CHANNELS// }" ]] && __error "Environment variable 'CT_TWITCH_CHANNELS' missing or is empty";
[[ -z "${MONGODB_HOST// }" ]] && __error "Environment variable 'MONGODB_HOST' missing or is empty";
[[ -z "${MONGODB_PORT// }" ]] && __error "Environment variable 'MONGODB_PORT' missing or is empty";
[[ -z "${MONGODB_USERNAME// }" ]] && __error "Environment variable 'MONGODB_USERNAME' missing or is empty";
[[ -z "${MONGODB_PASSWORD// }" ]] && __error "Environment variable 'MONGODB_PASSWORD' missing or is empty";

DOCKER_IMAGE="${BUILD_ORG}/${BUILD_PROJECT}:${BUILD_VERSION}";

echo "${DOCKER_REGISTRY}/${DOCKER_IMAGE}";

docker login --username "${ARTIFACTORY_USERNAME}" "${PULL_REPOSITORY}" --password-stdin <<< "${ARTIFACTORY_PASSWORD}";

docker pull "${DOCKER_REGISTRY}/${DOCKER_IMAGE}";


# CHECK IF IT IS CREATED, IF IT IS, THEN DEPLOY
DC_INFO=$(docker ps --all --format "table {{.Status}}\t{{.Names}}" | awk '/obs-trivia$/ {print $0}');
__info "DC_INFO: $DC_INFO";
DC_STATUS=$(echo "${DC_INFO}" | awk '{print $1}');
__info "DC_STATUS: $DC_STATUS";
__info "FORCE_DEPLOY: $FORCE_DEPLOY";
if [[ -z "${DC_STATUS}" ]] && [ $FORCE_DEPLOY -eq 0 ]; then
	__warning "Container '$DOCKER_IMAGE' not deployed. Skipping deployment";
	exit 0;
fi

if [[ ! $DC_STATUS =~ ^Exited$ ]]; then
  __info "stopping container";
	docker stop "${BUILD_PROJECT}" || __warning "Unable to stop '${BUILD_PROJECT}'";
fi
if [[ ! -z "${DC_INFO}" ]]; then
  __info "removing image";
	docker rm "${BUILD_PROJECT}" || __warning "Unable to remove '${BUILD_PROJECT}'";
fi


docker run -d \
	--user 0 \
	--restart unless-stopped \
	--name "${BUILD_PROJECT}" \
	-e CT_TWITCH_USERNAME="${CT_TWITCH_USERNAME}" \
	-e CT_TWITCH_OAUTH="${CT_TWITCH_OAUTH}" \
	-e CT_TWITCH_OAUTH_API="${CT_TWITCH_OAUTH_API}" \
	-e CT_TWITCH_CLIENTID="${CT_TWITCH_CLIENTID}" \
	-e CT_TWITCH_CLIENTSECRET="${CT_TWITCH_CLIENTSECRET}" \
	-e CT_TWITCH_CHANNELS="${CT_TWITCH_CHANNELS}" \
	-e CT_MONGODB_DATABASE="${CT_MONGODB_DATABASE}" \
	-e CT_MONGODB_DB_PASSWORD="${CT_MONGODB_DB_PASSWORD}" \
	-e CT_MONGODB_DB_USERNAME="${CT_MONGODB_DB_USERNAME}" \
	-e CT_MONGODB_HOST="${CT_MONGODB_HOST}" \
	-e CT_MONGODB_ARGS="${CT_MONGODB_ARGS}" \
	-e CT_MONGODB_AUTHDB="${CT_MONGODB_AUTHDB}" \
	-e CT_MONGODB_PORT="${CT_MONGODB_PORT}" \
	-e CT_MONGODB_ROOT_PASSWORD="${CT_MONGODB_ROOT_PASSWORD}" \
	-e CT_MONGODB_ROOT_USERNAME="${CT_MONGODB_ROOT_USERNAME}" \
	-p "49180:3000" \
	-t "${DOCKER_IMAGE}";
