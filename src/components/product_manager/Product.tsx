import { Tabs } from '@mantine/core';

import useData from '../../hooks/useData';
import CategoryContent from './CategoryContent';
const Product = () => {
  const { categories, loading } = useData('/api/category/list_tree');

  if (loading) return null;
  return (
    <Tabs defaultValue={categories?.[0]?.id?.toString()}>
      <CategoryContent listCategory={categories} />
    </Tabs>
  );
};

export default Product;
