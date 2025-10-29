import { useAtom } from 'jotai';
import { ResultList } from '@/components/resultList';
import { SearchCard } from '@/components/SearchCard';
import { resultsListAtom } from '@/store/resultsList';

export function HomePage() {
  const resultList = useAtom(resultsListAtom)[0];

  return (
    <div className="flex-1">
      <div style={{ paddingTop: resultList.length === 0 ? 180 : 50 }}>
        <h1 className="font-bold text-3xl text-center m-10">
          海洋防灾减灾知识库
        </h1>
        <div className="flex flex-col gap-15 mx-10 mb-20 lg:mx-70">
          <SearchCard />
          <ResultList />
        </div>
      </div>
    </div>
  );
}
