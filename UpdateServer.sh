#!/bin/bash 
git pull 
mv server.cjs ../server.cjs 
sudo npm run build 
mv ../server.cjs server.cjs 
sudo pm2 restart server
