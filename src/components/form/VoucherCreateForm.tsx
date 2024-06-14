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
import { voucherType } from '../../utils/utilsInterface';
import { useState } from 'react';
import { POST } from '../../utils/fetch';
import { notifications } from '@mantine/notifications';
import dayjs from 'dayjs';

type voucherFormprops = {
  onSuccess: () => void;
};
const VoucherCreateForm = ({ onSuccess }: voucherFormprops) => {
  const [state, setState] = useState({
    start_date: '',
    isPercent: true,
    end_date: '',
  });
  const { start_date, end_date, isPercent } = state;
  const form = useForm<voucherType>({
    initialValues: {
      name: '',
      discount_type: '1',
      discount: 0,
      start_date: '',
      end_date: '',
      active: true,
      description: '',
      // total: 0,
    },
    validate: {
      // total: (v) => (v.toString().length >= 4 ? 'error' : null),
      discount: (v) => (v.toString().length >= 3 ? 'error' : null),
      name: (v) => (v.length > 100 ? 'error' : null),
    },
  });

  async function createVoucher(v: voucherType) {
    try {
      const res = await POST('/api/admin/voucher/create/', v);
      console.log(res);
      onSuccess();
      // if (res.message !== 'Data not valid') {
      //   onSuccess();
      // } else {
      //   notifications.show({
      //     message: 'Oups! L’erreur système s’est produite',
      //     color: 'red',
      //   });
      // }
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
            <Title c={'#858585'} size={12} sx={{ marginBottom: '8px' }}>
              Name of voucher *
            </Title>
            <TextInput
              w={' 23.6875rem'}
              h={'2.25rem'}
              {...form.getInputProps('name')}
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
              required
              {...form.getInputProps('description')}
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
                data={[
                  { value: 'true', label: 'Active' },
                  { value: 'false', label: 'Inactive' },
                ]}
                w={'15.5rem'}
                h={'2.375rem'}
                onChange={(e: string) => {
                  form.setFieldValue('active', e === 'true');
                }}
                value={String(form.values.active)}
                required={true}
                rightSection={<img src="/down_arrow.svg" alt="icon" />}
                withAsterisk
                sx={{
                  borderRadius: '4px',
                  background: '#FFE7EF',
                  padding: '0px 10px',
                }}
                variant={'unstyled'}
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
              <TextInput
                w={'6.375rem'}
                h={'2.25rem'}
                type={'number'}
                min={0}
                sx={{
                  resize: 'none',
                  border: '1px solid #b82c67',
                  borderRadius: '4px',
                  padding: '0px 10px',
                }}
                variant={'unstyled'}
                onKeyDown={(e) =>
                  e.key === '.' || e.key === 'e' ? e.preventDefault() : null
                }
                required
                // onChange={(e) => form.setFieldValue('total', +e.target.value)}
                // error={
                //   Object.hasOwn(form.errors, 'total') ? 'invalid number' : null
                // }
              />
            </div>
          </Group>
          <div>
            <div style={{ display: 'flex' }}>
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
                      // pt={'5px'}
                      h={'2.25rem'}
                      variant="unstyled"
                      bg={'#FFE7EF'}
                      pl={'10px'}
                      sx={{ borderRadius: '4px' }}
                      minDate={new Date()}
                      maxDate={end_date ? new Date(end_date) : undefined}
                      onChange={(e) => {
                        form.setFieldValue(
                          'start_date',
                          dayjs(e).format('YYYY-MM-DD'),
                        );
                        setState((p) => ({ ...p, start_date: String(e) }));
                      }}
                      required
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
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                      w={'15.5rem'}
                      // pt={'5px'}
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
                      disabled={start_date === ''}
                      minDate={new Date(start_date)}
                      required
                    />
                  </div>
                </Group>
              </div>
            </div>
          </div>
          <Title order={5} c={'#E7639A'}>
            Apply to
          </Title>
          {/* <Radio.Group {...form.getInputProps('discount_target')} required> */}
          <Radio.Group required>
            <Group>
              <Radio
                checked
                value={'product'}
                // onClick={() => setState((p) => ({ ...p, isShip: false }))}
                label={
                  <span style={{ color: '#E7639A', fontSize: '12px' }}>
                    Product
                  </span>
                }
              />
              <Radio
                value={'shipping_fee'}
                // onClick={() => setState((p) => ({ ...p, isShip: true }))}
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
              onChange={(e: string) => {
                form.setFieldValue('discount_type', e);
                if (e === '1') {
                  setState((p) => ({ ...p, isPercent: true }));
                } else {
                  setState((p) => ({ ...p, isPercent: false }));
                }
              }}
              value={form.values.discount_type}
              required={true}
              rightSection={<img src="/down_arrow.svg" alt="icon" />}
              withAsterisk
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
              sx={{
                resize: 'none',
                border: '1px solid #b82c67',
                borderRadius: '4px',
                padding: '0px 10px',
              }}
              variant={'unstyled'}
            />
            {isPercent ? '%' : '$'}
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
          <span style={{ fontSize: '16px' }}>Confirmer </span>
        </Button>
        <div style={{ height: '60px' }}></div>
      </form>
    </Box>
  );
};

export default VoucherCreateForm;
