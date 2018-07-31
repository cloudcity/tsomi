#!/bin/bash

if [ ! -e tsomi-staging ]; then
  git clone https://savannidgerinel:${GITHUB_TOKEN}@github.com/cloudcity/tsomi-staging.git
fi
mkdir -p tsomi-staging
cd tsomi-staging
#cat ../../index.html | sed 's/static\/tsomi.css/\/tsomi\/static\/tsomi.css/' | sed 's/js\/bundle.js/\/tsomi\/js\/bundle.js/' > index.html
cp ../index.html .
cp ../static/favicon.ico .
cp -r ../static .
cp -r ../js .
git add *
git commit -m "deploy tsomi to staging"
git push

