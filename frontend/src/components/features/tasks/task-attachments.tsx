'use client';
import {
  Download,
  Trash2,
  FileImage,
  FileText,
  FileCode,
  FileArchive,
  FileAudio,
  FileVideo,
  FileIcon,
} from 'lucide-react';
import { FileUpload } from '@/components/shared/file-upload';
import { useTaskAttachments, useUploadAttachment, useDeleteAttachment } from '@/hooks/use-attachments';
import { ConfirmDialog } from '@/components/shared/confirm-dialog';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { formatFileSize } from '@/lib/utils/format';
import { formatDate } from '@/lib/utils/date';
import { toast } from '@/components/ui/use-toast';
import { Attachment } from '@/types/attachment.types';
import { useState } from 'react';

interface TaskAttachmentsProps {
  taskId: string;
}

function getFileIcon(mimeType: string) {
  if (mimeType.startsWith('image/')) return FileImage;
  if (mimeType.startsWith('video/')) return FileVideo;
  if (mimeType.startsWith('audio/')) return FileAudio;
  if (mimeType.includes('zip') || mimeType.includes('tar') || mimeType.includes('archive'))
    return FileArchive;
  if (mimeType.includes('javascript') || mimeType.includes('json') || mimeType.includes('html'))
    return FileCode;
  if (mimeType.includes('pdf') || mimeType.includes('word') || mimeType.includes('text'))
    return FileText;
  return FileIcon;
}

export function TaskAttachments({ taskId }: TaskAttachmentsProps) {
  const [deleteTarget, setDeleteTarget] = useState<Attachment | null>(null);

  const { data: attachments, isLoading } = useTaskAttachments(taskId);
  const { mutate: uploadAttachment, isPending: isUploading } = useUploadAttachment();
  const { mutate: deleteAttachment, isPending: isDeleting } = useDeleteAttachment();

  const handleUpload = (files: File[]) => {
    files.forEach((file) => {
      uploadAttachment(
        { file, entityType: 'TASK', entityId: taskId },
        {
          onSuccess: () =>
            toast({ title: `${file.name} uploaded successfully` }),
          onError: () =>
            toast({ title: `Failed to upload ${file.name}`, variant: 'destructive' }),
        }
      );
    });
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAttachment(deleteTarget.id, {
      onSuccess: () => {
        toast({ title: 'Attachment deleted' });
        setDeleteTarget(null);
      },
      onError: () =>
        toast({ title: 'Failed to delete attachment', variant: 'destructive' }),
    });
  };

  return (
    <div className="space-y-4">
      <FileUpload onUpload={handleUpload} disabled={isUploading} />

      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full rounded-lg" />
          ))}
        </div>
      ) : attachments && attachments.length > 0 ? (
        <div className="grid gap-2">
          {attachments.map((attachment) => {
            const Icon = getFileIcon(attachment.mimeType);
            return (
              <div
                key={attachment.id}
                className="flex items-center gap-3 p-3 rounded-lg border bg-muted/40 hover:bg-muted/70 transition-colors"
              >
                <div className="h-9 w-9 rounded-md bg-background flex items-center justify-center shrink-0 border">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {attachment.fileName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.fileSize)} · Uploaded{' '}
                    {formatDate(attachment.createdAt, 'MMM d')} by{' '}
                    {attachment.uploader?.name ?? 'Unknown'}
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    asChild
                  >
                    <a
                      href={attachment.fileUrl}
                      download={attachment.fileName}
                      aria-label={`Download ${attachment.fileName}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => setDeleteTarget(attachment)}
                    aria-label={`Delete ${attachment.originalName}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground text-center py-2">
          No attachments yet.
        </p>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete Attachment"
        description={`Are you sure you want to delete "${deleteTarget?.fileName}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        onConfirm={handleDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
