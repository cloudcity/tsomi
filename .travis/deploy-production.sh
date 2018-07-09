#!/bin/bash

if [ ! -e cloudcity.io ]; then
  git clone git@github.com:cloudcity/cloudcity.io.git
fi
mkdir -p cloudcity.io/tsomi
cd cloudcity.io/tsomi
cp ../../index.html .
cp -r ../../static .
cp -r ../../dist/js .
# git add *
# git commit -m "deploy tsomi to production"

