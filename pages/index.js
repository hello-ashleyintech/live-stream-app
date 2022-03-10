import React, { useState, useRef } from "react";
import styles from "../styles/LiveVideoPage.module.css";

export default () => {
  const [connected, setConnected] = useState(false);
  const [cameraEnabled, setCameraEnabled] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [streamKey, setStreamKey] = useState(null);

  // Use the useRef() here so that when these values are updated, re-rendering of the component is not triggered.
  const inputStreamRef = useRef();
  const videoRef = useRef();
  const canvasRef = useRef();
  const wsRef = useRef();
  const mediaRecorderRef = useRef();
  const requestAnimationRef = useRef();

  const CAMERA_CONSTRAINTS = {
    audio: true,
    video: { width: 960, height: 540 },
  };

  /**
   * This function will query for permission from the user's input camera and,
   * if granted, set up the corresponding output canvas to match the input video
   * height and weight.
   */
  const enableCamera = async () => {
    // Prompts user for permission to use a media input - produces a MediaStream,
    // which has tracks containing requested types of media. This is requesting to
    // get both audio and video inputs, with video having a preferred width of 960px
    // and a preferred height of 540px.
    inputStreamRef.current = await navigator.mediaDevices.getUserMedia(
      CAMERA_CONSTRAINTS
    );

    videoRef.current.srcObject = inputStreamRef.current;

    await videoRef.current.play();

    setCameraEnabled(true);

    // We need to set the canvas height/width to match the video element.
    canvasRef.current.height = videoRef.current.clientHeight;
    canvasRef.current.width = videoRef.current.clientWidth - 30;
    console.log(videoRef.current.clientWidth);
    console.log(canvasRef.current.width);

    // This will animate the output canvas and continuously call updateCanvas() to map the input
    // to an animated canvas output.
    requestAnimationRef.current = requestAnimationFrame(updateCanvas);
  };

  /**
   * Continuously renders the output canvas element, which is what is being sent to the live stream.
   * Also adds graphics on top of the canvas (in this case, "Welcome to Stream with Ashley!")
   */
  const updateCanvas = () => {
    if (videoRef.current.ended || videoRef.current.paused) {
      return;
    }

    const ctx = canvasRef.current.getContext("2d");

    ctx.drawImage(
      videoRef.current,
      0,
      0,
      videoRef.current.clientWidth,
      videoRef.current.clientHeight
    );

    ctx.fillStyle = "#87D8E8";
    ctx.font = "50px cursive";
    ctx.fillText(`Welcome to Stream with Ashley! ✨`, 5, 50);

    requestAnimationRef.current = requestAnimationFrame(updateCanvas);
  };

  /**
   * Initializes the streaming process and initializes a WebSocket for an
   * RTMP connection using your Mux stream key.
   */
  const startStreaming = () => {
    setStreaming(true);

    const protocol = window.location.protocol.replace("http", "ws");
    wsRef.current = new WebSocket(
      `${protocol}//${window.location.host}/rtmp?key=${streamKey}`
    );

    wsRef.current.addEventListener("open", function open() {
      setConnected(true);
    });

    wsRef.current.addEventListener("close", () => {
      setConnected(false);
      stopStreaming();
    });

    const videoOutputStream = canvasRef.current.captureStream(30); // 30 FPS

    // Let's do some extra work to get audio to join the party.
    // https://hacks.mozilla.org/2016/04/record-almost-everything-in-the-browser-with-mediarecorder/
    const audioStream = new MediaStream();
    const audioTracks = inputStreamRef.current.getAudioTracks();
    audioTracks.forEach(function (track) {
      audioStream.addTrack(track);
    });

    const outputStream = new MediaStream();
    [audioStream, videoOutputStream].forEach(function (s) {
      s.getTracks().forEach(function (t) {
        outputStream.addTrack(t);
      });
    });

    mediaRecorderRef.current = new MediaRecorder(outputStream, {
      mimeType: "video/webm",
      videoBitsPerSecond: 3000000,
    });

    mediaRecorderRef.current.start(1000);

    mediaRecorderRef.current.addEventListener("dataavailable", (e) => {
      wsRef.current.send(e.data);
    });

    mediaRecorderRef.current.addEventListener("stop", () => {
      stopStreaming();
      wsRef.current.close();
    });
  };

  /**
   * Ends the media recorder connection by raising a "stop" event
   * and sets streaming state variable back to false.
   */
  const stopStreaming = () => {
    mediaRecorderRef.current.stop();
    setStreaming(false);
  };

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto" }}>
      <div className={styles.headerTextContainer}>
        <h1 className={styles.primaryFont}>STREAM WITH ASHLEY</h1>
      </div>
      <div className={styles.graphic1}>
        <img
          className={styles.img}
          src="transparent-tube.png"
          alt="holographic 3D tube"
        />
      </div>
      <div className={styles.graphic2}>
        <img
          className={styles.img}
          src="rubiks-cube.png"
          alt="holographic rubiks cube"
        />
      </div>
      <div className={styles.graphic3} alt="holographic bubble">
        <img className={styles.img} src="bubble.png" />
      </div>
      <div className={styles.graphic4} alt="holoraphic sad face">
        <img className={styles.img} src="frowny-boi.png" />
      </div>
      <div className={styles.graphic5} alt="holographic bubble">
        <img className={styles.img} src="bubble.png" />
      </div>
      <div className={styles.graphic6} alt="holographic stars">
        <img className={styles.imgSmall} src="holo-stars.png" />
      </div>
      <div className={styles.graphic7} alt="holographic stars">
        <img className={styles.imgSmall} src="holo-stars.png" />
      </div>
      <div className={styles.streamKeyContainer}>
        {!cameraEnabled && (
          <button className={styles.button} onClick={enableCamera}>
            Enable Camera
          </button>
        )}
        {cameraEnabled &&
          (streaming ? (
            <div>
              <span className={styles.connectedText}>
                {connected ? "Connected" : "Disconnected"}
              </span>
              <button className={styles.button} onClick={stopStreaming}>
                Stop Streaming
              </button>
            </div>
          ) : (
            <>
              <input
                className={styles.input}
                placeholder="Stream Key"
                type="text"
                onChange={(e) => setStreamKey(e.target.value)}
              />
              <button
                className={styles.button}
                disabled={!streamKey}
                onClick={startStreaming}
              >
                Start Streaming
              </button>
            </>
          ))}
      </div>
      <div className="row">
        <div className="column">
          <h2 children className={styles.secondaryFont}>
            INPUT
          </h2>
          <video
            className={styles.videoCanvas}
            ref={videoRef}
            controls
            width="100%"
            height="auto"
            muted
          ></video>
        </div>
        <div className="column">
          {cameraEnabled && (
            <>
              <h2 className={styles.secondaryFont}>OUTPUT</h2>
              <div>
                <canvas className={styles.videoCanvas} ref={canvasRef}></canvas>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
