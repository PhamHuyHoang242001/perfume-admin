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
  CopyButton,
  Tooltip,
  ActionIcon,
  TextInput,
} from '@mantine/core';

import { useEffect, useState } from 'react';
// import VoucherForm from '../form/VoucherEditForm';
import { DateInput } from '@mantine/dates';
import VoucherCreateForm from '../form/VoucherCreateForm';
import { useDisclosure } from '@mantine/hooks';
import useSWR, { mutate } from 'swr';
import { voucherType } from '../../utils/utilsInterface.ts';
import { formatDay } from '../../utils/format.ts';
import { DELETE, POST } from '../../utils/fetch.ts';
import { apiRoute } from '../../utils/apiRoute.ts';
import VoucherEditForm from '../form/VoucherEditForm.tsx';
import { IconCheck, IconCopy, IconRefresh } from '@tabler/icons-react';
import dayjs from 'dayjs';

const statusData = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'expirer', label: 'Expirer' },
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
    end_date: '',
    reversed: false,
  });
  const {
    scrolled,
    voucherData,
    deleteModal,
    deleteId,
    voucherID,
    editModal,
    start_date,
    end_date,
    reversed,
  } = state;
  const { classes, cx } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);
  async function getVoucher() {
    return await fetch('/api/voucher/all')
      .then((res) => res.json())
      .catch((e) => alert(e));
  }
  const { data } = useSWR('get-voucher', getVoucher);
  async function refreshVoucherCode(id: number) {
    await POST(`/api/voucher/code/${id}`).then(() => mutate('get-voucher'));
  }

  const statusFilter = [{ value: 'all', label: 'Totalité' }, ...statusData];

  useEffect(() => {
    setState((p) => ({ ...p, voucherData: data }));
  }, [data]);

  return (
    <div style={{ padding: '32px 5.44rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title order={2} c={'#B82C67'}>
          Gestionnaire de bons
        </Title>
        <Button
          rightIcon={<img src="/plus.svg" alt="icon" />}
          bg={'#B82C67'}
          w={'10.6875rem'}
          h={'2.625rem'}
          onClick={open}
        >
          Créer un bon
        </Button>
      </div>
      <br />

      <Box mt={32} sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Group spacing={'xl'}>
          <Select
            data={statusFilter}
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            bg={'#FFE7EF'}
            variant={'unstyled'}
            label={
              <span style={{ fontSize: '12px', color: '#858585' }}>Statut</span>
            }
            h={58}
            w={'16.1875rem'}
            sx={{
              borderRadius: '5px',
              paddingLeft: '10px',
            }}
            onChange={(e: string) => {
              if (e === 'all') {
                setState((p) => ({ ...p, voucherData: data }));
              } else {
                setState((p) => ({
                  ...p,
                  voucherData: data.filter(
                    (item: voucherType) =>
                      item.status.trim().toLowerCase() === e.toLowerCase(),
                  ),
                }));
              }
            }}
            allowDeselect
          />

          <DateInput
            label={
              <span style={{ fontSize: '12px', color: '#858585' }}>
                Date de début
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
            onChange={(e) => setState((p) => ({ ...p, start_date: String(e) }))}
          />
          <DateInput
            label={
              <span style={{ fontSize: '12px', color: '#858585' }}>
                Date de fin
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
            onChange={(e) => setState((p) => ({ ...p, end_date: String(e) }))}
          />
          <Button
            bg={'#B82C67'}
            w={'7.5rem'}
            h={58}
            onClick={() =>
              setState((p) => ({
                ...p,
                voucherData: data.filter(
                  (item: voucherType) =>
                    dayjs(item.start_date as Date).format('l') ===
                      dayjs(start_date).format('l') ||
                    dayjs(item.end_date as Date).format('l') ===
                      dayjs(end_date).format('l'),
                ),
              }))
            }
          >
            Afficher
          </Button>
        </Group>
        <TextInput
          icon={<img src="/search.svg" alt="icon" />}
          placeholder="Rechercher un bon de réduction"
          w={327}
          h={58}
          variant="unstyled"
          className={cx(classes.input)}
          onChange={function (e) {
            setState((p) => ({
              ...p,
              voucherData: data.filter((item: voucherType) =>
                item.name
                  .trim()
                  .toLowerCase()
                  .includes(e.target.value.trim().toLowerCase()),
              ),
            }));
          }}
        />
      </Box>

      <br />
      <Title c={'#B82C67'} order={3}>
        Bons de réduction ({data?.length})
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
                }}
              >
                <td>
                  <UnstyledButton
                    sx={{ display: 'flex' }}
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        reversed: !reversed,
                        voucherData: [...voucherData].sort((a, b) => {
                          if (reversed) {
                            return b['name'].localeCompare(a['name']);
                          }
                          return a['name'].localeCompare(b['name']);
                        }),
                      }))
                    }
                  >
                    <span style={{ color: '#b82c67', fontWeight: '600' }}>
                      Nom du bon <br />
                      de
                      <br /> réduction
                    </span>
                    <img src={'/sort.svg'} alt={'icon'} />
                  </UnstyledButton>
                </td>
                <td>Code de réduction</td>
                <td>Bon de réduction</td>
                <td>Quantité de codes</td>
                <td>Bon de réduction s'applique à</td>
                <td>
                  <UnstyledButton
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        reversed: !reversed,
                        voucherData: [...voucherData].sort((a, b) => {
                          if (reversed) {
                            return (
                              Date.parse(b['start_date']) -
                              Date.parse(a['start_date'])
                            );
                          }
                          return (
                            Date.parse(a['start_date']) -
                            Date.parse(b['start_date'])
                          );
                        }),
                      }))
                    }
                  >
                    <span style={{ color: '#b82c67', fontWeight: '600' }}>
                      Date de début
                    </span>
                    <img src={'/sort.svg'} alt={'icon'} />
                  </UnstyledButton>
                </td>
                <td>
                  <UnstyledButton
                    onClick={() =>
                      setState((p) => ({
                        ...p,
                        reversed: !reversed,
                        voucherData: [...voucherData].sort((a, b) => {
                          if (reversed) {
                            return (
                              Date.parse(b['end_date']) -
                              Date.parse(a['end_date'])
                            );
                          }
                          return (
                            Date.parse(a['end_date']) -
                            Date.parse(b['end_date'])
                          );
                        }),
                      }))
                    }
                  >
                    <span style={{ color: '#b82c67', fontWeight: '600' }}>
                      Date de fin
                    </span>
                    <img src={'/sort.svg'} alt={'icon'} />
                  </UnstyledButton>
                </td>
                <td>Statut</td>
                <td>Pendre le code</td>
                <td></td>
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
                    <td>{item.code_promo}</td>
                    <td>
                      {item.discount_type === 'value'
                        ? `Valuer-${item.discount}€`
                        : `%Rabias-${item.discount}%`}
                    </td>
                    <td>
                      {item.available}/{item.total}
                    </td>
                    <td>{item.product || 'All'}</td>
                    <td>{formatDay(item.start_date)}</td>
                    <td>{formatDay(item.end_date)}</td>
                    <td>
                      {item.available === 0 ? (
                        <span
                          style={{
                            background: '#FF9090',
                            textAlign: 'center',
                            textTransform: 'capitalize',
                            padding: '0.1875rem 0.75rem',
                            border: '1px solid #333',
                            borderRadius: '5px',
                            fontWeight: 500,
                            fontSize: '0.875rem',
                          }}
                        >
                          Expirer
                        </span>
                      ) : (
                        <span
                          style={{
                            background:
                              item.status === 'inactive'
                                ? '#FFC978'
                                : item.status === 'active'
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
                          {item.status === 'expire' ? 'Expirer' : item.status}
                        </span>
                      )}
                    </td>
                    <td>
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
                    </td>
                    <td>
                      <UnstyledButton
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
                    </td>
                    <td>
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
              <Title c={'#B82C67'} order={1} mt={32} ml={64}>
                Créer un bon de réduction
              </Title>
            </Modal.Title>
            <Modal.CloseButton>
              <img src={'/close.svg'} alt={'icon'} />
            </Modal.CloseButton>
          </Modal.Header>
          <Modal.Body>
            <VoucherCreateForm
              onSuccess={() => {
                mutate('get-voucher').then(() => close());
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
              <Title c={'#B82C67'} order={1} mt={32} ml={64}>
                Modifier les coupons
              </Title>
            </Modal.Title>
            <Modal.CloseButton>
              <img src={'/close.svg'} alt={'icon'} />
            </Modal.CloseButton>
          </Modal.Header>
          <Modal.Body>
            <VoucherEditForm
              onSuccess={() => {
                mutate('get-voucher').then(() =>
                  setState((p) => ({ ...p, editModal: false })),
                );
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
                await DELETE(`${apiRoute.delete_voucher}/${deleteId}`)
                  .then(() =>
                    setState((p) => ({
                      ...p,
                      voucherData: [...voucherData].filter(
                        (item: voucherType) => item.id !== deleteId,
                      ),
                      deleteModal: false,
                    })),
                  )
                  .then(() => mutate('get-voucher'))
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

export default Voucher;
