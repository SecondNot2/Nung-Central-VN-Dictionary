/**
 * Text-to-Speech Helper
 * Browser-based TTS fallback for when API TTS is unavailable
 */

export interface TTSOptions {
  lang?: string;
  rate?: number;
  pitch?: number;
  volume?: number;
}

/**
 * Check if browser TTS is available
 */
export function isBrowserTTSAvailable(): boolean {
  return "speechSynthesis" in window;
}

/**
 * Speak text using browser's built-in TTS
 * @param text - Text to speak
 * @param options - TTS options (language, rate, pitch, volume)
 */
export function speakWithBrowserTTS(
  text: string,
  options: TTSOptions = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isBrowserTTSAvailable()) {
      reject(new Error("Browser TTS not supported"));
      return;
    }

    const { lang = "vi-VN", rate = 1, pitch = 1, volume = 1 } = options;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = lang;
    utterance.rate = rate;
    utterance.pitch = pitch;
    utterance.volume = volume;

    utterance.onend = () => resolve();
    utterance.onerror = (event) =>
      reject(new Error(`TTS Error: ${event.error}`));

    window.speechSynthesis.speak(utterance);
  });
}

/**
 * Stop any ongoing speech
 */
export function stopSpeech(): void {
  if (isBrowserTTSAvailable()) {
    window.speechSynthesis.cancel();
  }
}

/**
 * Get available voices for a specific language
 */
export function getVoicesForLanguage(langCode: string): SpeechSynthesisVoice[] {
  if (!isBrowserTTSAvailable()) return [];

  return window.speechSynthesis
    .getVoices()
    .filter((voice) => voice.lang.startsWith(langCode));
}
