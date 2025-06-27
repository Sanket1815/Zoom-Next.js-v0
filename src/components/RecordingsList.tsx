'use client';

import { useState, useEffect } from 'react';
import { ZoomRecording, Transcription } from '@/types/zoom';
import { format } from 'date-fns';
import { Download, Play, FileText, Clock, Calendar, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

interface RecordingsListProps {
  meetingId: string;
}

export default function RecordingsList({ meetingId }: RecordingsListProps) {
  const [recordings, setRecordings] = useState<ZoomRecording | null>(null);
  const [transcriptions, setTranscriptions] = useState<{ [key: string]: Transcription }>({});
  const [loading, setLoading] = useState(true);
  const [transcribing, setTranscribing] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    fetchRecordings();
  }, [meetingId]);

  const fetchRecordings = async () => {
    try {
      const response = await fetch(`/api/zoom/recordings/${meetingId}`);
      if (response.ok) {
        const data = await response.json();
        setRecordings(data);
        
        // Check for existing transcriptions
        const transcriptionResponse = await fetch(`/api/transcriptions/${meetingId}`);
        if (transcriptionResponse.ok) {
          const transcriptionData = await transcriptionResponse.json();
          setTranscriptions(transcriptionData);
        }
      }
    } catch (error) {
      console.error('Error fetching recordings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTranscribe = async (recordingFile: any) => {
    const fileId = recordingFile.id;
    setTranscribing(prev => ({ ...prev, [fileId]: true }));
    
    try {
      const response = await fetch('/api/transcribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          audioUrl: recordingFile.download_url,
          meetingId: meetingId,
          recordingId: fileId
        }),
      });

      if (response.ok) {
        const transcription = await response.json();
        setTranscriptions(prev => ({ ...prev, [fileId]: transcription }));
        toast.success('Transcription completed!');
      } else {
        throw new Error('Transcription failed');
      }
    } catch (error) {
      console.error('Error transcribing:', error);
      toast.error('Failed to transcribe recording');
    } finally {
      setTranscribing(prev => ({ ...prev, [fileId]: false }));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span>Loading recordings...</span>
      </div>
    );
  }

  if (!recordings || !recordings.recording_files?.length) {
    return (
      <div className="text-center p-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
        <p>No recordings available for this meeting.</p>
        <p className="text-sm mt-2">Recordings may take a few minutes to process after the meeting ends.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Meeting Recordings</h3>
        
        <div className="mb-4 text-sm text-gray-600">
          <div className="flex items-center mb-2">
            <Calendar className="w-4 h-4 mr-2" />
            {format(new Date(recordings.start_time), 'PPP')}
          </div>
          <div className="flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Duration: {Math.round(recordings.duration)} minutes
          </div>
        </div>

        <div className="space-y-4">
          {recordings.recording_files.map((file) => (
            <div key={file.id} className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h4 className="font-medium text-gray-900">
                    {file.recording_type === 'shared_screen_with_speaker_view' ? 'Screen Share with Speaker' :
                     file.recording_type === 'speaker_view' ? 'Speaker View' :
                     file.recording_type === 'gallery_view' ? 'Gallery View' :
                     file.recording_type === 'audio_only' ? 'Audio Only' :
                     file.recording_type}
                  </h4>
                  <p className="text-sm text-gray-600">
                    {file.file_type} • {(file.file_size / (1024 * 1024)).toFixed(1)} MB
                  </p>
                </div>
                <div className="flex space-x-2">
                  <a
                    href={file.play_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                  >
                    <Play className="w-4 h-4 mr-1" />
                    Play
                  </a>
                  <a
                    href={file.download_url}
                    className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-1" />
                    Download
                  </a>
                  {(file.file_type === 'MP4' || file.file_type === 'M4A') && (
                    <button
                      onClick={() => handleTranscribe(file)}
                      disabled={transcribing[file.id]}
                      className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-green-600 bg-green-50 rounded-md hover:bg-green-100 transition-colors disabled:opacity-50"
                    >
                      {transcribing[file.id] ? (
                        <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                      ) : (
                        <FileText className="w-4 h-4 mr-1" />
                      )}
                      {transcribing[file.id] ? 'Transcribing...' : 'Transcribe'}
                    </button>
                  )}
                </div>
              </div>

              {/* Transcription Display */}
              {transcriptions[file.id] && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h5 className="font-medium text-gray-900 mb-2">Transcription</h5>
                  <div className="text-sm text-gray-700 max-h-40 overflow-y-auto">
                    {transcriptions[file.id].text}
                  </div>
                  <div className="mt-3 flex space-x-2">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(transcriptions[file.id].text);
                        toast.success('Transcription copied to clipboard');
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Copy Transcription
                    </button>
                    <button
                      onClick={() => {
                        const blob = new Blob([transcriptions[file.id].text], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `transcription-${meetingId}.txt`;
                        a.click();
                        URL.revokeObjectURL(url);
                      }}
                      className="text-xs text-blue-600 hover:text-blue-800"
                    >
                      Download as TXT
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}