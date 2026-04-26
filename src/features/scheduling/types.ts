export type MeetingRequestStatus = 'pending' | 'accepted' | 'declined';

export interface AvailabilitySlot {
  id: string;
  userId: string;
  start: string; // ISO
  end: string; // ISO
  createdAt: string; // ISO
}

export interface MeetingRequest {
  id: string;
  requesterId: string;
  inviteeId: string;
  start: string; // ISO
  end: string; // ISO
  status: MeetingRequestStatus;
  message?: string;
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

export interface SchedulingState {
  availability: AvailabilitySlot[];
  meetingRequests: MeetingRequest[];
}

