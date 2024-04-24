import useSWR from 'swr';
import { apiRoute } from '../utils/apiRoute';
import { Paper, ScrollArea, Table, createStyles, rem } from '@mantine/core';
import React from 'react';
import { ordersListType } from '../utils/utilsInterface';
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
export default function ListOrder() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = React.useState(false);
  const { data } = useSWR('get-list-order', async () => {
    return await fetch(apiRoute.get_list_order).then((res) => res.json());
  });

  return (
    <div>
      <ScrollArea
        h={500}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
        mt={'3rem'}
      >
        <Paper shadow="md" radius="md" sx={{ border: '1px solid #B82C67' }}>
          <Table sx={{ borderRadius: '0.65em', overflow: 'hidden' }}   highlightOnHover withColumnBorders>
            <thead
              className={cx(classes.header, { [classes.scrolled]: scrolled })}
            >
              <tr
                style={{
                //   textAlign: 'center',
                  color: '#B82C67',
                  backgroundColor: '#FFE2EC',
                  height: '60px',
                  fontWeight: 600,
                }}
              >
                <th>Order ID</th>
                <th>Nom du client</th>
                <th>Téléphone du client</th>
                <th>Email</th>
                <th>Pays</th>
                <th>Province</th>
                <th>District</th>
                <th>Salle</th>
                <th>Zip Code</th>
                <th>Voucher</th>
                <th>Navire payant</th>
                <th>Poids total</th>
                <th>Prix total</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((item: ordersListType) => (
                <tr key={item.id}>
                  <td>{item.id_order}</td>
                  <td>{`${item.first_name} ${item.last_name}`}</td>
                  <td>{item.phone_number}</td>
                  <td>{item.email}</td>
                  <td>{item.country}</td>
                  <td>{item.province}</td>
                  <td>{item.district}</td>
                  <td>{item.ward}</td>
                  <td>{item.zip_code}</td>
                  <td>{item.applied_voucher}</td>
                  <td>{item.fee_ship}€</td>
                  <td>{item.total_weight}</td>
                  <td>{item.total_price_payment}€</td>
                  <td>{item.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Paper>
      </ScrollArea>
    </div>
  );
}
