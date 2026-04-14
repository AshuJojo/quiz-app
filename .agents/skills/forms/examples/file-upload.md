# File Upload Pattern

Handling file uploads in Next.js Server Actions requires passing native `FormData` rather than a serialized JSON payload, as files cannot be JSON serialized.

## 1. Zod Schema (`src/components/features/uploads/validations.ts`)

```ts
import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

export const uploadSchema = z.object({
  title: z.string().min(2),
  file: z
    .custom<File>((val) => val instanceof File, 'Please upload a file')
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      'Only .jpg, .jpeg, .png and .webp formats are supported.'
    ),
});
```

## 2. Server Action (`src/components/features/uploads/actions.ts`)

When accepting files, the action must take `FormData` directly.

```ts
'use server';

import { uploadSchema } from '@/lib/validations/upload.schema';
import { uploadToS3OrEquivalent } from '@/lib/s3';

export async function uploadImageAction(formData: FormData) {
  const file = formData.get('file');
  const title = formData.get('title');

  // Ensure parsing uses the correct object shape
  const validation = uploadSchema.safeParse({ file, title });

  if (!validation.success) {
    return {
      success: false,
      errors: validation.error.flatten().fieldErrors,
    };
  }

  // File is validated and safe here
  const safeFile = validation.data.file;
  const buffer = Buffer.from(await safeFile.arrayBuffer());

  // Example: Send to S3, Vercel Blob, etc.
  const fileUrl = await uploadToS3OrEquivalent({
    buffer,
    name: safeFile.name,
    type: safeFile.type,
  });

  return { success: true, url: fileUrl };
}
```

## 3. Client Form (`src/components/forms/upload-form.tsx`)

When using files in React Hook Form with Server Actions, you must manually construct the `FormData` on submit rather than letting Server Actions automatically serialize, because RHF manages the file input value.

```tsx
'use client';

import * as React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { uploadSchema } from '@/lib/validations/upload.schema';
import { uploadImageAction } from '@/actions/upload.actions';
import { z } from 'zod';

type FormValues = z.infer<typeof uploadSchema>;

export function UploadForm() {
  const [isPending, startTransition] = React.useTransition();

  const form = useForm<FormValues>({
    resolver: zodResolver(uploadSchema),
  });

  // We construct FormData manually because files require it
  const onSubmit = (data: FormValues) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('file', data.file);

    startTransition(async () => {
      const result = await uploadImageAction(formData);
      if (!result?.success && result?.errors) {
        if (result.errors.file) {
          form.setError('file', { message: result.errors.file[0] });
        }
      } else {
        alert('Uploaded successfully!');
      }
    });
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label>Title</label>
        <input {...form.register('title')} className="border p-2 w-full" />
      </div>

      <div>
        <label>Image Upload</label>
        <input
          type="file"
          accept="image/*"
          // We must handle the onChange manually to extract the File object from FileList
          onChange={(e) => {
            if (e.target.files?.[0]) {
              form.setValue('file', e.target.files[0], { shouldValidate: true });
            }
          }}
        />
        {form.formState.errors.file && (
          <p className="text-destructive text-sm">{form.formState.errors.file.message}</p>
        )}
      </div>

      <button type="submit" disabled={isPending} className="bg-primary text-white p-2">
        {isPending ? 'Uploading...' : 'Upload'}
      </button>
    </form>
  );
}
```
