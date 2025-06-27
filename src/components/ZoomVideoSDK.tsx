'use client';

import { useEffect, useRef, useState } from 'react';
import { ZoomMeeting } from '@/types/zoom';
import { Mic, MicOff, Video, VideoOff, Phone, Users } from 'lucide-react';

interface ZoomVideoSDKProps {
  meeting: ZoomMeeting;
  onLeave: () => void;
  userIdentity: string;
}

export default function ZoomVideoSDK({ meeting, onLeave, userIdentity }: ZoomVideoSDKProps) {
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState<any[]>([]);
  const [client, setClient] = useState<any>(null);

  useEffect(() => {
    const initializeZoomSDK = async () => {
      try {
        // Import Zoom Video SDK dynamically
        const ZoomVideo = (await import('@zoom/videosdk')).default;
        
        const zoomClient = ZoomVideo.createClient();
        setClient(zoomClient);

        // Get JWT token for SDK authentication
        const response = await fetch('/api/zoom/sdk-token', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionName: meeting.id,
            userIdentity: userIdentity,
            roleType: 1
          }),
        });

        const { token } = await response.json();

        // Initialize and join session
        await zoomClient.init('en-US', 'Global', { patchJsMedia: true });
        
        await zoomClient.join(meeting.id, token, userIdentity);
        setIsConnected(true);

        // Set up event listeners
        zoomClient.on('user-added', (payload: any) => {
          setParticipants(prev => [...prev, payload]);
        });

        zoomClient.on('user-removed', (payload: any) => {
          setParticipants(prev => prev.filter(p => p.userId !== payload.userId));
        });

        zoomClient.on('user-updated', (payload: any) => {
          setParticipants(prev => 
            prev.map(p => p.userId === payload.userId ? { ...p, ...payload } : p)
          );
        });

        // Start video and audio
        const mediaStream = zoomClient.getMediaStream();
        if (videoContainerRef.current) {
          await mediaStream.startVideo({ videoElement: videoContainerRef.current });
        }
        await mediaStream.startAudio();

      } catch (error) {
        console.error('Error initializing Zoom SDK:', error);
      }
    };

    initializeZoomSDK();

    return () => {
      if (client) {
        client.leave().catch(console.error);
      }
    };
  }, [meeting.id, userIdentity]);

  const toggleVideo = async () => {
    if (client) {
      const mediaStream = client.getMediaStream();
      if (isVideoOn) {
        await mediaStream.stopVideo();
      } else {
        if (videoContainerRef.current) {
          await mediaStream.startVideo({ videoElement: videoContainerRef.current });
        }
      }
      setIsVideoOn(!isVideoOn);
    }
  };

  const toggleAudio = async () => {
    if (client) {
      const mediaStream = client.getMediaStream();
      if (isAudioOn) {
        await mediaStream.muteAudio();
      } else {
        await mediaStream.unmuteAudio();
      }
      setIsAudioOn(!isAudioOn);
    }
  };

  const handleLeave = async () => {
    if (client) {
      await client.leave();
    }
    onLeave();
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">{meeting.topic}</h2>
          <p className="text-sm text-gray-300">Meeting ID: {meeting.id}</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center text-sm">
            <Users className="w-4 h-4 mr-2" />
            {participants.length + 1} participants
          </div>
          {isConnected && (
            <div className="flex items-center text-sm text-green-400">
              <div className="w-2 h-2 bg-green-400 rounded-full mr-2"></div>
              Connected
            </div>
          )}
        </div>
      </div>

      {/* Video Container */}
      <div className="flex-1 relative bg-gray-900">
        <div 
          ref={videoContainerRef}
          className="w-full h-full flex items-center justify-center"
        >
          {!isConnected && (
            <div className="text-white text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
              <p>Connecting to meeting...</p>
            </div>
          )}
        </div>

        {/* Participants Grid */}
        <div className="absolute top-4 right-4 space-y-2">
          {participants.map((participant) => (
            <div
              key={participant.userId}
              className="bg-gray-800 text-white p-2 rounded text-sm"
            >
              {participant.displayName || participant.userId}
            </div>
          ))}
        </div>
      </div>

      {/* Controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center space-x-4">
        <button
          onClick={toggleAudio}
          className={`p-3 rounded-full transition-colors ${
            isAudioOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isAudioOn ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleVideo}
          className={`p-3 rounded-full transition-colors ${
            isVideoOn 
              ? 'bg-gray-700 hover:bg-gray-600 text-white' 
              : 'bg-red-600 hover:bg-red-700 text-white'
          }`}
        >
          {isVideoOn ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
        </button>

        <button
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          <Phone className="w-5 h-5 transform rotate-[135deg]" />
        </button>
      </div>
    </div>
  );
}