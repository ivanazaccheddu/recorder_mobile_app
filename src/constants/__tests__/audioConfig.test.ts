import { QUALITY_PRESETS } from '../audioConfig';

describe('Audio Configuration', () => {
  describe('QUALITY_PRESETS', () => {
    const qualities = ['low', 'medium', 'high'] as const;

    qualities.forEach(quality => {
      describe(`${quality} quality preset`, () => {
        it('should have android configuration', () => {
          const preset = QUALITY_PRESETS[quality];
          expect(preset.android).toBeDefined();
          expect(preset.android.extension).toBeDefined();
          expect(preset.android.outputFormat).toBeDefined();
          expect(preset.android.audioEncoder).toBeDefined();
          expect(preset.android.sampleRate).toBeDefined();
          expect(preset.android.numberOfChannels).toBeDefined();
          expect(preset.android.bitRate).toBeDefined();
        });

        it('should have ios configuration', () => {
          const preset = QUALITY_PRESETS[quality];
          expect(preset.ios).toBeDefined();
          expect(preset.ios.extension).toBeDefined();
          expect(preset.ios.outputFormat).toBeDefined();
          expect(preset.ios.audioQuality).toBeDefined();
          expect(preset.ios.sampleRate).toBeDefined();
          expect(preset.ios.numberOfChannels).toBeDefined();
          expect(preset.ios.bitRate).toBeDefined();
        });

        it('should have web configuration', () => {
          const preset = QUALITY_PRESETS[quality];
          expect(preset.web).toBeDefined();
          expect(preset.web.mimeType).toBeDefined();
          expect(preset.web.bitsPerSecond).toBeDefined();
        });

        it('should have consistent extension across platforms', () => {
          const preset = QUALITY_PRESETS[quality];
          expect(preset.android.extension).toBe('.m4a');
          expect(preset.ios.extension).toBe('.m4a');
        });

        it('should have valid web mimeType', () => {
          const preset = QUALITY_PRESETS[quality];
          expect(preset.web.mimeType).toBe('audio/webm');
        });
      });
    });

    it('should have increasing bitrates for higher quality', () => {
      const lowBitrate = QUALITY_PRESETS.low.android.bitRate;
      const mediumBitrate = QUALITY_PRESETS.medium.android.bitRate;
      const highBitrate = QUALITY_PRESETS.high.android.bitRate;

      expect(lowBitrate).toBeLessThan(mediumBitrate);
      expect(mediumBitrate).toBeLessThan(highBitrate);
    });

    it('should have consistent bitrates between android and ios for same quality', () => {
      qualities.forEach(quality => {
        const preset = QUALITY_PRESETS[quality];
        expect(preset.android.bitRate).toBe(preset.ios.bitRate);
      });
    });

    it('should have matching bitsPerSecond for web with other platforms', () => {
      qualities.forEach(quality => {
        const preset = QUALITY_PRESETS[quality];
        expect(preset.web.bitsPerSecond).toBe(preset.android.bitRate);
      });
    });
  });
});
