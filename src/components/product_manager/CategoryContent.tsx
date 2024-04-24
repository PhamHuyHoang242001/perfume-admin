import {
  Button,
  createStyles,
  Group,
  Modal,
  Pagination,
  Paper,
  rem,
  ScrollArea,
  Space,
  Table,
  Text,
  Title,
  UnstyledButton,
} from '@mantine/core';
import FunctionHeader from '../common/FunctionHeader';

import { CategoryType, productType } from '../../utils/utilsInterface';
import ProductForm from '../form/ProductForm';
import React, { useEffect, useState } from 'react';

import { useDisclosure } from '@mantine/hooks';
import { formatDay } from '../../utils/format';
import { DELETE } from '../../utils/fetch.ts';
import { apiRoute } from '../../utils/apiRoute.ts';

import ProductEditForm from '../form/ProductEditForm.tsx';
import useSWR from 'swr';

const fakedata = [
  { value: 'React', label: 'React' },
  { value: 'Angular', label: 'Angular' },
  { value: 'Svelte', label: 'Svelte' },
  { value: 'Vue', label: 'Vue' },
];

interface CategoryContentProps {
  category: CategoryType;
}
const useStyles = createStyles((theme) => ({
  header: {
    position: 'sticky',
    top: 0,
    backgroundColor:
      theme.colorScheme === 'dark' ? theme.colors.dark[7] : theme.white,
    transition: 'box-shadow 150ms ease',
    borderRadius: '1em',
    '&::after': {
      content: '""',
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === 'dark'
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },
  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));
const CategoryContent = ({ category }: CategoryContentProps) => {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = React.useState(false);
  const [state, setState] = useState({
    productID: 0,
    editModal: false,
    searchValue: '',
    filterData: [] as productType[],
    subCategory: [] as { value: string; label: string }[],
    deleteModal: false,
    deleteID: 0,
    urlData: `/api/product/filter?category=${category?.id}&page=1`,
    reversed: false,
    total: 0,
  });
  const {
    productID,
    editModal,
    filterData,
    subCategory,
    deleteModal,
    deleteID,
    urlData,
    reversed,
    total,
  } = state;
  const [opened, { open, close }] = useDisclosure(false);

  function openEditModal(id: number) {
    setState((p) => ({ ...p, productID: id, editModal: true }));
  }

  async function getProduct() {
    return await fetch(urlData).then((res) => res.json());
  }
  const { data, mutate } = useSWR(urlData, getProduct);

  const productData = data?.data?.results;

  // const changeProductStatus = async (id: number, v: string) => {
  //   await PUT(`/api/product/detail/${id}`, { status: v }).then(() =>
  //     mutate(`/api/product/filter?category=${category?.id}`),
  //   );
  // };

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/product/filter?category=${category?.id}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({
          ...p,
          compareData: data?.data?.results,
          total: data.data?.total,
        })),
      );
    return () => {
      controller.abort();
    };
  }, [category?.id]);

  useEffect(() => {
    const controller = new AbortController();

    fetch(`/api/subcategory/list/${category?.id}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({
          ...p,
          subCategory: [...data].map((item: { name: string }) => ({
            value: item.name,
            label: item.name,
          })),
        })),
      );
    return () => {
      controller.abort();
    };
  }, [category?.id]);
  const subCategoryData = [{ value: 'all', label: 'Totalité' }, ...subCategory];
  useEffect(() => {
    setState((p) => ({ ...p, filterData: productData }));
  }, [productData]);

  return (
    <div>
      <Title c="#B82C67" order={1} mb={4}>
        Chef de produit
      </Title>
      {productData && productData.length !== 0 ? (
        <FunctionHeader
          title={`Totalité produit (${productData?.length})`}
          onCreateNew={open}
          onSelectCategories={function (v) {
            if (v === 'all') {
              setState((p) => ({ ...p, filterData: productData }));
            } else {
              setState((p) => ({
                ...p,

                filterData: productData.filter((item: productType) =>
                  item.subcategory?.name
                    ?.toLowerCase()
                    .includes(v?.toLowerCase()),
                ),
              }));
            }
          }}
          onSelectStatus={function (v): void {
            if (v === 'all') {
              setState((p) => ({ ...p, filterData: productData }));
            } else {
              setState((p) => ({
                ...p,

                filterData: productData.filter(
                  (item: productType) =>
                    item.status?.toLowerCase() === v?.toLowerCase(),
                ),
              }));
            }
          }}
          onSearch={function (e) {
            setState((p) => ({
              ...p,

              filterData: productData.filter((item: productType) =>
                item.name
                  ?.toLowerCase()
                  .trim()
                  .includes(e.target.value?.toLowerCase().trim()),
              ),
            }));
          }}
          categoriesData={subCategory ? subCategoryData : fakedata}
        />
      ) : (
        'Empty'
      )}
      <div>
        <ScrollArea
          h={500}
          onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
          mt={'3rem'}
        >
          <Paper shadow="md" radius="md" sx={{ border: '1px solid #B82C67' }}>
            <Table sx={{ borderRadius: '0.65em', overflow: 'hidden' }}>
              <thead
                className={cx(classes.header, { [classes.scrolled]: scrolled })}
              >
                <tr
                  style={{
                    textAlign: 'center',
                    color: '#B82C67',
                    backgroundColor: '#FFE2EC',
                    height: '60px',
                    fontWeight: 600,
                  }}
                >
                  <td>Image</td>
                  <td>
                    <UnstyledButton
                      onClick={() => {
                        setState((p) => ({
                          ...p,
                          reversed: !reversed,
                          filterData: [...filterData].sort((a, b) => {
                            if (reversed) {
                              return b['name'].localeCompare(a['name']);
                            }
                            return a['name'].localeCompare(b['name']);
                          }),
                        }));
                      }}
                    >
                      <span style={{ color: '#B82C67', fontWeight: 600 }}>
                        Nom du produit
                      </span>{' '}
                      <img src={'/sort.svg'} alt={'icon'} />
                    </UnstyledButton>
                  </td>
                  <td>Code-produit</td>
                  <td>Entrepôt</td>
                  <td>
                    <UnstyledButton
                      onClick={() =>
                        setState((p) => ({
                          ...p,
                          reversed: !reversed,
                          filterData: [...filterData].sort((a, b) => {
                            if (reversed) {
                              return b['price'] - a['price'];
                            }
                            return a['price'] - b['price'];
                          }),
                        }))
                      }
                    >
                      <span style={{ color: '#B82C67', fontWeight: 600 }}>
                        Prix/unité
                      </span>{' '}
                      <img src={'/sort.svg'} alt={'icon'} />
                    </UnstyledButton>
                  </td>
                  <td>
                    <UnstyledButton
                      onClick={() =>
                        setState((p) => ({
                          ...p,
                          reversed: !reversed,
                          filterData: [...filterData].sort((a, b) => {
                            if (reversed) {
                              return b['weight'] - a['weight'];
                            }
                            return a['weight'] - b['weight'];
                          }),
                        }))
                      }
                    >
                      <span style={{ color: '#B82C67', fontWeight: 600 }}>
                        Poids/unité
                      </span>{' '}
                      <img src={'/sort.svg'} alt={'icon'} />
                    </UnstyledButton>
                  </td>
                  <td>Catégories</td>
                  <td>
                    <UnstyledButton
                      onClick={() =>
                        setState((p) => ({
                          ...p,
                          reversed: !reversed,
                          filterData: [...filterData].sort((a, b) => {
                            if (reversed) {
                              return (
                                Date.parse(b['created_time']) -
                                Date.parse(a['created_time'])
                              );
                            }
                            return (
                              Date.parse(a['created_time']) -
                              Date.parse(b['created_time'])
                            );
                          }),
                        }))
                      }
                    >
                      <span style={{ color: '#B82C67', fontWeight: 600 }}>
                        Date de creation du produit
                      </span>{' '}
                      <img src={'/sort.svg'} alt={'icon'} />
                    </UnstyledButton>
                  </td>
                  <td>Statut</td>
                  <td>Modifier</td>
                  <td>Supprimer</td>
                </tr>
              </thead>
              <tbody>
                {filterData !== null &&
                  filterData?.map((item: productType) => (
                    <tr
                      key={item.id}
                      style={{ textAlign: 'center', height: '60px' }}
                      className={'hover_table'}
                    >
                      <td>
                        <img
                          src={item.url_image}
                          width="52px"
                          height="36px"
                          alt="image"
                          loading="lazy"
                        />
                      </td>
                      <td>{item.name}</td>
                      <td>
                        {item.name.slice(0, 3)}-{item.id}
                      </td>
                      <td>{item.amount}</td>
                      <td>€{item.price}</td>
                      <td>{item.weight}g</td>
                      <td>{item.subcategory?.name}</td>
                      <td>{formatDay(item.created_time)}</td>
                      <td style={{ textTransform: 'capitalize' }}>
                        <span
                          style={{
                            background:
                              item.status?.toLowerCase() === 'inactive'
                                ? '#FFC978'
                                : item.status?.toLowerCase() === 'active'
                                ? '#87FF74'
                                : '#FF9090',
                            textAlign: 'center',
                            textTransform: 'capitalize',
                            padding: '0.1875rem 0.75rem',
                            border: '1px solid #333',
                            borderRadius: '5px',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                          }}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td>
                        <UnstyledButton onClick={() => openEditModal(item.id)}>
                          <img src="/pen.svg" alt="icon" />
                        </UnstyledButton>
                      </td>
                      <td>
                        <UnstyledButton
                          onClick={function () {
                            setState((p) => ({
                              ...p,
                              deleteModal: true,
                              deleteID: item.id,
                            }));
                          }}
                        >
                          <img src="/delete_btn.svg" alt="icon" />
                        </UnstyledButton>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Paper>
        </ScrollArea>
          <Space h="md" />
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination
              total={total}
              onChange={(v) =>
                setState((p) => ({
                  ...p,
                  urlData: `/api/product/filter?category=${category?.id}&page=${v}`,
                }))
              }
            />
          </div>
      </div>
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
                mutate(`/api/product/filter?category=${category?.id}`).then(
                  () => close(),
                );

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
            <ProductEditForm
              id={productID}
              onSuccess={() => {
                mutate(`/api/product/filter?category=${category?.id}`).then(
                  () => setState((p) => ({ ...p, editModal: false })),
                );
              }}
            />
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
            Vous voulez absolument supprimer ce produit?
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
                        (filterItem: productType) => filterItem.id !== deleteID,
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
  );
};

export default CategoryContent;
