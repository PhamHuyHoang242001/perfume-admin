import { Select, Title } from '@mantine/core';
import { itemSelectType } from '../../utils/utilsInterface';
const listOption = [
  {
    value: 'category',
    label: 'Category',
  },
  {
    value: 'subcategory',
    label: 'Sub-category',
  },
  {
    value: 'sub-subcategory',
    label: 'Sub-sub-category',
  },
];

type HeaderCategoryPropsType = {
  optionSelected: string;
  categorySelected?: string | null;
  subCategorySelected?: string | null;
  subSubCategorySelected?: string | null;
  handleChange: (type: 'category' | 'sub', value: string) => void;
  listSubCategory: itemSelectType;
  listCategory: itemSelectType;
};

const HeaderCategory = ({
  optionSelected,
  subCategorySelected,
  categorySelected,
  handleChange,
  listSubCategory,
  listCategory,
}: HeaderCategoryPropsType) => {
  return (
    <div style={{ marginTop: 30 }}>
      <Title c="pink" order={3} mb={4}>
        Category
      </Title>
      <div style={{ display: 'flex', gap: 30 }}>
        {optionSelected !== 'category' && (
          <Select
            data={listCategory as any}
            label="Category"
            variant="unstyled"
            value={categorySelected}
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            bg={'#FFE7EF'}
            onChange={(v) => {
              handleChange('category', v || '');
            }}
            w={'342px'}
            h={'3.625rem'}
            sx={{
              borderRadius: '5px',
              marginRight: '20px',
              whiteSpace: 'normal',
              '.mantine-bkyer9': {
                height: 20,
                minHeight: 0,
                fontWeight: 500,
                paddingLeft: 16,
              },
              '.mantine-1fzet7j': {
                fontSize: 12,
                color: '#858585',
                paddingLeft: 16,
                paddingTop: 8,
              },
            }}
          />
        )}
        {optionSelected === 'sub-subcategory' && (
          <Select
            data={listSubCategory as any}
            label="Sub-category"
            onChange={(v) => handleChange('sub', v || '')}
            value={subCategorySelected}
            variant="unstyled"
            rightSection={<img alt="icon" src="/down_arrow.svg" />}
            bg={'#FFE7EF'}
            w={'342px'}
            h={'3.625rem'}
            sx={{
              borderRadius: '5px',
              marginRight: '20px',
              whiteSpace: 'normal',
              '.mantine-bkyer9': {
                height: 20,
                minHeight: 0,
                fontWeight: 500,
                paddingLeft: 16,
              },
              '.mantine-1fzet7j': {
                fontSize: 12,
                color: '#858585',
                paddingLeft: 16,
                paddingTop: 8,
              },
            }}
          />
        )}

        <Select
          data={listOption}
          label="Status"
          variant="unstyled"
          rightSection={<img alt="icon" src="/down_arrow.svg" />}
          bg={'#FFE7EF'}
          w={'342px'}
          h={'3.625rem'}
          sx={{
            borderRadius: '5px',
            marginRight: '20px',
            whiteSpace: 'normal',
            '.mantine-bkyer9': {
              height: 20,
              minHeight: 0,
              fontWeight: 500,
              paddingLeft: 16,
            },
            '.mantine-1fzet7j': {
              fontSize: 12,
              color: '#858585',
              paddingLeft: 16,
              paddingTop: 8,
            },
          }}
        />
      </div>
    </div>
  );
};

export default HeaderCategory;
