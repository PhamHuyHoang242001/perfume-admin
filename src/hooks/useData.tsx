import useSWR from 'swr';
import { CategoryType } from '../utils/utilsInterface';
const useData = (endPoint: string) => {
  const fetcher = () => fetch(endPoint).then((res) => res.json());
  const { data, error, isLoading } = useSWR(endPoint, fetcher);
  return {
    categories: data as CategoryType[],
    serverData: data,
    loading: isLoading,
    isError: error,
  };
};
export default useData;
