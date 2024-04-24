import { Dropzone, FileWithPath, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import React from 'react';
import {
  Box,
  Button,
  ColorInput,

  // ColorPicker,
  Paper,
  TextInput,
  Title,
} from '@mantine/core';
import ImagePreview from './ImagePreview';
type attributeCardProps = {
  onAddImage: (file: FileWithPath[]) => void;
  attributeType?: string;
  attributePrice?: number;
  onCancel?: () => void;
  
  productImage: string;
  attributeIndex?: number;
  attributeTitle: string;
  onPriceChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onColorChange?: (e: string) => void;
  onAttributeChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: () => void;
  onReplaceImage: (file: File) => void;
  defaultColor?: string;
  attributeName?: string;
};

const AttributeCards: React.FC<attributeCardProps> = ({
  attributeType,
  attributePrice,
  onAddImage,
  onCancel,
  productImage,
  attributeIndex,
  attributeTitle,
  onPriceChange,
  onColorChange,
  onRemoveImage,
  onReplaceImage,
  onAttributeChange,
  defaultColor,
  attributeName,
}) => {
  // const [chooseColor, setChooseColor] = React.useState(false);
  // const [color, setColor] = React.useState('');
  return (
    <Paper w={'14.4375rem'} h={'17.75rem'} bg={'#fff8f8'} radius={'sm'}>
      {productImage ? (
        <ImagePreview
          remove={false}
          image={productImage}
          onRemove={onRemoveImage}
          onReplace={onReplaceImage}
          imageWidth={'14.4375rem'}
          imageHeight={'8.75rem'}
        />
      ) : (
        <Dropzone
          onDrop={onAddImage}
          bg={'#fff8f8'}
          h={'8.75rem'}
          maxSize={3 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
        >
          <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
            <img src={'/add_image_ic.svg'} width={32} height={32} alt={'img'} />
            <p style={{ fontSize: '13px' }}>Ajouter une photo</p>
          </div>
        </Dropzone>
      )}
      <Box p={'0.5rem 1rem'}>
        <Title order={5} c={'#B82C67'}>
          Type-{attributeIndex}
        </Title>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box>
            <span style={{ color: '#7C7C7C', fontSize: '12px' }}>
              {attributeTitle}
            </span>

            {attributeTitle.toLowerCase() === 'colour' ? (
              <ColorInput
                withEyeDropper={false}
                variant="unstyled"
                onChange={onColorChange}
                defaultValue={defaultColor}
              />
            ) : (
              <TextInput
                type="text"
                h={'1.5rem'}
                w={'6.8125rem'}
                mb={'0.85rem'}
                onChange={onAttributeChange}
                defaultValue={attributeName}
              />
            )}
          </Box>
          <Box ml={'1rem'} mb={'0.85rem'}>
            <span style={{ color: '#7C7C7C', fontSize: '12px' }}>
              Price plus
            </span>
            <TextInput
              rightSection={'€'}
              h={'1.5rem'}
              w={'5rem'}
              onChange={onPriceChange}
              type="number"
              defaultValue={attributePrice}
              min={0}
            />
          </Box>
        </div>
        {attributeType === 'edit' ? (
          <div style={{ float: 'right' }}>
            <Button variant={'subtle'} onClick={onCancel}>
              <span style={{ color: '#333' }}>Delete</span>
            </Button>
          </div>
        ) : (
          <Box sx={{ float: 'right' }} mt={'5px'}>
            <Button variant={'subtle'} onClick={onCancel}>
              <span style={{ color: '#333' }}>Delete</span>
            </Button>
        
          </Box>
        )}
      </Box>
    </Paper>
  );
};

export default AttributeCards;
