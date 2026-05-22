import { SubmissionsTable } from "./_components/submissions-table";

export default async function SubmissionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-3xl font-semibold">Submissions</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View all submissions for this form.
        </p>
      </div>
      <SubmissionsTable formId={id} />
    </div>
  );
}
