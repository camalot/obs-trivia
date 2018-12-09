#! /usr/bin/env bash

set -e;

get_opts "$@";

base_dir=$(dirname "$0");
# shellcheck source=/dev/null
source "${base_dir}/shared.sh";


get_opts() {
	while getopts ":n:v:o:f" opt; do
	  case $opt in
			n) export opt_project_name="$OPTARG";
			;;
			v) export opt_version="$OPTARG";
			;;
			o) export opt_docker_org="$OPTARG";
			;;
			f) export opt_force="--no-cache ";
			;;
			\?) echo "Invalid option -$OPTARG" >&2;
			exit 1;
			;;
		esac;
	done;

	return 0;
};

BUILD_PROJECT="${opt_project_name:-"${CI_PROJECT_NAME}"}";
BUILD_PUSH_REGISTRY="${DOCKER_REGISTRY}";
BUILD_VERSION="${opt_version:-"${CI_BUILD_VERSION:-"1.0.0-snapshot"}"}";
BUILD_ORG="${opt_docker_org}";
WORKDIR="${WORKSPACE:-"$(pwd)"}";


az login -u ${AZURE_USERNAME} -p ${AZURE_PASSWORD};

az configure --defaults location="centralus"

az group create --name ${AZ_RESOURCE_GROUP};
az cosmosdb create --name ${CT_MONGODB_DATABASE} --resource-group ${AZ_RESOURCE_GROUP} --kind MongoDB;
az cosmosdb list-keys --name ${CT_MONGODB_DATABASE} --resource-group ${AZ_RESOURCE_GROUP} --query "primaryMasterKey"

az container create \
	--resource-group ${AZ_RESOURCE_GROUP} \
	--name ${BUILD_PROJECT} \
	--image ${BUILD_ORG}/${BUILD_PROJECT}:${BUILD_VERSION} \
	--dns-name-label ${BUILD_PROJECT} \
	--ports 80
