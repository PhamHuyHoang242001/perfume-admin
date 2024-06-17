import { Modal, Title } from '@mantine/core';
import { ModalType } from '../../pages/CategoryPage';

type ModalContentProps = {
  opened: boolean;
  close: () => void;
  typeModal: ModalType | null;
};

const ModalContent = ({ opened, close, typeModal }: ModalContentProps) => {
  return (
    <Modal.Root
      opened={opened}
      onClose={close}
      closeOnClickOutside={false}
      size={'auto'}
    >
      <Modal.Overlay />
      <Modal.Content>
        <Modal.Header>
          <Modal.Title>
            <Title c={'#B82C67'} order={1} mt={32} ml={64}>
              {typeModal === 'ADD'
                ? 'Add new product'
                : typeModal === 'EDIT'
                ? 'Update product'
                : 'Delete product'}
            </Title>
          </Modal.Title>
          <Modal.CloseButton>
            <img src={'/close.svg'} alt={'icon'} />
          </Modal.CloseButton>
        </Modal.Header>
        <Modal.Body></Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ModalContent;
