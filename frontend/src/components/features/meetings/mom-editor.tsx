'use client';
import { useEffect, useState } from 'react';
import { Loader2, Save } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useUpdateMom } from '@/hooks/use-meetings';
import { useToast } from '@/hooks/use-toast';
import { extractApiError } from '@/lib/utils/error';
import type { Meeting } from '@/types/meeting.types';

const FIELDS: Array<{ key: keyof MomState; label: string; placeholder: string }> = [
  { key: 'momSummary', label: 'Summary', placeholder: 'High-level summary of the meeting...' },
  { key: 'discussionPoints', label: 'Discussion Points', placeholder: 'What was discussed...' },
  { key: 'decisionsMade', label: 'Decisions Made', placeholder: 'Decisions agreed on...' },
  { key: 'risksBlockers', label: 'Risks / Blockers', placeholder: 'Risks or blockers raised...' },
  { key: 'additionalNotes', label: 'Additional Notes', placeholder: 'Anything else worth noting...' },
];

interface MomState {
  momSummary: string;
  discussionPoints: string;
  decisionsMade: string;
  risksBlockers: string;
  additionalNotes: string;
}

export function MomEditor({ meeting }: { meeting: Meeting }) {
  const { toast } = useToast();
  const updateMom = useUpdateMom(meeting.id);
  const [values, setValues] = useState<MomState>({
    momSummary: meeting.momSummary ?? '',
    discussionPoints: meeting.discussionPoints ?? '',
    decisionsMade: meeting.decisionsMade ?? '',
    risksBlockers: meeting.risksBlockers ?? '',
    additionalNotes: meeting.additionalNotes ?? '',
  });

  useEffect(() => {
    setValues({
      momSummary: meeting.momSummary ?? '',
      discussionPoints: meeting.discussionPoints ?? '',
      decisionsMade: meeting.decisionsMade ?? '',
      risksBlockers: meeting.risksBlockers ?? '',
      additionalNotes: meeting.additionalNotes ?? '',
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meeting.id]);

  const dirty =
    values.momSummary !== (meeting.momSummary ?? '') ||
    values.discussionPoints !== (meeting.discussionPoints ?? '') ||
    values.decisionsMade !== (meeting.decisionsMade ?? '') ||
    values.risksBlockers !== (meeting.risksBlockers ?? '') ||
    values.additionalNotes !== (meeting.additionalNotes ?? '');

  const handleSave = async () => {
    try {
      await updateMom.mutateAsync(values);
      toast({ title: 'Minutes saved' });
    } catch (err) {
      toast({ variant: 'destructive', title: 'Error', description: extractApiError(err) });
    }
  };

  return (
    <div className="space-y-4">
      {FIELDS.map((f) => (
        <div key={f.key}>
          <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
            {f.label}
          </Label>
          <Textarea
            rows={3}
            placeholder={f.placeholder}
            value={values[f.key]}
            onChange={(e) => setValues((v) => ({ ...v, [f.key]: e.target.value }))}
            className="resize-none"
          />
        </div>
      ))}
      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={!dirty || updateMom.isPending}>
          {updateMom.isPending ? (
            <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-1.5" />
          )}
          Save Minutes
        </Button>
      </div>
    </div>
  );
}
