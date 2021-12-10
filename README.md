# README #

The application can be run as a standalone web application, inside docker container or packaged as an electron application (desktop app style). Follow the steps below to get it up adn running in your preferred environment.

### Run as Standalone App ###
* Prerequisites
    * Install nodejs 
    * Run command in root directory:
        * npm install
* Run in local
    * ng serve --open
    * Type URL in browser: http://localhost:4200
* Build Package
    * ng build --prod

### Run as electron app ###
* Prerequisites
    * sudo su
    * npm install electron-packager -g
    * brew install --cask wine-stable
* Run in local
    * npm run electron-build
* Build electron package for Mac OS ###
    * electron-packager . --platform=darwin --overwrite
* Build electron package for Windows ###
    * electron-packager . --platform=win32 --overwrite

### Run as container app ###
* Prerequisites
    * Install docker
* Run in local
    * docker build -t idn-admin-console-image .
    * docker run --name idn-admin-console-container -d -p 8080:80 idn-admin-console-image
    * Type URL in browser:  http://localhost:8080
    * To stop container
        * docker stop idn-admin-console-container
    * To remove container
        * docker rm idn-admin-console-container
    * To delete image
        * docker rmi idn-admin-console-image