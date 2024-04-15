# Appointments Service API

## Getting started

There are a few things that you need in order to setup the project:

### Pre-requisites

- **[Docker](https://www.docker.com/)** (required for running our postgres DB service)
- **[NVM](https://github.com/nvm-sh/nvm)** (not mandatory, nvm allows you to quickly install and use different versions of node via the command line)

* If you aren't using NVM, be sure to have a version of Node higher than v14.x.x

After we've got the above installed, you should follow a few steps:

Clone this repository

```
git clone https://github.com/Healy-tp/appointments.git
```

`cd` in to created directory

```
cd appointments
```

Install all the modules with the following command:

```
npm install
```

Copy the env variables on the .env file

```
cp .env.sample .env
```

Run Docker Compose so we set up our postgres DB service

```
npm run docker:up
```

Run the migrations

```
npm run migrate
```

Run our appointments service

```
npm start
```
