import { useAtom } from "jotai";
import { Item, ItemContent, ItemDescription, ItemFooter, ItemTitle } from "./ui/item";
import { resultsListAtom } from "@/store/resultsList";

export function ResultList() {
  const [resultList, setResultList] = useAtom(resultsListAtom);

  return (
    <div className="flex flex-col gap-5">
      {resultList.map((element) => ( // 使用 map 方法，同时添加 key
        <Item key={element.title} variant="muted" className="flex flex-col max-h-none h-auto items-start "> {/* 添加 flex-nowrap 防止换行 */}
          <ItemContent>
            <ItemTitle>{element.title}</ItemTitle> {/* 假设 element 有 title 属性，根据实际数据调整 */}
            <ItemDescription className="line-clamp-none! break-all text-left text-blue-50">
              {element.description} {/* 假设 element 有 description 属性，根据实际数据调整 */}
            </ItemDescription>
          </ItemContent>
          <ItemFooter className="flex flex-row text-left basis-auto">
            <div className="flex-1">
              {`来源文档: `}<br />{`${element.document} (第 ${element.page} 页)`}
            </div>
          </ItemFooter>
        </Item>
      ))}
    </div>)
}