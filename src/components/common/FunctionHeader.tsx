import { Button, Select, Space, TextInput, Title } from '@mantine/core';
import React from 'react';
import { useLocation } from 'react-router-dom';

interface FuntionHeaderProps {
  onCreateNew: () => void;
  title: string;
  onSelectSubCategories: (v: string) => void;
  onSelectSubSubCategories?: (v: string) => void;
  onSelectStatus: (v: string) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  subCategory: { value: string; label: string }[];
  subSubCategory: { value: string; label: string }[];
  subCategorySelected?: string;
  subSubCategorySelected?: string;
}
const FunctionHeader = (props: FuntionHeaderProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <div>
      <Button
        radius="md"
        bg={' #B82C67'}
        onClick={props.onCreateNew}
        rightIcon={<img src="/plus.svg" alt="icon" />}
        sx={{ float: 'right' }}
      >
        Nouveau Produit
      </Button>
      <Space h="md" />
      <Title c="pink" order={3} mb={4}>
        {props.title}
      </Title>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex' }}>
          {currentPath !== '/voucher_manager' && (
            <>
              <Select
                data={props.subCategory}
                label="Sub-category"
                variant="unstyled"
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                onChange={props.onSelectSubCategories}
                value={props?.subCategorySelected}
                bg={'#FFE7EF'}
                w={'200px'}
                h={'3.625rem'}
                sx={{
                  padding: '8px 16px  ',
                  borderRadius: '5px',
                  marginRight: '72px',
                  whiteSpace: 'normal',
                  '.mantine-bkyer9': {
                    height: 20,
                    minHeight: 0,
                  },
                  '.mantine-1fzet7j': {
                    fontSize: 12,
                  },
                }}
              />

              <Select
                data={props.subSubCategory}
                label="Sub-sub-category"
                variant="unstyled"
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                onChange={props.onSelectSubSubCategories}
                value={props?.subSubCategorySelected}
                bg={'#FFE7EF'}
                w={'200px'}
                h={'3.625rem'}
                sx={{
                  padding: '2px 10px 0 ',
                  borderRadius: '5px',
                  marginRight: '72px',
                }}
              />
            </>
          )}
          <Select
            data={[
              { value: 'all', label: 'All' },
              { value: 'Active', label: 'Active' },
              { value: 'Inactive', label: 'Inactive' },
              { value: 'Stockout', label: 'Stockout' },
            ]}
            onChange={props.onSelectStatus}
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            variant="unstyled"
            label="Status"
            bg={'#FFE7EF'}
            w={'21.375rem'}
            h={'3.625rem'}
            sx={{
              padding: '2px 10px 0 ',
              borderRadius: '5px',
            }}
          />
        </div>

        <div>
          <span style={{ color: '#B82C67', marginBottom: '10px' }}>
            Search for product
          </span>

          <TextInput
            rightSection={<img src="/search.svg" alt="icon" />}
            variant="unstyled"
            sx={{
              border: '1px solid #B82C67',
              padding: '0 5px',
              borderRadius: '5px',
              width: '347px',
            }}
            onChange={props.onSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default FunctionHeader;
