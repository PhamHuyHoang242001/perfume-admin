import React from 'react';
import {
  ActionIcon,
  createStyles,
  Paper,
  rem,
  ScrollArea,
  Select,
  Table,
  TextInput,
  Title,
  UnstyledButton,
} from '@mantine/core';
import dayjs from 'dayjs';
import { DELETE, POST, PUT } from '../../utils/fetch.ts';
import useSWR, { mutate } from 'swr';
import { IconCircleX } from '@tabler/icons-react';

type shippingProps = {
  id?: number;
  weight_min: number;
  weight_max: number;
  cost: number;
  country: string;
  created_time: string;
  create: boolean;
  edit?: boolean;
};
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
/*async function getCountry() {
  const res = await fetch(
    'https://restcountries.com/v3.1/all?fields=name,flag',
  );
  return res.json();
}*/
const Delivery = () => {
  const { classes, cx } = useStyles();

  const [state, setState] = React.useState({
    shipping: [] as shippingProps[],
    scrolled: false,
    countryValue: '',
  });
  const { shipping, scrolled, countryValue } = state;
  async function getDeliveryCost() {
    return await fetch('/api/delivery-cost/all').then((res) => res.json());
  }
  const { data } = useSWR('get-delivery', getDeliveryCost);
  /* const countryList = useSWR('get-country', getCountry);
  const countryData = [...countryList.data].map((item) => {
    return {
      value: item.flag,
      label: item.name.common,
    };
  });*/
  const minRef = React.useRef<HTMLInputElement | null>(null);
  const maxRef = React.useRef<HTMLInputElement | null>(null);
  const costRef = React.useRef<HTMLInputElement | null>(null);

  React.useEffect(() => {
    setState((p) => ({ ...p, shipping: data }));
  }, [data]);
  return (
    <div>
      <Title c="#B82C67" order={1} mb={4}>
        Frais de port
      </Title>
      <div style={{ textAlign: 'center' }}>
        <ScrollArea
          h={500}
          onScrollPositionChange={({ y }) =>
            setState((p) => ({ ...p, scrolled: y !== 0 }))
          }
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
                  <td>Taper</td>
                  <td>Poids mini (g) *</td>
                  <td>Poids maximal (g) *</td>
                  <td>Frais de port (€) *</td>
                  <td>Expédition vers les pays</td>
                  <td>Date de création</td>
                  <td></td>
                </tr>
              </thead>
              <tbody>
                {shipping &&
                  shipping.map((item) => (
                    <tr key={item.id} className={'hover_table'}>
                      <td>{item.id}</td>
                      <td>
                        {item.create ? (
                          <TextInput ref={minRef} />
                        ) : (
                          <>
                            {item.edit ? (
                              <TextInput
                                defaultValue={item.weight_min}
                                ref={minRef}
                              />
                            ) : (
                              item.weight_min
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        {item.create ? (
                          <TextInput ref={maxRef} />
                        ) : (
                          <>
                            {item.edit ? (
                              <TextInput
                                defaultValue={item.weight_max}
                                ref={maxRef}
                              />
                            ) : (
                              item.weight_max
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        {item.create ? (
                          <TextInput ref={costRef} />
                        ) : (
                          <>
                            {item.edit ? (
                              <TextInput
                                defaultValue={item.cost}
                                ref={costRef}
                              />
                            ) : (
                              item.cost
                            )}
                          </>
                        )}
                      </td>
                      <td>
                        {item.create ? (
                          <Select
                            rightSection={
                              <img alt="icon" src="/down_arrow.svg" />
                            }
                            data={[
                              { value: 'VietNam', label: 'VietNam' },
                              { value: 'France', label: 'France' },
                              { value: 'Dubai', label: 'Dubai' },
                              {
                                value: 'United Kingdom',
                                label: 'United Kingdom',
                              },
                            ]}
                            value={countryValue}
                            onChange={(v: string) =>
                              setState((p) => ({ ...p, countryValue: v }))
                            }
                          />
                        ) : (
                          <>
                            {item.edit ? (
                              <Select
                                data={[
                                  { value: 'VietNam', label: 'VietNam' },
                                  { value: 'France', label: 'France' },
                                  { value: 'Dubai', label: 'Dubai' },
                                  {
                                    value: 'United Kingdom',
                                    label: 'United Kingdom',
                                  },
                                ]}
                                defaultValue={item.country}
                                onChange={(v: string) =>
                                  setState((p) => ({ ...p, countryValue: v }))
                                }
                              />
                            ) : (
                              item.country
                            )}
                          </>
                        )}
                      </td>
                      <td>{dayjs(item.created_time).format('L')}</td>
                      <td style={{ display: 'flex' }}>
                        {item.create ? (
                          <ActionIcon
                            onClick={async () => {
                              const res = await POST(
                                '/api/delivery-cost/create',
                                {
                                  weight_min: minRef.current?.value,
                                  weight_max: maxRef.current?.value,
                                  cost: costRef.current?.value,
                                  country: countryValue,
                                },
                              ).then((res) => res.json());
                              if (res) {
                                await mutate('get-delivery');

                                setState((p) => ({ ...p, countryValue: '' }));
                              }
                            }}
                          >
                            <img src={'/success.svg'} alt={'icon'} />
                          </ActionIcon>
                        ) : (
                          <>
                            {item.edit ? (
                              <>
                                <ActionIcon
                                  onClick={async () => {
                                    const res = await PUT(
                                      `/api/delivery-cost/detail/${item.id}`,
                                      {
                                        weight_min: minRef.current?.value,
                                        weight_max: maxRef.current?.value,
                                        cost: costRef.current?.value,
                                        country: countryValue || item.country,
                                      },
                                    ).then((res) => res.json());
                                    if (res) {
                                      await mutate('get-delivery');
                                    }
                                  }}
                                >
                                  <img src={'/success.svg'} alt={'icon'} />
                                </ActionIcon>
                                <ActionIcon
                                  onClick={() => {
                                    item.edit = false;
                                    setState((p) => ({ ...p }));
                                  }}
                                >
                                  <IconCircleX color={'red'} />
                                </ActionIcon>
                              </>
                            ) : (
                              <>
                                <ActionIcon
                                  onClick={() => {
                                    item.edit = true;
                                    setState((p) => ({ ...p }));
                                  }}
                                >
                                  <img src={'/e_ic.svg'} alt={'icon'} />
                                </ActionIcon>
                                <ActionIcon
                                  onClick={async () => {
                                    const res = await DELETE(
                                      `/api/delivery-cost/detail/${item.id}`,
                                    ).then((res) => res.json());
                                    if (res.message === 'delete success') {
                                      await mutate('get-delivery');
                                    }
                                  }}
                                >
                                  <img src={'/del.svg'} alt={'icon'} />
                                </ActionIcon>
                              </>
                            )}
                          </>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </Table>
          </Paper>
        </ScrollArea>

        <UnstyledButton
          onClick={() =>
            setState((p) => ({
              ...p,
              shipping: [
                ...shipping,
                {
                  weight_min: 0,
                  weight_max: 0,
                  cost: 0,
                  country: '',
                  created_time: dayjs(new Date()).format('l'),
                  create: true,
                },
              ],
            }))
          }
        >
          <span
            style={{
              color: '#B82C67',
              fontWeight: 600,
              marginRight: '0.75rem',
            }}
          >
            Add
          </span>
          <img src={'/add.svg'} alt={'icon'} />
        </UnstyledButton>
      </div>
    </div>
  );
};

export default Delivery;
