#!/bin/sh
npm run build
npm run buildServer
rsync -za lib img dist style package.json mwa:/opt/uno/
ssh mwa "cd /opt/uno && npm install --production"
ssh -t mwa "sudo systemctl stop uno.service"
