#!/bin/sh
npm run build
npm run buildServer
rsync -za lib img build style package.json mwa:/opt/tarot/
ssh mwa "cd /opt/tarot && npm install --production"
ssh -t mwa "sudo systemctl stop tarot.service"
