# Regional Rail Explorer
![lint](https://github.com/transitmatters/regional-rail-explorer/workflows/lint/badge.svg)

The Regional Rail Explorer is a tool to demonstrate the impact of Regional Rail on journeys within the MBTA rail system. It uses real MBTA GTFS feeds and hypothetical equivalents generated by the [`regional-rail-schedule-generator`](https://github.com/transitmatters/regional-rail-schedule-generator) repository to simulate and compare journeys with today's Commuter Rail, and potential Regional Rail systems of tomorrow.

This project is in the early stages of development.

![Screenshot_2021-06-06 Regional Rail Explorer](https://user-images.githubusercontent.com/2208769/120929859-b8b3b800-c6b8-11eb-8ed3-84a73ddff88b.png)


## Setup

To start the application locally:

```
npm install
export PORT=3000
npm run build && npm start
```
Then navigate to http://localhost:3000.

To start the application on our server:
```
git pull
npm install
NODE_OPTIONS="--max-old-space-size=2048" npm run build
cp regional-rail-explorer.supervisor.conf /etc/supervisor/conf.d/regional-rail-explorer.conf
sudo supervisorctl restart regional-rail-explorer # a supervisorctl reload may be required if the .conf was changed
```

Initial API requests will be quite slow for now as the server must load and parse several large GTFS bundles.

## Storybook

An index of React component fixtures is available to browse by running:

```
npm run storybook
```

## Linting

To lint the project source code, run `npm run lint` in the root directory