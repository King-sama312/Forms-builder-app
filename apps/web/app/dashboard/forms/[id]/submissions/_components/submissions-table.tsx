"use client";

import { useGetFormFields, useGetFormSubmissions } from "~/hooks/api/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { format } from "date-fns";

export function SubmissionsTable({ formId }: { formId: string }) {
  const { fields, isLoading: fieldsLoading, isError: fieldsError } = useGetFormFields(formId);
  const { submissions, isLoading: subsLoading, isError: subsError } = useGetFormSubmissions(formId);

  if (fieldsLoading || subsLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-muted-foreground">Loading submissions...</div>
      </div>
    );
  }

  if (fieldsError || subsError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-destructive">Failed to load submissions.</div>
      </div>
    );
  }

  if (!fields || fields.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-muted-foreground">
          This form has no fields. Add fields to start collecting submissions.
        </div>
      </div>
    );
  }

  if (!submissions || submissions.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-muted-foreground">
          No submissions yet. Share the form to start receiving responses.
        </div>
      </div>
    );
  }

  const fieldMap = new Map(fields.map((f) => [f.id, f.label]));

  return (
    <div className="rounded-2xl border border-border bg-card p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Submissions ({submissions.length})</h2>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {fields.map((field) => (
                <TableHead key={field.id}>{field.label}</TableHead>
              ))}
              <TableHead className="text-right">Submitted At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.map((submission) => {
              const valueMap = new Map(
                (submission.values ?? []).map((v) => [v.formFieldId, v.value])
              );

              return (
                <TableRow key={submission.id}>
                  {fields.map((field) => (
                    <TableCell key={field.id} className="max-w-xs truncate">
                      {valueMap.get(field.id) ?? "-"}
                    </TableCell>
                  ))}
                  <TableCell className="text-right text-muted-foreground whitespace-nowrap">
                    {submission.createdAt
                      ? format(new Date(submission.createdAt), "MMM d, yyyy h:mm a")
                      : "-"}
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
