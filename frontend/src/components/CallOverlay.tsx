import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, MicOff, Video, VideoOff, Monitor, MonitorOff,
  XCircle, UserPlus, Minimize2, Maximize2, Volume2,
  ChevronDown, AlertTriangle, Loader, Settings, ShieldAlert,
  RotateCw
} from 'lucide-react';
import { useChatStore } from '../store/useChatStore';
import { useMediaDevices } from '../hooks/useMediaDevices';

const CallAvatar = ({ avatar, name, size }: { avatar?: string; name: string; size: number }) => {
  const [failed, setFailed] = useState(false);
  
  useEffect(() => {
    setFailed(false);
  }, [avatar]);

  return avatar && !failed ? (
    <img 
      src={avatar} 
      onError={() => setFailed(true)}
      style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
      alt={name} 
    />
  ) : (
    <div style={{
      width: '100%',
      height: '100%',
      background: 'linear-gradient(135deg, var(--primary) 0%, #d97706 100%)',
      color: '#0a0a0c',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontWeight: '700',
      fontSize: size > 80 ? '3rem' : '1.8rem',
      textTransform: 'uppercase',
      userSelect: 'none'
    }}>
      {name ? name.trim().charAt(0).toUpperCase() : 'U'}
    </div>
  );
};


/* ─── Mic Level Bar ─────────────────────────────────────────────────── */
const MicLevelBar: React.FC<{ level: number; isMuted: boolean }> = ({ level, isMuted }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', height: '20px' }}>
    {Array.from({ length: 12 }).map((_, i) => {
      const threshold = (i / 12) * 100;
      const active = !isMuted && level > threshold;
      const color = i < 8 ? 'var(--success)' : i < 10 ? 'var(--warning)' : '#ef4444';
      return (
        <div
          key={i}
          style={{
            width: '3px',
            height: `${8 + i * 1.5}px`,
            borderRadius: '2px',
            backgroundColor: active ? color : 'rgba(255,255,255,0.1)',
            transition: 'background-color 0.08s ease',
          }}
        />
      );
    })}
  </div>
);

/* ─── Device Picker ─────────────────────────────────────────────────── */
const DevicePicker: React.FC<{
  label: string;
  devices: { deviceId: string; label: string }[];
  selectedId: string;
  onSelect: (id: string) => void;
}> = ({ label, devices, selectedId, onSelect }) => {
  const [open, setOpen] = useState(false);
  const selected = devices.find(d => d.deviceId === selectedId);
  return (
    <div style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: '6px',
          padding: '6px 10px', borderRadius: '8px', fontSize: '0.72rem',
          backgroundColor: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.12)',
          color: 'var(--text-muted)', cursor: 'pointer', whiteSpace: 'nowrap',
          maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis',
        }}
      >
        <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selected?.label || label}
        </span>
        <ChevronDown size={11} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.96 }}
            style={{
              position: 'absolute', bottom: 'calc(100% + 8px)', left: 0,
              minWidth: '220px', backgroundColor: 'rgba(18,18,22,0.98)',
              backdropFilter: 'blur(20px)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '12px', padding: '6px', zIndex: 10,
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
            }}
          >
            <p style={{ fontSize: '0.65rem', color: 'var(--text-dim)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 8px 6px' }}>{label}</p>
            {devices.length === 0 && <p style={{ fontSize: '0.75rem', color: 'var(--text-dim)', padding: '6px 8px' }}>No devices found</p>}
            {devices.map(d => (
              <div
                key={d.deviceId}
                onClick={() => { onSelect(d.deviceId); setOpen(false); }}
                className="hover-glass"
                style={{
                  padding: '8px 10px', borderRadius: '8px', cursor: 'pointer',
                  fontSize: '0.8rem', color: d.deviceId === selectedId ? 'var(--primary)' : 'var(--text-main)',
                  fontWeight: d.deviceId === selectedId ? 700 : 400,
                  transition: 'all 0.15s',
                }}
              >
                {d.label}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Main CallOverlay ──────────────────────────────────────────────── */
const CallOverlay: React.FC<{ targetName: string; targetAvatar?: string; isDialing?: boolean }> = ({
  targetName, targetAvatar, isDialing,
}) => {
  const { activeCall, endCall } = useChatStore();
  const media = useMediaDevices();
  const [callTime, setCallTime] = useState('00:00');
  const [isMinimized, setIsMinimized] = useState(false);
  const [showDevices, setShowDevices] = useState(false);
  const localVideoRef  = useRef<HTMLVideoElement>(null);
  const screenVideoRef = useRef<HTMLVideoElement>(null);
  const speakerAudioRef= useRef<HTMLAudioElement>(null);

  /* Start camera + mic as soon as the overlay mounts */
  useEffect(() => {
    const type = activeCall?.type;
    media.startMedia({ audio: true, video: type === 'video' });
    return () => media.stopMedia();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Attach video element refs after mount */
  useEffect(() => { media.attachLocalVideo(localVideoRef.current); }, [media.localStream]);
  useEffect(() => { media.attachScreenVideo(screenVideoRef.current); }, [media.screenStream]);

  /* Call timer */
  useEffect(() => {
    const timer = setInterval(() => {
      if (activeCall?.startTime) {
        const diff = Math.floor((Date.now() - new Date(activeCall.startTime).getTime()) / 1000);
        setCallTime(`${String(Math.floor(diff / 60)).padStart(2,'0')}:${String(diff % 60).padStart(2,'0')}`);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [activeCall?.startTime]);

  const handleEndCall = useCallback(() => {
    media.stopMedia();
    media.stopScreenShare();
    endCall();
  }, [media, endCall]);

  const handleToggleMic = useCallback(() => {
    media.toggleMic();
  }, [media]);

  const handleToggleCamera = useCallback(() => {
    media.toggleCamera();
  }, [media]);

  const handleToggleScreen = useCallback(async () => {
    if (media.isScreenSharing) {
      media.stopScreenShare();
    } else {
      await media.startScreenShare();
    }
  }, [media]);

  if (!activeCall) return null;

  const isVideoCall = activeCall.type === 'video';

  /* ── Permission / Security error state ── */
  if (media.permissionError && !media.localStream) {
    const isIp = /^[0-9.]+$/.test(window.location.hostname);
    const isInsecure = media.permissionError === 'INSECURE_CONTEXT';
    
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
        style={{
          position: 'fixed', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
          width: 'min(480px, 92vw)', padding: '2.5rem',
          backgroundColor: 'rgba(15,15,18,0.98)', backdropFilter: 'blur(30px)',
          border: `1px solid ${isInsecure ? 'var(--warning)' : 'rgba(239,68,68,0.3)'}`, borderRadius: '32px',
          boxShadow: '0 40px 80px rgba(0,0,0,0.8)', zIndex: 3000,
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1.5rem', textAlign: 'center',
        }}
      >
        <div style={{ 
          width: '80px', height: '80px', borderRadius: '24px', 
          backgroundColor: isInsecure ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: isInsecure ? 'var(--primary)' : '#ef4444'
        }}>
          {isInsecure ? <ShieldAlert size={40} /> : <AlertTriangle size={40} />}
        </div>

        <div>
          <h3 style={{ fontWeight: 900, fontSize: '1.25rem', marginBottom: '0.5rem', letterSpacing: '-0.02em' }}>
            {isInsecure ? 'Security Protocol Required' : 'Media Access Denied'}
          </h3>
          <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6 }}>
            {isInsecure 
              ? `Modern browsers block camera/mic on insecure networks. Since you are accessing via ${window.location.hostname}, you must use HTTPS.`
              : 'The system was unable to initialize your camera or microphone. Please verify your hardware connection and browser permissions.'
            }
          </p>
        </div>

        {isInsecure && isIp && (
          <div style={{ 
            width: '100%', padding: '1.25rem', borderRadius: '16px', 
            backgroundColor: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.1)',
            textAlign: 'left'
          }}>
            <p style={{ fontSize: '0.75rem', fontWeight: 800, color: 'var(--primary)', marginBottom: '8px', textTransform: 'uppercase' }}>Industry Troubleshooting</p>
            <ul style={{ fontSize: '0.75rem', color: 'var(--text-dim)', paddingLeft: '1.2rem', margin: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <li>Access via <strong style={{ color: 'white' }}>localhost</strong> instead of IP.</li>
              <li>Use an <strong style={{ color: 'white' }}>HTTPS tunnel</strong> (e.g. ngrok) for remote testing.</li>
              <li>Enable <strong style={{ color: 'white' }}>Insecure origins</strong> in chrome://flags if testing locally.</li>
            </ul>
          </div>
        )}

        <div style={{ display: 'flex', gap: '12px', width: '100%' }}>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-secondary" 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            <RotateCw size={16} /> Retry
          </button>
          <button 
            onClick={handleEndCall} 
            className="btn-danger" 
            style={{ flex: 1, justifyContent: 'center' }}
          >
            Terminate Call
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      drag={isMinimized}
      dragMomentum={false}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      style={isMinimized ? {
        position: 'fixed', bottom: '24px', right: '24px',
        width: '300px', height: '200px',
        backgroundColor: 'rgba(15,15,18,0.97)', backdropFilter: 'blur(24px)',
        borderRadius: '16px', border: '1px solid rgba(255,255,255,0.12)',
        boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6)',
        zIndex: 2000, display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'grab',
      } : {
        position: 'fixed', top: '8vh', left: '50%',
        width: 'min(860px, 92vw)', height: '82vh',
        backgroundColor: 'rgba(12,12,15,0.97)', backdropFilter: 'blur(24px)',
        borderRadius: '24px', border: '1px solid rgba(255,255,255,0.1)',
        boxShadow: '0 30px 60px -12px rgba(0,0,0,0.7)',
        zIndex: 2000, display: 'flex', flexDirection: 'column', overflow: 'hidden',
        transform: 'translateX(-50%)',
      }}
    >
      {/* Hidden audio element for speaker routing */}
      <audio ref={speakerAudioRef} autoPlay style={{ display: 'none' }} />

      {/* ── Top controls ── */}
      <div style={{ position: 'absolute', top: '14px', right: '14px', zIndex: 10, display: 'flex', gap: '8px' }}>
        {!isMinimized && (
          <>
            <button
              onClick={() => setShowDevices(s => !s)}
              className="btn-icon"
              style={{ width: '34px', height: '34px', backgroundColor: showDevices ? 'rgba(245,158,11,0.15)' : 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: showDevices ? 'var(--primary)' : 'white' }}
              title="Device Settings"
            >
              <Settings size={15} />
            </button>
            <button className="btn-icon" onClick={() => alert('Invite link copied!')}
              style={{ width: '34px', height: '34px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
              <UserPlus size={15} />
            </button>
          </>
        )}
        <button onClick={() => setIsMinimized(m => !m)} className="btn-icon"
          style={{ width: '34px', height: '34px', backgroundColor: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.1)', color: 'white' }}>
          {isMinimized ? <Maximize2 size={15} /> : <Minimize2 size={15} />}
        </button>
      </div>

      {/* ── Device Settings Panel ── */}
      <AnimatePresence>
        {showDevices && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
            style={{
              backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(12px)',
              borderBottom: '1px solid rgba(255,255,255,0.08)',
              padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', overflow: 'hidden',
            }}
          >
            <DevicePicker
              label="Microphone"
              devices={media.audioInputs}
              selectedId={media.selectedMicId}
              onSelect={media.selectMic}
            />
            <DevicePicker
              label="Camera"
              devices={media.videoInputs}
              selectedId={media.selectedCameraId}
              onSelect={media.selectCamera}
            />
            <DevicePicker
              label="Speaker"
              devices={media.audioOutputs}
              selectedId={media.selectedSpeakerId}
              onSelect={(id) => media.setSpeakerDevice(id, speakerAudioRef.current)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Video / Avatar area ── */}
      <div style={{
        flex: 1, minHeight: 0, position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        background: 'radial-gradient(circle at 50% 40%, #181820 0%, #0a0a0c 100%)',
        overflow: 'hidden',
      }}>

        {/* Loading state */}
        {media.isRequestingMedia && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem', color: 'var(--text-dim)' }}>
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
              <Loader size={32} color="var(--primary)" />
            </motion.div>
            <p style={{ fontSize: '0.9rem' }}>Connecting to your devices…</p>
          </div>
        )}

        {/* Screen share view */}
        {media.isScreenSharing && !media.isRequestingMedia && (
          <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            {/* Real screen share stream */}
            <video
              ref={screenVideoRef}
              autoPlay
              playsInline
              muted
              style={{ width: '100%', height: '100%', objectFit: 'contain', backgroundColor: '#000' }}
            />
            {/* "Sharing" badge */}
            <div style={{
              position: 'absolute', top: '16px', left: '50%', transform: 'translateX(-50%)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              backgroundColor: 'rgba(239,68,68,0.9)', color: 'white',
              padding: '5px 14px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 800,
              boxShadow: '0 4px 16px rgba(239,68,68,0.5)',
            }}>
              <motion.div animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.2 }}
                style={{ width: '7px', height: '7px', borderRadius: '50%', backgroundColor: 'white' }} />
              YOU ARE SHARING SCREEN
            </div>
            {/* Stop sharing button */}
            <button
              onClick={handleToggleScreen}
              style={{
                position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)',
                padding: '9px 22px', borderRadius: '12px', backgroundColor: 'rgba(0,0,0,0.7)',
                border: '1px solid rgba(255,255,255,0.2)', color: 'white', fontWeight: 600,
                display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer',
                backdropFilter: 'blur(10px)',
              }}
            >
              <MonitorOff size={16} /> Stop Sharing
            </button>
          </div>
        )}

        {/* Camera / avatar view (when not screen sharing) */}
        {!media.isScreenSharing && !media.isRequestingMedia && (
          <>
            {/* Remote participant (avatar placeholder — WebRTC peer would go here) */}
            <div style={{
              width: isMinimized ? '80px' : '140px',
              height: isMinimized ? '80px' : '140px',
              borderRadius: '50%',
              border: '3px solid rgba(245,158,11,0.4)',
              overflow: 'hidden',
              boxShadow: '0 0 40px rgba(245,158,11,0.15)',
            }}>
              <CallAvatar avatar={targetAvatar} name={targetName} size={isMinimized ? 80 : 140} />
            </div>
            {/* Signal Indicator */}
            {!isMinimized && (
              <div style={{ position: 'absolute', bottom: '130px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '3px', alignItems: 'flex-end', height: '14px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} style={{ width: '3px', height: `${i * 20 + 20}%`, backgroundColor: i <= 4 ? 'var(--success)' : 'rgba(255,255,255,0.2)', borderRadius: '1px' }} />
                ))}
              </div>
            )}

            {!isMinimized && (
              <div style={{ position: 'absolute', bottom: '80px', textAlign: 'center' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '4px' }}>{targetName}</h2>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--primary)', fontWeight: 700, fontSize: '0.85rem' }}>
                  {isDialing ? (
                    <motion.div style={{ display: 'flex', gap: '4px' }}>
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0 }}>.</motion.span>
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}>.</motion.span>
                      <motion.span animate={{ opacity: [1, 0.4, 1] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}>.</motion.span>
                      DIALING
                    </motion.div>
                  ) : (
                    <>
                      <motion.div animate={{ scale: [1, 1.4, 1], opacity: [1, 0.5, 1] }} transition={{ repeat: Infinity, duration: 2 }}
                        style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: 'var(--primary)' }} />
                      LIVE {activeCall?.type?.toUpperCase() || 'CALL'}
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* ── Self preview (camera PiP) ── */}
        {!isMinimized && (
          <div style={{
            position: 'absolute', bottom: '16px', right: '16px',
            width: isVideoCall ? '180px' : '100px',
            height: isVideoCall ? '110px' : '100px',
            borderRadius: '14px', overflow: 'hidden',
            border: '2px solid rgba(255,255,255,0.15)',
            backgroundColor: '#111',
            boxShadow: '0 8px 24px rgba(0,0,0,0.6)', zIndex: 5,
          }}>
            {media.isCameraOn && isVideoCall ? (
              /* Real camera feed */
              <video
                ref={localVideoRef}
                autoPlay
                playsInline
                muted
                style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }}
              />
            ) : (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#1a1a1e' }}>
                <VideoOff size={20} color="var(--text-dim)" />
              </div>
            )}
            {/* Mic level indicator on self-preview */}
            <div style={{ position: 'absolute', bottom: '6px', left: '6px' }}>
              <MicLevelBar level={media.micLevel} isMuted={!media.isMicOn} />
            </div>
          </div>
        )}

        {/* Call info chips */}
        {!isMinimized && (
          <div style={{ position: 'absolute', top: '14px', left: '14px', display: 'flex', gap: '8px' }}>
            <div style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)', padding: '5px 12px', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.1)', fontSize: '0.82rem', fontWeight: 700 }}>
              {callTime}
            </div>
            <div style={{ backgroundColor: 'rgba(16,185,129,0.15)', color: 'var(--success)', padding: '5px 12px', borderRadius: '8px', fontSize: '0.7rem', fontWeight: 800, border: '1px solid rgba(16,185,129,0.2)' }}>
              E2E ENCRYPTED
            </div>
          </div>
        )}
      </div>

      {/* ── Controls bar ── */}
      {!isMinimized ? (
        <div style={{
          padding: '1.25rem 2rem', display: 'flex', justifyContent: 'center', alignItems: 'center',
          gap: '1rem', backgroundColor: 'rgba(0,0,0,0.35)', borderTop: '1px solid rgba(255,255,255,0.06)',
          flexWrap: 'wrap',
        }}>
          {/* Mic */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleToggleMic}
              className="btn-icon"
              style={{
                width: '54px', height: '54px', borderRadius: '18px',
                backgroundColor: media.isMicOn ? 'rgba(255,255,255,0.07)' : '#ef4444',
                color: media.isMicOn ? 'var(--text-main)' : 'white',
                boxShadow: media.isMicOn ? 'none' : '0 0 20px rgba(239,68,68,0.35)',
              }}
              title={media.isMicOn ? 'Mute Microphone' : 'Unmute Microphone'}
            >
              {media.isMicOn ? <Mic size={22} /> : <MicOff size={22} />}
            </button>
            <MicLevelBar level={media.micLevel} isMuted={!media.isMicOn} />
          </div>

          {/* Camera */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleToggleCamera}
              className="btn-icon"
              style={{
                width: '54px', height: '54px', borderRadius: '18px',
                backgroundColor: media.isCameraOn ? 'rgba(255,255,255,0.07)' : '#ef4444',
                color: media.isCameraOn ? 'var(--text-main)' : 'white',
                boxShadow: media.isCameraOn ? 'none' : '0 0 20px rgba(239,68,68,0.35)',
              }}
              title={media.isCameraOn ? 'Turn Off Camera' : 'Turn On Camera'}
            >
              {media.isCameraOn ? <Video size={22} /> : <VideoOff size={22} />}
            </button>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 600 }}>Camera</span>
          </div>

          {/* Screen Share */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button
              onClick={handleToggleScreen}
              className="btn-icon"
              style={{
                width: '54px', height: '54px', borderRadius: '18px',
                backgroundColor: media.isScreenSharing ? 'var(--primary)' : 'rgba(255,255,255,0.07)',
                color: media.isScreenSharing ? '#000' : 'var(--text-main)',
                boxShadow: media.isScreenSharing ? '0 0 20px var(--primary-glow)' : 'none',
              }}
              title={media.isScreenSharing ? 'Stop Screen Share' : 'Share Screen'}
            >
              {media.isScreenSharing ? <MonitorOff size={22} /> : <Monitor size={22} />}
            </button>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 600 }}>Screen</span>
          </div>

          {/* Speaker indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
            <button className="btn-icon" style={{ width: '54px', height: '54px', borderRadius: '18px', backgroundColor: 'rgba(255,255,255,0.07)', color: 'var(--text-main)' }} title="Speaker">
              <Volume2 size={22} />
            </button>
            <span style={{ fontSize: '0.62rem', color: 'var(--text-dim)', fontWeight: 600 }}>Speaker</span>
          </div>

          {/* End call */}
          <button
            onClick={handleEndCall}
            style={{
              height: '54px', padding: '0 2rem', backgroundColor: '#ef4444', borderRadius: '18px',
              display: 'flex', alignItems: 'center', gap: '8px', color: 'white',
              fontWeight: 700, fontSize: '0.9rem', border: 'none', cursor: 'pointer',
              boxShadow: '0 8px 20px rgba(239,68,68,0.35)',
            }}
          >
            <XCircle size={22} /> END CALL
          </button>
        </div>
      ) : (
        /* Minimized controls */
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          padding: '10px', display: 'flex', justifyContent: 'center', gap: '10px',
          background: 'linear-gradient(transparent, rgba(0,0,0,0.9))',
        }}>
          <button onClick={handleToggleMic} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: media.isMicOn ? 'rgba(255,255,255,0.15)' : '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {media.isMicOn ? <Mic size={16} /> : <MicOff size={16} />}
          </button>
          <button onClick={handleToggleCamera} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: media.isCameraOn ? 'rgba(255,255,255,0.15)' : '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
            {media.isCameraOn ? <Video size={16} /> : <VideoOff size={16} />}
          </button>
          <button onClick={handleEndCall} style={{ width: '36px', height: '36px', borderRadius: '10px', backgroundColor: '#ef4444', color: 'white', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 4px 12px rgba(239,68,68,0.4)' }}>
            <XCircle size={16} />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default CallOverlay;
