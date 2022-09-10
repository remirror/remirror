#!/bin/bash

# Temporary workaround for https://github.com/microsoft/rushstack/issues/2070.
#
# The issue above has been fixed in the latest api-extractor v7.30.0. However,
# another issue (https://github.com/microsoft/rushstack/issues/3620) prevents us
# from upgrading to that version.

set -e

cd $(dirname $0)/../..

pwd

packageJsonFiles="$(find ./node_modules -type f -name package.json | grep 'mui' | sort | uniq)"

for packageJsonFile in $packageJsonFiles; do
  name=$(cat "$packageJsonFile" | jq '.name')
  if [[ "$name" == "null" ]]; then
    echo "N $packageJsonFile does not include name"
    # Add the name field to the package.json
    echo "$(jq '. += {"name": "name"}' $packageJsonFile)" > "$packageJsonFile"
  else
    echo "Y $packageJsonFile does include name: $name"
  fi
done
