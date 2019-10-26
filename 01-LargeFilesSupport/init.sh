#!/bin/sh

# Execute this script as source ./init.sh for export variables to global environment outside the script scope

# IPFS Host
export IPFS_HOST="172.17.0.1"
env | grep '^IPFS_HOST='
# IPFS Port
export IPFS_PORT="5001"
env | grep '^IPFS_PORT='
# IPFS Protocol
export IPFS_PROTOCOL="http"
env | grep '^IPFS_PROTOCOL='
