import { Tabs, Title } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useEffect, useState } from 'react';
import CategoryTable from '../components/category/CategoryTable';
import HeaderCategory from '../components/category/HeaderCategory';
import ModalContent from '../components/category/ModalContent';
import { apiRoute } from '../utils/apiRoute';
import { GET } from '../utils/fetch';
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

export type ModalType = 'ADD' | 'EDIT' | 'DELETE';

const CategoryPage = () => {
  const [categorySelected, setCategorySelected] = useState<string[] | []>([]);
  const [subCategorySelected, setSubCategorySelected] = useState<string[] | []>(
    [],
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [listCategory, setListCategory] = useState<itemSelectType | []>([]);
  const [listSubCategory, setListSubCategory] = useState<itemSelectType | []>(
    [],
  );
  const [searchValue, setSearchValue] = useState<string>('');
  const [optionSelected, setOptionSelected] = useState<string | any>(
    listOption[0]?.value,
  );
  const [categoryData, setCategoryData] = useState<CategoryType[] | []>([]);
  const [typeModal, setTypeModal] = useState<ModalType | null>('ADD');

  const [opened, { open, close }] = useDisclosure(false);

  console.log('opened :>> ', opened);

  const getListData = async (
    value?: string,
    option?: {
      category: string[];
      subcategory: string[];
      search: string;
    },
    refreshSearch?: boolean,
  ) => {
    setIsLoading(true);
    try {
      const url =
        value === 'sub-subcategory'
          ? apiRoute.list_sub_subcategory
          : value === 'subcategory'
          ? apiRoute.list_subcategory
          : apiRoute.list_category;

      const queryParams = {
        page_size: 1000,
        ...((categorySelected || option?.category) && {
          category_id: option?.category ? option?.category : categorySelected,
        }),
        ...((subCategorySelected || option?.subcategory) && {
          subcategory_id: option?.subcategory
            ? option?.subcategory
            : subCategorySelected,
        }),
        ...((searchValue || option?.search) && {
          search: refreshSearch
            ? ''
            : option?.search
            ? option?.search
            : searchValue,
        }),
      };

      const queryString = new URLSearchParams(queryParams as any).toString();

      const res = await GET(url + '?' + queryString);
      if (res.status === 200) {
        setCategoryData(res.data?.results);
      }

      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const getListOptions = async () => {
    if (optionSelected === 'category') return;

    try {
      const url =
        optionSelected === 'subcategory'
          ? apiRoute.list_category
          : apiRoute.list_subcategory;

      const res = await GET(url);
      const newData = res.data?.results?.map((item: any) => ({
        label: item?.name,
        value: item?.id,
      }));

      if (newData?.length > 0)
        if (optionSelected === 'subcategory') {
          setListCategory(newData);
        } else {
          setListSubCategory(newData);
        }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const handleChange = (type: 'category' | 'sub', value: string[]) => {
    if (type === 'category') {
      if (value !== categorySelected) {
        setCategorySelected(value);
        getListData(optionSelected, {
          category: value,
          subcategory:
            optionSelected === 'subcategory' ? [] : subCategorySelected,
          search: searchValue,
        });
      }
      return;
    }

    if (value !== subCategorySelected) {
      setSubCategorySelected(value);
      getListData('sub-subcategory', {
        category: categorySelected,
        subcategory: value,
        search: searchValue,
      });
    }
  };

  const handleSearch = () => {
    getListData();
  };

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (e.target.value === '') {
      getListData(
        '',
        {
          category: categorySelected,
          subcategory: subCategorySelected,
          search: '',
        },
        true,
      );
    }
  };

  const handleOpenModal = (type: ModalType, value?: string | number | null) => {
    console.log('value :>> ', value);
    setTypeModal(type);
    open();
  };

  useEffect(() => {
    getListData();
  }, []);

  useEffect(() => {
    getListOptions();
  }, [optionSelected]);

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
          setCategorySelected([]);
          setSubCategorySelected([]);
          setListSubCategory([]);
          getListData(tab, {
            category: [],
            subcategory: [],
            search: '',
          });
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
        onSearch={onSearchChange}
        handleSearch={handleSearch}
        searchValue={searchValue}
        handleOpenModal={handleOpenModal}
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
          categoryData={categoryData}
          optionSelected={optionSelected}
          handleOpenModal={handleOpenModal}
        />
      )}
      <ModalContent close={close} opened={opened} typeModal={typeModal} />
    </div>
  );
};

export default CategoryPage;
