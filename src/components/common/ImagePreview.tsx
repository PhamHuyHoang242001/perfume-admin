import { ActionIcon, FileButton, Group, BackgroundImage } from '@mantine/core';
import { IconPencil, IconX } from '@tabler/icons-react';

interface ImagePreviewProps {
  image: string;
  onRemove?: () => void;
  onReplace: (e: File) => void;
  imageWidth: number | string;
  imageHeight: number | string;
  remove: boolean;
}
const ImagePreview = (props: ImagePreviewProps) => {
  return (
    <BackgroundImage
      src={props.image}
      radius={'sm'}
      w={props.imageWidth}
      h={props.imageHeight}
      className="image_preview"
    >
      <Group spacing={'xs'} align="center" position="right">
        <FileButton onChange={props.onReplace}>
          {(props) => (
            <ActionIcon
              {...props}
              variant="filled"
              bg="rgba(0, 0, 0, 0.40)"
              radius={'xl'}
            >
              <IconPencil color="#fff" size={'1rem'} />
            </ActionIcon>
          )}
        </FileButton>
        {props.remove && (
          <ActionIcon
            onClick={props.onRemove}
            variant="filled"
            radius={'xl'}
            bg="rgba(0, 0, 0, 0.40)"
          >
            <IconX size={'1rem'} color="#fff" />
          </ActionIcon>
        )}
      </Group>
    </BackgroundImage>
  );
};

export default ImagePreview;
