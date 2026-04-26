import { useMemo } from 'react';
import { useLocalStorageState } from '../../hooks/useLocalStorageState';
import { AvailabilitySlot, MeetingRequest, SchedulingState } from './types';

const SCHEDULING_STORAGE_KEY = 'business_nexus_scheduling_v1';

function createId() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const cryptoAny = crypto as any;
  if (typeof cryptoAny?.randomUUID === 'function') return cryptoAny.randomUUID();
  return `${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

const emptyState: SchedulingState = { availability: [], meetingRequests: [] };

export function useSchedulingStore() {
  const [state, setState] = useLocalStorageState<SchedulingState>(SCHEDULING_STORAGE_KEY, emptyState);

  const api = useMemo(() => {
    const addAvailability = (input: { userId: string; start: string; end: string }) => {
      const slot: AvailabilitySlot = {
        id: createId(),
        userId: input.userId,
        start: input.start,
        end: input.end,
        createdAt: new Date().toISOString(),
      };
      setState(prev => ({ ...prev, availability: [slot, ...prev.availability] }));
      return slot;
    };

    const updateAvailability = (slotId: string, updates: Partial<Pick<AvailabilitySlot, 'start' | 'end'>>) => {
      setState(prev => ({
        ...prev,
        availability: prev.availability.map(s => (s.id === slotId ? { ...s, ...updates } : s)),
      }));
    };

    const deleteAvailability = (slotId: string) => {
      setState(prev => ({ ...prev, availability: prev.availability.filter(s => s.id !== slotId) }));
    };

    const sendMeetingRequest = (input: {
      requesterId: string;
      inviteeId: string;
      start: string;
      end: string;
      message?: string;
    }) => {
      const now = new Date().toISOString();
      const req: MeetingRequest = {
        id: createId(),
        requesterId: input.requesterId,
        inviteeId: input.inviteeId,
        start: input.start,
        end: input.end,
        status: 'pending',
        message: input.message,
        createdAt: now,
        updatedAt: now,
      };
      setState(prev => ({ ...prev, meetingRequests: [req, ...prev.meetingRequests] }));
      return req;
    };

    const setMeetingRequestStatus = (requestId: string, status: MeetingRequest['status']) => {
      const now = new Date().toISOString();
      setState(prev => ({
        ...prev,
        meetingRequests: prev.meetingRequests.map(r =>
          r.id === requestId ? { ...r, status, updatedAt: now } : r
        ),
      }));
    };

    const deleteMeetingRequest = (requestId: string) => {
      setState(prev => ({ ...prev, meetingRequests: prev.meetingRequests.filter(r => r.id !== requestId) }));
    };

    const reset = () => setState(emptyState);

    return {
      state,
      addAvailability,
      updateAvailability,
      deleteAvailability,
      sendMeetingRequest,
      setMeetingRequestStatus,
      deleteMeetingRequest,
      reset,
    };
  }, [setState, state]);

  return api;
}

export function getConfirmedMeetingsForUser(state: SchedulingState, userId: string) {
  return state.meetingRequests.filter(
    r => r.status === 'accepted' && (r.requesterId === userId || r.inviteeId === userId)
  );
}

export function getIncomingMeetingRequestsForUser(state: SchedulingState, userId: string) {
  return state.meetingRequests.filter(r => r.status === 'pending' && r.inviteeId === userId);
}

