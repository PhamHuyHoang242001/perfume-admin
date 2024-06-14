import {
  Box,
  Button,
  Group,
  Radio,
  Select,
  Stack,
  TextInput,
  Title,
} from '@mantine/core';

import { useForm } from '@mantine/form';
import { voucherType } from '../../utils/utilsInterface';
import useSWR from 'swr';
import { useEffect, useState } from 'react';
import { PUT } from '../../utils/fetch';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import _ from 'lodash';
type voucherFormprops = {
  onSuccess: () => void;
  id: number;
};
const statusData = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expire', label: 'Expirer' },
];
const VoucherEditForm = ({ onSuccess, id }: voucherFormprops) => {
  const [state, setState] = useState({
    subCategory: [],
    product: [],
    defaultCategoryName: '',
    defaultSubCategoryName: '',
    // data: {} as voucherType,
    isShip: false,
  });
  const {
    subCategory,
    product,
    defaultCategoryName,

    defaultSubCategoryName,
  } = state;
  async function getVoucherData() {
    return await fetch(`/api/voucher/update/${id}`).then((res) => res.json());
  }
  const { data, isLoading } = useSWR(
    `/api/voucher/update/${id}`,
    getVoucherData,
  );

  const startDate = dayjs(data?.start_date).toDate();
  const endDate = dayjs(data?.end_date).toDate();
  const form = useForm<voucherType>({
    initialValues: data,
    validate: {
      total: (v) => (v.toString().length >= 4 ? 'error' : null),
      discount: (v) => (v.toString().length >= 3 ? 'error' : null),
      name: (v) => (v.length > 100 ? 'error' : null),
    },
  });

  async function getCategory() {
    return await fetch('/api/category/list')
      .then((res) => res.json())
      .catch((e) => alert(e));
  }
  const category = useSWR('get-category', getCategory);

  const categoryData = category?.data?.map(
    (item: { name: string; id: number }) => ({
      value: item.id,
      label: item.name,
    }),
  );

  async function getSubCategory(id: number) {
    return await fetch(`/api/subcategory/list/${+id}`)
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({
          ...p,
          subCategory: data.map((item: { name: string; id: number }) => ({
            value: item.id,
            label: item.name,
          })),
        })),
      )
      .catch((e) => alert(e));
  }

  async function getProduct(id: number) {
    return fetch(`/api/product/filter?subcategory=${id}`)
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({
          ...p,
          product: data?.data?.results.map(
            (item: { name: string; id: number }) => ({
              value: item.id,
              label: item.name,
            }),
          ),
        })),
      )
      .catch((e) => alert(e));
  }

  console.log(data);
  async function editVoucher(v: voucherType) {
    try {
      const editData = _.omit(v, ['slug']);
      const shippingData = Object.assign(
        _.omit(data, [
          'category_id',
          'subcategory_id',
          'subsubcategory_id',
          'product_id',
          'category',
          'slug',
          'subcategory',
          'subsubcategory',
          'category',
          'last_code',
          'code_promo',
          'created_time',
          'modified_time',
          'available',
          'total',
          'active',
          'id',
        ]),
        _.omit(v, [
          'category_id',
          'subcategory_id',
          'subsubcategory_id',
          'product_id',
          'category',
          'slug',
          'subcategory',
          'subsubcategory',
          'category',
        ]),
      );

      const res = await PUT(
        `/api/voucher/update/${id}`,
        data?.discount_target?.toLowerCase() === 'shipping_fee'
          ? shippingData
          : editData,
      ).then((res) => res.json());
      if (res.message !== 'Data invalid') {
        onSuccess();
      } else {
        notifications.show({
          message: 'Oups! L’erreur système s’est produite',
          color: 'red',
        });
      }
    } catch (e) {
      notifications.show({
        message: 'Oups! L’erreur système s’est produite',
        icon: <img src={'/warning.svg'} alt={'icon'} />,
        withCloseButton: true,
        color: 'red',
      });
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/category/detail/${data?.category}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({ ...p, defaultCategoryName: data?.name })),
      );
    return () => controller.abort();
  }, [data?.category]);

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/subcategory/detail/${data?.subcategory}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({ ...p, defaultSubCategoryName: data?.name })),
      );
    return () => controller.abort();
  }, [data?.subcategory]);
  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/voucher/update/${id}`, { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => setState((p) => ({ ...p, data: data })));
    return () => controller.abort();
  }, [id]);

  if (isLoading) return 'loading';
  return (
    <Box px={'4rem'}>
      <form
        className={'voucher_form'}
        onSubmit={form.onSubmit((v) => editVoucher(v))}
      >
        <Stack spacing={'lg'}>
          <div>
            <Title order={4} c={'#707070'}>
              Nom du bon de réduction
            </Title>
            <TextInput
              w={' 23.6875rem'}
              h={'2.25rem'}
              defaultValue={data?.name}
              onChange={(e) => form.setFieldValue('name', e.target.value)}
            />
          </div>
          <div>
            <Title order={4} c={'#707070'}>
              Description
            </Title>
            <textarea
              style={{
                width: '41.3125rem',
                height: '12.25rem',
                resize: 'none',
                border: '1px solid #b82c67',
                borderRadius: '4px',
                padding: '5px 10px',
              }}
              defaultValue={data?.description}
              onChange={(e) =>
                form.setFieldValue('description', e.target.value)
              }
            />
          </div>
          <Title c={'#E7639A'} order={4}>
            Détail du bon
          </Title>
          <Group align="start">
            <div>
              <span style={{ color: '#858585', fontSize: '0.95rem' }}>
                Statut
              </span>

              <Select
                data={statusData}
                bg={'#FFE7EF'}
                w={'15.5rem'}
                h={'2.375rem'}
                variant="unstyled"
                sx={{ borderRadius: '4px' }}
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                {...form.getInputProps('status')}
                // placeholder={data?.status}
                defaultValue={data?.status.toLowerCase()}
                pl={'5px'}
              />
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <span style={{ color: '#7c7c7c', fontSize: '0.75rem' }}>
                Quantité
              </span>
              <br />
              <TextInput
                w={'6.375rem'}
                h={'2.25rem'}
                type={'number'}
                min={0}
                defaultValue={data?.total}
                onChange={(e) => form.setFieldValue('total', +e.target.value)}
              />
            </div>
          </Group>
          <div>
            <Group>
              <div>
                <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                  Date de début
                </span>
                <DateInput
                  rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                  w={'15.5rem'}
                  h={'2.25rem'}
                  variant="unstyled"
                  bg={'#FFE7EF'}
                  pl={'10px'}
                  sx={{ borderRadius: '4px' }}
                  defaultValue={startDate}
                  // {...form.getInputProps('start_date')}
                  onChange={(e) => form.setFieldValue('start_date', e)}
                />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                  Date de fin
                </span>
                <DateInput
                  defaultValue={endDate}
                  rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                  w={'15.5rem'}
                  h={'2.25rem'}
                  variant="unstyled"
                  bg={'#FFE7EF'}
                  pl={'10px'}
                  sx={{ borderRadius: '4px' }}
                  onChange={(e) => form.setFieldValue('end_date', e)}
                />
              </div>
            </Group>
          </div>
          <Title order={4} c={'#E7639A'}>
            Bon de réduction s'applique à
          </Title>
          <Radio.Group
            {...form.getInputProps('discount_target')}
            defaultValue={data?.discount_target}
            required
          >
            <Group>
              <Radio
                value={'product'}
                label={<span style={{ color: '#E7639A' }}>Produit</span>}
                disabled={data?.discount_target === 'shipping_fee'}
                checked
              />
              <Radio
                checked={
                  data?.discount_target?.toLowerCase() === 'shipping_fee'
                }
                disabled={data?.discount_target === 'product'}
                value={'shipping_fee'}
                label={<span style={{ color: '#E7639A' }}>Livraison</span>}
              />
            </Group>
          </Radio.Group>
          <Group>
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Catégorie
              </span>
              {categoryData && (
                <Select
                  data={categoryData}
                  sx={{
                    width: '15.5rem',
                    height: '2.375rem',
                    borderRadius: '4px',
                  }}
                  rightSection={<img alt="icon" src="/down_arrow.svg" />}
                  onChange={(e: string) => {
                    getSubCategory(+e).then(() =>
                      form.setFieldValue('category_id', +e),
                    );
                  }}
                  placeholder={defaultCategoryName ? defaultCategoryName : ''}
                  disabled={
                    data?.discount_target?.toLowerCase() === 'shipping_fee'
                  }
                />
              )}
            </div>{' '}
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Sub-Catégorie
              </span>

              <Select
                data={subCategory}
                sx={{
                  width: '15.5rem',
                  height: '2.375rem',
                  borderRadius: '4px',
                }}
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                onChange={(e: string) => {
                  getProduct(+e).then(() =>
                    form.setFieldValue('subcategory_id', +e),
                  );
                }}
                placeholder={
                  defaultSubCategoryName ? defaultSubCategoryName : ''
                }
                disabled={
                  data?.discount_target?.toLowerCase() === 'shipping_fee'
                }
              />
            </div>{' '}
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Produits
              </span>
              <Select
                disabled={
                  data?.discount_target?.toLowerCase() === 'shipping_fee'
                }
                data={product}
                // variant={'unstyled'}
                sx={{
                  width: '15.5rem',
                  height: '2.375rem',
                  borderRadius: '4px',
                }}
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                {...form.getInputProps('product_id')}
                placeholder={data?.product}
              />
            </div>
          </Group>
          <Title order={4} c={'#E7639A'}>
            Bon de réduction
          </Title>
          <Group>
            <Select
              data={[
                { value: 'percentage', label: '%Rabias' },
                { value: 'value', label: 'Valuer' },
              ]}
              w={'9.125rem'}
              h={'2.25rem'}
              {...form.getInputProps('discount_type')}
              placeholder={data?.discount_type}
              required={true}
              rightSection={<img src="/down_arrow.svg" alt="icon" />}
            />

            <TextInput
              w={53}
              defaultValue={data?.discount}
              type={'number'}
              min={0}
              onChange={(e) => form.setFieldValue('discount', +e.target.value)}
            />
            <span>%</span>
          </Group>
        </Stack>
        <Button
          type="submit"
          c={'#fff'}
          leftIcon={<img src="/tick.svg" alt="icon" />}
          w={'7.875rem'}
          h={'2.5rem'}
          sx={{ float: 'right' }}
          bg={'#B82C67'}
          radius={'md'}
        >
          <span style={{ fontSize: '1rem' }}>Done</span>
        </Button>
        <div style={{ height: '60px' }}></div>
      </form>
    </Box>
  );
};

export default VoucherEditForm;
