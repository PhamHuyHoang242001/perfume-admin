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

import { DateInput } from '@mantine/dates';
import _ from 'lodash';
import { useForm } from '@mantine/form';
import { productType, voucherType } from '../../utils/utilsInterface';
import useSWR from 'swr';
import { useState } from 'react';
import { POST } from '../../utils/fetch';
import { apiRoute } from '../../utils/apiRoute';
import { notifications } from '@mantine/notifications';

type voucherFormprops = {
  onSuccess: () => void;
};
const VoucherCreateForm = ({ onSuccess }: voucherFormprops) => {
  const [state, setState] = useState({
    subCategory: [],
    product: [],
    singleProduct: {} as productType,
    start_date: '',
    isShip: false,
    isPercent: false,
  });
  const { subCategory, product, singleProduct, start_date, isShip, isPercent } =
    state;
  const form = useForm<voucherType>({
    initialValues: {
      category_id: 0,
      subcategory_id: 0,
      name: '',
      discount_type: '',
      discount: 0,
      start_date: '',
      end_date: '',
      active: true,
      description: '',
      total: 0,
      product_id: 0,
      discount_target: 'product',
      status: 'active',
      subsubcategory_id: 0,
    },
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
  const all = [{ value: '', label: 'All' }].concat(categoryData);
  console.log(all);
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
            (item: { name: string; id: number; subsubcategory: number }) => ({
              value: item.id,
              label: item.name,
              sub: item.subsubcategory,
            }),
          ),
          singleProduct: data?.data?.results[0],
        })),
      )
      .catch((e) => alert(e));
  }
  async function createVoucher(v: voucherType) {
    try {
      const res = await POST(
        apiRoute.create_voucher,
        isShip
          ? _.omit(v, [
              'category_id',
              'subcategory_id',
              'subsubcategory_id',
              'product_id',
            ])
          : v,
      ).then((res) => res.json());
      if (res.message !== 'Data not valid') {
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

  return (
    <Box px={'4rem'}>
      <form
        className={'voucher_form'}
        onSubmit={form.onSubmit((v) => createVoucher(v))}
      >
        <Stack spacing={'lg'}>
          <div>
            <Title order={4} c={'#707070'}>
              Nom du bon de réduction
            </Title>
            <TextInput
              w={' 23.6875rem'}
              h={'2.25rem'}
              {...form.getInputProps('name')}
              required
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
              required
              {...form.getInputProps('description')}
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
              <div
                style={{
                  width: '15.5rem',
                  height: '2.375rem',
                  borderRadius: '4px',
                  background: '#FFE7EF',
                  padding: '5px 10px',
                }}
              >
                <span>Active</span>
              </div>
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <span style={{ color: '#7c7c7c', fontSize: '0.75rem' }}>
                Quantité
              </span>
              <TextInput
                w={'6.375rem'}
                h={'2.25rem'}
                type={'number'}
                min={0}
                onKeyDown={(e) =>
                  e.key === '.' || e.key === 'e' ? e.preventDefault() : null
                }
                required
                onChange={(e) => form.setFieldValue('total', +e.target.value)}
                error={
                  Object.hasOwn(form.errors, 'total') ? 'invalid number' : null
                }
              />
            </div>
          </Group>
          <div>
            <div style={{ display: 'flex' }}>
              <div>
                <Group>
                  <div>
                    <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                      Date de début
                    </span>
                    <DateInput
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                      w={'15.5rem'}
                      // pt={'5px'}
                      h={'2.25rem'}
                      variant="unstyled"
                      bg={'#FFE7EF'}
                      pl={'10px'}
                      sx={{ borderRadius: '4px' }}
                      minDate={new Date()}
                      onChange={(e) => {
                        form.setFieldValue('start_date', e);
                        setState((p) => ({ ...p, start_date: String(e) }));
                      }}
                      required
                    />
                  </div>
                  <div style={{ marginLeft: '1rem' }}>
                    <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                      Date de fin
                    </span>
                    <DateInput
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                      w={'15.5rem'}
                      // pt={'5px'}
                      h={'2.25rem'}
                      variant="unstyled"
                      bg={'#FFE7EF'}
                      pl={'10px'}
                      sx={{ borderRadius: '4px' }}
                      {...form.getInputProps('end_date')}
                      disabled={start_date === ''}
                      minDate={new Date(start_date)}
                      required
                    />
                  </div>
                </Group>
              </div>
            </div>
          </div>
          <Title order={4} c={'#E7639A'}>
            Bon de réduction s'applique à
          </Title>
          <Radio.Group {...form.getInputProps('discount_target')} required>
            <Group>
              <Radio
                checked
                value={'product'}
                onClick={() => setState((p) => ({ ...p, isShip: false }))}
                label={<span style={{ color: '#E7639A' }}>Produit</span>}
              />
              <Radio
                value={'shipping_fee'}
                onClick={() => setState((p) => ({ ...p, isShip: true }))}
                label={<span style={{ color: '#E7639A' }}>Livraison</span>}
              />
            </Group>
          </Radio.Group>
          {!isShip && (
            <span style={{ color: '#D72525', fontSize: '0.725rem' }}>
              La valeur par défaut s’applique à tous les produits
            </span>
          )}
          <Group>
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Catégorie
              </span>
              {categoryData && (
                <Select
                  data={all}
                  sx={{
                    width: '15.5rem',
                    height: '2.375rem',
                    borderRadius: '4px',
                  }}
                  rightSection={<img alt="icon" src="/down_arrow.svg" />}
                  onChange={(e: string) => {
                    if (e === '') {
                      setState((p) => ({ ...p, isShip: true }));
                    } else {
                      getSubCategory(+e).then(() =>
                        form.setFieldValue('category_id', +e),
                      );
                    }
                  }}
                  disabled={isShip}
                  required
                />
              )}
            </div>{' '}
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Sub-Catégorie
              </span>
              <Select
                disabled={isShip}
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
                required
              />
            </div>{' '}
            <div>
              <span style={{ color: '#707070', fontSize: '0.75rem' }}>
                Produits
              </span>
              <Select
                disabled={isShip}
                data={product}
                // variant={'unstyled'}
                sx={{
                  width: '15.5rem',
                  height: '2.375rem',
                  borderRadius: '4px',
                }}
                onChange={(e: string) => {
                  form.setFieldValue('product_id', +e);
                  form.setFieldValue(
                    'subsubcategory_id',
                    singleProduct.subsubcategory,
                  );
                }}
                required
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
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
              onChange={(e: string) => {
                form.setFieldValue('discount_type', e);
                if (e === 'percentage') {
                  setState((p) => ({ ...p, isPercent: true }));
                } else {
                  setState((p) => ({ ...p, isPercent: false }));
                }
              }}
              required={true}
              rightSection={<img src="/down_arrow.svg" alt="icon" />}
              withAsterisk
            />

            <TextInput
              w={53}
              type={'number'}
              min={0}
              onChange={(e) => form.setFieldValue('discount', +e.target.value)}
              error={
                Object.hasOwn(form.errors, 'discount') ? 'invalid number' : ''
              }
              required
              onKeyDown={(e) =>
                e.key === '.' || e.key === 'e' ? e.preventDefault() : null
              }
            />
            {isPercent && <span>%</span>}
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

export default VoucherCreateForm;
