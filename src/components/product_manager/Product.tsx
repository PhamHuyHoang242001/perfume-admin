import { Tabs, Title } from '@mantine/core';

import { CategoryType } from '../../utils/utilsInterface';
import CategoryContent from './CategoryContent';
import useData from '../../hooks/useData';
const { List, Panel, Tab } = Tabs;
const Product = () => {
  const { categories } = useData('/api/category/create');

  return categories != null ? (
    <Tabs defaultValue={categories?.[0]?.slug}>
      <div style={{ padding: '0 30px' }}>
        <List grow>
          {categories?.map((item: CategoryType) => (
            <Tab value={item?.slug || ''} key={item.id}>
              <Title c={'pink'} order={4}>
                {item?.name}
              </Title>
            </Tab>
          ))}
        </List>
      </div>
      <div style={{ marginTop: '2rem', padding: '0 80px' }}>
        {categories?.map((item: CategoryType) => (
          <Panel value={item?.slug || ''} key={item.id}>
            <CategoryContent category={item} />
          </Panel>
        ))}
      </div>
    </Tabs>
  ) : (
    <></>
  );
};

export default Product;
