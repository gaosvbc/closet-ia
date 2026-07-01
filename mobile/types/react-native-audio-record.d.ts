declare module "react-native-audio-record" {
  interface AudioRecordOptions {
    sampleRate: number;
    channels: number;
    bitsPerSample: 8 | 16;
    /** Android AudioSource constant. 6 = VOICE_RECOGNITION. */
    audioSource?: number;
    /** Optional path for writing a WAV file alongside the stream. */
    wavFile?: string;
  }

  interface AudioSubscription {
    remove: () => void;
  }

  const AudioRecord: {
    init(options: AudioRecordOptions): void;
    start(): void;
    /** Resolves with the WAV file path (or empty string if wavFile not set). */
    stop(): Promise<string>;
    on(event: "data", callback: (data: string) => void): AudioSubscription;
  };

  export default AudioRecord;
}
