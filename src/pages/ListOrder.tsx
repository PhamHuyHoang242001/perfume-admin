import {
  Image,
  Paper,
  Table,
  TextInput,
  createStyles,
  rem,
} from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { ordersListType } from '../utils/utilsInterface';
import { GET } from '../utils/fetch';
import dayjs from 'dayjs';
import { twMerge } from 'tailwind-merge';

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
const listStatus: { [key: string]: string } = {
  '3': 'New order',
  '4': 'Accepted',
  '5': 'Rejected',
  '6': 'In progress',
  '7': 'Delivering',
  '8': 'Completed',
};
const orderStatus = [
  {
    value: 'all',
    label: 'All',
  },
  {
    value: '3',
    label: 'New order',
  },
  {
    value: '4',
    label: 'Accepted',
  },
  {
    value: '7',
    label: 'Delivering',
  },
  {
    value: '8',
    label: 'Completed',
  },
  {
    value: '5',
    label: 'Rejected',
  },
];
export default function ListOrder() {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = React.useState(false);
  const [orderDetail, setOrderDetail] = useState<any>({});
  const [data, setData] = useState<any>({});
  const [state, setState] = React.useState({
    status: 'all',
    tab: '1',
    totalOrder: 0,
    orderId: -1,
    page: 1,
    searchText: '',
  });
  const { status, tab, page, totalOrder, orderId, searchText } = state;
  async function getListOrder() {
    const res = await GET(
      `/api/admin/order?page=${page}${
        status === 'all' ? '' : '&statuses=' + status
      }${'&page_size=10'}${
        searchText ? '&search_id_customer=' + searchText : ''
      }`,
    );
    setData(res?.data);
  }

  useEffect(() => {
    getListOrder();
  }, [status, page, searchText]);
  async function getOrderDetail() {
    const res = await GET(`/api/admin/order/${orderId}/`);
    setOrderDetail(res?.data);
  }

  useEffect(() => {
    if (orderId !== -1) {
      getOrderDetail();
    }
  }, [orderId]);
  console.log(status);

  return tab === '1' ? (
    <div>
      <div
        style={{
          marginTop: '10px',
          fontSize: '24px',
          fontWeight: '600px',
          color: '#374151',
        }}
      >
        List Order{' '}
      </div>
      <div
        className="mt-8"
        style={{
          display: 'flex',
          flexDirection: 'row',
          gap: '16px',
        }}
      >
        {orderStatus?.map((item, index) => {
          return (
            <div
              key={index}
              style={{
                width: '120px',
                height: '40px',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: item.value === status ? '#FFD9E2' : '#fff',
                cursor: 'pointer',
              }}
              onClick={() => {
                setState((pre) => ({
                  ...pre,
                  status: item.value,
                }));
              }}
            >
              {item.label}
            </div>
          );
        })}
      </div>
      <div className="flex w-full justify-end">
        <TextInput
          icon={<img src="/search.svg" alt="icon" />}
          placeholder="Search"
          w={240}
          h={40}
          variant="unstyled"
          className="mt-6 mb-4 "
          onChange={(e) => {
            setState((p) => ({
              ...p,
              searchText: e.target.value,
            }));
          }}
          style={{
            border: '0.5px solid #D9D9D9',
            borderRadius: '4px',
          }}
        />
      </div>

      <Paper shadow="md" radius="md" sx={{ border: '1px solid #B82C67' }}>
        <Table
          sx={{ borderRadius: '0.65em', overflow: 'hidden' }}
          highlightOnHover
          withColumnBorders
        >
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
              <th>Number</th>
              <th>Order ID</th>
              <th>Date order</th>
              <th>Quantity</th>
              <th>Customer</th>
              <th>Total</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {data &&
              data?.results?.map((item: ordersListType, index: number) => (
                <tr
                  key={index}
                  style={{
                    backgroundColor: index % 2 === 0 ? '#fff' : '#FFF1F6',
                  }}
                >
                  <td className="h-[60px]">{index + 1}</td>
                  <td>{item.id}</td>
                  <td>{item.paid_at ? item.paid_at : ''}</td>
                  <td>
                    {item.quantity === 1
                      ? item.quantity + ' item'
                      : item.quantity + ' items'}
                  </td>
                  <td>{`${item.first_name} ${item.last_name}`}</td>
                  <td>{item.total + ' $'}</td>

                  <td
                    style={{
                      color:
                        String(item.status) === '8'
                          ? '#00DD16'
                          : String(item.status) === '5'
                          ? '#FF2626'
                          : '#0047FF',
                    }}
                  >
                    {listStatus[item.status.toString()]}
                  </td>
                  <td>
                    <div
                      onClick={() => {
                        setState((pre) => ({
                          ...pre,
                          tab: '2',
                          orderId: item.id,
                          totalOrder: item.quantity,
                        }));
                      }}
                    >
                      <div className="flex items-center gap-x-2 cursor-pointer">
                        <span className="text-[#005AEA] font-normal text-xs">
                          Detail
                        </span>
                        <svg
                          width="12"
                          height="12"
                          viewBox="0 0 12 12"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M4.25596 2.21529C4.41321 2.0805 4.64994 2.09871 4.78473 2.25596L7.78473 5.75596C7.9051 5.89639 7.9051 6.10362 7.78473 6.24405L4.78473 9.74405C4.64994 9.9013 4.41321 9.91951 4.25596 9.78473C4.09871 9.64994 4.0805 9.41321 4.21529 9.25596L7.0061 6.00001L4.21529 2.74405C4.0805 2.58681 4.09871 2.35007 4.25596 2.21529Z"
                            fill="#575757"
                          />
                        </svg>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
          </tbody>
        </Table>
        {data && data?.results?.length > 0 && (
          <div
            className=" flex justify-center py-8 "
            style={{
              borderTop: '0.0625rem solid #dee2e6',
            }}
          >
            <div className="flex gap-x-5">
              <button
                className={twMerge(
                  ' text-xs font-medium',
                  data?.previous_page === null
                    ? 'cursor-not-allowed text-[#B3B3B3]'
                    : 'text-[#000]',
                )}
                onClick={() =>
                  setState((p) => ({ ...p, page: state.page - 1 }))
                }
                disabled={data?.previous_page === null}
              >
                Previous
              </button>
              <div className="flex gap-x-2">
                {Array.from({ length: data?.num_pages }, (_, index) => (
                  <button
                    className={` ${
                      page === index + 1 && 'bg-[#603813] text-white'
                    }  w-5 h-5 px-1  rounded text-sm`}
                    onClick={() => {
                      setState((p) => ({ ...p, page: index + 1 }));
                    }}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>

              <button
                className={twMerge(
                  ' text-xs font-medium',
                  data?.next_page === null
                    ? 'cursor-not-allowed text-[#B3B3B3]'
                    : 'text-[#000]',
                )}
                onClick={() =>
                  setState((p) => ({ ...p, page: state.page + 1 }))
                }
                disabled={data?.next_page === null}
              >
                Next
              </button>
            </div>
          </div>
        )}
      </Paper>
    </div>
  ) : (
    <div className="ml-[56px]">
      <h1 className="text-[#374151] font-semibold text-2xl flex flex-row gap-3">
        <svg
          onClick={() => {
            setState((pre) => ({
              ...pre,
              tab: '1',
            }));
          }}
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="my-auto cursor-pointer"
        >
          <g clip-path="url(#clip0_306_3068)">
            <path
              d="M3.63605 11.2932C3.44858 11.4807 3.34326 11.735 3.34326 12.0002C3.34326 12.2653 3.44858 12.5197 3.63605 12.7072L9.29305 18.3642C9.48165 18.5463 9.73425 18.6471 9.99645 18.6449C10.2586 18.6426 10.5095 18.5374 10.6949 18.352C10.8803 18.1666 10.9854 17.9158 10.9877 17.6536C10.99 17.3914 10.8892 17.1388 10.707 16.9502L6.75705 13.0002H20C20.2653 13.0002 20.5196 12.8948 20.7072 12.7073C20.8947 12.5198 21 12.2654 21 12.0002C21 11.735 20.8947 11.4806 20.7072 11.2931C20.5196 11.1055 20.2653 11.0002 20 11.0002H6.75705L10.707 7.05018C10.8892 6.86158 10.99 6.60898 10.9877 6.34678C10.9854 6.08458 10.8803 5.83377 10.6949 5.64836C10.5095 5.46295 10.2586 5.35778 9.99645 5.35551C9.73425 5.35323 9.48165 5.45402 9.29305 5.63618L3.63605 11.2932Z"
              fill="#374151"
            />
          </g>
          <defs>
            <clipPath id="clip0_306_3068">
              <rect width="24" height="24" fill="white" />
            </clipPath>
          </defs>
        </svg>
        Order Detail
      </h1>
      <div className="mt-[42px] flex flex-wrap">
        <div className="w-3/5 border border-[#E9E9E9]  mr-8 p-6 h-fit">
          <div className="flex justify-between">
            <div className="text-[16px] text-[#374151] font-medium">
              Order ID:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold">
              #{orderDetail.id}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">
              Date order:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              <span className="mr-2">
                {dayjs(orderDetail?.updated_at).format('HH:mm')}
              </span>
              {dayjs(orderDetail?.updated_at).format('YYYY-MM-DD')}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">Name:</div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.first_name + ' ' + orderDetail.last_name}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">
              Name of company (optional):
            </div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.company_name}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">Email:</div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.email}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">
              Address:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.address}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">City:</div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.city}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">
              Code Post:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.postal_code}
            </div>
          </div>
          <div className="flex justify-between mt-3 gap-2">
            <div className="text-[16px] text-[#374151] font-medium">
              Phone Number:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold text-right">
              {orderDetail.phone_number}
            </div>
          </div>
          {/* <div className="flex justify-between mt-3">
            <div className="text-[16px] text-[#374151] font-medium">
              Estimate time:
            </div>
            <div className="text-[#603813] text-[16px] font-semibold">
              <span className="mr-2">
                {dayjs(orderDetail.delivered_at).format("HH:MM")}
              </span>
              {dayjs(orderDetail.delivered_at).format("YYYY-MM-DD")}
            </div>
          </div> */}

          <div className="text-[16px] text-[#374151] font-semibold my-8">
            Orders ({totalOrder})
          </div>
          <div className="">
            {orderDetail?.items?.map((item: any, index: number) => (
              <div
                key={index}
                className="flex flex-row justify-between pb-5 pt-4"
                style={{
                  borderBottom:
                    index !== orderDetail?.items?.length - 1
                      ? '1px solid #E9E9E9'
                      : 'none',
                }}
              >
                <div className="flex flex-row">
                  <Image
                    src={item.image ? item.image : item.product.thumbnail.url}
                    alt="item"
                    width={'60px'}
                    height={'60px'}
                  />
                  <div className="flex flex-col ml-3">
                    <div className="flex flex-row gap-5 text-[16px] text-[#374151] font-medium mb-2">
                      <div>{item.product?.name}</div>{' '}
                      <div>{'x' + item.quantity}</div>
                    </div>
                    <div className="text-[#ABABAB] text-[14px] font-medium">
                      {item.item_product_color?.length > 0
                        ? item.item_product_color[0]?.product_color?.name
                        : ''}
                      {item.item_product_color?.length > 0 &&
                        item.item_product_capacity?.length > 0 &&
                        ', '}
                      {item.item_product_capacity?.length > 0
                        ? item.item_product_capacity[0]?.product_capacity?.name
                        : ''}
                      {((item.item_product_package?.length > 0 &&
                        item.item_product_capacity?.length > 0) ||
                        (item.item_product_color?.length > 0 &&
                          item.item_product_package?.length > 0)) &&
                        ', '}
                      {item.item_product_package?.length > 0
                        ? item.item_product_package[0]?.product_package?.name
                        : ''}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <div className="text-[#603813] text-[16px] font-bold mb-1">
                    {'$ '}
                    {item.total}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="w-1/3 border border-[#E9E9E9] p-6 flex flex-col h-fit ">
          <div className="flex justify-between mb-3">
            <div className="text-[16px] text-[#374151] font-medium">
              Sub-total
            </div>
            <div className="text-[#603813] text-[16px] font-semibold">
              $ {orderDetail?.total_price_items}
            </div>
          </div>
          <div className="flex justify-between mb-1">
            <div className="text-[16px] text-[#374151] font-medium">
              Shipping
            </div>
            <div className="text-[#603813] text-[16px] font-semibold">
              $ {orderDetail.shipping_fee}
            </div>
          </div>
          <div className="text-[12px] font-normal text-[#ABABAB] mb-6">
            Not included in the price but need to include in the final invoice
            (payment)
          </div>
          <div
            className="flex justify-between pb-6 mb-4 "
            style={{ borderBottom: '1px solid #E9E9E9' }}
          >
            <div className="text-[16px] text-[#374151] font-medium">
              Discount
            </div>
            <div className="text-[#603813] text-[16px] font-semibold">
              $ {orderDetail.discount !== null ? orderDetail.discount : 0}
            </div>
          </div>
          <div
            className="flex justify-between pb-6 mb-4 "
            style={{ borderBottom: '1px solid #E9E9E9' }}
          >
            <div className="text-[16px] text-[#374151] font-medium">VAT</div>
            <div className="text-[#603813] text-[16px] font-semibold">
              <span className="mr-3 font-semibold">(5%)</span>${' '}
              {orderDetail?.tax_fee}
            </div>
          </div>
          <div className="flex justify-between mb-8">
            <div className="text-[16px] text-[#374151] font-bold">Total</div>
            <div className="flex flex-row gap-8">
              <div className="text-[#603813] text-[20px] font-bold">
                $ {orderDetail?.total}
              </div>
            </div>
          </div>
          {orderDetail?.status === 3 ? (
            <div className="flex flex-row justify-between">
              <button className="bg-[#DB1818] w-[184px] h-[48px] text-[16px] text-white font-bold rounded-lg ">
                REJECT
              </button>
              <button className="bg-[#18DB4E] w-[184px] h-[48px] text-[16px] text-white font-bold rounded-lg ">
                ACCEPT
              </button>
            </div>
          ) : orderDetail?.status === 4 ? (
            <button className="bg-[#1871DB] w-[291px] h-[48px] text-[16px] text-white font-bold rounded-lg mx-auto ">
              SWITCH TO DELIVERY
            </button>
          ) : orderDetail?.status === 5 ? (
            <div className="text-[#DB1818] text-xl font-normal ml-auto">
              Rejected
            </div>
          ) : orderDetail?.status === 7 ? (
            <button className="bg-[#18DB4E] w-full h-[48px] text-[16px] text-white font-bold rounded-lg  ">
              DONE
            </button>
          ) : (
            <div className="text-[#18DB4E] text-xl font-normal ml-auto">
              Done
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
