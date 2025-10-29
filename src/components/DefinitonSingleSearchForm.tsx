import { zodResolver } from '@hookform/resolvers/zod';
import { Controller, useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';

export function DefinitionSingleSearchForm() {
  const singleSearchForm = z.object({
    search_type: z
      .string()
      .min(2, '至少需要输入两个字符')
      .max(100, '最多输入100个字符'),
    query: z
      .string()
      .min(2, '至少需要输入两个字符')
      .max(100, '最多输入100个字符'),
  });

  const form = useForm<z.infer<typeof singleSearchForm>>({
    resolver: zodResolver(singleSearchForm),
    defaultValues: {
      search_type: 'definition',
      query: '',
    },
  });

  const onSubmit = (data: z.infer<typeof singleSearchForm>) => {
    console.log('Form submitted with data:', data);
  };

  return (
    <form id="search-form" onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="search_type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                type="hidden"
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                autoComplete="off"
              />
            </Field>
          )}
        />

        <Controller
          name="query"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor="form-rhf-demo-title">术语</FieldLabel>
              <Input
                {...field}
                id="form-rhf-demo-title"
                aria-invalid={fieldState.invalid}
                placeholder="海洋灾害"
                autoComplete="off"
              />
              {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
            </Field>
          )}
        />
      </FieldGroup>
      <div className="mt-5">
        <Button type="submit">查询</Button>
      </div>
    </form>
  );
}
