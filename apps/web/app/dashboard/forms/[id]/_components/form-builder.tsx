"use client";

import { useState } from "react";
import { toast } from "sonner";
import {
  AlignLeft,
  Hash,
  Mail,
  ToggleLeft,
  Lock,
  Plus,
  Trash2,
  GripVertical,
  Loader2,
} from "lucide-react";
import {
  useGetFormFields,
  useCreateFormField,
  useUpdateFormField,
  useDeleteFormField,
} from "~/hooks/api/form";
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
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { Switch } from "~/components/ui/switch";

type FieldType = "TEXT" | "NUMBER" | "EMAIL" | "YES_NO" | "PASSWORD";

const FIELD_TYPES: { value: FieldType; label: string; icon: React.ReactNode }[] = [
  { value: "TEXT", label: "Text", icon: <AlignLeft className="size-4" /> },
  { value: "NUMBER", label: "Number", icon: <Hash className="size-4" /> },
  { value: "EMAIL", label: "Email", icon: <Mail className="size-4" /> },
  { value: "YES_NO", label: "Yes / No", icon: <ToggleLeft className="size-4" /> },
  { value: "PASSWORD", label: "Password", icon: <Lock className="size-4" /> },
];

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^a-z0-9_]/g, "");
}

/** Generate a fractional index after the last existing field */
function nextIndex(fields: { index: string }[]) {
  if (fields.length === 0) return "1.00";
  const max = Math.max(...fields.map((f) => parseFloat(f.index)));
  return (max + 1).toFixed(2);
}

interface FormBuilderProps {
  formId: string;
}

export function FormBuilder({ formId }: FormBuilderProps) {
  const { fields, isLoading } = useGetFormFields(formId);
  const { createFormFieldAsync, isLoading: isCreating } = useCreateFormField() as any;
  const { deleteFormFieldAsync } = useDeleteFormField(formId);
  const { updateFormFieldAsync } = useUpdateFormField(formId);

  const [newLabel, setNewLabel] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newType, setNewType] = useState<FieldType>("TEXT");
  const [newRequired, setNewRequired] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editLabel, setEditLabel] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editRequired, setEditRequired] = useState(false);

  const handleAddField = async () => {
    const label = newLabel.trim();
    if (!label) {
      toast.error("Please enter a field label");
      return;
    }
    try {
      await createFormFieldAsync({
        formId,
        label,
        labelKey: slugify(label),
        type: newType,
        index: nextIndex(fields ?? []),
        isRequired: newRequired,
        description: newDescription.trim() || undefined,
      });
      setNewLabel("");
      setNewDescription("");
      setNewRequired(false);
      toast.success("Field added");
    } catch {
      toast.error("Failed to add field");
    }
  };

  const handleDelete = async (fieldId: string) => {
    try {
      await deleteFormFieldAsync({ fieldId });
      toast.success("Field deleted");
    } catch {
      toast.error("Failed to delete field");
    }
  };

  const startEdit = (field: { id: string; label: string; description?: string | null; isRequired: boolean }) => {
    setEditingId(field.id);
    setEditLabel(field.label);
    setEditDescription(field.description ?? "");
    setEditRequired(field.isRequired);
  };

  const handleSaveEdit = async (fieldId: string) => {
    try {
      await updateFormFieldAsync({
        fieldId,
        label: editLabel,
        description: editDescription.trim() || undefined,
        isRequired: editRequired,
      });
      setEditingId(null);
      toast.success("Field updated");
    } catch {
      toast.error("Failed to update field");
    }
  };

  const fieldTypeIcon = (type: FieldType) =>
    FIELD_TYPES.find((t) => t.value === type)?.icon ?? <AlignLeft className="size-4" />;

  return (
    <div className="flex flex-col gap-6">
      {/* Add field panel */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold">Add a field</h2>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1.5 flex-1 min-w-48">
            <Label htmlFor="new-label">Label</Label>
            <Input
              id="new-label"
              placeholder="e.g. Full Name"
              value={newLabel}
              onChange={(e) => setNewLabel(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddField()}
            />
          </div>
          <div className="flex flex-col gap-1.5 flex-1 min-w-48">
            <Label htmlFor="new-description">Description</Label>
            <Input
              id="new-description"
              placeholder="Optional description"
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddField()}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label>Type</Label>
            <Select value={newType} onValueChange={(v) => setNewType(v as FieldType)}>
              <SelectTrigger className="w-36">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FIELD_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    <span className="flex items-center gap-2">
                      {t.icon}
                      {t.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-2 pb-1.5">
            <Switch
              id="new-required"
              checked={newRequired}
              onCheckedChange={setNewRequired}
            />
            <Label htmlFor="new-required" className="text-sm">
              Required
            </Label>
          </div>
          <Button onClick={handleAddField} disabled={isCreating}>
            {isCreating ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            Add Field
          </Button>
        </div>
      </div>

      {/* Field list */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <h2 className="mb-4 text-base font-semibold">
          Fields{" "}
          <span className="text-muted-foreground font-normal text-sm">
            ({fields?.length ?? 0})
          </span>
        </h2>

        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-8 justify-center">
            <Loader2 className="size-4 animate-spin" />
            Loading fields...
          </div>
        )}

        {!isLoading && (!fields || fields.length === 0) && (
          <div className="rounded-xl border-2 border-dashed border-border py-12 text-center text-sm text-muted-foreground">
            No fields yet. Add your first field above.
          </div>
        )}

        {!isLoading && fields && fields.length > 0 && (
          <div className="flex flex-col gap-2">
            {fields.map((field, i) => (
              <div key={field.id}>
                {i > 0 && <Separator className="my-2" />}
                {editingId === field.id ? (
                  /* ── edit mode ── */
                  <div className="flex flex-wrap items-end gap-3 py-1">
                    <div className="flex flex-col gap-1.5 flex-1 min-w-40">
                      <Label>Label</Label>
                      <Input
                        value={editLabel}
                        onChange={(e) => setEditLabel(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(field.id)}
                        autoFocus
                      />
                    </div>
                    <div className="flex flex-col gap-1.5 flex-1 min-w-40">
                      <Label>Description</Label>
                      <Input
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSaveEdit(field.id)}
                      />
                    </div>
                    <div className="flex items-center gap-2 pb-1.5">
                      <Switch
                        id={`required-${field.id}`}
                        checked={editRequired}
                        onCheckedChange={setEditRequired}
                      />
                      <Label htmlFor={`required-${field.id}`} className="text-sm">
                        Required
                      </Label>
                    </div>
                    <div className="flex gap-2 pb-0.5">
                      <Button size="sm" onClick={() => handleSaveEdit(field.id)}>
                        Save
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setEditingId(null)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* ── view mode ── */
                  <div className="group flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/50 transition-colors">
                    <GripVertical className="size-4 text-muted-foreground/40 shrink-0" />
                    <span className="text-muted-foreground shrink-0">
                      {fieldTypeIcon(field.type as FieldType)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{field.label}</p>
                      <p className="text-xs text-muted-foreground font-mono">{field.labelKey}</p>
                    </div>
                    <Badge variant="secondary" className="text-xs shrink-0">
                      {field.type}
                    </Badge>
                    {field.isRequired && (
                      <Badge variant="outline" className="text-xs shrink-0 border-destructive/50 text-destructive">
                        Required
                      </Badge>
                    )}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        onClick={() =>
                          startEdit({
                            id: field.id,
                            label: field.label,
                            description: field.description,
                            isRequired: field.isRequired,
                          })
                        }
                      >
                        <AlignLeft className="size-3.5" />
                      </Button>
                      <Button
                        size="icon-sm"
                        variant="ghost"
                        className="text-destructive hover:text-destructive"
                        onClick={() => handleDelete(field.id)}
                      >
                        <Trash2 className="size-3.5" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
