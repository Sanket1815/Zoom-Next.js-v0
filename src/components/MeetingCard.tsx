'use client';

import { useState } from 'react';
import { ZoomMeeting } from '@/types/zoom';
import { format } from 'date-fns';
import { Calendar, Clock, Users, Video, Trash2, Copy, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';

interface MeetingCardProps {
  meeting: ZoomMeeting;
  onDelete: (meetingId: string) => void;
  onJoin: (meeting: ZoomMeeting) => void;
}

export default function MeetingCard({ meeting, onDelete, onJoin }: MeetingCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this meeting?')) return;
    
    setIsDeleting(true);
    try {
      await onDelete(meeting.id);
      toast.success('Meeting deleted successfully');
    } catch (error) {
      toast.error('Failed to delete meeting');
    } finally {
      setIsDeleting(false);
    }
  };

  const copyJoinUrl = () => {
    navigator.clipboard.writeText(meeting.join_url);
    toast.success('Join URL copied to clipboard');
  };

  const copyMeetingId = () => {
    navigator.clipboard.writeText(meeting.id);
    toast.success('Meeting ID copied to clipboard');
  };

  const isUpcoming = new Date(meeting.start_time) > new Date();
  const isLive = meeting.status === 'started';

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">{meeting.topic}</h3>
          {meeting.agenda && (
            <p className="text-gray-600 text-sm mb-3">{meeting.agenda}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          {isLive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-1 animate-pulse"></div>
              Live
            </span>
          )}
          {isUpcoming && !isLive && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Upcoming
            </span>
          )}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 mr-2" />
          {format(new Date(meeting.start_time), 'PPP')}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Clock className="w-4 h-4 mr-2" />
          {format(new Date(meeting.start_time), 'p')} ({meeting.duration} min)
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Users className="w-4 h-4 mr-2" />
          Meeting ID: {meeting.id}
        </div>
        {meeting.password && (
          <div className="flex items-center text-sm text-gray-600">
            <span className="w-4 h-4 mr-2">🔒</span>
            Password: {meeting.password}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <button
            onClick={copyMeetingId}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <Copy className="w-3 h-3 mr-1" />
            Copy ID
          </button>
          <button
            onClick={copyJoinUrl}
            className="inline-flex items-center px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Copy URL
          </button>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => onJoin(meeting)}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
          >
            <Video className="w-4 h-4 mr-2" />
            Join
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="inline-flex items-center px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-md hover:bg-red-100 transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}