"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import { useGetFormById, useCreateFormSubmission } from "~/hooks/api/form";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Loader2 } from "lucide-react";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";

export default function PublicFormPage() {
  const { form_id } = useParams<{ form_id: string }>();
  const { form, isLoading, isError } = useGetFormById(form_id);
  const { createFormSubmissionAsync, isSuccess: isSubmitted, isPending: isSubmitting } = useCreateFormSubmission();
  const [values, setValues] = useState<Record<string, string>>({});

  if (isLoading) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Loader2 className="size-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (isError || !form) {
    return (
      <div className="flex min-h-svh items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Form not found</CardTitle>
            <CardDescription>
              This form may have been removed or the link is invalid.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const missing = form.fields
      .filter((f) => f.isRequired && !values[f.id]?.trim())
      .map((f) => f.label);

    if (missing.length > 0) {
      toast.error(`Please fill in: ${missing.join(", ")}`);
      return;
    }

    try {
      await createFormSubmissionAsync({
        formId: form_id,
        values: form.fields
          .filter((f) => values[f.id]?.trim())
          .map((f) => ({ formFieldId: f.id, value: values[f.id]! })),
      });
      toast.success("Form submitted");
    } catch {
      toast.error("Failed to submit form");
    }
  };

  const setValue = (fieldId: string, value: string) => {
    setValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-svh items-center justify-center p-6">
        <Card className="w-full max-w-lg">
          <CardHeader>
            <CardTitle>Thank you!</CardTitle>
            <CardDescription>Your response has been recorded.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh items-start justify-center p-6 md:p-10">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle>{form.title}</CardTitle>
          {form.description && (
            <CardDescription>{form.description}</CardDescription>
          )}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {form.fields.map((field) => (
              <div key={field.id} className="flex flex-col gap-1.5">
                <Label htmlFor={field.id}>
                  {field.label}
                  {field.isRequired && (
                    <span className="text-destructive ml-0.5">*</span>
                  )}
                </Label>
                {field.description && (
                  <p className="text-xs text-muted-foreground">
                    {field.description}
                  </p>
                )}
                {field.type === "YES_NO" ? (
                  <Select
                    value={values[field.id] ?? ""}
                    onValueChange={(v) => setValue(field.id, v)}
                  >
                    <SelectTrigger id={field.id}>
                      <SelectValue placeholder="Select..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={field.id}
                    type={field.type === "PASSWORD" ? "password" : field.type.toLowerCase()}
                    placeholder={field.placeholeder ?? ""}
                    value={values[field.id] ?? ""}
                    onChange={(e) => setValue(field.id, e.target.value)}
                  />
                )}
              </div>
            ))}
            <Button type="submit" className="self-start mt-2" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="size-4 animate-spin" /> Submitting...</>
              ) : (
                "Submit"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
