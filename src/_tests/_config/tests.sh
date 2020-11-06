#!/bin/bash

yarn run test:before

sleep 10

yarn run test:all
yarn run test:after
