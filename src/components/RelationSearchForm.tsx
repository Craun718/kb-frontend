import { zodResolver } from '@hookform/resolvers/zod';
import { useAtom } from 'jotai';
import { useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from 'zod';
import { searchRelationshipRelationPost } from '@/client';
import type { RelationResult } from '@/client/types.gen';
import { exportRelationsAsJson } from '@/lib/export';
import { resultsListAtom } from '@/store/resultsList';
import { Button } from './ui/button';
import { Field, FieldError, FieldGroup, FieldLabel } from './ui/field';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Progress } from './ui/progress';
import { Separator } from './ui/separator';
import { Spinner } from './ui/spinner';

export function RelationSingleSearchForm() {
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
      search_type: 'relation',
      query: '海洋灾害,应急响应,台风,预警',
    },
  });

  const onSubmit = async (data: z.infer<typeof singleSearchForm>) => {
    const query = (data.query || '').replace(/，/g, ',');
    const terms = query
      .split(',')
      .map((term) => (term || '').trim())
      .filter(Boolean);

    if (terms.length < 2) {
      toast.error('请输入至少两个有效术语并用逗号分隔');
      return;
    }

    if (terms.length % 2 !== 0) {
      toast.error('术语数量必须为2的倍数，请确保输入偶数个术语');
      return;
    }

    console.debug('Form submitted with data:', data);
    setIsLoading(true);
    setCompletedRequests(0);

    // 按顺序两两配对
    const termPairs: string[][] = [];
    for (let i = 0; i < terms.length; i += 2) {
      termPairs.push([terms[i], terms[i + 1]]);
    }

    setTotalRequests(termPairs.length);
    setProgress(0);

    // 顺序请求每对术语
    const allResults: RelationResult[] = [];

    try {
      for (let i = 0; i < termPairs.length; i++) {
        const [term1, term2] = termPairs[i];

        const res = await searchRelationshipRelationPost({
          body: {
            query: `${term1},${term2}`,
          },
        });

        // 更新进度
        setCompletedRequests(i + 1);
        setProgress(((i + 1) / termPairs.length) * 100);

        if (!res.response.ok) {
          if (res.response.status === 401) {
            toast.error('请检查API KEY是否正确');
          } else if (res.response.status === 404) {
            console.warn('部分请求未找到相关关系');
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
        toast.error('未找到相关关系');
        return;
      }

      const preprocessedResults = allResults.filter(
        (item) =>
          item.term1 &&
          item.term2 &&
          item.relation &&
          item.reason &&
          item.documents &&
          item.page,
      );

      const formattedResults = preprocessedResults.map((item) => ({
        title: `${item.term1} 与 ${item.term2} 为 ${item.relation}` || '',
        description: item.reason || '',
        document: item.documents || '',
        page: item.page || 0,
      }));

      if (!formattedResults.length) {
        toast.error('未找到相关关系');
        return;
      }

      setResultsList(formattedResults);
      toast.success(`查询成功，找到 ${formattedResults.length} 个关系`);
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : '请求失败');
    } finally {
      setIsLoading(false);
      setProgress(0);
      setCompletedRequests(0);
      setTotalRequests(0);
    }
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
      const terms = fileContent || [];
      if (
        Array.isArray(terms) &&
        terms.length > 0 &&
        terms.every((item) => typeof item === 'string')
      ) {
        searchRelationWithFile(terms);
      } else {
        toast.error('JSON文件格式不正确，缺少术语数组或数组格式错误');
        return;
      }
    } catch (_) {
      toast.error('解析文件失败');
      return;
    }
  };

  const searchRelationWithFile = async (terms: string[]) => {
    const query = terms.map((term) => term.trim()).filter(Boolean);
    if (query.length < 2) {
      toast.error('JSON文件中至少需要两个有效术语');
      return;
    }

    if (query.length % 2 !== 0) {
      toast.error('JSON文件中术语数量必须为2的倍数，请确保输入偶数个术语');
      return;
    }

    setIsLoading(true);
    setCompletedRequests(0);

    // 按顺序两两配对
    const termPairs: string[][] = [];
    for (let i = 0; i < query.length; i += 2) {
      termPairs.push([query[i], query[i + 1]]);
    }

    setTotalRequests(termPairs.length);
    setProgress(0);

    // 顺序请求每对术语
    const allResults: RelationResult[] = [];

    try {
      for (let i = 0; i < termPairs.length; i++) {
        const [term1, term2] = termPairs[i];

        const res = await searchRelationshipRelationPost({
          body: {
            query: `${term1},${term2}`,
          },
        });

        // 更新进度
        setCompletedRequests(i + 1);
        setProgress(((i + 1) / termPairs.length) * 100);

        if (!res.response.ok) {
          if (res.response.status === 401) {
            toast.error('请检查API KEY是否正确');
          } else if (res.response.status === 404) {
            console.warn('部分请求未找到相关关系');
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
        toast.error('未找到相关关系');
        return;
      }

      const preprocessedResults = allResults.filter(
        (item) =>
          item.term1 &&
          item.term2 &&
          item.relation &&
          item.reason &&
          item.documents &&
          item.page,
      );

      const formattedResults = preprocessedResults.map((item) => ({
        title: `${item.term1} 与 ${item.term2} 为 ${item.relation}` || '',
        description: item.reason || '',
        document: item.documents || '',
        page: item.page || 0,
      }));

      if (!formattedResults.length) {
        toast.error('未找到相关关系');
        return;
      }

      setResultsList(formattedResults);
      toast.success(`查询成功，找到 ${formattedResults.length} 个关系`);
      exportRelationsAsJson({ result: allResults });
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
                  术语关系查询（用逗号分隔，数量必须为偶数）
                </FieldLabel>
                <Input
                  {...field}
                  id={id}
                  aria-invalid={fieldState.invalid}
                  placeholder="海洋灾害,应急响应,台风,预警"
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
        <Label>批量查询关系</Label>
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
      </div>
      {isLoading && (
        <>
          <Separator />
          <div className="flex flex-col gap-2">
            <div className="flex justify-between text-sm text-gray-600">
              <span>查询进度</span>
              <span>
                {completedRequests}/{totalRequests}
              </span>
            </div>
            <Progress value={progress} />
          </div>
        </>
      )}
    </div>
  );
}
