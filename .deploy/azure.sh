#! /usr/bin/env bash

set -e;

base_dir=$(dirname "$0");
# shellcheck source=/dev/null
source "${base_dir}/shared.sh";
WORKDIR="${WORKSPACE:-"$(pwd)"}"

source ${WORKDIR}/.env;

az configure --defaults location="centralus"

az group create --name ${AZ_RESOURCE_GROUP};
az cosmosdb create --name ${CT_MONGODB_DATABASE} --resource-group ${AZ_RESOURCE_GROUP} --kind MongoDB;
az cosmosdb list-keys --name ${CT_MONGODB_DATABASE} --resource-group ${AZ_RESOURCE_GROUP} --query "primaryMasterKey"
