import { Mp3Encoder } from "lamejsfix";
import { OpusStreamDecoder } from 'opus-stream-decoder'
import { parseBuffer } from "music-metadata";
import WavEncoder from "wav-encoder";

export async function createMp3FromOggBuffer(inputBuffer) {

  const MAX_SAMPLE_SIZE = 1152;

  function convertBuffer(arrayBuffer) {
    const input = new Float32Array(arrayBuffer);
    const output = new Int16Array(arrayBuffer.length);

    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
    }

    return output;
  }

  const dataBuffer = [];
  let length = 0;
  let mp3Encoder = null;
  const decoder = new OpusStreamDecoder({
    onDecode({ left, sampleRate }) {

      if (mp3Encoder == null) {
        mp3Encoder = new Mp3Encoder(1, sampleRate, 32);
      }

      const samplesMono = convertBuffer(left);
      let remaining = samplesMono.length;

      for (let i = 0; remaining >= 0; i += MAX_SAMPLE_SIZE) {
        const left = samplesMono.subarray(i, i + MAX_SAMPLE_SIZE);
        const buffer = mp3Encoder.encodeBuffer(left);
        length += buffer.length;
        dataBuffer.push(new Uint8Array(buffer));
        remaining -= MAX_SAMPLE_SIZE;
      }
    }
  })

  try {
    await decoder.ready;
    decoder.decode(inputBuffer);
    decoder.free();
    const buffer = mp3Encoder.flush();
    length += buffer.length;
    dataBuffer.push(new Uint8Array(buffer));
    return Buffer.concat(dataBuffer, length);
  } catch (e) {
    await decoder.ready
    decoder.free();
    throw e;
  }
}



export async function createWavFromOggBuffer(inputBuffer) {

  const { format } = await parseBuffer(inputBuffer)
  const { numberOfChannels } = format;

  let _sampleRate = -1;

  const leftBuffers = [];
  const rightBuffers = [];

  const decoder = new OpusStreamDecoder({
    onDecode({ left, right, sampleRate }) {
      leftBuffers.push(...left);
      if (numberOfChannels > 1) {
        rightBuffers.push(...right);
      }
      _sampleRate = sampleRate;
    }
  })

  try {
    await decoder.ready;
    decoder.decode(inputBuffer);
    const channelData = [
      new Float32Array(leftBuffers),
    ];

    if (numberOfChannels > 1) {
      channelData.push(new Float32Array(rightBuffers))
    }
    decoder.free();
    return Buffer.from(
      await WavEncoder.encode({
        sampleRate: _sampleRate,
        channelData,
      })
    )
  } catch (e) {
    await decoder.ready
    decoder.free()
    throw e;
  }
}
