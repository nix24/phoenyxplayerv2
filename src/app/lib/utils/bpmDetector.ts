'use client';

export async function detectBPM(audioUrl: string): Promise<number> {
  try {
    const audioContext = new AudioContext();
    const response = await fetch(audioUrl);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);

    // Get audio data
    const channelData = audioBuffer.getChannelData(0); // Get the first channel
    const sampleRate = audioBuffer.sampleRate;

    // Parameters for BPM detection
    const intervalSize = Math.floor(sampleRate * 0.05); // 50ms intervals
    const intervals: number[] = [];

    // Calculate energy for each interval
    for (let i = 0; i < channelData.length; i += intervalSize) {
      let energy = 0;
      for (let j = 0; j < intervalSize && i + j < channelData.length; j++) {
        energy += Math.abs(channelData[i + j]);
      }
      intervals.push(energy);
    }

    // Find peaks in energy
    const peaks: number[] = [];
    const threshold = Math.max(...intervals) * 0.5;

    for (let i = 1; i < intervals.length - 1; i++) {
      if (intervals[i] > threshold &&
        intervals[i] > intervals[i - 1] &&
        intervals[i] > intervals[i + 1]) {
        peaks.push(i);
      }
    }

    // Calculate average interval between peaks
    let totalIntervals = 0;
    for (let i = 1; i < peaks.length; i++) {
      totalIntervals += peaks[i] - peaks[i - 1];
    }

    const averageInterval = totalIntervals / (peaks.length - 1);

    // Convert to BPM
    // intervalSize is in samples, we need to convert to minutes
    const intervalInMinutes = (intervalSize * averageInterval) / (sampleRate * 60);
    const bpm = Math.round(1 / intervalInMinutes);

    // Ensure the BPM is within a reasonable range (60-200 BPM)
    return Math.max(60, Math.min(200, bpm));
  } catch (error) {
    console.error('Error detecting BPM:', error);
    return 120; // Default fallback
  }
}
