import useSWR from 'swr';
import { GET } from '../utils/fetch';
import { CategoryType } from '../utils/utilsInterface';
const useData = (endPoint: string) => {
  const fetcher = () => GET(endPoint).then((res) => res.data);
  const { data, error, isLoading } = useSWR(endPoint, fetcher);
  return {
    categories: data as CategoryType[],
    serverData: data,
    loading: isLoading,
    isError: error,
  };
};
export default useData;
