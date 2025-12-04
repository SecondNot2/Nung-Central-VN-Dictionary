/**
 * Audio Decoding Helpers
 * Shared utilities for decoding audio data (PCM, Base64)
 */

/**
 * Decode Base64 string to Uint8Array
 */
export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Decode raw PCM audio data to AudioBuffer
 * @param data - Raw PCM audio data as Uint8Array
 * @param ctx - AudioContext instance
 * @param sampleRate - Sample rate (default: 24000 Hz)
 * @param numChannels - Number of audio channels (default: 1 - mono)
 */
export function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number = 24000,
  numChannels: number = 1
): AudioBuffer {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

/**
 * Play AudioBuffer using Web Audio API
 */
export function playAudioBuffer(buffer: AudioBuffer, ctx: AudioContext): void {
  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.connect(ctx.destination);
  source.start();
}
