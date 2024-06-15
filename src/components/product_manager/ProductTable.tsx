import {
  Pagination,
  Paper,
  ScrollArea,
  Space,
  Table,
  UnstyledButton,
  createStyles,
  rem,
} from '@mantine/core';

import React from 'react';
import { productType } from '../../utils/utilsInterface';

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

type CategoryTableProps = {
  productData: productType[] | null;
  openEditModal: (value: number) => void;
  setState: (value: any) => void;
  total?: number;
};

const ProductTable = ({
  productData,
  openEditModal,
  setState,
  total = 0,
}: CategoryTableProps) => {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = React.useState(false);
  return (
    <div>
      <ScrollArea
        h={500}
        onScrollPositionChange={({ y }) => setScrolled(y !== 0)}
        mt={'3rem'}
      >
        <Paper shadow="md" radius="md" sx={{ border: '1px solid #B82C67' }}>
          <Table sx={{ borderRadius: '0.65em', overflow: 'hidden' }}>
            <thead
              className={cx(classes.header, {
                [classes.scrolled]: scrolled,
              })}
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
                  <UnstyledButton>
                    <span
                      style={{
                        color: '#B82C67',
                        fontWeight: 600,
                        textAlign: 'left',
                      }}
                    >
                      Name
                    </span>{' '}
                  </UnstyledButton>
                </td>
                <td>
                  <UnstyledButton>
                    <span style={{ color: '#B82C67', fontWeight: 600 }}>
                      Price
                    </span>{' '}
                  </UnstyledButton>
                </td>
                <td>Sub-category</td>
                <td>Sub-sub-category</td>
                <td>Status</td>
                <td>Update</td>
                <td>Delete</td>
              </tr>
            </thead>
            <tbody>
              {productData &&
                productData?.map((item: productType) => (
                  <tr
                    key={item.id}
                    style={{ textAlign: 'center', height: '60px' }}
                    className={'hover_table'}
                  >
                    <td>
                      <img
                        src={item?.thumbnail?.url}
                        width="52px"
                        height="36px"
                        alt="image"
                        loading="lazy"
                      />
                    </td>
                    <td>{item.name}</td>
                    <td>€{item.price}</td>
                    <td>{item?.subcategory?.name}</td>
                    <td>{item?.sub_subcategory?.name}</td>
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
                        {/* {item.status} */}
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
                          setState((p: any) => ({
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
          onChange={(page) =>
            setState((p: any) => ({
              ...p,
              page: page,
            }))
          }
        />
      </div>
    </div>
  );
};

export default ProductTable;
