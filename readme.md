### Get started

Install dependencies

```shell
npm install
```

Start the http server

```shell
PORT=8080 node index.js
```

### Docker

```shell
docker run -p "8080:8080" ghcr.io/seanghay/ogg-transcode-server:latest
```

> `8080` is the default port of the http server. It can be changed with a PORT env.


## OGG to MP3

**Path:** `/transcode-mp3`

**Method:** `POST`

**Request Body:** `binary`

**Request Header:**
  - `Content-Type`: `audio/ogg`

**Response Body**: `binary`

**Response Header:**
  - `Content-Type`: `audio/mp3`


## OGG to WAV

**Path:** `/transcode-mp3`

**Method:** `POST`

**Request Body:** `binary`

**Request Header:**
  - `Content-Type`: `audio/ogg`

**Response Body**: `binary`

**Response Header:**
  - `Content-Type`: `audio/wav`
