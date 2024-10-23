import { useMediaRecorder } from "react-media-recorder";

const Recorder = ({ onAudioStop }) => {
  const { startRecording, stopRecording, mediaBlobUrl } = useMediaRecorder({
    audio: true,
    mimeType: "audio/wav",
    onStop: (blobUrl) => onAudioStop(blobUrl),
  });

  return (
    <div>
      <button onClick={startRecording}>Start Recording</button>
      <button onClick={stopRecording}>Stop Recording</button>
      {mediaBlobUrl && <audio src={mediaBlobUrl} controls />}
    </div>
  );
};

export default Recorder;
