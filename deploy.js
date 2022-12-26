const execSync = require('child_process').execSync;
const fs = require('fs-extra');

console.log("Cleaning up old build...");
if(fs.existsSync('deploy')) {
    fs.rmSync('deploy', { recursive: true, force: true })
}

console.log("Building new build...");
fs.mkdirSync('deploy')
fs.mkdirSync('deploy/configs')
fs.mkdirSync('deploy/platforms')
fs.copySync('resources', 'deploy/resources')

console.log("Building backend...");
execSync('cd backend & npm install & npm run build');
fs.copySync('backend/dist', 'deploy/backend')

console.log("Building frontend...");
execSync('cd frontend & npm install & npm run build');
fs.copySync('frontend/dist', 'deploy/backend/frontend')

console.log("Installing dependencies for production...");
fs.copySync('backend/package.json', 'deploy/package.json')
execSync('cd deploy && npm install --production');

console.log("Building application...");
execSync('cd deploy && npm run pkg:win');