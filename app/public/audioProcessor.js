class PCMWorkletProcessor extends AudioWorkletProcessor {
  process(inputs, outputs, parameters) {
    const input = inputs[0]; // First input is the microphone input
    if (input) {
      const channelData = input[0]; // Get data from the first channel
      const pcm16AudioData = this.float32ToPCM16(channelData);

      // Send audio data to the main thread
      this.port.postMessage(pcm16AudioData);
    }
    return true; // Keep the processor alive
  }

  float32ToPCM16(audioData) {
    const pcm16 = new Int16Array(audioData.length);
    for (let i = 0; i < audioData.length; i++) {
      pcm16[i] = Math.max(-1, Math.min(1, audioData[i])) * 0x7fff;
    }
    return pcm16;
  }
}

registerProcessor("pcm-worklet-processor", PCMWorkletProcessor);
