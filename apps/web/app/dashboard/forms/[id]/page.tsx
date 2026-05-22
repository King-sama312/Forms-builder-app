import { FormBuilder } from "./_components/form-builder";

export default async function FormBuilderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="rounded-2xl border border-border bg-card p-6">
        <h1 className="text-3xl font-semibold">Form Builder</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Form ID:{" "}
          <span className="font-mono text-foreground">{id}</span>
        </p>
      </div>
      <FormBuilder formId={id} />
    </div>
  );
}
