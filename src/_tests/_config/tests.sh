#!/bin/bash

yarn run test:before

sleep 10

yarn run test:all:watch
yarn run test:after
