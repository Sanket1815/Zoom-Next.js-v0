import { NextRequest, NextResponse } from "next/server";
import { createZoomMeeting, listZoomMeetings } from "../../../../lib/zoom-api";

export async function GET() {
  try {
    const meetings = await listZoomMeetings("scheduled");
    return NextResponse.json(meetings);
  } catch (error) {
    console.error("Error fetching meetings:", error);
    return NextResponse.json(
      { error: "Failed to fetch meetings" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const meetingData = await request.json();
    const meeting = await createZoomMeeting(meetingData);
    return NextResponse.json(meeting);
  } catch (error) {
    console.error("Error creating meeting:", error);
    return NextResponse.json(
      { error: "Failed to create meeting" },
      { status: 500 }
    );
  }
}
