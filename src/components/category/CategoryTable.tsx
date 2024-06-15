import {
  Paper,
  ScrollArea,
  Space,
  Table,
  UnstyledButton,
  createStyles,
  rem,
} from '@mantine/core';

import { DragDropContext, Draggable, Droppable } from '@hello-pangea/dnd';
import { UseListStateHandlers } from '@mantine/hooks';
import { CategoryType } from '../../utils/utilsInterface';

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
  openEditModal?: (value: number) => void;
  total?: number;
  categoryData: CategoryType[];
  handlers: UseListStateHandlers<CategoryType>;
  optionSelected: string | any;
};

const CategoryTable = ({
  categoryData,
  openEditModal,
  total = 0,
  handlers,
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
            <DragDropContext
              onDragEnd={({ destination, source }) =>
                handlers.reorder({
                  from: source.index,
                  to: destination?.index || 0,
                })
              }
            >
              <Droppable droppableId="dnd-list" direction="vertical">
                {(provided) => (
                  <tbody {...provided.droppableProps} ref={provided.innerRef}>
                    {categoryData?.map((item, index) => (
                      <Draggable
                        key={item.id}
                        index={index}
                        draggableId={item.id?.toString() || ''}
                      >
                        {(provided) => (
                          <tr
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                          >
                            <td
                              style={{
                                textAlign: 'center',
                                width: 100,
                              }}
                              {...provided.dragHandleProps}
                            >
                              <svg
                                width="24"
                                height="24"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M4 13H20V15H4V13ZM4 9H20V11H4V9ZM15 17H9L12 20L15 17ZM9 7H15L12 4L9 7Z"
                                  fill="#606060"
                                />
                              </svg>
                            </td>

                            {optionSelected === 'category' && (
                              <td>
                                <img src={item.image?.url} width={40} alt="" />
                              </td>
                            )}
                            {optionSelected === 'sub-subcategory' && (
                              <td>Sub-sub-category</td>
                            )}
                            {optionSelected !== 'category' && (
                              <td>Sub-category</td>
                            )}
                            <td>{item.name}</td>
                            <td>123</td>
                            <td>
                              <UnstyledButton>
                                <img src="/pen.svg" alt="icon" />
                              </UnstyledButton>
                            </td>
                            <td>
                              <UnstyledButton>
                                <img src="/delete_btn.svg" alt="icon" />
                              </UnstyledButton>
                            </td>
                          </tr>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </tbody>
                )}
              </Droppable>
            </DragDropContext>
          </Table>
        </Paper>
      </ScrollArea>
      <Space h="md" />
    </div>
  );
};

export default CategoryTable;
