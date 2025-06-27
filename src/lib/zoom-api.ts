import jwt from 'jsonwebtoken';
import axios from 'axios';
import { ZoomMeeting, ZoomRecording } from '@/types/zoom';

const ZOOM_API_BASE_URL = 'https://api.zoom.us/v2';

// Generate JWT token for Zoom API authentication
export function generateZoomJWT(): string {
  const payload = {
    iss: process.env.ZOOM_API_KEY,
    exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour expiration
  };
  
  return jwt.sign(payload, process.env.ZOOM_API_SECRET!);
}

// Generate SDK JWT for Zoom Video SDK
export function generateSDKJWT(sessionName: string, userIdentity: string, roleType: number = 1): string {
  const payload = {
    iss: process.env.ZOOM_SDK_KEY,
    exp: Math.floor(Date.now() / 1000) + (60 * 60 * 2), // 2 hours
    alg: 'HS256',
    aud: 'zoom',
    appKey: process.env.ZOOM_SDK_KEY,
    tokenExp: Math.floor(Date.now() / 1000) + (60 * 60 * 2),
    sessionName,
    userIdentity,
    roleType
  };
  
  return jwt.sign(payload, process.env.ZOOM_SDK_SECRET!);
}

// Create a new Zoom meeting
export async function createZoomMeeting(meetingData: {
  topic: string;
  type: number;
  start_time?: string;
  duration?: number;
  timezone?: string;
  agenda?: string;
  settings?: {
    host_video?: boolean;
    participant_video?: boolean;
    join_before_host?: boolean;
    mute_upon_entry?: boolean;
    watermark?: boolean;
    use_pmi?: boolean;
    approval_type?: number;
    audio?: string;
    auto_recording?: string;
    cloud_recording_election?: boolean;
  };
}): Promise<ZoomMeeting> {
  const token = generateZoomJWT();
  
  try {
    const response = await axios.post(
      `${ZOOM_API_BASE_URL}/users/me/meetings`,
      {
        ...meetingData,
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          mute_upon_entry: true,
          watermark: false,
          use_pmi: false,
          approval_type: 2,
          audio: 'both',
          auto_recording: 'cloud',
          cloud_recording_election: true,
          ...meetingData.settings
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error creating Zoom meeting:', error);
    throw new Error('Failed to create Zoom meeting');
  }
}

// Get meeting details
export async function getZoomMeeting(meetingId: string): Promise<ZoomMeeting> {
  const token = generateZoomJWT();
  
  try {
    const response = await axios.get(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Zoom meeting:', error);
    throw new Error('Failed to fetch Zoom meeting');
  }
}

// List user's meetings
export async function listZoomMeetings(type: 'scheduled' | 'live' | 'upcoming' = 'scheduled'): Promise<ZoomMeeting[]> {
  const token = generateZoomJWT();
  
  try {
    const response = await axios.get(
      `${ZOOM_API_BASE_URL}/users/me/meetings?type=${type}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data.meetings || [];
  } catch (error) {
    console.error('Error listing Zoom meetings:', error);
    throw new Error('Failed to list Zoom meetings');
  }
}

// Get meeting recordings
export async function getMeetingRecordings(meetingId: string): Promise<ZoomRecording | null> {
  const token = generateZoomJWT();
  
  try {
    const response = await axios.get(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}/recordings`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null; // No recordings found
    }
    console.error('Error fetching meeting recordings:', error);
    throw new Error('Failed to fetch meeting recordings');
  }
}

// Delete a meeting
export async function deleteZoomMeeting(meetingId: string): Promise<void> {
  const token = generateZoomJWT();
  
  try {
    await axios.delete(
      `${ZOOM_API_BASE_URL}/meetings/${meetingId}`,
      {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }
    );
  } catch (error) {
    console.error('Error deleting Zoom meeting:', error);
    throw new Error('Failed to delete Zoom meeting');
  }
}