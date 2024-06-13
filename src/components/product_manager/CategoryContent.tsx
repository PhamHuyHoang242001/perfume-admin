import { Button, Group, Modal, Paper, Tabs, Text, Title } from '@mantine/core';
import FunctionHeader from '../common/FunctionHeader';

import { useEffect, useMemo, useState } from 'react';
import { CategoryType, productType } from '../../utils/utilsInterface';
import ProductForm from '../form/ProductForm';

import { useDisclosure } from '@mantine/hooks';
import { apiRoute } from '../../utils/apiRoute.ts';
import { DELETE, GET } from '../../utils/fetch.ts';

import ProductEditForm from '../form/ProductEditForm.tsx';
import CategoryTable from './CategoryTable.tsx';

const { List, Tab } = Tabs;

interface CategoryContentProps {
  listCategory: CategoryType[];
}

const CategoryContent = ({ listCategory }: CategoryContentProps) => {
  const [state, setState] = useState({
    productID: 0,
    editModal: false,
    searchValue: '',
    filterData: [] as productType[],
    deleteModal: false,
    deleteID: 0,
    reversed: false,
    total: 0,
  });
  const { productID, editModal, filterData, deleteModal, deleteID, total } =
    state;
  const [opened, { open, close }] = useDisclosure(false);

  const [search, setSearch] = useState('');

  const [categorySelected, setCategorySelected] = useState<any>(
    listCategory?.[0]?.id,
  );
  const [subCategorySelected, setSubCategorySelected] = useState<any>(null);
  const [subSubCategorySelected, setSubSubCategorySelected] =
    useState<any>(null);
  const [productData, setProductData] = useState<productType[] | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const getProduct = async (value?: any) => {
    const queryParams = {
      ...(value?.category && {
        category_ids: value?.category ? value?.category : categorySelected,
      }),
      ...(search && { search: search }),
      ...(value?.subCategory && {
        subcategory_ids: value?.subCategory,
      }),
      ...(value?.subSubCategory && {
        sub_subcategory_ids: value?.subSubCategory,
      }),
    };
    const queryString = new URLSearchParams(queryParams as any).toString();
    const url = 'api/admin/product/' + `?${queryString}`;

    if (isLoading) return;
    setIsLoading(true);

    try {
      const res = await GET(url);

      if (res.status === 200) {
        setProductData(res.data?.results);
      }
      setIsLoading(false);
    } catch (error) {
      console.log('error :>> ', error);
      setIsLoading(false);
    }
  };

  function openEditModal(id: number) {
    setState((p) => ({ ...p, productID: id, editModal: true }));
  }

  const subCategory = useMemo(() => {
    if (listCategory && listCategory?.length > 0) {
      const list = listCategory?.find(
        (item: any) => +item?.id === +categorySelected,
      ) as any;

      return (
        list?.subcategories.map((item: any) => ({
          value: item.id,
          label: item.name,
          ...item,
        })) || []
      );
    }
    return [];
  }, [categorySelected]) as any;

  const subSubCategory = useMemo(() => {
    if (subCategory && subCategory?.length > 0) {
      const list = subCategory?.find(
        (item: any) =>
          subCategorySelected && item?.value === +subCategorySelected,
      ) as any;

      return (
        list?.sub_subcategories.map((item: any) => ({
          value: item.id,
          label: item.name,
        })) || []
      );
    }
    return [];
  }, [subCategory, categorySelected, subCategorySelected]) as any;

  useEffect(() => {
    getProduct();
  }, []);

  return (
    <div>
      <div style={{ padding: '0 30px' }}>
        <List grow>
          {listCategory?.map((item: CategoryType) => (
            <Tab
              value={item?.id?.toString() || ''}
              key={item.id}
              defaultValue={categorySelected}
            >
              <Title
                c={'pink'}
                order={4}
                onClick={() => {
                  setCategorySelected(item?.id);
                  getProduct({
                    category: item?.id,
                    subCategory: null,
                    subSubCategory: null,
                  });
                  if (subCategorySelected) setSubCategorySelected(null);
                  if (subSubCategorySelected) setSubSubCategorySelected(null);
                }}
                style={{
                  width: '100%',
                  display: 'block',
                  textAlign: 'center',
                }}
              >
                {item?.name}
              </Title>
            </Tab>
          ))}
        </List>
      </div>
      <div style={{ marginTop: '2rem', padding: '0 80px' }}>
        <Title c="#B82C67" order={1} mb={4}>
          Product management
        </Title>

        <FunctionHeader
          title=""
          onCreateNew={open}
          onSelectSubCategories={(v) => {
            setSubCategorySelected(v);
            setSubSubCategorySelected(null);
            getProduct({
              category: categorySelected,
              subCategory: v,
              subSubCategory: null,
            });
          }}
          subCategorySelected={subCategorySelected}
          subSubCategorySelected={subSubCategorySelected}
          onSelectSubSubCategories={(v) => {
            setSubSubCategorySelected(v);
            getProduct({
              category: categorySelected,
              subCategory: subCategorySelected,
              subSubCategory: v,
            });
          }}
          onSelectStatus={function (v): void {}}
          onSearch={function (e) {
            setSearch(e.target.value?.trim());
          }}
          subCategory={subCategory}
          subSubCategory={subSubCategory}
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
            openEditModal={openEditModal}
            productData={productData}
            total={total}
            setState={setState}
          />
        )}
        {/*create modal*/}
        <Modal.Root
          opened={opened}
          onClose={close}
          closeOnClickOutside={false}
          size={'auto'}
        >
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header>
              <Modal.Title>
                <Title c={'#B82C67'} order={1} mt={32} ml={64}>
                  Ajouter un nouveau produit
                </Title>
              </Modal.Title>
              <Modal.CloseButton>
                <img src={'/close.svg'} alt={'icon'} />
              </Modal.CloseButton>
            </Modal.Header>
            <Modal.Body>
              <ProductForm
                onSuccess={() => {
                  // window.location.reload()
                }}
              />
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
        {/*Edit modal*/}
        <Modal.Root
          opened={editModal}
          onClose={() => setState((p) => ({ ...p, editModal: false }))}
          closeOnClickOutside={false}
          size={'auto'}
        >
          <Modal.Overlay />
          <Modal.Content>
            <Modal.Header>
              <Modal.CloseButton>
                <img src={'/close.svg'} alt={'icon'} />
              </Modal.CloseButton>
            </Modal.Header>
            <Modal.Body>
              <ProductEditForm id={productID} onSuccess={() => {}} />
            </Modal.Body>
          </Modal.Content>
        </Modal.Root>
        {/*  Delete Modal*/}
        <Modal
          opened={deleteModal}
          onClose={close}
          withCloseButton={false}
          centered
          radius={'md'}
        >
          <Paper pt={'1rem'}>
            <Text align={'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
              Are you sure want to delete product?
            </Text>
            <Group sx={{ float: 'right' }} my={32}>
              <Button
                variant={'subtle'}
                onClick={() => setState((p) => ({ ...p, deleteModal: false }))}
              >
                <span style={{ color: '#333' }}>Anunuler</span>
              </Button>
              <Button
                onClick={async function () {
                  await DELETE(`${apiRoute.delete_product}/${deleteID}`)
                    .then(() =>
                      setState((p) => ({
                        ...p,

                        filterData: [...filterData].filter(
                          (filterItem: productType) =>
                            filterItem.id !== deleteID,
                        ),
                        deleteModal: false,
                      })),
                    )
                    .catch((e) => alert(e));
                }}
              >
                Effacer
              </Button>
            </Group>
          </Paper>
        </Modal>
      </div>
    </div>
  );
};

export default CategoryContent;
