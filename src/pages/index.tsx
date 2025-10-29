import { SearchCard } from '@/components/SearchCard';

export function HomePage() {
  return (
    <>
      <div className="flex-1">
        <div style={{ paddingTop: 150 }}>
          <h1 className="font-bold text-3xl text-center m-10">
            海洋防灾减灾知识库
          </h1>
          <SearchCard />
        </div>
      </div>
    </>
  );
}
