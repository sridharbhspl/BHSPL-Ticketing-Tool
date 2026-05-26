/**
 * useMediaDevices — Industry-grade WebRTC media hook
 *
 * Connects to:
 *  - System Microphone  (getUserMedia audio)
 *  - System Camera      (getUserMedia video)
 *  - System Speakers    (via AudioContext + analyser for live level meter)
 *  - Screen Share       (getDisplayMedia)
 *
 * All streams are cleaned up automatically on unmount or when stopped.
 */

import { useState, useEffect, useRef, useCallback } from 'react';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: MediaDeviceKind;
}

export interface MediaState {
  // Streams
  localStream:       MediaStream | null;   // camera + mic
  screenStream:      MediaStream | null;   // screen share
  displayStream:     MediaStream | null;   // combined for <video> display

  // Toggles
  isMicOn:           boolean;
  isCameraOn:        boolean;
  isScreenSharing:   boolean;

  // Device level meters (0–100)
  micLevel:          number;

  // Permission / error state
  permissionError:   string | null;
  isSecureContext:   boolean;
  isRequestingMedia: boolean;

  // Available devices
  audioInputs:       DeviceInfo[];
  videoInputs:       DeviceInfo[];
  audioOutputs:      DeviceInfo[];

  // Selected device IDs
  selectedMicId:     string;
  selectedCameraId:  string;
  selectedSpeakerId: string;
}

export interface MediaActions {
  startMedia:        (opts?: { audio?: boolean; video?: boolean }) => Promise<void>;
  stopMedia:         () => void;
  toggleMic:         () => void;
  toggleCamera:      () => void;
  startScreenShare:  () => Promise<void>;
  stopScreenShare:   () => void;
  setSpeakerDevice:  (deviceId: string, audioEl: HTMLAudioElement | null) => Promise<void>;
  selectMic:         (deviceId: string) => Promise<void>;
  selectCamera:      (deviceId: string) => Promise<void>;
  attachLocalVideo:  (el: HTMLVideoElement | null) => void;
  attachScreenVideo: (el: HTMLVideoElement | null) => void;
  enumerateDevices:  () => Promise<void>;
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMediaDevices(): MediaState & MediaActions {
  const [state, setState] = useState<MediaState>({
    localStream:       null,
    screenStream:      null,
    displayStream:     null,
    isMicOn:           true,
    isCameraOn:        true,
    isScreenSharing:   false,
    micLevel:          0,
    permissionError:   null,
    isSecureContext:   window.isSecureContext,
    isRequestingMedia: false,
    audioInputs:       [],
    videoInputs:       [],
    audioOutputs:      [],
    selectedMicId:     '',
    selectedCameraId:  '',
    selectedSpeakerId: '',
  });

  // Refs — stable across renders, no re-render on change
  const localStreamRef  = useRef<MediaStream | null>(null);
  const screenStreamRef = useRef<MediaStream | null>(null);
  const audioCtxRef     = useRef<AudioContext | null>(null);
  const analyserRef     = useRef<AnalyserNode | null>(null);
  const animFrameRef    = useRef<number>(0);
  const localVideoElRef = useRef<HTMLVideoElement | null>(null);
  const screenVideoElRef= useRef<HTMLVideoElement | null>(null);

  // ── Cleanup helper ────────────────────────────────────────────────────────
  const stopStream = useCallback((stream: MediaStream | null) => {
    if (!stream) return;
    stream.getTracks().forEach(t => t.stop());
  }, []);

  const stopMicMeter = useCallback(() => {
    cancelAnimationFrame(animFrameRef.current);
    audioCtxRef.current?.close().catch(() => {});
    audioCtxRef.current = null;
    analyserRef.current = null;
    setState(s => ({ ...s, micLevel: 0 }));
  }, []);

  // ── Full cleanup on unmount ───────────────────────────────────────────────
  useEffect(() => {
    return () => {
      stopStream(localStreamRef.current);
      stopStream(screenStreamRef.current);
      stopMicMeter();
    };
  }, [stopStream, stopMicMeter]);

  // ── Enumerate devices ─────────────────────────────────────────────────────
  const enumerateDevices = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const audioInputs  = devices.filter(d => d.kind === 'audioinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Microphone ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
      const videoInputs  = devices.filter(d => d.kind === 'videoinput').map(d => ({ deviceId: d.deviceId, label: d.label || `Camera ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
      const audioOutputs = devices.filter(d => d.kind === 'audiooutput').map(d => ({ deviceId: d.deviceId, label: d.label || `Speaker ${d.deviceId.slice(0, 8)}`, kind: d.kind }));
      setState(s => ({
        ...s,
        audioInputs,
        videoInputs,
        audioOutputs,
        selectedMicId:     s.selectedMicId     || audioInputs[0]?.deviceId  || '',
        selectedCameraId:  s.selectedCameraId  || videoInputs[0]?.deviceId  || '',
        selectedSpeakerId: s.selectedSpeakerId || audioOutputs[0]?.deviceId || '',
      }));
    } catch {
      // silently fail enumeration
    }
  }, []);

  // ── Device change listener ───────────────────────────────────────────────
  useEffect(() => {
    const handler = () => enumerateDevices();
    navigator.mediaDevices.addEventListener('devicechange', handler);
    return () => navigator.mediaDevices.removeEventListener('devicechange', handler);
  }, [enumerateDevices]);

  // ── Mic level analyser ────────────────────────────────────────────────────

  // ── Mic level analyser ────────────────────────────────────────────────────
  const startMicMeter = useCallback((stream: MediaStream) => {
    try {
      const ctx      = new AudioContext();
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      const source   = ctx.createMediaStreamSource(stream);
      source.connect(analyser);
      audioCtxRef.current  = ctx;
      analyserRef.current  = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        analyser.getByteFrequencyData(data);
        const avg = data.reduce((a, b) => a + b, 0) / data.length;
        setState(s => ({ ...s, micLevel: Math.min(100, Math.round(avg * 1.5)) }));
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch {
      // AudioContext not available
    }
  }, []);

  // ── Start local media (mic + camera) ─────────────────────────────────────
  const startMedia = useCallback(async (opts: { audio?: boolean; video?: boolean } = { audio: true, video: true }) => {
    if (!window.isSecureContext) {
      setState(s => ({ ...s, permissionError: 'INSECURE_CONTEXT' }));
      return;
    }
    
    setState(s => ({ ...s, isRequestingMedia: true, permissionError: null }));
    try {
      const constraints: MediaStreamConstraints = {
        audio: opts.audio !== false ? { 
          deviceId: state.selectedMicId ? { exact: state.selectedMicId } : undefined,
          echoCancellation: { ideal: true }, 
          noiseSuppression: { ideal: true }, 
          autoGainControl: { ideal: true },
          sampleRate: { ideal: 48000 } 
        } : false,
        video: opts.video !== false ? { 
          deviceId: state.selectedCameraId ? { exact: state.selectedCameraId } : undefined,
          width: { ideal: 1920, max: 1920 }, 
          height: { ideal: 1080, max: 1080 }, 
          frameRate: { ideal: 30 },
          facingMode: 'user' 
        } : false,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      stopStream(localStreamRef.current);
      localStreamRef.current = stream;

      // Attach to <video> element if already mounted
      if (localVideoElRef.current) {
        localVideoElRef.current.srcObject = stream;
      }

      if (opts.audio !== false) startMicMeter(stream);
      await enumerateDevices();

      setState(s => ({
        ...s,
        localStream:       stream,
        isMicOn:           true,
        isCameraOn:        opts.video !== false,
        isRequestingMedia: false,
        permissionError:   null,
      }));
    } catch (err: unknown) {
      console.error('Media capture failed:', err);
      let msg = 'Permission denied';
      if (err instanceof Error) {
        if (err.name === 'NotAllowedError') msg = 'PERMISSION_DENIED';
        else if (err.name === 'NotFoundError') msg = 'DEVICE_NOT_FOUND';
        else msg = err.message;
      }
      setState(s => ({ ...s, isRequestingMedia: false, permissionError: msg }));
    }
  }, [stopStream, startMicMeter, enumerateDevices]);

  // ── Stop all local media ──────────────────────────────────────────────────
  const stopMedia = useCallback(() => {
    stopStream(localStreamRef.current);
    localStreamRef.current = null;
    stopMicMeter();
    if (localVideoElRef.current) localVideoElRef.current.srcObject = null;
    setState(s => ({ ...s, localStream: null, isMicOn: false, isCameraOn: false }));
  }, [stopStream, stopMicMeter]);

  // ── Toggle mic ────────────────────────────────────────────────────────────
  const toggleMic = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const audioTracks = stream.getAudioTracks();
    const nextEnabled = !audioTracks[0]?.enabled;
    audioTracks.forEach(t => { t.enabled = nextEnabled; });
    setState(s => ({ ...s, isMicOn: nextEnabled }));
  }, []);

  // ── Toggle camera ─────────────────────────────────────────────────────────
  const toggleCamera = useCallback(() => {
    const stream = localStreamRef.current;
    if (!stream) return;
    const videoTracks = stream.getVideoTracks();
    const nextEnabled = !videoTracks[0]?.enabled;
    videoTracks.forEach(t => { t.enabled = nextEnabled; });
    setState(s => ({ ...s, isCameraOn: nextEnabled }));
  }, []);

  // ── Screen share ──────────────────────────────────────────────────────────
  const startScreenShare = useCallback(async () => {
    setState(s => ({ ...s, isRequestingMedia: true, permissionError: null }));
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: { frameRate: { ideal: 30 }, displaySurface: 'monitor' } as MediaTrackConstraints,
        audio: true, // capture system audio if user allows
      });

      // When user clicks "Stop Sharing" in the browser's native UI
      screenStream.getVideoTracks()[0].onended = () => {
        stopScreenShare();
      };

      stopStream(screenStreamRef.current);
      screenStreamRef.current = screenStream;

      if (screenVideoElRef.current) {
        screenVideoElRef.current.srcObject = screenStream;
      }

      setState(s => ({ ...s, screenStream, isScreenSharing: true, isRequestingMedia: false }));
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Screen share cancelled';
      setState(s => ({ ...s, isRequestingMedia: false, permissionError: msg === 'Permission denied' ? msg : null }));
    }
  }, [stopStream]);

  const stopScreenShare = useCallback(() => {
    stopStream(screenStreamRef.current);
    screenStreamRef.current = null;
    if (screenVideoElRef.current) screenVideoElRef.current.srcObject = null;
    setState(s => ({ ...s, screenStream: null, isScreenSharing: false }));
  }, [stopStream]);

  // ── Set speaker output device ─────────────────────────────────────────────
  const setSpeakerDevice = useCallback(async (deviceId: string, audioEl: HTMLAudioElement | null) => {
    if (!audioEl) return;
    // setSinkId is not yet in all typings
    const el = audioEl as HTMLAudioElement & { setSinkId?: (id: string) => Promise<void> };
    if (typeof el.setSinkId === 'function') {
      await el.setSinkId(deviceId);
      setState(s => ({ ...s, selectedSpeakerId: deviceId }));
    }
  }, []);

  // ── Switch mic device ─────────────────────────────────────────────────────
  const selectMic = useCallback(async (deviceId: string) => {
    setState(s => ({ ...s, selectedMicId: deviceId }));
    if (!localStreamRef.current) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: { exact: deviceId }, echoCancellation: true, noiseSuppression: true },
        video: localStreamRef.current.getVideoTracks().length > 0,
      });
      // Replace audio track in existing stream
      const [newAudio] = newStream.getAudioTracks();
      localStreamRef.current.getAudioTracks().forEach(t => {
        localStreamRef.current?.removeTrack(t);
        t.stop();
      });
      if (newAudio) localStreamRef.current.addTrack(newAudio);
      stopMicMeter();
      startMicMeter(localStreamRef.current);
    } catch {
      // ignore
    }
  }, [startMicMeter, stopMicMeter]);

  // ── Switch camera device ──────────────────────────────────────────────────
  const selectCamera = useCallback(async (deviceId: string) => {
    setState(s => ({ ...s, selectedCameraId: deviceId }));
    if (!localStreamRef.current) return;
    try {
      const newStream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      const [newVideo] = newStream.getVideoTracks();
      localStreamRef.current.getVideoTracks().forEach(t => {
        localStreamRef.current?.removeTrack(t);
        t.stop();
      });
      if (newVideo) {
        localStreamRef.current.addTrack(newVideo);
        if (localVideoElRef.current) localVideoElRef.current.srcObject = localStreamRef.current;
      }
    } catch {
      // ignore
    }
  }, []);

  // ── Attach video elements ─────────────────────────────────────────────────
  const attachLocalVideo = useCallback((el: HTMLVideoElement | null) => {
    localVideoElRef.current = el;
    if (el && localStreamRef.current) el.srcObject = localStreamRef.current;
  }, []);

  const attachScreenVideo = useCallback((el: HTMLVideoElement | null) => {
    screenVideoElRef.current = el;
    if (el && screenStreamRef.current) el.srcObject = screenStreamRef.current;
  }, []);

  return {
    ...state,
    startMedia,
    stopMedia,
    toggleMic,
    toggleCamera,
    startScreenShare,
    stopScreenShare,
    setSpeakerDevice,
    selectMic,
    selectCamera,
    attachLocalVideo,
    attachScreenVideo,
    enumerateDevices,
  };
}
