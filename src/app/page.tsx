'use client';

import { useState, useEffect } from 'react';
import { ZoomMeeting } from '@/types/zoom';
import MeetingCard from '@/components/MeetingCard';
import CreateMeetingModal from '@/components/CreateMeetingModal';
import ZoomVideoSDK from '@/components/ZoomVideoSDK';
import RecordingsList from '@/components/RecordingsList';
import { Plus, Video, Calendar, FileText, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Home() {
  const [meetings, setMeetings] = useState<ZoomMeeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [activeMeeting, setActiveMeeting] = useState<ZoomMeeting | null>(null);
  const [selectedMeetingForRecordings, setSelectedMeetingForRecordings] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'meetings' | 'recordings'>('meetings');

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch('/api/zoom/meetings');
      if (response.ok) {
        const data = await response.json();
        setMeetings(data);
      } else {
        toast.error('Failed to fetch meetings');
      }
    } catch (error) {
      console.error('Error fetching meetings:', error);
      toast.error('Failed to fetch meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateMeeting = async (meetingData: any) => {
    const response = await fetch('/api/zoom/meetings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(meetingData),
    });

    if (response.ok) {
      const newMeeting = await response.json();
      setMeetings(prev => [newMeeting, ...prev]);
    } else {
      throw new Error('Failed to create meeting');
    }
  };

  const handleDeleteMeeting = async (meetingId: string) => {
    const response = await fetch(`/api/zoom/meetings/${meetingId}`, {
      method: 'DELETE',
    });

    if (response.ok) {
      setMeetings(prev => prev.filter(m => m.id !== meetingId));
    } else {
      throw new Error('Failed to delete meeting');
    }
  };

  const handleJoinMeeting = (meeting: ZoomMeeting) => {
    setActiveMeeting(meeting);
  };

  const handleLeaveMeeting = () => {
    setActiveMeeting(null);
  };

  if (activeMeeting) {
    return (
      <ZoomVideoSDK
        meeting={activeMeeting}
        onLeave={handleLeaveMeeting}
        userIdentity={`user_${Date.now()}`}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Video className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-xl font-semibold text-gray-900">Zoom Integration</h1>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Meeting
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('meetings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'meetings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-2" />
              Meetings
            </button>
            <button
              onClick={() => setActiveTab('recordings')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'recordings'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FileText className="w-4 h-4 inline mr-2" />
              Recordings
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'meetings' && (
          <div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-6 h-6 animate-spin mr-2" />
                <span>Loading meetings...</span>
              </div>
            ) : meetings.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No meetings found</h3>
                <p className="text-gray-500 mb-6">Get started by creating your first meeting.</p>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Meeting
                </button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {meetings.map((meeting) => (
                  <MeetingCard
                    key={meeting.id}
                    meeting={meeting}
                    onDelete={handleDeleteMeeting}
                    onJoin={handleJoinMeeting}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'recordings' && (
          <div>
            {!selectedMeetingForRecordings ? (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Select a meeting to view recordings</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {meetings.map((meeting) => (
                    <div
                      key={meeting.id}
                      onClick={() => setSelectedMeetingForRecordings(meeting.id)}
                      className="bg-white rounded-lg shadow-md border border-gray-200 p-4 cursor-pointer hover:shadow-lg transition-shadow"
                    >
                      <h3 className="font-medium text-gray-900 mb-2">{meeting.topic}</h3>
                      <p className="text-sm text-gray-600">Meeting ID: {meeting.id}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(meeting.start_time).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-lg font-semibold text-gray-900">
                    Recordings for Meeting {selectedMeetingForRecordings}
                  </h2>
                  <button
                    onClick={() => setSelectedMeetingForRecordings(null)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    ← Back to meetings
                  </button>
                </div>
                <RecordingsList meetingId={selectedMeetingForRecordings} />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreateMeeting={handleCreateMeeting}
      />
    </div>
  );
}