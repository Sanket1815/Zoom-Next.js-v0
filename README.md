# Zoom Integration App with Automatic Transcription

A comprehensive Next.js application that integrates with Zoom's API and Video SDK to provide meeting management, video calling, and automatic transcription capabilities using OpenAI Whisper.

## Features

### 🎥 Meeting Management
- Create instant or scheduled Zoom meetings
- Configure meeting settings (video, audio, recording options)
- View and manage existing meetings
- Delete meetings
- Copy meeting URLs and IDs

### 📹 Video Calling
- Join meetings directly in the browser using Zoom Video SDK
- Real-time video and audio controls
- Participant management
- Screen sharing support
- Professional meeting interface

### 🎙️ Automatic Transcription
- Automatic cloud recording for all meetings
- Post-meeting audio transcription using OpenAI Whisper
- Meeting summaries and action item extraction
- Downloadable transcriptions
- Searchable meeting content

### 🔧 Technical Features
- Server-side API integration with Zoom
- JWT-based authentication for Zoom APIs
- Real-time video streaming
- File download and processing
- Responsive design for all devices

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Zoom API Configuration
ZOOM_API_KEY=your_zoom_api_key_here
ZOOM_API_SECRET=your_zoom_api_secret_here
ZOOM_SDK_KEY=your_zoom_sdk_key_here
ZOOM_SDK_SECRET=your_zoom_sdk_secret_here

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret_here
```

### 2. Zoom App Configuration

1. **Create a Zoom App:**
   - Go to [Zoom Marketplace](https://marketplace.zoom.us/)
   - Click "Develop" → "Build App"
   - Choose "Server-to-Server OAuth" for API access
   - Choose "Video SDK" for in-browser video calling

2. **Configure Server-to-Server OAuth App:**
   - Add required scopes: `meeting:write`, `meeting:read`, `recording:read`
   - Note down your API Key and Secret

3. **Configure Video SDK App:**
   - Note down your SDK Key and Secret
   - Add your domain to the allowlist

### 3. OpenAI API Setup

1. Create an account at [OpenAI](https://platform.openai.com/)
2. Generate an API key
3. Ensure you have access to the Whisper API

### 4. Installation and Development

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## Usage Guide

### Creating Meetings

1. Click "New Meeting" in the header
2. Fill in meeting details:
   - **Topic**: Meeting subject
   - **Agenda**: Optional meeting agenda
   - **Start Time**: Leave empty for instant meetings
   - **Duration**: Meeting length in minutes
   - **Settings**: Configure video, audio, and recording options

3. Click "Create Meeting"

### Joining Meetings

1. Find your meeting in the meetings list
2. Click "Join" to enter the meeting room
3. Use the controls to manage your video and audio
4. Click the red phone button to leave

### Viewing Recordings and Transcriptions

1. Switch to the "Recordings" tab
2. Select a meeting to view its recordings
3. Click "Transcribe" on any audio/video file
4. View the generated transcription, summary, and action items
5. Download or copy transcriptions as needed

## API Endpoints

### Meetings
- `GET /api/zoom/meetings` - List all meetings
- `POST /api/zoom/meetings` - Create a new meeting
- `GET /api/zoom/meetings/[id]` - Get meeting details
- `DELETE /api/zoom/meetings/[id]` - Delete a meeting

### Recordings
- `GET /api/zoom/recordings/[id]` - Get meeting recordings

### Transcription
- `POST /api/transcribe` - Transcribe audio file
- `GET /api/transcriptions/[meetingId]` - Get meeting transcriptions

### SDK
- `POST /api/zoom/sdk-token` - Generate SDK JWT token

## Architecture

### Frontend Components
- **MeetingCard**: Display meeting information and controls
- **CreateMeetingModal**: Form for creating new meetings
- **ZoomVideoSDK**: Video calling interface
- **RecordingsList**: Display and manage recordings

### Backend Services
- **zoom-api.ts**: Zoom API integration and JWT generation
- **openai.ts**: OpenAI Whisper integration for transcription
- **API Routes**: RESTful endpoints for all operations

### Key Technologies
- **Next.js 15**: React framework with App Router
- **Zoom Video SDK**: In-browser video calling
- **Zoom REST API**: Meeting management
- **OpenAI Whisper**: Audio transcription
- **Tailwind CSS**: Styling and responsive design
- **TypeScript**: Type safety and better development experience

## Security Considerations

- All API keys are stored securely in environment variables
- JWT tokens are generated server-side with proper expiration
- Meeting passwords and URLs are handled securely
- File downloads are processed server-side to protect credentials

## Limitations and Notes

- Recordings may take a few minutes to appear after meetings end
- Transcription requires audio/video files (MP4, M4A formats)
- Large files may take longer to transcribe
- Free Zoom accounts have limited cloud recording storage
- OpenAI API usage will incur costs based on audio duration

## Troubleshooting

### Common Issues

1. **"Failed to create meeting"**
   - Check your Zoom API credentials
   - Ensure your Zoom app has the required scopes
   - Verify your account has meeting creation permissions

2. **"Failed to join meeting"**
   - Check your Zoom SDK credentials
   - Ensure your domain is allowlisted in the SDK app
   - Check browser permissions for camera/microphone

3. **"No recordings found"**
   - Ensure cloud recording is enabled for the meeting
   - Wait a few minutes after the meeting ends
   - Check your Zoom account's recording settings

4. **"Transcription failed"**
   - Verify your OpenAI API key is valid
   - Ensure you have sufficient API credits
   - Check that the recording file is accessible

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.