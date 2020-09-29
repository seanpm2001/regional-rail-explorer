# Regional Rail Explorer

The Regional Rail Explorer is a tool to demonstrate the impact of Regional Rail on journeys within the MBTA rail system. It uses real MBTA GTFS feeds and hypothetical equivalents generated by the [`regional-rail-schedule-generator`](https://github.com/transitmatters/regional-rail-schedule-generator) repository to simulate and compare journeys with today's Commuter Rail, and potential Regional Rail systems of tomorrow.

This project is in the early stages of development.

<img width="1904" alt="Screen Shot 2020-09-29 at 7 49 28 AM" src="https://user-images.githubusercontent.com/2208769/94554912-c743f880-0228-11eb-8a95-e925d8705c64.png">

## Setup

To start the application locally:

```
npm install
npm run build && npm start
```
Then navigate to http://localhost:3000.

Initial API requests will be quite slow for now as the server must load and parse several large GTFS bundles.

## Storybook

An index of React component fixtures is available to browse by running:

```
npm run storybook
```
