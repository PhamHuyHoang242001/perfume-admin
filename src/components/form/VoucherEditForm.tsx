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
import { PATCH, GET } from '../../utils/fetch';
import { notifications } from '@mantine/notifications';
import { DateInput } from '@mantine/dates';
import dayjs from 'dayjs';
import { useEffect, useState } from 'react';
type voucherFormprops = {
  onSuccess: () => void;
  id: number;
};
const statusData = [
  { value: 'true', label: 'Active' },
  { value: 'false', label: 'Inactive' },
];
const VoucherEditForm = ({ onSuccess, id }: voucherFormprops) => {
  const [state, setState] = useState({
    voucherData: {} as voucherType,
    start_date: '',
    end_date: '',
  });
  const { voucherData, start_date, end_date } = state;
  async function getVoucherData() {
    const res = await GET(`/api/admin/voucher/${id}`);

    setState((p) => ({
      ...p,
      voucherData: res?.data,
      start_date: res?.data.start_date,
      end_date: res?.data.end_date,
    }));
  }

  const form = useForm<voucherType>({
    initialValues: voucherData,
    validate: {
      // total: (v) => (v.toString().length >= 4 ? 'error' : null),
      discount: (v) => (v.toString().length >= 3 ? 'error' : null),
      name: (v) => (v.length > 100 ? 'error' : null),
    },
  });
  useEffect(() => {
    getVoucherData();
  }, []);
  useEffect(() => {
    form.setValues(voucherData);
  }, [voucherData]);
  async function editVoucher(v: voucherType) {
    try {
      const res = await PATCH(`/api/admin/voucher/${id}/patch/`, v);
      console.log(res);
      onSuccess();
    } catch (e) {
      notifications.show({
        message: 'Oups! L’erreur système s’est produite',
        icon: <img src={'/warning.svg'} alt={'icon'} />,
        withCloseButton: true,
        color: 'red',
      });
    }
  }
  console.log(form.values.discount_type);

  return (
    <Box px={'4rem'}>
      <form
        className={'voucher_form'}
        onSubmit={form.onSubmit((v) => editVoucher(v))}
      >
        <Stack spacing={'lg'}>
          <div>
            <Title c={'#858585'} size={12} sx={{ marginBottom: '8px' }}>
              Name of voucher *
            </Title>
            <TextInput
              w={' 23.6875rem'}
              h={'2.25rem'}
              defaultValue={form.values?.name}
              onChange={(e) => form.setFieldValue('name', e.target.value)}
              required
            />
          </div>
          <div>
            <Title
              order={4}
              c={'#858585'}
              size={12}
              sx={{ marginBottom: '8px' }}
            >
              Description *
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
              defaultValue={form.values?.description}
              onChange={(e) =>
                form.setFieldValue('description', e.target.value)
              }
              required
            />
          </div>
          <Title c={'#E7639A'} order={5}>
            Voucher details
          </Title>
          <Group align="start">
            <div>
              <span
                style={{
                  color: '#858585',
                  fontSize: '12px',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                Status
              </span>

              <Select
                data={statusData}
                bg={'#FFE7EF'}
                w={'15.5rem'}
                h={'2.375rem'}
                variant="unstyled"
                sx={{
                  borderRadius: '4px',
                  background: '#FFE7EF',
                  padding: '0px 10px',
                }}
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                onChange={(e: string) => {
                  form.setFieldValue('active', e === 'true');
                }}
                value={String(form.values.active)}
                pl={'5px'}
              />
            </div>
            <div style={{ marginLeft: '1rem' }}>
              <span
                style={{
                  color: '#7c7c7c',
                  fontSize: '12px',
                  marginBottom: '8px',
                  fontWeight: '500',
                }}
              >
                Quantity *
              </span>
              <br />
              <TextInput
                w={'6.375rem'}
                h={'2.25rem'}
                type={'number'}
                min={0}
                maxLength={9}
                // defaultValue={voucherData?.total}
                // onChange={(e) => form.setFieldValue('total', +e.target.value)}
                sx={{
                  resize: 'none',
                  border: '1px solid #b82c67',
                  borderRadius: '4px',
                  padding: '0px 10px',
                }}
                variant={'unstyled'}
                // required
              />
            </div>
          </Group>
          <div>
            <Group>
              <div>
                <span
                  style={{
                    color: '#707070',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  Start date
                </span>
                <DateInput
                  rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                  w={'15.5rem'}
                  h={'2.25rem'}
                  variant="unstyled"
                  bg={'#FFE7EF'}
                  pl={'10px'}
                  sx={{ borderRadius: '4px' }}
                  value={dayjs(form.values?.start_date).toDate()}
                  // {...form.getInputProps('start_date')}
                  onChange={(e) => {
                    form.setFieldValue(
                      'start_date',
                      dayjs(e).format('YYYY-MM-DD'),
                    );
                    setState((p) => ({ ...p, start_date: String(e) }));
                  }}
                  minDate={new Date()}
                  maxDate={end_date ? new Date(end_date) : undefined}
                />
              </div>
              <div style={{ marginLeft: '1rem' }}>
                <span
                  style={{
                    color: '#707070',
                    fontSize: '12px',
                    marginBottom: '8px',
                  }}
                >
                  End date
                </span>
                <DateInput
                  value={dayjs(form.values?.end_date).toDate()}
                  rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                  w={'15.5rem'}
                  h={'2.25rem'}
                  variant="unstyled"
                  bg={'#FFE7EF'}
                  pl={'10px'}
                  sx={{ borderRadius: '4px' }}
                  onChange={(e) => {
                    form.setFieldValue(
                      'end_date',
                      dayjs(e).format('YYYY-MM-DD'),
                    );
                    setState((p) => ({ ...p, end_date: String(e) }));
                  }}
                  minDate={start_date ? new Date(start_date) : new Date()}
                />
              </div>
            </Group>
          </div>
          <Title order={5} c={'#E7639A'}>
            Apply to
          </Title>
          <Radio.Group
            {...form.getInputProps('discount_target')}
            // defaultValue={data?.discount_target}
            required
          >
            <Group>
              <Radio
                // value={'product'}
                label={<span style={{ color: '#E7639A' }}>Produit</span>}
                // disabled={data?.discount_target === 'shipping_fee'}
                checked
              />
              <Radio
                // checked={
                //   data?.discount_target?.toLowerCase() === 'shipping_fee'
                // }
                // disabled={data?.discount_target === 'product'}
                value={'shipping_fee'}
                label={
                  <span style={{ color: '#E7639A', fontSize: '12px' }}>
                    Delivery
                  </span>
                }
              />
            </Group>
          </Radio.Group>

          <Title order={5} c={'#E7639A'}>
            Type of discount
          </Title>
          <Group>
            <Select
              data={[
                { value: '1', label: '% Discount' },
                { value: '3', label: '$ Value' },
              ]}
              w={'9.125rem'}
              h={'2.25rem'}
              onChange={(e) => {
                form.setFieldValue('discount_type', String(e));
              }}
              value={String(form.values.discount_type)}
              required={true}
              rightSection={<img src="/down_arrow.svg" alt="icon" />}
              sx={{
                resize: 'none',
                border: '1px solid #b82c67',
                borderRadius: '4px',
                padding: '0px 10px',
              }}
              variant={'unstyled'}
            />

            <TextInput
              w={53}
              defaultValue={voucherData?.discount}
              type={'number'}
              min={0}
              maxLength={8}
              onChange={(e) => form.setFieldValue('discount', +e.target.value)}
            />
            <span>{form.values.discount_type === '1' ? '%' : '$'}</span>
          </Group>
        </Stack>
        <Button
          type="submit"
          c={'#fff'}
          w={'7.875rem'}
          h={'2.5rem'}
          sx={{ float: 'right' }}
          bg={'#B82C67'}
          radius={'md'}
        >
          <span style={{ fontSize: '16px' }}>Confirmer</span>
        </Button>
        <div style={{ height: '60px' }}></div>
      </form>
    </Box>
  );
};

export default VoucherEditForm;
