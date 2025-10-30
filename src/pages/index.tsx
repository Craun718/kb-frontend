import { ResultList } from '@/components/resultList';
import { SearchCard } from '@/components/SearchCard';

export function HomePage() {
  return (
    <div className="flex-1">
      <div>
        <h1 className="font-extrabold text-4xl text-center text-sky-900 mb-6">
          海洋防灾减灾知识库
        </h1>

        <div className="flex justify-center px-4">
          <div className="w-full max-w-4xl bg-white/70 dark:bg-gray-800/60 backdrop-blur-sm rounded-2xl p-6 shadow-lg">
            <div className="flex flex-col gap-10 mx-1 mt-5 lg:mx-4">
              <SearchCard />
              <ResultList />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
