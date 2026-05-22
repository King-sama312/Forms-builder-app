import { CreateFormDialog } from "./_components/create-form-dialog"

export default function DashboardFormsPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      <div className="px-4 lg:px-6">
        <div className="space-y-2 rounded-2xl border border-border bg-card p-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold">Forms</h1>
            <p className="text-sm text-muted-foreground">
              This section shares the dashboard layout, sidebar, and header.
            </p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <div className="flex flex-col justify-between rounded-2xl border border-border bg-background p-4">
              <div>
                <h2 className="text-lg font-semibold">Create a new form</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Start a blank form or use a template to collect responses.
                </p>
              </div>
              <CreateFormDialog />
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="text-lg font-semibold">Published forms</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                View and manage forms that are currently live.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-background p-4">
              <h2 className="text-lg font-semibold">Responses</h2>
              <p className="mt-2 text-sm text-muted-foreground">
                Review how many responses your forms have received.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
