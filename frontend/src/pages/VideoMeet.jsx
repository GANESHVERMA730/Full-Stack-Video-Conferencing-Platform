import React, { useEffect, useRef, useState, useCallback } from "react";
import io from "socket.io-client";
import { Badge, IconButton, TextField, Button } from "@mui/material";
import VideocamIcon from "@mui/icons-material/Videocam";
import VideocamOffIcon from "@mui/icons-material/VideocamOff";
import styles from "../styles/videoComponent.module.css";
import CallEndIcon from "@mui/icons-material/CallEnd";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ScreenShareIcon from "@mui/icons-material/ScreenShare";
import StopScreenShareIcon from "@mui/icons-material/StopScreenShare";
import ChatIcon from "@mui/icons-material/Chat";
import server from "../environment";

const server_url = server;

const peerConfigConnections = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

const silence = () => {
  const ctx = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = ctx.createOscillator();
  const dst = oscillator.connect(ctx.createMediaStreamDestination());
  oscillator.start();
  ctx.resume();
  return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false });
};

const black = ({ width = 640, height = 480 } = {}) => {
  const canvas = Object.assign(document.createElement("canvas"), {
    width,
    height,
  });
  canvas.getContext("2d").fillRect(0, 0, width, height);
  const stream = canvas.captureStream();
  return Object.assign(stream.getVideoTracks()[0], { enabled: false });
};

export default function VideoMeetComponent() {
  const socketRef = useRef(null);
  const socketIdRef = useRef(null);
  const localVideoref = useRef(null);
  const connectionsRef = useRef({});

  const [videoAvailable, setVideoAvailable] = useState(true);
  const [audioAvailable, setAudioAvailable] = useState(true);
  const [video, setVideo] = useState(true);
  const [audio, setAudio] = useState(true);
  const [screen, setScreen] = useState(false);
  const [showModal, setModal] = useState(true);
  const [screenAvailable, setScreenAvailable] = useState(false);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [newMessages, setNewMessages] = useState(0);
  const [askForUsername, setAskForUsername] = useState(true);
  const [username, setUsername] = useState("");
  const videoRef = useRef([]);
  const [videos, setVideos] = useState([]);

  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices
        .getUserMedia({ video: true })
        .catch(() => false);
      setVideoAvailable(!!videoPermission);

      const audioPermission = await navigator.mediaDevices
        .getUserMedia({ audio: true })
        .catch(() => false);
      setAudioAvailable(!!audioPermission);

      if (navigator.mediaDevices.getDisplayMedia) {
        setScreenAvailable(true);
      } else {
        setScreenAvailable(false);
      }

      if (videoPermission || audioPermission) {
        const userMediaStream = await navigator.mediaDevices
          .getUserMedia({ video: true, audio: true })
          .catch(() => null);
        if (userMediaStream) {
          window.cameraStream = userMediaStream;
          window.localStream = userMediaStream;
          if (localVideoref.current) {
            localVideoref.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.error("Error getting user permissions:", error);
    }
  };

  useEffect(() => {
    getPermissions();
    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
      if (window.localStream) {
        window.localStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const addStreamToPeer = (peer, stream) => {
    if (!stream) return;
    stream.getTracks().forEach((track) => {
      try {
        peer.addTrack(track, stream);
      } catch (e) {
        // track may already be added
      }
    });
  };

  const gotMessageFromServer = (fromId, message) => {
    const signal = JSON.parse(message);

    if (fromId !== socketIdRef.current) {
      const peer = connectionsRef.current[fromId];
      if (!peer) return;

      if (signal.sdp) {
        peer
          .setRemoteDescription(new RTCSessionDescription(signal.sdp))
          .then(() => {
            if (signal.sdp.type === "offer") {
              peer
                .createAnswer()
                .then((description) => {
                  peer
                    .setLocalDescription(description)
                    .then(() => {
                      socketRef.current.emit(
                        "signal",
                        fromId,
                        JSON.stringify({ sdp: peer.localDescription }),
                      );
                    })
                    .catch((e) =>
                      console.error("Error setting local answer SDP:", e),
                    );
                })
                .catch((e) => console.error("Error creating answer SDP:", e));
            }
          })
          .catch((e) =>
            console.error("Error setting remote description SDP:", e),
          );
      }

      if (signal.ice) {
        peer
          .addIceCandidate(new RTCIceCandidate(signal.ice))
          .catch((e) => console.error("Error adding ICE candidate:", e));
      }
    }
  };

  const addMessage = useCallback((data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: sender, data: data },
    ]);
    if (socketIdSender !== socketIdRef.current) {
      setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
  }, []);

  const handleRemoteStream = (socketListId, stream) => {
    setVideos((prevVideos) => {
      const videoExists = prevVideos.find((v) => v.socketId === socketListId);
      let updated;
      if (videoExists) {
        updated = prevVideos.map((v) =>
          v.socketId === socketListId ? { ...v, stream: stream } : v,
        );
      } else {
        updated = [
          ...prevVideos,
          {
            socketId: socketListId,
            stream: stream,
            autoplay: true,
            playsinline: true,
          },
        ];
      }
      videoRef.current = updated;
      return updated;
    });
  };

  const connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, { secure: false });

    socketRef.current.on("signal", gotMessageFromServer);

    socketRef.current.on("connect", () => {
      socketRef.current.emit("join-call", window.location.href);
      socketIdRef.current = socketRef.current.id;

      socketRef.current.on("chat-message", addMessage);

      socketRef.current.on("user-left", (id) => {
        setVideos((prevVideos) => prevVideos.filter((v) => v.socketId !== id));
        if (connectionsRef.current[id]) {
          connectionsRef.current[id].close();
          delete connectionsRef.current[id];
        }
      });

      socketRef.current.on("user-joined", (id, clients) => {
        clients.forEach((socketListId) => {
          if (socketListId === socketIdRef.current) return;

          if (!connectionsRef.current[socketListId]) {
            const peer = new RTCPeerConnection(peerConfigConnections);
            connectionsRef.current[socketListId] = peer;

            peer.onicecandidate = (event) => {
              if (event.candidate != null) {
                socketRef.current.emit(
                  "signal",
                  socketListId,
                  JSON.stringify({ ice: event.candidate }),
                );
              }
            };

            peer.ontrack = (event) => {
              if (event.streams && event.streams[0]) {
                handleRemoteStream(socketListId, event.streams[0]);
              }
            };

            peer.onaddstream = (event) => {
              if (event.stream) {
                handleRemoteStream(socketListId, event.stream);
              }
            };

            const activeStream =
              window.localStream || new MediaStream([black(), silence()]);
            addStreamToPeer(peer, activeStream);
          }
        });

        if (id === socketIdRef.current) {
          for (let id2 in connectionsRef.current) {
            if (id2 === socketIdRef.current) continue;

            const peer = connectionsRef.current[id2];
            peer
              .createOffer()
              .then((description) => {
                peer
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      id2,
                      JSON.stringify({ sdp: peer.localDescription }),
                    );
                  })
                  .catch((e) =>
                    console.error("Error setting local offer SDP:", e),
                  );
              })
              .catch((e) => console.error("Error creating offer SDP:", e));
          }
        }
      });
    });
  };

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  const handleVideo = () => {
    setVideo((prev) => {
      const next = !prev;
      if (window.localStream) {
        window.localStream.getVideoTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const handleAudio = () => {
    setAudio((prev) => {
      const next = !prev;
      if (window.localStream) {
        window.localStream.getAudioTracks().forEach((track) => {
          track.enabled = next;
        });
      }
      return next;
    });
  };

  const getDisplayMediaSuccess = useCallback((screenStream) => {
  const screenTrack = screenStream.getVideoTracks()[0];

  if (!screenTrack) {
    setScreen(false);
    return;
  }

  window.screenStream = screenStream;

  // Show screen share locally
  if (localVideoref.current) {
    localVideoref.current.srcObject = screenStream;
  }

  // Replace camera track with screen track for every peer
  for (let id in connectionsRef.current) {
    if (id === socketIdRef.current) continue;

    const peer = connectionsRef.current[id];

    const videoSender = peer
      .getSenders()
      .find((sender) => sender.track && sender.track.kind === "video");

    if (videoSender) {
      videoSender.replaceTrack(screenTrack).catch((error) => {
        console.error("Error replacing camera with screen:", error);
      });
    }
  }

  // When screen sharing is stopped from browser/system
  screenTrack.onended = () => {
    setScreen(false);

    const cameraStream = window.cameraStream;

    if (!cameraStream) {
      console.error("Camera stream not found");
      return;
    }

    const cameraTrack = cameraStream.getVideoTracks()[0];

    if (!cameraTrack) {
      console.error("Camera video track not found");
      return;
    }

    // Show camera locally again
    if (localVideoref.current) {
      localVideoref.current.srcObject = cameraStream;
    }

    // Replace screen track with camera track for every peer
    for (let id in connectionsRef.current) {
      if (id === socketIdRef.current) continue;

      const peer = connectionsRef.current[id];

      const videoSender = peer
        .getSenders()
        .find((sender) => sender.track && sender.track.kind === "video");

      if (videoSender) {
        videoSender.replaceTrack(cameraTrack).catch((error) => {
          console.error("Error restoring camera:", error);
        });
      }
    }

    window.localStream = cameraStream;
    window.screenStream = null;
  };
}, []);

  const getDisplayMedia = useCallback(() => {
  if (!screen) return;

  if (!navigator.mediaDevices.getDisplayMedia) {
    setScreen(false);
    return;
  }

  navigator.mediaDevices
    .getDisplayMedia({ video: true, audio: true })
    .then(getDisplayMediaSuccess)
    .catch((error) => {
      console.error("Screen sharing cancelled or failed:", error);
      setScreen(false);
    });
}, [screen, getDisplayMediaSuccess]);

  useEffect(() => {
    if (screen !== undefined && !askForUsername) {
      getDisplayMedia();
    }
  }, [screen, askForUsername, getDisplayMedia]);

  useEffect(() => {
    if (!askForUsername && localVideoref.current && window.localStream) {
      localVideoref.current.srcObject = window.localStream;
    }
  }, [askForUsername]);

  const handleScreen = () => {
  if (screen) {
    if (window.screenStream) {
      window.screenStream.getTracks().forEach((track) => {
        track.stop();
      });
    } else {
      setScreen(false);
    }
  } else {
    setScreen(true);
  }
};

  const handleEndCall = () => {
    try {
      if (localVideoref.current && localVideoref.current.srcObject) {
        let tracks = localVideoref.current.srcObject.getTracks();
        tracks.forEach((track) => track.stop());
      }
    } catch (e) {
      console.error(e);
    }

    if (socketRef.current) {
      socketRef.current.disconnect();
    }
    window.location.href = "/";
  };

  const sendMessage = () => {
    if (socketRef.current && message.trim() !== "") {
      socketRef.current.emit("chat-message", message, username);
      setMessage("");
    }
  };

  const connect = () => {
    if (!username.trim()) return;
    setAskForUsername(false);
    getMedia();
  };

  return (
    <div>
      {askForUsername === true ? (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "100vh",
            gap: "20px",
          }}
        >
          <h2>Enter into Lobby</h2>
          <div style={{ display: "flex", gap: "10px" }}>
            <TextField
              id="outlined-basic"
              label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              variant="outlined"
            />
            <Button variant="contained" onClick={connect}>
              Connect
            </Button>
          </div>
          <div>
            <video
              ref={localVideoref}
              autoPlay
              muted
              style={{ width: "320px", borderRadius: "10px" }}
            ></video>
          </div>
        </div>
      ) : (
        <div className={styles.meetVideoContainer}>
          {showModal ? (
            <div className={styles.chatRoom}>
              <div className={styles.chatContainer}>
                <h1>Chat</h1>
                <div className={styles.chattingDisplay}>
                  {messages.length !== 0 ? (
                    messages.map((item, index) => (
                      <div style={{ marginBottom: "20px" }} key={index}>
                        <p style={{ fontWeight: "bold" }}>{item.sender}</p>
                        <p>{item.data}</p>
                      </div>
                    ))
                  ) : (
                    <p>No Messages Yet</p>
                  )}
                </div>
                <div className={styles.chattingArea}>
                  <TextField
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    id="outlined-basic"
                    label="Enter Your chat"
                    variant="outlined"
                  />
                  <Button variant="contained" onClick={sendMessage}>
                    Send
                  </Button>
                </div>
              </div>
            </div>
          ) : null}

          <div className={styles.buttonContainers}>
            <IconButton onClick={handleVideo} style={{ color: "white" }}>
              {video === true ? <VideocamIcon /> : <VideocamOffIcon />}
            </IconButton>
            <IconButton onClick={handleEndCall} style={{ color: "red" }}>
              <CallEndIcon />
            </IconButton>
            <IconButton onClick={handleAudio} style={{ color: "white" }}>
              {audio === true ? <MicIcon /> : <MicOffIcon />}
            </IconButton>

            {screenAvailable === true ? (
              <IconButton onClick={handleScreen} style={{ color: "white" }}>
                {screen === true ? (
                  <StopScreenShareIcon />
                ) : (
                  <ScreenShareIcon />
                )}
              </IconButton>
            ) : null}

            <Badge badgeContent={newMessages} max={999} color="primary">
              <IconButton
                onClick={() => {
                  setModal(!showModal);
                  setNewMessages(0);
                }}
                style={{ color: "white" }}
              >
                <ChatIcon />
              </IconButton>
            </Badge>
          </div>

          <video
            className={styles.meetUserVideo}
            ref={localVideoref}
            autoPlay
            muted
            playsInline
          />

          <div className={styles.conferenceView}>
            {videos.map((v) => (
              <div key={v.socketId}>
                <video
                  data-socket={v.socketId}
                  ref={(ref) => {
                    if (ref && v.stream) {
                      ref.srcObject = v.stream;
                    }
                  }}
                  autoPlay
                  playsInline
                ></video>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
