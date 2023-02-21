import 'dotenv/config.js';
import express from 'express';
import {
  createMp3FromOggBuffer,
  createWavFromOggBuffer
} from './audio.js'

import gracefulShutdown from 'http-graceful-shutdown';

const app = express();

app.use(express.raw({ type: "audio/ogg", limit: "100mb" }));
app.disable('x-powered-by');
app.post("/transcode-wav", async (req, res) => {
  res.type('audio/wav');
  res.send(await createWavFromOggBuffer(req.body))
});

app.post("/transcode-mp3", async (req, res) => {
  res.type('audio/mp3');
  res.send(await createMp3FromOggBuffer(req.body))
});

const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => console.log(`server is on http://0.0.0.0:${PORT}`))

gracefulShutdown(server, {
  onShutdown() {
    console.log('http shutdown')
  }
});
