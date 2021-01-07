#!/bin/bash

source ~/.profile

set -e
set -x
cd "$(dirname "$0")"

git pull

node 1_download.js
sh 2_deduplicate.sh
node 3_parse.js

sleep 3

git add ../data/
git commit -m "automatic data update" || exit 0
git push

exit 42
