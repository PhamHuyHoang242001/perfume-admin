import { Tabs, Title } from '@mantine/core';
import { useListState } from '@mantine/hooks';
import { useEffect, useMemo, useState } from 'react';
import CategoryTable from '../components/category/CategoryTable';
import HeaderCategory from '../components/category/HeaderCategory';
import { apiRoute } from '../utils/apiRoute';
import { GET, POST } from '../utils/fetch';
import { CategoryType, itemSelectType } from '../utils/utilsInterface';

const listOption = [
  {
    value: 'category',
    label: 'Category',
  },
  {
    value: 'subcategory',
    label: 'Sub-category',
  },
  {
    value: 'sub-subcategory',
    label: 'Sub-sub-category',
  },
];

const CategoryPage = () => {
  const [categorySelected, setCategorySelected] = useState<string | null>('0');
  const [subCategorySelected, setSubCategorySelected] = useState<string | null>(
    null,
  );
  const [status, setStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [optionSelected, setOptionSelected] = useState<string | any>(
    listOption[0]?.value,
  );
  const [state, handlers] = useListState<CategoryType>([]);

  let listCategory = useMemo(() => {
    return (
      state?.map((item) => ({
        value: item.id,
        label: item.name,
        ...item,
      })) || []
    );
  }, [state]);

  let listSubCategory = useMemo(() => {
    return (
      listCategory
        ?.find((item) => categorySelected && item.id === +categorySelected)
        ?.subcategories?.map((item) => ({
          value: item.id,
          label: item.name,
          ...item,
        })) || []
    );
  }, [categorySelected]);

  async function createCategory(v: CategoryType) {
    try {
      return await POST(apiRoute.create_category, v);
    } catch (error) {
      alert(error);
    }
  }
  async function createSubcategory(v: CategoryType) {
    try {
      return await POST('/api/subcategory/create', v);
    } catch (error) {
      alert(error);
    }
  }

  const getCategory = async (value?: string) => {
    setIsLoading(true);
    try {
      const url =
        value === 'sub-subcategory'
          ? apiRoute.list_sub_subcategory
          : value === 'subcategory'
          ? apiRoute.list_subcategory
          : apiRoute.list_category;

      const res = await GET(url);
      if (res.status === 200) {
        setCategorySelected(res.data?.results?.[0]?.id?.toString());
        handlers.setState(res.data?.results);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleChange = (type: 'category' | 'sub', value: string) => {
    switch (type) {
      case 'category':
        if (value !== categorySelected) {
          setCategorySelected(value);
          listSubCategory = [];
          setSubCategorySelected(null);
        }
        break;
      case 'sub':
        if (value !== subCategorySelected) {
          setSubCategorySelected(value);
        }
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    getCategory();
  }, []);

  return (
    <div
      style={{
        maxWidth: 1440,
        margin: 'auto',
        justifyContent: 'space-evenly',
      }}
    >
      <Tabs
        value={optionSelected}
        onTabChange={(tab: string) => {
          setOptionSelected(tab);
          setCategorySelected(null);
          setSubCategorySelected(null);
          listSubCategory = [];
          getCategory(tab);
        }}
        w={600}
      >
        <Tabs.List grow>
          {listOption?.map((item: itemSelectType) => (
            <Tabs.Tab key={item.value} value={item.value}>
              <Title
                c={'pink'}
                order={4}
                style={{
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {item.label}
              </Title>
            </Tabs.Tab>
          ))}
        </Tabs.List>
      </Tabs>

      <HeaderCategory
        optionSelected={optionSelected}
        categorySelected={categorySelected}
        subCategorySelected={subCategorySelected}
        handleChange={handleChange}
        listSubCategory={listSubCategory as any}
        listCategory={listCategory as any}
      />

      {isLoading ? (
        <div
          style={{
            paddingTop: 150,
            textAlign: 'center',
          }}
        >
          <span className="loader" />
        </div>
      ) : (
        <CategoryTable
          categoryData={state}
          handlers={handlers}
          optionSelected={optionSelected}
        />
      )}
    </div>
  );
};

export default CategoryPage;
