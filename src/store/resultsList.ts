import { atom } from 'jotai';

interface ResultItem {
  title: string;
  description: string;
  document: string;
  page: number;
}

export const resultsListAtom = atom<ResultItem[]>([]);
