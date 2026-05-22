"use client";

import { useListForms } from "~/hooks/api/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export function FormList() {
  const { forms, isLoading, isError } = useListForms();

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-muted-foreground">Loading forms...</div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-destructive">Failed to load forms.</div>
      </div>
    );
  }

  if (!forms || forms.length === 0) {
    return (
      <div className="rounded-2xl border border-border bg-card p-6 mt-6">
        <div className="text-sm text-muted-foreground">
          You have no forms yet. Create one to get started!
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 mt-6">
      <h2 className="text-xl font-semibold mb-4">Your Forms</h2>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Description</TableHead>
              <TableHead>Created At</TableHead>
              <TableHead className="text-right">Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {forms.map((form) => (
              <TableRow key={form.id}>
                <TableCell className="font-medium">{form.title}</TableCell>
                <TableCell className="text-muted-foreground">{form.description || "-"}</TableCell>
                <TableCell className="text-muted-foreground">
                  {form.createdAt ? format(new Date(form.createdAt), "MMM d, yyyy") : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="outline" size="sm" asChild>
                    <Link href={`/dashboard/forms/${form.id}`}>Edit</Link>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
