import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { searchRelationshipRelationPost } from '@/client';
import { resultsListAtom } from '@/store/resultsList';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Spinner } from './ui/spinner';

export function RelationSingleSearchForm() {
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
      search_type: 'relation',
      query: '海洋灾害应急',
    },
  });

  const onSubmit = (data: z.infer<typeof singleSearchForm>) => {
    const query = (data.query || '').replace(/，/g, ',');
    const terms = query.split(',').map(term => (term || '').trim());

    if (terms.filter(Boolean).length < 2) {
      toast.error('请输入至少两个有效术语并用逗号分隔');
      return;
    }

    data.query = terms.join(',');

    console.debug('Form submitted with data:', data);
    setIsLoading(true);
    searchRelationshipRelationPost({ body: { ...data } })
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


        const preprocessedResults = result.filter(item => item.term1 && item.term2 && item.relation && item.reason && item.documents && item.page);

        const formattedResults = preprocessedResults.map((item) => (
          {
            title: `${item.term1} 与 ${item.term2} 为 ${item.relation}` || '',
            description: item.reason || '',
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

  const id = useId();
  return (
    <form id={id} onSubmit={form.handleSubmit(onSubmit)}>
      <FieldGroup>
        <Controller
          name="search_type"
          control={form.control}
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <Input
                type="hidden"
                {...field}
                id={id}
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
              <FieldLabel htmlFor="form-rhf-demo-title">术语（用逗号分隔）</FieldLabel>
              <Input
                {...field}
                id={id}
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
        <Button type="submit" size="lg">
          {isLoading && <Spinner />}
          查询
        </Button>
      </div>
    </form>
  );
}
