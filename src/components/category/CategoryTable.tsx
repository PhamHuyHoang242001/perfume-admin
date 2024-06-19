import { Paper, ScrollArea, Space, Table, UnstyledButton } from '@mantine/core';
import { ModalType } from '../../pages/CategoryPage';
import { CategoryType } from '../../utils/utilsInterface';

type CategoryTableProps = {
  handleOpenModal: (type: ModalType, value: any | null) => void;
  total?: number;
  categoryData: CategoryType[];
  optionSelected: string | any;
};

const CategoryTable = ({
  categoryData,
  handleOpenModal,
  optionSelected,
}: CategoryTableProps) => {
  return (
    <div>
      <ScrollArea h={500} mt={'3rem'}>
        <Paper shadow="md" radius="md" sx={{ border: '1px solid #B82C67' }}>
          <Table sx={{ borderRadius: '0.65em', overflow: 'hidden' }}>
            <thead>
              <tr
                style={{
                  textAlign: 'center',
                  color: '#B82C67',
                  backgroundColor: '#FFE2EC',
                  height: '60px',
                  fontWeight: 600,
                }}
              >
                <td style={{ width: 100 }}>Order</td>
                {optionSelected === 'category' && <td>Image</td>}
                {optionSelected === 'sub-subcategory' && (
                  <td>Sub-sub-category</td>
                )}
                {optionSelected !== 'category' && <td>Sub-category</td>}
                <td>Category</td>
                <td>Status</td>
                <td>Update</td>
                <td>Delete</td>
              </tr>
            </thead>

            <tbody>
              {categoryData?.map((item, index) => (
                <tr
                  style={{
                    background: index % 2 !== 0 ? '#FFE2EC80' : '',
                  }}
                  className="h-[60px] hover:bg-[#FFE2EC80]"
                >
                  <td
                    style={{
                      textAlign: 'center',
                      width: 100,
                    }}
                  >
                    {index + 1}
                  </td>

                  {optionSelected === 'category' && (
                    <td>
                      <img
                        src={item.image?.url}
                        className="block mx-auto text-center"
                        width={40}
                        alt=""
                      />
                    </td>
                  )}
                  {optionSelected === 'sub-subcategory' && (
                    <td className="text-center">Sub-sub-category</td>
                  )}
                  <td>{item.name}</td>

                  {optionSelected !== 'category' && (
                    <td className="text-center">{item?.category?.name}</td>
                  )}
                  <td className="text-center">123</td>
                  <td className="text-center">
                    <UnstyledButton
                      onClick={() => handleOpenModal('EDIT', item || null)}
                    >
                      <img src="/pen.svg" alt="icon" />
                    </UnstyledButton>
                  </td>
                  <td className="text-center">
                    <UnstyledButton
                      onClick={() => handleOpenModal('DELETE', item || null)}
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
    </div>
  );
};

export default CategoryTable;
