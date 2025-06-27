'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Calendar, Clock, Users, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface CreateMeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateMeeting: (meetingData: any) => Promise<void>;
}

interface MeetingFormData {
  topic: string;
  agenda: string;
  start_time: string;
  duration: number;
  timezone: string;
  host_video: boolean;
  participant_video: boolean;
  join_before_host: boolean;
  mute_upon_entry: boolean;
  auto_recording: string;
}

export default function CreateMeetingModal({ isOpen, onClose, onCreateMeeting }: CreateMeetingModalProps) {
  const [isCreating, setIsCreating] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<MeetingFormData>({
    defaultValues: {
      topic: '',
      agenda: '',
      start_time: '',
      duration: 60,
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      host_video: true,
      participant_video: true,
      join_before_host: false,
      mute_upon_entry: true,
      auto_recording: 'cloud'
    }
  });

  const onSubmit = async (data: MeetingFormData) => {
    setIsCreating(true);
    try {
      const meetingData = {
        topic: data.topic,
        type: data.start_time ? 2 : 1, // 1 = instant, 2 = scheduled
        start_time: data.start_time || undefined,
        duration: data.duration,
        timezone: data.timezone,
        agenda: data.agenda,
        settings: {
          host_video: data.host_video,
          participant_video: data.participant_video,
          join_before_host: data.join_before_host,
          mute_upon_entry: data.mute_upon_entry,
          auto_recording: data.auto_recording,
          cloud_recording_election: true
        }
      };

      await onCreateMeeting(meetingData);
      toast.success('Meeting created successfully!');
      reset();
      onClose();
    } catch (error) {
      toast.error('Failed to create meeting');
    } finally {
      setIsCreating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create New Meeting</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <Users className="w-4 h-4 mr-2" />
              Meeting Topic *
            </label>
            <input
              type="text"
              {...register('topic', { required: 'Meeting topic is required' })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter meeting topic"
            />
            {errors.topic && (
              <p className="mt-1 text-sm text-red-600">{errors.topic.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <FileText className="w-4 h-4 mr-2" />
              Agenda
            </label>
            <textarea
              {...register('agenda')}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Meeting agenda (optional)"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 mr-2" />
                Start Time
              </label>
              <input
                type="datetime-local"
                {...register('start_time')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">Leave empty for instant meeting</p>
            </div>

            <div>
              <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                <Clock className="w-4 h-4 mr-2" />
                Duration (minutes)
              </label>
              <input
                type="number"
                {...register('duration', { min: 1, max: 1440 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                min="1"
                max="1440"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-3 block">Meeting Settings</label>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('host_video')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Start video when host joins</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('participant_video')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Start video when participants join</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('join_before_host')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Allow participants to join before host</span>
              </label>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  {...register('mute_upon_entry')}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm text-gray-700">Mute participants upon entry</span>
              </label>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700 mb-2 block">Auto Recording</label>
            <select
              {...register('auto_recording')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="none">No Recording</option>
              <option value="local">Local Recording</option>
              <option value="cloud">Cloud Recording</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isCreating}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isCreating ? 'Creating...' : 'Create Meeting'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}