# api.mc

## Build Setup

``` bash
# install dependencies
npm install

# database config
cp database.json.example database.json
vim database.json

# project config
cp .config.js.example .config.js
vim .config.js

# generate database
npm run generateDB

# database migrations
npm run migrate -- up

# dev serve default at localhost:3000
npm run dev

# start serve default at localhost:3000
npm run start

```