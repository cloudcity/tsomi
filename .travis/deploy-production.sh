#!/bin/bash

if [ ! -e cloudcity.io ]; then
  git clone git@github.com:cloudcity/cloudcity.io.git
fi
mkdir -p cloudcity.io/tsomi
cd cloudcity.io/tsomi
cat ../../index.html | sed 's/static\/tsomi.css/\/tsomi\/static\/tsomi.css/' | sed 's/js\/bundle.js/\/tsomi\/js\/bundle.js/' > index.html
cp -r ../../static .
cp -r ../../dist/js .
git checkout -b savanni
git add *
git commit -m "deploy tsomi to production"
git push --set-upstream origin savanni

