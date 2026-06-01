import { useAtom } from 'jotai';
import { resultsListAtom } from '@/store/resultsList';
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemFooter,
  ItemGroup,
  ItemTitle,
} from './ui/item';

export function ResultList() {
  const [resultList, _] = useAtom(resultsListAtom);

  return (
    <div>
      <ItemGroup className='flex flex-col gap-10'>
        {resultList.map(
          (
            element, // 使用 map 方法，同时添加 key
          ) => (
            <Item
              key={element.title}
              variant="muted"
              className="flex flex-col max-h-none h-auto items-start bg-blue-100"
            >
              <ItemContent>
                <ItemTitle className="text-blue-900">{element.title}</ItemTitle>{' '}
                <ItemDescription className="line-clamp-none! break-all text-left text-blue-800   dark:text-gray-400">
                  {element.description}{' '}
                </ItemDescription>
              </ItemContent>
              <ItemFooter className="flex flex-row text-left basis-auto text-gray-500">
                <div className="flex-1">
                  {`参考文档: `}
                  <br />
                  {`${element.document} (第 ${element.page} 页)`}
                </div>
              </ItemFooter>
            </Item>
          ),
        )}
      </ItemGroup>
    </div>
  );
}
