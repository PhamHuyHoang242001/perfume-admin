import { Button, TextInput, Title } from '@mantine/core';
import { ModalType } from '../../pages/CategoryPage';
import { itemSelectType } from '../../utils/utilsInterface';
import { CustomSelectMultiple } from '../CustomSelectMultiple';

type HeaderCategoryPropsType = {
  optionSelected: string;
  categorySelected?: string[] | [];
  subCategorySelected?: string[] | [];
  handleChange: (type: 'category' | 'sub', value: string[]) => void;
  listSubCategory: itemSelectType;
  listCategory: itemSelectType;
  handleSearch: () => void;
  searchValue: string;
  onSearch: (value: React.ChangeEvent<HTMLInputElement>) => void;
  handleOpenModal: (type: ModalType) => void;
};

const HeaderCategory = ({
  optionSelected,
  subCategorySelected,
  categorySelected,
  handleChange,
  listSubCategory,
  listCategory,
  handleSearch,
  searchValue,
  onSearch,
  handleOpenModal,
}: HeaderCategoryPropsType) => {
  return (
    <div style={{ marginTop: 30 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Title c="pink" order={3} mb={4}>
          Category
        </Title>
        <Button
          radius="md"
          bg={' #B82C67'}
          rightIcon={<img src="/plus.svg" alt="icon" />}
          sx={{ fontWeight: 500 }}
          onClick={() => handleOpenModal('ADD')}
        >
          Add
        </Button>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', gap: 30 }}>
          {optionSelected !== 'category' && (
            <CustomSelectMultiple
              data={listCategory as any}
              value={categorySelected as string[]}
              label="Category"
              onChange={(v) => {
                handleChange('category', v);
              }}
            />
          )}
          {optionSelected === 'sub-subcategory' && (
            <CustomSelectMultiple
              data={listSubCategory as any}
              value={subCategorySelected as string[]}
              label="Sub-Category"
              onChange={(v) => {
                handleChange('sub', v);
              }}
            />
          )}
        </div>
        <div>
          <span style={{ color: '#B82C67', marginBottom: '4px', fontSize: 12 }}>
            Search
          </span>

          <TextInput
            rightSection={
              <img
                src="/search.svg"
                alt="icon"
                style={{ zIndex: 100, cursor: 'pointer' }}
                onClick={handleSearch}
              />
            }
            w={'320px'}
            variant="unstyled"
            sx={{
              border: '1px solid #B82C67',
              padding: '0 5px',
              borderRadius: '5px',
              maxWidth: '347px',
              height: 32,
              minHeight: 32,
              fontSize: 14,
              '.mantine-1v7s5f8, .mantine-nilrrg': {
                height: 32,
              },
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearch();
            }}
            value={searchValue}
            onChange={onSearch}
          />
        </div>
      </div>
    </div>
  );
};

export default HeaderCategory;
