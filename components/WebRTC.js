import { useEffect, useRef, useState } from "react";
import Peer from "simple-peer";

const WebRTC = ({ stream }) => {
  const [peer, setPeer] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream: stream,
    });

    peer.on("signal", (data) => {
      // Handle signaling data
      console.log("Signal", data);
    });

    peer.on("stream", (remoteStream) => {
      if (videoRef.current) {
        videoRef.current.srcObject = remoteStream;
      }
    });

    setPeer(peer);

    return () => {
      peer.destroy();
    };
  }, [stream]);

  return <video ref={videoRef} autoPlay playsInline />;
};

export default WebRTC;
