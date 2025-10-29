import type { DefinitionResponse } from '@/client';

// [
// "W01": {"术语名称": "...", "术语定义": "...", "文档出处": "...",
// "文档页数": "..."},
// "W02": {"术语名称": "...", "术语定义": "...", "文档出处": "...",
// "文档页数": "..."},
// // 其他 18 个术语信息
// ]

export const exportDefinitionsAsJson = (definitions: DefinitionResponse) => {
  // 构建符合要求格式的对象
  const exportData: Record<
    string,
    {
      术语名称: string;
      术语定义: string;
      文档出处: string;
      文档页数: number;
    }
  > = {};

  // 遍历定义结果，为每个术语分配一个ID（W01, W02, ...）
  definitions.result.forEach((item, index) => {
    const termId = `W${String(index + 1).padStart(2, '0')}`;
    exportData[termId] = {
      术语名称: item.term,
      术语定义: item.definition,
      文档出处: item.documents,
      文档页数: item.page,
    };
  });

  // 创建并下载JSON文件
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = `术语定义_${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};
