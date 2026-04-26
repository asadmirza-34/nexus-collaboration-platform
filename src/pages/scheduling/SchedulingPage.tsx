import React, { useMemo, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import timeGridPlugin from '@fullcalendar/timegrid';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin, { DateSelectArg, EventClickArg } from '@fullcalendar/interaction';
import '../../styles/fullcalendar.css';
import { CalendarDays, Plus, Trash2 } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../hooks/useAuth';
import { findUserById, getUsersByRole } from '../../data/users';
import { useSchedulingStore, getConfirmedMeetingsForUser, getIncomingMeetingRequestsForUser } from '../../features/scheduling/store';

function fromLocalInputValue(localValue: string) {
  return new Date(localValue).toISOString();
}

export const SchedulingPage: React.FC = () => {
  const { user } = useAuth();
  const scheduling = useSchedulingStore();
  const [activeTab, setActiveTab] = useState<'availability' | 'requests' | 'confirmed'>('availability');

  const [requestInviteeId, setRequestInviteeId] = useState('');
  const [requestStart, setRequestStart] = useState('');
  const [requestEnd, setRequestEnd] = useState('');
  const [requestMessage, setRequestMessage] = useState('');
  const [uiError, setUiError] = useState<string | null>(null);

  const currentUserId = user?.id ?? '';

  const counterpartRole = user?.role === 'entrepreneur' ? 'investor' : 'entrepreneur';
  const inviteeOptions = useMemo(() => (user ? getUsersByRole(counterpartRole) : []), [counterpartRole, user]);

  const myAvailability = useMemo(
    () => scheduling.state.availability.filter(s => s.userId === currentUserId),
    [currentUserId, scheduling.state.availability]
  );

  const incoming = useMemo(
    () => (user ? getIncomingMeetingRequestsForUser(scheduling.state, user.id) : []),
    [scheduling.state, user]
  );

  const confirmed = useMemo(
    () => (user ? getConfirmedMeetingsForUser(scheduling.state, user.id) : []),
    [scheduling.state, user]
  );

  const calendarEvents = useMemo(() => {
    const availabilityEvents = scheduling.state.availability.map(slot => ({
      id: `avail_${slot.id}`,
      title: slot.userId === currentUserId ? 'My Availability' : 'Availability',
      start: slot.start,
      end: slot.end,
      backgroundColor: slot.userId === currentUserId ? '#DBEAFE' : '#F3F4F6',
      borderColor: slot.userId === currentUserId ? '#93C5FD' : '#E5E7EB',
      textColor: slot.userId === currentUserId ? '#1D4ED8' : '#374151',
      extendedProps: { kind: 'availability' as const, slotId: slot.id, ownerId: slot.userId },
    }));

    const requestEvents = scheduling.state.meetingRequests.map(r => {
      const isConfirmed = r.status === 'accepted';
      const isPending = r.status === 'pending';

      const title =
        r.status === 'accepted'
          ? 'Confirmed meeting'
          : r.status === 'pending'
            ? 'Meeting request'
            : 'Declined request';

      const backgroundColor = isConfirmed ? '#DCFCE7' : isPending ? '#FEF3C7' : '#FEE2E2';
      const borderColor = isConfirmed ? '#86EFAC' : isPending ? '#FCD34D' : '#FCA5A5';
      const textColor = isConfirmed ? '#15803D' : isPending ? '#92400E' : '#991B1B';

      return {
        id: `req_${r.id}`,
        title,
        start: r.start,
        end: r.end,
        backgroundColor,
        borderColor,
        textColor,
        extendedProps: { kind: 'request' as const, requestId: r.id },
      };
    });

    return [...availabilityEvents, ...requestEvents];
  }, [currentUserId, scheduling.state.availability, scheduling.state.meetingRequests]);

  if (!user) return null;

  const handleSelect = (arg: DateSelectArg) => {
    setUiError(null);
    scheduling.addAvailability({
      userId: user.id,
      start: arg.start.toISOString(),
      end: arg.end.toISOString(),
    });
  };

  const handleEventClick = (arg: EventClickArg) => {
    const kind = (arg.event.extendedProps as { kind?: string }).kind;
    if (kind !== 'availability') return;
    const { slotId, ownerId } = arg.event.extendedProps as { slotId: string; ownerId: string };
    if (ownerId !== user.id) return;
    scheduling.deleteAvailability(slotId);
  };

  const submitMeetingRequest = () => {
    setUiError(null);
    if (!requestInviteeId) {
      setUiError('Select a participant to send the request to.');
      return;
    }
    if (!requestStart || !requestEnd) {
      setUiError('Pick a start and end time.');
      return;
    }
    const startIso = fromLocalInputValue(requestStart);
    const endIso = fromLocalInputValue(requestEnd);
    if (new Date(endIso).getTime() <= new Date(startIso).getTime()) {
      setUiError('End time must be after start time.');
      return;
    }
    scheduling.sendMeetingRequest({
      requesterId: user.id,
      inviteeId: requestInviteeId,
      start: startIso,
      end: endIso,
      message: requestMessage.trim() ? requestMessage.trim() : undefined,
    });
    setRequestMessage('');
    setRequestStart('');
    setRequestEnd('');
    setRequestInviteeId('');
    setActiveTab('requests');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Scheduling</h1>
          <p className="text-gray-600">Manage availability and coordinate meetings</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="success">{confirmed.length} confirmed</Badge>
          <Badge variant="warning">{incoming.length} incoming</Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarDays size={18} className="text-primary-700" />
              <h2 className="text-lg font-medium text-gray-900">Calendar</h2>
            </div>
            <div className="text-xs text-gray-500">
              Drag to create availability. Click your slot to delete.
            </div>
          </CardHeader>
          <CardBody className="p-0">
            <div className="p-4">
              <FullCalendar
                plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                initialView="timeGridWeek"
                headerToolbar={{
                  left: 'prev,next today',
                  center: 'title',
                  right: 'dayGridMonth,timeGridWeek,timeGridDay',
                }}
                height="auto"
                selectable
                selectMirror
                select={handleSelect}
                eventClick={handleEventClick}
                events={calendarEvents}
                nowIndicator
                slotMinTime="06:00:00"
                slotMaxTime="22:00:00"
                expandRows
              />
            </div>
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-gray-900">Meeting requests</h2>
              <Badge variant="gray" size="sm">Mock</Badge>
            </CardHeader>
            <CardBody className="space-y-3">
              {uiError && (
                <div className="rounded-md border border-error-200 bg-error-50 px-3 py-2 text-sm text-error-700">
                  {uiError}
                </div>
              )}

              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-900">Send a request</div>
                <div className="space-y-2">
                  <label className="block text-xs font-medium text-gray-700">To</label>
                  <select
                    value={requestInviteeId}
                    onChange={e => setRequestInviteeId(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    <option value="">Select {counterpartRole}</option>
                    {inviteeOptions.map(u => (
                      <option key={u.id} value={u.id}>
                        {u.name}
                      </option>
                    ))}
                  </select>

                  <div className="grid grid-cols-1 gap-2">
                    <div>
                      <label className="block text-xs font-medium text-gray-700">Start</label>
                      <Input
                        type="datetime-local"
                        value={requestStart}
                        onChange={e => setRequestStart(e.target.value)}
                        fullWidth
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700">End</label>
                      <Input
                        type="datetime-local"
                        value={requestEnd}
                        onChange={e => setRequestEnd(e.target.value)}
                        fullWidth
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700">Message (optional)</label>
                    <textarea
                      value={requestMessage}
                      onChange={e => setRequestMessage(e.target.value)}
                      rows={3}
                      className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
                      placeholder="Share an agenda or context…"
                    />
                  </div>

                  <Button leftIcon={<Plus size={18} />} onClick={submitMeetingRequest} fullWidth>
                    Send request
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card>
            <CardHeader className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('availability')}
                  className={`text-sm font-medium ${activeTab === 'availability' ? 'text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Availability
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setActiveTab('requests')}
                  className={`text-sm font-medium ${activeTab === 'requests' ? 'text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Requests
                </button>
                <span className="text-gray-300">|</span>
                <button
                  onClick={() => setActiveTab('confirmed')}
                  className={`text-sm font-medium ${activeTab === 'confirmed' ? 'text-primary-700' : 'text-gray-600 hover:text-gray-900'}`}
                >
                  Confirmed
                </button>
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {activeTab === 'availability' && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">Your slots</div>
                    <Badge variant="gray" size="sm">{myAvailability.length}</Badge>
                  </div>
                  {myAvailability.length === 0 ? (
                    <p className="text-sm text-gray-600">Create availability by dragging on the calendar.</p>
                  ) : (
                    <div className="space-y-2">
                      {myAvailability.slice(0, 5).map(slot => (
                        <div key={slot.id} className="flex items-start justify-between gap-3 rounded-md border border-gray-200 p-3">
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-gray-900 truncate">
                              {new Date(slot.start).toLocaleString()} → {new Date(slot.end).toLocaleString()}
                            </div>
                            <div className="text-xs text-gray-500">Click on the calendar slot to delete.</div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="p-2 text-error-600 hover:text-error-700"
                            aria-label="Delete availability"
                            onClick={() => scheduling.deleteAvailability(slot.id)}
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'requests' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-medium text-gray-900">Incoming</div>
                      <Badge variant="warning" size="sm">{incoming.length}</Badge>
                    </div>
                    {incoming.length === 0 ? (
                      <p className="text-sm text-gray-600">No pending requests yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {incoming.slice(0, 4).map(r => {
                          const requester = findUserById(r.requesterId);
                          return (
                            <div key={r.id} className="rounded-md border border-gray-200 p-3 space-y-2">
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="text-sm font-medium text-gray-900 truncate">
                                    {requester?.name ?? 'Unknown user'}
                                  </div>
                                  <div className="text-xs text-gray-500">
                                    {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                                  </div>
                                </div>
                                <Badge variant="warning" size="sm">Pending</Badge>
                              </div>
                              {r.message && <div className="text-sm text-gray-700">{r.message}</div>}
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="success"
                                  onClick={() => scheduling.setMeetingRequestStatus(r.id, 'accepted')}
                                >
                                  Accept
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => scheduling.setMeetingRequestStatus(r.id, 'declined')}
                                >
                                  Decline
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="text-sm font-medium text-gray-900">Outgoing</div>
                    {scheduling.state.meetingRequests.filter(r => r.requesterId === user.id).length === 0 ? (
                      <p className="text-sm text-gray-600">No outgoing requests.</p>
                    ) : (
                      <div className="space-y-2">
                        {scheduling.state.meetingRequests
                          .filter(r => r.requesterId === user.id)
                          .slice(0, 4)
                          .map(r => {
                            const invitee = findUserById(r.inviteeId);
                            const variant = r.status === 'accepted' ? 'success' : r.status === 'pending' ? 'warning' : 'error';
                            return (
                              <div key={r.id} className="rounded-md border border-gray-200 p-3">
                                <div className="flex items-center justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="text-sm font-medium text-gray-900 truncate">
                                      To: {invitee?.name ?? 'Unknown user'}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                                    </div>
                                  </div>
                                  <Badge variant={variant} size="sm">
                                    {r.status}
                                  </Badge>
                                </div>
                              </div>
                            );
                          })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'confirmed' && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium text-gray-900">Your confirmed meetings</div>
                    <Badge variant="success" size="sm">{confirmed.length}</Badge>
                  </div>
                  {confirmed.length === 0 ? (
                    <p className="text-sm text-gray-600">No confirmed meetings yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {confirmed.slice(0, 6).map(r => {
                        const otherUserId = r.requesterId === user.id ? r.inviteeId : r.requesterId;
                        const other = findUserById(otherUserId);
                        return (
                          <div key={r.id} className="rounded-md border border-gray-200 p-3">
                            <div className="flex items-center justify-between gap-3">
                              <div className="min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate">
                                  With {other?.name ?? 'Unknown user'}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {new Date(r.start).toLocaleString()} → {new Date(r.end).toLocaleString()}
                                </div>
                              </div>
                              <Badge variant="success" size="sm">Confirmed</Badge>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

