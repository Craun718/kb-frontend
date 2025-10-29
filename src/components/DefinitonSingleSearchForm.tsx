import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { searchDefinitionDefinitionPost } from '@/client';
import { resultsListAtom } from '@/store/resultsList';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';

export function DefinitionSingleSearchForm() {
  const [_, setResultsList] = useAtom(resultsListAtom);
  const [isLoading, setIsLoading] = useState(false);

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
      query: '海洋灾害应急',
    },
  });

  const onSubmit = (data: z.infer<typeof singleSearchForm>) => {
    console.debug('Form submitted with data:', data);
    setIsLoading(true);
    searchDefinitionDefinitionPost({ body: { ...data } })
      .then((res) => {
        if (!res.response.ok) {
          if (res.response.status === 401) {
            toast.error('请检查API KEY是否正确');
          } else if (res.response.status === 404) {
            toast.error('未找到相关定义');
          } else {
            toast.error(`请求失败，状态码：${res.response.status}`);
          }
        }

        const result = res.data?.result;
        if (!result || !Array.isArray(result)) {
          toast.error('未找到相关定义');
          return;
        }

        const formattedResults = result.map((item) => ({
          title: item.term || '',
          description: item.definition || '',
          document: item.documents || '',
          page: item.page || 0,
        }));

        if (!formattedResults.length) {
          toast.error('未找到相关定义');
          return;
        }

        setResultsList(formattedResults);
        toast.success('查询成功');
      })
      .catch((error) => {
        toast.error(error.message);
      })
      .finally(() => {
        setIsLoading(false);
      });
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
        <Button type="submit">
          {isLoading && <Spinner />}
          查询
        </Button>
      </div>
    </form>
  );
}
