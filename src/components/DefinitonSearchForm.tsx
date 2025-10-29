import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { searchDefinitionDefinitionPost } from '@/client';
import type { DefinitionResult } from '@/client/types.gen';
import { exportDefinitionsAsJson } from '@/lib/export';
import { resultsListAtom } from '@/store/resultsList';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

export function DefinitionSingleSearchForm() {
  const [_, setResultsList] = useAtom(resultsListAtom);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [totalRequests, setTotalRequests] = useState(0);
  const [completedRequests, setCompletedRequests] = useState(0);

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

  const selectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      if (file.type !== 'application/json' && !file.name.endsWith('.json')) {
        toast.error('请上传JSON格式的文件');
        e.target.value = '';
        return;
      }
      setFile(e.target.files[0]);
    }
  };

  const parseFileAndSearch = async () => {
    if (!file) {
      toast.error('请先选择一个JSON文件');
      return;
    }

    try {
      const fileContent = JSON.parse(await file.text());
      console.debug('Parsed file content:', fileContent);
      const term = fileContent || [];
      if (
        Array.isArray(term) &&
        term.length > 0 &&
        term.every((item) => typeof item === 'string')
      ) {
        searchDefinitionWithFile(term);
      } else {
        toast.error('JSON文件格式不正确，缺少definitions数组或数组格式错误');
        return;
      }
    } catch (_) {
      toast.error('解析文件失败');
      return;
    }
  };

  const searchDefinitionWithFile = async (terms: string[]) => {
    const query = terms.map((term) => term.trim()).filter(Boolean);
    if (query.length === 0) {
      toast.error('JSON文件中没有有效的术语');
      return;
    }

    setIsLoading(true);
    setCompletedRequests(0);
    setTotalRequests(query.length);
    setProgress(0);

    // 顺序请求每个术语的定义
    const allResults: DefinitionResult[] = [];

    try {
      for (let i = 0; i < query.length; i++) {
        const term = query[i];

        const res = await searchDefinitionDefinitionPost({
          body: {
            query: term,
          },
        });

        // 更新进度
        setCompletedRequests(i + 1);
        setProgress(((i + 1) / query.length) * 100);

        if (!res.response.ok) {
          if (res.response.status === 401) {
            toast.error('请检查API KEY是否正确');
          } else if (res.response.status === 404) {
            console.warn('部分请求未找到相关定义');
          } else {
            toast.error(`请求失败，状态码：${res.response.status}`);
          }
          continue;
        }

        const result = res.data?.result;
        if (result && Array.isArray(result)) {
          allResults.push(...result);
        }
      }

      if (allResults.length === 0) {
        toast.error('未找到相关定义');
        return;
      }

      const formattedResults = allResults.map((item) => ({
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
      toast.success(`查询成功，找到 ${formattedResults.length} 个定义`);
      exportDefinitionsAsJson({ result: allResults });
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '请求失败');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCompletedRequests(0);
      setTotalRequests(0);
    }
  };

  const id = useId();
  return (
    <div className="flex flex-col gap-3">
      <form
        id={id}
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-3"
      >
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
                <FieldLabel htmlFor="form-rhf-demo-title">
                  术语定义查询
                </FieldLabel>
                <Input
                  {...field}
                  id={id}
                  aria-invalid={fieldState.invalid}
                  placeholder="海洋灾害"
                  autoComplete="off"
                />
                {fieldState.invalid && (
                  <FieldError errors={[fieldState.error]} />
                )}
              </Field>
            )}
          />
        </FieldGroup>
        <div className="flex justify-end mt-2 mr-2">
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Spinner />}
            查询
          </Button>
        </div>
      </form>
      <Separator />
      <div className="flex flex-col gap-3 mt-3">
        <Label>批量查询定义</Label>
        <Input type="file" accept=".json" onChange={selectFile} />
        <div className="flex justify-end mt-2 mr-2">
          <Button
            type="button"
            disabled={isLoading}
            onClick={parseFileAndSearch}
          >
            {isLoading && <Spinner />}
            查询
          </Button>
        </div>
        {isLoading && (
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>查询进度</span>
              <span>
                {completedRequests}/{totalRequests}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        )}
      </div>
    </div>
  );
}
