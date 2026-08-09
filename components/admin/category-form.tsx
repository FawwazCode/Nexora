"use client";

import { useEffect, useState, type ChangeEvent, type FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type CategoryFormValues = {
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
};

type CategoryFormProps = {
  initialValues?: Partial<CategoryFormValues> | null;
  submitting?: boolean;
  submitLabel?: string;
  onSubmit: (values: CategoryFormValues) => Promise<void> | void;
};

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  description: "",
  isActive: true,
};

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export function CategoryForm({ initialValues, submitting = false, submitLabel = "Save", onSubmit }: CategoryFormProps) {
  const [values, setValues] = useState<CategoryFormValues>(defaultValues);
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false);

  useEffect(() => {
    const nextValues = {
      ...defaultValues,
      ...initialValues,
      isActive: initialValues?.isActive ?? true,
    } as CategoryFormValues;

    setValues(nextValues);
    setSlugManuallyEdited(Boolean(initialValues?.slug));
  }, [initialValues]);

  const handleNameChange = (event: ChangeEvent<HTMLInputElement>) => {
    const name = event.target.value;
    setValues((current) => ({
      ...current,
      name,
      slug: slugManuallyEdited ? current.slug : slugify(name),
    }));
  };

  const handleSlugChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSlugManuallyEdited(true);
    setValues((current) => ({ ...current, slug: event.target.value }));
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <Input
          required
          placeholder="Category name"
          value={values.name}
          onChange={handleNameChange}
        />
        <Input
          required
          placeholder="Slug"
          value={values.slug}
          onChange={handleSlugChange}
        />
      </div>

      <textarea
        className="min-h-28 w-full rounded-lg border border-gray-200 px-3 py-2 text-sm"
        placeholder="Description"
        value={values.description}
        onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
      />

      <label className="flex items-center gap-2 text-sm text-gray-700">
        <input
          type="checkbox"
          checked={values.isActive}
          onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))}
        />
        Active
      </label>

      <div className="flex gap-2">
        <Button type="submit" className="bg-[#7F46FA] hover:bg-[#6B3DD9]" disabled={submitting}>
          {submitting ? "Saving..." : submitLabel}
        </Button>
        <Button type="button" variant="outline" onClick={() => window.history.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
