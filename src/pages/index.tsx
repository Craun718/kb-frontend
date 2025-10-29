import { SearchCard } from '@/components/SearchCard';

export function HomePage() {
  return (
    <>
      <div className="flex-1">
        <div style={{ paddingTop: 250 }}>
          <h1 className="font-bold text-3xl text-center m-10">
            欢迎来到海洋防灾减灾知识库
          </h1>
          <SearchCard />
        </div>
      </div>
    </>
  );
}
