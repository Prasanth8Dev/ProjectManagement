import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '@/constants/query-keys';
import type { Meeting, MeetingActionItem } from '@/types/meeting.types';
import {
  getMeetings,
  getMeeting,
  createMeeting,
  updateMeeting,
  updateMom,
  deleteMeeting,
  createActionItem,
  updateActionItem,
  deleteActionItem,
  convertActionItemToTask,
  type CreateMeetingInput,
  type UpdateMeetingInput,
  type UpdateMomInput,
  type CreateActionItemInput,
  type UpdateActionItemInput,
} from '@/lib/api/meetings.api';

export const useMeetings = (projectId: string, type?: string) =>
  useQuery({
    queryKey: QUERY_KEYS.meetings.list(projectId, type),
    queryFn: () => getMeetings(projectId, type),
    enabled: !!projectId,
    staleTime: 15_000,
    select: (d: any): Meeting[] => d?.data ?? d,
  });

export const useMeeting = (id: string) =>
  useQuery({
    queryKey: QUERY_KEYS.meetings.detail(id),
    queryFn: () => getMeeting(id),
    enabled: !!id,
    staleTime: 10_000,
    select: (d: any): Meeting => d?.data ?? d,
  });

export const useCreateMeeting = (projectId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMeetingInput) => createMeeting(projectId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.all });
    },
  });
};

export const useUpdateMeeting = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMeetingInput) => updateMeeting(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(id) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.all });
    },
  });
};

export const useUpdateMom = (id: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateMomInput) => updateMom(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(id) });
    },
  });
};

export const useDeleteMeeting = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteMeeting(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.all });
    },
  });
};

export const useCreateActionItem = (meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateActionItemInput) => createActionItem(meetingId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(meetingId) });
    },
  });
};

export const useUpdateActionItem = (meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ actionItemId, data }: { actionItemId: string; data: UpdateActionItemInput }) =>
      updateActionItem(meetingId, actionItemId, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(meetingId) });
    },
  });
};

export const useDeleteActionItem = (meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionItemId: string) => deleteActionItem(meetingId, actionItemId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(meetingId) });
    },
  });
};

export const useConvertActionItemToTask = (meetingId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (actionItemId: string) => convertActionItemToTask(meetingId, actionItemId),
    onSuccess: (updated: MeetingActionItem) => {
      qc.invalidateQueries({ queryKey: QUERY_KEYS.meetings.detail(meetingId) });
      qc.invalidateQueries({ queryKey: QUERY_KEYS.tasks.all });
      return updated;
    },
  });
};
