# EACIIT Project Boilerplate

Unofficial boilerplate for EACIIT project. This starter kit use SCB-based ui styles.

# Features

- Auto setup database and default user if the database is not exists
- Better logging
- CRUD for users, access, and groups are ready
- Better restriction access (user will not be able to directly access the available URL if not logged in)

# Project Structures

```bash
- eaciit-project-boilerplate
    |- assets/
        |- 3rdparty/
        |- core/
    |- conf/
    |- controllers/
    |- models/
    |- views/
    |- helper/
    |- main.go
```

# Commands

### Checkout Project

```bash
cd $GOPATH/src/eaciit
git clone https://git.eaciitapp.com/novalagung/eaciit-project-boilerplate.git yourproject
```

### Replace Package

```bash
go get github.com/novalagung/gorep

cd $GOPATH/src/eaciit/yourproject
$GOPATH/bin/gorep -from="eaciit/eaciit-project-boilerplate" -to="eaciit/yourproject"
```

### Use default configuration file, then modify as you need

```bash
cd $GOPATH/src/eaciit/yourproject/webapp/apps/main/conf
cp app.json.template app.json
```

### Run app

```bash
cd $GOPATH/src/eaciit/yourproject/webapp
go run main
```

### Deploy app

```bash
cd $GOPATH/src/eaciit/yourproject/webapp
sh deploy.sh
```

# Default Stuff

### App port

This application use port `:9000`, you can change it on the `webapp/conf/*.json`

### Mongo database access

```javascript
{
    "dbHost": "localhost:27123",
    "dbName": "eaciit-project-boilerplate",
    "dbUsername": "",
    "dbPassword": ""
}
```

### User

Two default users will be created at first.

1. username: **eaciit**, password: **Password.1** (under user group: **admin**, has access to dashboard and user management page)
2. username: **user**, password: **Password.1**  (under user group: **user**, has access only to dashboard)

# Preview

![Login page](https://git.eaciitapp.com/novalagung/eaciit-project-boilerplate/raw/master/etc/preview.jpg)

# Portofolio

This boilerplate already used in some projects.

1. NYSE - http://nyinov8.eaciit.com/
2. SCB Home - http://scbhome.eaciitapp.com/
3. SCB AM (API Portal Management) - http://api.exellerator.io/
4. Yours will be next!

# 3rd Party Libraries

This project already integrated pretty well with these Libraries. You can also add new library if you want.

- html5shiv
- normalize
- jquery
- jszip
- kendoui
- knockoutjs
- knockout-kendo
- tooltipster
- sweetalert
- bootstrap
- bootstrap-switch
- bootstrap-validator
- lodash
- momentjs
- animate.css
- font-awesome
- spinkit

# Maintainers

Created & maintained by [@novalagung](https://git.eaciitapp.com/novalagung).
