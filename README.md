# IDN Admin Console #

> This application is not developed, maintained or supported by SailPoint. It is built and based on a community effort.

This tool is build to help the community to manage SailPoint IdentityNow (IDN).

## Badges

### GitHub

[![Latest Version](https://img.shields.io/github/package-json/v/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console) [![Latest Release](https://img.shields.io/github/v/release/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/releases) [![Github Total Downloads](https://img.shields.io/github/downloads/piyush-khandelwal-sp/idn-admin-console/total.svg)](https://github.com/piyush-khandelwal-sp/idn-admin-console/releases) [![Github Repo Size](https://img.shields.io/github/repo-size/piyush-khandelwal-sp/idn-admin-console)]() [![Project License](https://img.shields.io/github/license/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/blob/main/License)

[![Github Issues Open](https://img.shields.io/github/issues/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/issues) [![Github Issues Closed](https://img.shields.io/github/issues-closed/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/issues?q=is%3Aclosed) [![Github PR Open](https://img.shields.io/github/issues-pr/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/pulls?q=is%3Apr+is%3Aopen+) [![Github PR Closed](https://img.shields.io/github/issues-pr-closed/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/pulls?q=is%3Apr+is%3Aclosed+) [![Last Commit](https://img.shields.io/github/last-commit/piyush-khandelwal-sp/idn-admin-console)](https://github.com/piyush-khandelwal-sp/idn-admin-console/commits/main)

[![Build](https://img.shields.io/github/actions/workflow/status/piyush-khandelwal-sp/idn-admin-console/actions.yml)](https://github.com/piyush-khandelwal-sp/idn-admin-console/actions/workflows/actions.yml)

### Docker

[![Latest Version](https://img.shields.io/docker/v/khandelwalpiyush/idn-admin-console/latest)](http://hub.docker.com/r/khandelwalpiyush/idn-admin-console) [![Total Downloads](https://img.shields.io/docker/pulls/khandelwalpiyush/idn-admin-console)](http://hub.docker.com/r/khandelwalpiyush/idn-admin-console) [![Size](https://img.shields.io/docker/image-size/khandelwalpiyush/idn-admin-console?sort=date)](http://hub.docker.com/r/khandelwalpiyush/idn-admin-console) 

### Security
[![Known Vulnerabilities](https://snyk.io/test/github/piyush-khandelwal-sp/idn-admin-console/badge.svg)](https://snyk.io/test/github/piyush-khandelwal-sp/idn-admin-console)



## Release

You can download the latest Windows/Mac/Linux build from [Release](https://github.com/piyush-khandelwal-sp/idn-admin-console/releases) page

Latest Docker Build can be found at [Docker Hub](http://hub.docker.com/r/khandelwalpiyush/idn-admin-console) page

**NOTE:** Currently the builds are not code-singed. For Mac, please download and unzip, right click and open for the first time. Then you can open normally for subsequent uses.

## Authentication

You require `{tenant}` and PAT ID and Token as mentioned [in this guide](https://developer.sailpoint.com/idn/api/getting-started). PAT ID and Token must be of an **ORG_ADMIN** User or have `sp:scopes:all` scope

Alternatively if you have an internal domain other than identitynow.com please fill it in the domain name section of login.

**NOTE:** For Vanity URL's please [find your](https://developer.sailpoint.com/idn/api/getting-started#find-your-tenant-name) `{tenant}` as per the article and use that. **DO NOT** fill in your vanity URL domain in the Domain Name section.

## Contribute

We are looking for (list is not exhaustive)

* Help from community if they are interested in spreading the word
* Help us build more features and extend existing ones.
* GitHub and Actions know-how to help management and auto build / deploy / version et al
* Help us make the Angular framework better and plug holes if any. Upgrade existing versions and remove non used dependencies.
* Help us enhance it (pagination, current build documentation / standardizing and refactoring code et al .. list is endless)
* Testing, finding, and reporting and hopefully help fixing bugs - we are bound to find lot of issues to being with.
* Looking for contributors for the repo to help us set it up properly.

## Features

* Identity Profiles
    * Identity Info (Get Identity Details / Get Manager Details / Refresh Single Identity / Download Report)
    * Manage Identity Profile (Move Priority / Refresh Individual Profile / Export All)
    * Manage Identity Attribute Index (Index / Unindex Attributes)
    * Manage Transforms (Add / Update / Delete / Download / Export All)
    * Manage LCS (Delete / Download)
* Find Multiple Accounts in Source and Download Report
* Access Profiles
    * Manage Access Profiles (Enable / Disable / Delete / Export All)
    * Manage Access Profile Owners
* Roles
    * Manage Roles (Enable / Disable / Mark-Umark as Requestable / Delete / Export All)
    * Manage Role Owners
    * Duplicate Role (Good for Testing / Troubleshooting Membership Criteria)
* Sources
    * Manage Aggregation Schedules (Enable / Disable / Backup and Restore Accounts & Entitlement)
    * Manage Source Owners
    * Run Aggregations (Unoptimized / File Upload)
    * Manage Create Profile (Add / Delete Attribute / Download)
    * Reset Source (Accounts / Entitlements / Both)
    * Source Info (Internal Name / ID / Count / Export All)
* Rules
    * Manage Cloud Rules (Download / Export All)
    * Manage Connector Rules (Add / Update / Delete / Download / Export All)
* Requests
    * Access Request Status (List / Download Report)
    * Access Request Approval Forward (Forward Pending Requests / Download Report)
* Work Items
    * Work Items Status (List / Download Report)
    * Work Items Pending Forward (Forward Pending Work Items / Download Report)
* Misc
    * Check and Set Org Time
    * Manage PAT (See Permission / Last Usage / Delete Token)
    * Org Statistics (Pretty cool to see)

## Screenshots

![Find Multiple Accounts](resources/readme/find-multiple-accounts.png)

![Manage Connector Rules](resources/readme/manage-connector-rules.png)

## Manual Build

The application can be run as a standalone web application, inside docker container or packaged as an electron application (desktop app style). Follow the steps below to get it up and running in your preferred environment.

### Run as Standalone App ###
* Prerequisites
    * Install nodejs 
    * Install Angular CLI
        * npm install -g @angular/cli
    * Run command in root directory:
        * npm install
* Build Package
    * npm run build
* Run in local
    * ng serve --open
    * Will open URL in browser: http://localhost:4200


### Run as electron app ###
* Prerequisites
    * sudo su
    * npm install electron-packager -g
    * brew install --cask wine-stable
* Run in local
    * npm run build
* Build electron package for Mac OS
    * npm run build
    * electron-packager . --platform=darwin --overwrite
* Build electron package for Windows
    * npm run build
    * electron-packager . --platform=win32 --overwrite

### Run as container app ###
* Prerequisites
    * Install docker
* Run in local
    * npm run build
    * docker build -t idn-admin-console-image .
    * docker run --name idn-admin-console-container -d -p 8080:80 idn-admin-console-image
    * Type URL in browser:  http://localhost:8080
    * To stop container
        * docker stop idn-admin-console-container
    * To remove container
        * docker rm idn-admin-console-container
    * To delete image
        * docker rmi idn-admin-console-image

## 📝 License

This project is [MIT](https://github.com/piyush-khandelwal-sp/idn-admin-console/blob/main/License) licensed.