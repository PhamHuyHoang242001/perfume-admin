import { Button, Select, Space, Title, TextInput } from '@mantine/core';
import { useLocation } from 'react-router-dom';
import React from 'react';
interface FuntionHeaderProps {
  onCreateNew: () => void;
  title: string;
  onSelectCategories: (v: string) => void;
  onSelectStatus: (v: string) => void;
  onSearch: (e: React.ChangeEvent<HTMLInputElement>) => void;
  categoriesData: { value: string; label: string }[];
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
            <Select
              data={props.categoriesData}
              label="Categories"
              variant="unstyled"
              rightSection={<img alt="icon" src="/down_arrow.svg" />}
              onChange={props.onSelectCategories}
              bg={'#FFE7EF'}
              w={'21.375rem'}
              h={'3.625rem'}
              sx={{
                padding: '2px 10px 0 ',
                borderRadius: '5px',
                marginRight: '72px',
              }}
            />
          )}
          <Select
            data={[
              { value: 'all', label: 'Totalité' },
              { value: 'Active', label: 'Actif' },
              { value: 'Inactive', label: 'Inactif' },
              { value: 'Stockout', label: 'Rupture De Stock' },
            ]}
            onChange={props.onSelectStatus}
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            variant="unstyled"
            label="Statut"
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
