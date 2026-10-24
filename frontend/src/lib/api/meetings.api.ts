import api from './axios';
import type { Meeting, MeetingType, MeetingActionItem, ActionItemStatus } from '@/types/meeting.types';
import type { TaskPriority } from '@/types/task.types';
import { actorParams } from './actor';

export interface CreateMeetingInput {
  title: string;
  type?: MeetingType;
  scheduledAt: string;
  duration?: number;
  organizerId?: string;
  participantIds?: string[];
  description?: string;
}

export type UpdateMeetingInput = Partial<CreateMeetingInput>;

export interface UpdateMomInput {
  momSummary?: string;
  discussionPoints?: string;
  decisionsMade?: string;
  risksBlockers?: string;
  additionalNotes?: string;
}

export interface CreateActionItemInput {
  title: string;
  description?: string;
  assigneeId?: string;
  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateActionItemInput extends Partial<CreateActionItemInput> {
  status?: ActionItemStatus;
}

export async function getMeetings(projectId: string, type?: string): Promise<Meeting[]> {
  return api.get(`/projects/${projectId}/meetings`, { params: type ? { type } : undefined });
}

export async function getMeeting(id: string): Promise<Meeting> {
  return api.get(`/meetings/${id}`);
}

export async function createMeeting(projectId: string, data: CreateMeetingInput): Promise<Meeting> {
  return api.post(`/projects/${projectId}/meetings`, data, { params: actorParams() });
}

export async function updateMeeting(id: string, data: UpdateMeetingInput): Promise<Meeting> {
  return api.patch(`/meetings/${id}`, data, { params: actorParams() });
}

export async function updateMom(id: string, data: UpdateMomInput): Promise<Meeting> {
  return api.patch(`/meetings/${id}/mom`, data, { params: actorParams() });
}

export async function deleteMeeting(id: string): Promise<void> {
  return api.delete(`/meetings/${id}`, { params: actorParams() });
}

export async function createActionItem(
  meetingId: string,
  data: CreateActionItemInput
): Promise<MeetingActionItem> {
  return api.post(`/meetings/${meetingId}/action-items`, data, { params: actorParams() });
}

export async function updateActionItem(
  meetingId: string,
  actionItemId: string,
  data: UpdateActionItemInput
): Promise<MeetingActionItem> {
  return api.patch(`/meetings/${meetingId}/action-items/${actionItemId}`, data, {
    params: actorParams(),
  });
}

export async function deleteActionItem(meetingId: string, actionItemId: string): Promise<void> {
  return api.delete(`/meetings/${meetingId}/action-items/${actionItemId}`, {
    params: actorParams(),
  });
}

export async function convertActionItemToTask(
  meetingId: string,
  actionItemId: string
): Promise<MeetingActionItem> {
  return api.post(
    `/meetings/${meetingId}/action-items/${actionItemId}/convert-to-task`,
    undefined,
    { params: actorParams() }
  );
}
