import {
  Box,
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Table,
  UnstyledButton,
  createStyles,
  rem,
  Title,
  Text,
  TextInput,
} from '@mantine/core';

import { useEffect, useState } from 'react';
// import VoucherForm from '../form/VoucherEditForm';
import { DateInput } from '@mantine/dates';
import VoucherCreateForm from '../form/VoucherCreateForm';
import { useDisclosure } from '@mantine/hooks';
import { voucherType } from '../../utils/utilsInterface.ts';
import { formatDay } from '../../utils/format.ts';
import { DELETE, GET } from '../../utils/fetch.ts';
import VoucherEditForm from '../form/VoucherEditForm.tsx';
import dayjs from 'dayjs';

const statusData = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];
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
  voucher_header: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    border: '1px solid #B82C67',
    borderRadius: '5px',
    padding: '8px 0',
    textAlign: 'center',
  },
}));
const Voucher = () => {
  const [state, setState] = useState({
    voucherID: 0,
    scrolled: false,
    editModal: false,
    voucherData: [] as voucherType[],
    deleteModal: false,
    deleteId: 0,
    start_date: '',
    searchText: '',
    end_date: '',
    status: 'all',
  });
  const {
    scrolled,
    voucherData,
    deleteModal,
    deleteId,
    voucherID,
    editModal,
    searchText,
    start_date,
    end_date,
    status,
  } = state;
  const { classes, cx } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  console.log(start_date);

  async function getVoucher() {
    const res = await GET(
      `/api/admin/voucher?${
        status === 'active'
          ? 'active=true'
          : status === 'inactive'
          ? 'active=false'
          : ''
      }${searchText ? '&search=' + searchText : ''}${
        start_date
          ? '&start_date=' + dayjs(start_date).format('YYYY-MM-DD')
          : ''
      }${end_date ? '&end_date=' + dayjs(end_date).format('YYYY-MM-DD') : ''}`,
    );
    setState((p) => ({ ...p, voucherData: res?.data?.results }));
  }

  useEffect(() => {
    getVoucher();
  }, [status, searchText, start_date, end_date]);

  return (
    <div style={{ padding: '32px 5.44rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title order={2} c={'#B82C67'}>
          Voucher management
        </Title>
        <Button
          rightIcon={<img src="/plus.svg" alt="icon" />}
          bg={'#B82C67'}
          w={'218px'}
          h={'2.625rem'}
          onClick={open}
          sx={{
            borderRadius: '10px',
          }}
        >
          Add new voucher
        </Button>
      </div>
      <br />

      <Box mt={32} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Group spacing={'xl'}>
          <Select
            // className="header_list_voucher"
            data={statusData}
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            bg={'#FFE7EF'}
            variant={'unstyled'}
            label={
              <span
                style={{
                  fontSize: '12px',
                  color: '#858585',
                  display: 'flex',
                }}
              >
                Status
              </span>
            }
            h={58}
            w={'16.1875rem'}
            sx={{
              borderRadius: '5px',
              paddingLeft: '10px',
            }}
            value={status}
            onChange={(e: string) => {
              setState((p) => ({ ...p, status: e }));
            }}
            allowDeselect
          />

          <DateInput
            // className="header_list_voucher"
            clearable
            label={
              <span style={{ fontSize: '12px', color: '#858585' }}>
                Start date
              </span>
            }
            h={58}
            w={190}
            rightSection={
              <img src={'calendar.svg'} alt={'icon'} className={'mb-15'} />
            }
            variant="unstyled"
            bg={'#FFE7EF'}
            sx={{ borderRadius: '5px', paddingLeft: '8px' }}
            onChange={(e) =>
              setState((p) => ({
                ...p,
                start_date: e !== null ? String(e) : '',
              }))
            }
            minDate={new Date()}
            maxDate={end_date ? new Date(end_date) : undefined}
          />
          <DateInput
            clearable
            label={
              <span style={{ fontSize: '12px', color: '#858585' }}>
                End date
              </span>
            }
            h={58}
            w={190}
            rightSection={
              <img src={'calendar.svg'} alt={'icon'} className={'mb-15'} />
            }
            variant="unstyled"
            bg={'#FFE7EF'}
            sx={{ borderRadius: '5px', paddingLeft: '8px' }}
            onChange={(e) =>
              setState((p) => ({ ...p, end_date: e !== null ? String(e) : '' }))
            }
            minDate={start_date ? new Date(start_date) : new Date()}
          />
          {/* <Button
            bg={'#B82C67'}
            w={'7.5rem'}
            h={58}
            onClick={() => {
              setState((p) => ({ ...p, check: true }));
            }}
          >
            Confirm
          </Button> */}
        </Group>
        <TextInput
          icon={<img src="/search.svg" alt="icon" />}
          placeholder="Search"
          w={327}
          h={58}
          variant="unstyled"
          className={cx(classes.input)}
          onChange={function (e) {
            setState((p) => ({
              ...p,
              searchText: e.target.value,
            }));
          }}
        />
      </Box>

      <br />
      <Title c={'#B82C67'} order={3}>
        Discount voucher ({voucherData?.length})
      </Title>
      <ScrollArea
        h={500}
        onScrollPositionChange={({ y }) =>
          setState((p) => ({ ...p, scrolled: y !== 0 }))
        }
        mt={'2rem'}
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
                  fontSize: '14px',
                }}
              >
                <td>
                  Name of <br />
                  voucher
                </td>
                <td>Promo code</td>
                <td>Type of discount</td>
                <td>Quantity</td>
                <td>Apply to</td>
                <td>Start date</td>
                <td>End date</td>
                <td>Status</td>
                {/* <td>Pendre le code</td> */}
                {/* <td></td> */}
                <td></td>
              </tr>
            </thead>
            <tbody>
              {voucherData &&
                voucherData?.map((item: Partial<voucherType>) => (
                  <tr
                    key={item.id}
                    style={{ textAlign: 'center', height: '60px' }}
                    className={'hover_table'}
                  >
                    <td>{item.name}</td>
                    <td>{item.code}</td>
                    <td>
                      {String(item.discount_type) === '3'
                        ? ` Valuer - ${item.discount}$`
                        : `% Discount - ${item.discount}%`}
                    </td>
                    <td>
                      {0}/{0}
                    </td>
                    <td>{'All'}</td>
                    <td>{formatDay(item.start_date)}</td>
                    <td>{formatDay(item.end_date)}</td>
                    <td>
                      <span
                        style={{
                          background:
                            item.active === false ? '#FFC978' : '#87FF74',
                          textAlign: 'center',
                          textTransform: 'capitalize',
                          padding: '0.1875rem 0.75rem',
                          border: '1px solid #333',
                          borderRadius: '5px',
                          fontWeight: 500,
                          fontSize: '0.875rem',
                          height: '30px',
                          width: '97px',
                        }}
                      >
                        {item.active === true ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {/* <td>
                      {item.last_code ? (
                        <div
                          style={{
                            border: '1px solid #E7639A',
                            height: '3.5rem',
                            width: '7.0625rem',
                            borderRadius: '5px',
                            display: 'flex',
                          }}
                        >
                          <span
                            style={{
                              color: '#E7639A',
                              fontSize: '0.75rem',
                            }}
                          >
                            {item.last_code}
                          </span>
                          <div>
                            <CopyButton value={item.last_code}>
                              {({ copied, copy }) => (
                                <Tooltip
                                  label={copied ? 'Copied' : 'Copy'}
                                  withArrow
                                  position="right"
                                >
                                  <ActionIcon
                                    variant={'transparent'}
                                    color={copied ? 'teal' : 'gray'}
                                    onClick={copy}
                                  >
                                    {copied ? (
                                      <IconCheck size="1rem" />
                                    ) : (
                                      <IconCopy size="1rem" color={'#52C7FA'} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </CopyButton>
                            <Tooltip
                              label={'refresh'}
                              withArrow
                              position={'right'}
                            >
                              <ActionIcon
                                variant={'transparent'}
                                disabled={(item.available as number) <= 0}
                                onClick={() =>
                                  refreshVoucherCode(item.id as number)
                                }
                              >
                                <IconRefresh size={'1rem'} color={'#B82C67'} />
                              </ActionIcon>
                            </Tooltip>
                          </div>
                        </div>
                      ) : (
                        <UnstyledButton
                          onClick={() => refreshVoucherCode(item.id as number)}
                        >
                          <img src="/plus_round.svg" alt="icon" />
                        </UnstyledButton>
                      )}
                    </td> */}
                    {/* <td>
                      
                    </td> */}
                    <td>
                      <UnstyledButton
                        style={{ marginRight: '16px' }}
                        onClick={function () {
                          setState((p) => ({
                            ...p,
                            voucherID: item.id as number,
                            editModal: true,
                          }));
                        }}
                      >
                        <img src="/pen.svg" alt="icon" />
                      </UnstyledButton>
                      <UnstyledButton
                        onClick={() =>
                          setState((p) => ({
                            ...p,
                            deleteModal: true,
                            deleteId: item.id as number,
                          }))
                        }
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
              <Title c={'#B82C67'} size={'24px'} mt={32} ml={64}>
                Add new voucher{' '}
              </Title>
            </Modal.Title>
            <Modal.CloseButton>
              <img
                src={'/close.svg'}
                alt={'icon'}
                height={'18px'}
                width={'18px'}
              />
            </Modal.CloseButton>
          </Modal.Header>
          <Modal.Body>
            <VoucherCreateForm
              onSuccess={() => {
                getVoucher();
                close();
              }}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      {/*edit modal*/}
      <Modal.Root
        opened={editModal}
        onClose={() => setState((p) => ({ ...p, editModal: false }))}
        closeOnClickOutside={false}
        size={'auto'}
      >
        <Modal.Overlay />
        <Modal.Content>
          <Modal.Header>
            <Modal.Title>
              <Title c={'#B82C67'} size={'24px'} mt={32} ml={64}>
                Edit voucher
              </Title>
            </Modal.Title>
            <Modal.CloseButton>
              <img src={'/close.svg'} alt={'icon'} />
            </Modal.CloseButton>
          </Modal.Header>
          <Modal.Body>
            <VoucherEditForm
              onSuccess={() => {
                getVoucher();
                setState((p) => ({ ...p, editModal: false }));
              }}
              id={voucherID}
            />
          </Modal.Body>
        </Modal.Content>
      </Modal.Root>
      {/*  delete modal*/}
      <Modal
        opened={deleteModal}
        onClose={close}
        withCloseButton={false}
        centered
        radius={'md'}
      >
        <Paper pt={'1rem'}>
          <Text align={'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
            Do you really want to delete this voucher?
          </Text>
          <Group sx={{ float: 'right' }} my={32}>
            <Button
              variant={'subtle'}
              onClick={() => setState((p) => ({ ...p, deleteModal: false }))}
            >
              <span style={{ color: '#333' }}>No</span>
            </Button>
            <Button
              onClick={async function () {
                await DELETE(`/api/admin/voucher/delete/?ids=${deleteId}`);
                setState((p) => ({
                  ...p,
                  deleteModal: false,
                })),
                  getVoucher();
              }}
            >
              Yes
            </Button>
          </Group>
        </Paper>
      </Modal>
    </div>
  );
};

export default Voucher;
