// Re-export daily update hooks under the names pages expect
export {
  useDailyUpdates,
  useDailyUpdate as useUpdate,
  useTodayUpdate,
  useCreateDailyUpdate,
  useUpdateDailyUpdate,
  useDeleteDailyUpdate,
  useDailyReport,
  useWeeklyReport,
  useDailyUpdateReplies,
  useCreateDailyUpdateReply,
} from './use-daily-updates';
