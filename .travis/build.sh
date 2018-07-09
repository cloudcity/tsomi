#!/bin/bash

if [ "${TRAVIS_BRANCH}" == "staging" ]; then
  export CONFIG_FILE=staging.js
elif [ "${TRAVIS_BRANCH}" == "master" ]; then
  export CONFIG_FILE=production.js
else
  export CONFIG_FILE=dev.js
fi

mkdir -p dist/
npm run build
cp index.html dist/
cp -r static dist/

