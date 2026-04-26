import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, Phone, MonitorUp } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuth } from '../../hooks/useAuth';

type CallStatus = 'idle' | 'connecting' | 'in_call' | 'ended';

export const VideoCallPage: React.FC = () => {
  const { user } = useAuth();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);

  const [status, setStatus] = useState<CallStatus>('idle');
  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [uiError, setUiError] = useState<string | null>(null);

  const statusBadge = useMemo(() => {
    if (status === 'in_call') return <Badge variant="success">In call</Badge>;
    if (status === 'connecting') return <Badge variant="warning">Connecting</Badge>;
    if (status === 'ended') return <Badge variant="gray">Ended</Badge>;
    return <Badge variant="gray">Ready</Badge>;
  }, [status]);

  const stopMedia = () => {
    const s = mediaStreamRef.current;
    if (s) {
      s.getTracks().forEach(t => t.stop());
    }
    mediaStreamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsScreenSharing(false);
  };

  useEffect(() => {
    return () => {
      // cleanup on unmount
      stopMedia();
    };
  }, []);

  const startCall = async () => {
    setUiError(null);
    setStatus('connecting');
    try {
      // UI-first mock. We only attempt local media if supported/allowed.
      const stream = await navigator.mediaDevices.getUserMedia({
        video: isCameraOn,
        audio: isMicOn,
      });
      mediaStreamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }
      setStatus('in_call');
    } catch {
      setUiError('Could not access camera/microphone. You can still use the mock call UI.');
      setStatus('in_call');
    }
  };

  const endCall = () => {
    stopMedia();
    setStatus('ended');
  };

  const toggleMic = () => {
    const next = !isMicOn;
    setIsMicOn(next);
    const s = mediaStreamRef.current;
    if (s) {
      s.getAudioTracks().forEach(t => {
        t.enabled = next;
      });
    }
  };

  const toggleCamera = () => {
    const next = !isCameraOn;
    setIsCameraOn(next);
    const s = mediaStreamRef.current;
    if (s) {
      s.getVideoTracks().forEach(t => {
        t.enabled = next;
      });
    }
  };

  const startScreenShare = async () => {
    setUiError(null);
    try {
      // optional mock: if supported, switch preview to screen stream
      // @ts-expect-error getDisplayMedia is supported in modern browsers
      const screenStream: MediaStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      setIsScreenSharing(true);
      // keep old stream tracks running; just swap preview
      if (videoRef.current) {
        videoRef.current.srcObject = screenStream;
        await videoRef.current.play().catch(() => undefined);
      }
      screenStream.getVideoTracks()[0]?.addEventListener('ended', () => {
        setIsScreenSharing(false);
        // revert to camera stream if available
        if (videoRef.current && mediaStreamRef.current) {
          videoRef.current.srcObject = mediaStreamRef.current;
        }
      });
    } catch {
      setUiError('Screen share is not available or was blocked.');
    }
  };

  if (!user) return null;

  const canStart = status === 'idle' || status === 'ended';
  const canEnd = status === 'connecting' || status === 'in_call';

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Video Call</h1>
          <p className="text-gray-600">Frontend mock UI with optional local preview</p>
        </div>
        <div className="flex items-center gap-2">{statusBadge}</div>
      </div>

      {uiError && (
        <div className="rounded-md border border-warning-200 bg-warning-50 px-4 py-3 text-sm text-warning-700">
          {uiError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="text-lg font-medium text-gray-900">Call stage</div>
            <Badge variant="gray" size="sm">Mock</Badge>
          </CardHeader>
          <CardBody>
            <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-gray-900">
              <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />
              <div className="absolute inset-0 pointer-events-none">
                {!isCameraOn && !isScreenSharing && (
                  <div className="h-full w-full flex items-center justify-center text-gray-200">
                    Camera is off
                  </div>
                )}
              </div>
              <div className="absolute bottom-3 left-3 flex items-center gap-2">
                <Badge variant="gray" size="sm">{user.name}</Badge>
                {isScreenSharing && <Badge variant="secondary" size="sm">Screen sharing</Badge>}
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                onClick={startCall}
                disabled={!canStart}
                leftIcon={<Phone size={18} />}
                variant="success"
              >
                Start call
              </Button>
              <Button
                onClick={endCall}
                disabled={!canEnd}
                leftIcon={<PhoneOff size={18} />}
                variant="error"
              >
                End call
              </Button>
              <Button
                onClick={toggleMic}
                disabled={status === 'idle'}
                leftIcon={isMicOn ? <Mic size={18} /> : <MicOff size={18} />}
                variant={isMicOn ? 'outline' : 'warning'}
              >
                {isMicOn ? 'Mute' : 'Unmute'}
              </Button>
              <Button
                onClick={toggleCamera}
                disabled={status === 'idle'}
                leftIcon={isCameraOn ? <Video size={18} /> : <VideoOff size={18} />}
                variant={isCameraOn ? 'outline' : 'warning'}
              >
                {isCameraOn ? 'Camera off' : 'Camera on'}
              </Button>
              <Button
                onClick={startScreenShare}
                disabled={status === 'idle'}
                leftIcon={<MonitorUp size={18} />}
                variant="outline"
              >
                Screen share
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-lg font-medium text-gray-900">Call details</h2>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="rounded-md border border-gray-200 p-3">
              <div className="text-xs text-gray-500">Mode</div>
              <div className="text-sm font-medium text-gray-900">UI-first (no signaling)</div>
            </div>
            <div className="rounded-md border border-gray-200 p-3 space-y-2">
              <div className="text-xs text-gray-500">Toggles</div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Microphone</span>
                <Badge variant={isMicOn ? 'success' : 'gray'} size="sm">{isMicOn ? 'On' : 'Off'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Camera</span>
                <Badge variant={isCameraOn ? 'success' : 'gray'} size="sm">{isCameraOn ? 'On' : 'Off'}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-700">Screen share</span>
                <Badge variant={isScreenSharing ? 'secondary' : 'gray'} size="sm">{isScreenSharing ? 'On' : 'Off'}</Badge>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              This page is intentionally frontend-only. In Week 3/4 we can connect real WebRTC signaling if needed.
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

