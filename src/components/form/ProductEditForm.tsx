import {
  ActionIcon,
  Box,
  Button,
  Container,
  Grid,
  Group,
  NumberInput,
  Select,
  Stack,
  Tabs,
  TextInput,
  Title,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm, yupResolver } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { GetColorName } from 'hex-color-to-color-name';
import { useEffect, useState } from 'react';
import * as yup from 'yup';
import { apiRoute } from '../../utils/apiRoute';
import { GET, PATCH, instance } from '../../utils/fetch';
import {
  CategoryType,
  IAttribute,
  IProductForm,
} from '../../utils/utilsInterface';
import AttributeCards from '../common/AttributeCards';
import ImagePreview from '../common/ImagePreview';
import TextEditor from '../common/TextEditor';

type ProductFormProps = {
  listCategory: CategoryType[];
  onSuccess: () => void;
  id: number;
};

const schema = yup.object().shape({
  name: yup.string().required('Name of product is required'),
  price: yup
    .string()
    .min(1, 'Price must be greater than 0 or equal to 1')
    .required('Price is required')
    .test({
      name: 'greaterThanZero',
      message: 'Price must be greater than 0',
      test: function (value) {
        const priceNumber = parseFloat(value);
        return !isNaN(priceNumber) && priceNumber > 0;
      },
    })
    .test({
      name: 'decimalPlaces',
      exclusive: false,
      message: 'Price must have at most 2 decimal places',
      test: function (currentPrice) {
        if (!currentPrice) {
          return true; // Skip validation if value is missing
        }
        const decimalPlaces =
          currentPrice.toString().split('.')[2]?.length || 0;
        return decimalPlaces <= 2;
      },
    })
    .typeError('Invalid number'),
  current_price: yup.string().when('price', (_price, schema) => {
    return schema
      .test({
        name: 'currentPriceLessThanPrice',
        exclusive: false,
        message: 'Sale price must be less than price',
        test: function (currentPrice) {
          const { parent } = this;
          const priceValue = parent.price;
          if (!currentPrice || !priceValue) {
            return true; // Skip validation if either value is missing
          }
          return parseFloat(currentPrice) < parseFloat(priceValue);
        },
      })
      .test({
        name: 'decimalPlaces',
        exclusive: false,
        message: 'Sale price must have at most 2 decimal places',
        test: function (currentPrice) {
          if (!currentPrice) {
            return true; // Skip validation if value is missing
          }
          const decimalPlaces =
            currentPrice.toString().split('.')[2]?.length || 0;

          return decimalPlaces <= 2;
        },
      })
      .typeError('Invalid number')
      .max(999999.99, 'Sale price must be less than 999999.99');
  }),
  mass: yup.string().required('Mass is required'),
  quantity: yup.string().required('Quantity is required'),
  image: yup.mixed().required('Image is required'),
});

const ProductEditForm = ({ listCategory, onSuccess, id }: ProductFormProps) => {
  const [state, setState] = useState({
    subCategory: [] as any,
    subsubCategory: [] as any,
    categories: listCategory?.map((item) => ({
      value: item.id,
      label: item.name,
      ...item,
    })),
    attributes: [],
    url_image: '',
    progress: 0,
    isLoading: false,
    isLoadingImage: false,
    colorAttribute: [] as IAttribute[],
    capacityAttribute: [] as IAttribute[],
    packageAttribute: [] as IAttribute[],
    tabSelected: '1' as string,
    messageError: '' as string,
    createdDay: '',
  });
  const {
    isLoading,
    url_image,
    subCategory,
    subsubCategory,
    categories,
    colorAttribute,
    capacityAttribute,
    packageAttribute,
    tabSelected,
    messageError,
    createdDay,
  } = state;

  const form = useForm<IProductForm | any>({
    validate: yupResolver(schema),
    validateInputOnBlur: true,
    initialValues: {
      name: '',
      status: 'Active',
      price: '',
      current_price: '',
      url_image: '',
      note: {
        characteristics: '',
        use: '',
        description: '',
        composition: '',
      },
      category_id: '',
      quantity: 1,
    },
  });
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      form.setFieldValue('note.description', content);
    },
  });
  const editor1 = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      form.setFieldValue('note.characteristics', content);
    },
  });
  const editor2 = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      form.setFieldValue('note.use', content);
    },
  });
  const editor3 = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
    ],
    onUpdate: ({ editor }) => {
      const content = editor.getHTML();
      form.setFieldValue('note.composition', content);
    },
  });

  const getDetailProduct = async () => {
    try {
      const res = await GET(apiRoute.detail_product + id);

      if (res.status === 200) {
        form.setValues({
          name: res.data?.name,
          mass: res.data?.mass,
          category_id: res.data?.category?.id,
          subcategory_id: res.data?.sub_subcategory?.id || '',
          sub_subcategory_id: res.data?.sub_subcategory?.id || '',
          current_price: res.data?.current_price || '',
          image: res.data?.images?.[0]?.url,
          price: res.data?.price,
          id: res.data?.id,
        });

        const listSubCategoryCurr = listCategory
          .find((item) => item.id === res.data?.category?.id)
          ?.subcategories?.map((item) => ({
            value: item.id,
            label: item.name,
            ...item,
          }));

        const listSubSubCate = listSubCategoryCurr
          ?.find((item) => item.id === res.data?.subcategory?.id)
          ?.sub_subcategories?.map((item) => ({
            value: item.id,
            label: item.name,
            ...item,
          }));

        setState((prev) => ({
          ...prev,
          capacityAttribute: res?.data?.capacity,
          packageAttribute: res?.data?.package,
          colorAttribute: res?.data?.color,
          url_image: res.data?.images?.[0]?.url,
          subCategory: listSubCategoryCurr || [],
          subsubCategory: listSubSubCate || [],
          createdDay: res.data?.created_ad,
        }));
      }
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const handlePostImage = async (image: File) => {
    if (!image) return null;

    try {
      setState((prev) => ({ ...prev, isLoadingImage: true }));
      const formData = new FormData();

      formData.append('name', image?.name);
      formData.append('source ', 'product');
      formData.append('file', image);

      const resFile = await instance.post(apiRoute.upload_image, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setState((prev) => ({ ...prev, isLoadingImage: false }));

      return resFile.data;
    } catch (error) {
      setState((prev) => ({ ...prev, isLoadingImage: false }));
    }
  };

  async function handleUpdateProduct(value: IProductForm) {
    try {
      if (isLoading) return;
      setState((prev) => ({ ...prev, isLoading: true }));
      if (typeof value?.image === 'object') {
        const resFile = await handlePostImage(value.image);

        if (resFile.id) {
          value.image_ids = [resFile.id];
        }
      }

      if (!value?.subcategory_id) {
        delete value.subcategory_id;
      }

      if (!value?.sub_subcategory_id) {
        delete value.sub_subcategory_id;
      }

      if (colorAttribute?.length > 0) {
        value.color = colorAttribute;
      }

      if (capacityAttribute?.length > 0) {
        value.capacity = capacityAttribute;
      }
      if (packageAttribute?.length > 0) {
        value.package = packageAttribute;
      }

      const res = await PATCH(
        apiRoute.detail_product + value?.id + '/patch/',
        value,
      );

      if (res.status === 200) {
        onSuccess();
        notifications.show({
          message: 'Add new product successfully',
          color: 'green',
        });
      } else {
        notifications.show({
          message: 'Something went wrong',
          color: 'red',
        });
      }
      setState((prev) => ({ ...prev, isLoading: false }));
    } catch (error) {
      notifications.show({
        message: `${error}`,
        color: 'red',
      });
      setState((prev) => ({ ...prev, isLoading: true }));
    }
  }

  const handleChangeTab = (tab: string) => {
    const attributes = [colorAttribute, capacityAttribute, packageAttribute];
    const selectedIndex = +tabSelected - 1; // Assuming tabSelected starts from 1

    if (
      selectedIndex >= 0 &&
      selectedIndex < attributes.length &&
      attributes[selectedIndex].length > 0
    ) {
      const isError = attributes[selectedIndex].some((item) => !item.name);
      if (isError) {
        setState((prev) => ({
          ...prev,
          messageError: `Please fill the attributes of the ${
            tabSelected === '1'
              ? 'color'
              : tabSelected === '2'
              ? 'capacity'
              : 'package'
          }`,
        }));
        return;
      }
    }

    setState((prev) => ({ ...prev, tabSelected: tab }));
  };

  useEffect(() => {
    if (id) getDetailProduct();
  }, [id]);

  return (
    <div>
      <form
        onSubmit={form.onSubmit((v) => handleUpdateProduct(v))}
        style={{ padding: '32px 64px', fontSize: 12 }}
      >
        <Stack spacing={'lg'}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>
                Name of product <span style={{ color: '#FF0000' }}>*</span>
              </span>
              <TextInput
                p={'0 10px'}
                h={36}
                variant={'unstyled'}
                key="name"
                width={313}
                maxLength={100}
                mt={'8px'}
                {...form.getInputProps('name')}
                sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              />
            </div>
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>Creation date</span>
              <div className={'badge_child'}>
                <p>{createdDay}</p>
              </div>
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>Status</span>
              <div className={'badge_child'}>
                <p>Active</p>
              </div>
            </div>{' '}
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 16,
            }}
          >
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>
                Category <span style={{ color: '#FF0000' }}>*</span>
              </span>
              <Select
                width="19.5625rem"
                height="2.25rem"
                data={categories as any}
                variant="unstyled"
                value={form.values?.category_id as any}
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                bg={'#FFE7EF'}
                sx={{
                  borderRadius: 4,
                  marginTop: 8,
                  '.mantine-bkyer9': {
                    fontSize: 12,
                  },
                }}
                onChange={(v) => {
                  form.setFieldValue('category_id', v as any);
                  const newSubCate = listCategory.find(
                    (item) => v && item?.id && +item.id === +v,
                  );
                  const convertList =
                    newSubCate?.subcategories?.map((item) => ({
                      value: item.id,
                      label: item.name,
                      ...item,
                    })) || [];
                  setState((prev) => ({
                    ...prev,
                    subCategory: convertList,
                  }));
                  form.values?.subcategory_id &&
                    form.setFieldValue('subcategory_id', null);
                  form.values?.sub_subcategory_id &&
                    form.setFieldValue('sub_subcategory_id', null);
                  subsubCategory &&
                    setState((prev) => ({
                      ...prev,
                      subsubCategory: [],
                    }));
                }}
              />
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>Sub-category</span>
              <Select
                width="19.5625rem"
                height="2.25rem"
                data={subCategory as any}
                value={form.values?.subcategory_id as any}
                variant="unstyled"
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                bg={'#FFE7EF'}
                sx={{
                  borderRadius: 4,
                  marginTop: 8,
                  '.mantine-bkyer9': {
                    fontSize: 12,
                  },
                }}
                onChange={(v) => {
                  form.setFieldValue('subcategory_id', v as any);
                  const newSubCate = subCategory.find(
                    (item: any) => v && +item.value === +v,
                  ) as any;
                  form.values?.sub_subcategory_id &&
                    form.setFieldValue('sub_subcategory_id', null);
                  const convertList =
                    newSubCate?.sub_subcategories?.map((item: any) => ({
                      value: item.id,
                      label: item.name,
                    })) || [];
                  setState((prev) => ({
                    ...prev,
                    subsubCategory: convertList,
                  }));
                }}
              />
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#707070' }}>Sub-sub-category</span>
              <Select
                width="19.5625rem"
                height="2.25rem"
                data={subsubCategory as any}
                value={form.values?.sub_subcategory_id as any}
                variant="unstyled"
                rightSection={<img alt="icon" src="/down_arrow.svg" />}
                bg={'#FFE7EF'}
                sx={{
                  borderRadius: 4,
                  marginTop: 8,
                  '.mantine-bkyer9': {
                    fontSize: 12,
                  },
                }}
                onChange={(v) => {
                  form.setFieldValue('sub_subcategory_id', v as any);
                }}
              />
            </div>{' '}
          </div>

          <Group spacing={'xl'}>
            <div>
              <h4 style={{ color: '#B82C67', fontSize: 16 }}>Product image</h4>
              {url_image ? (
                <>
                  <ImagePreview
                    imageWidth={174}
                    imageHeight={174}
                    remove={false}
                    image={url_image}
                    onReplace={(file) => {
                      if (file) {
                        setState((p) => ({
                          ...p,
                          url_image: URL.createObjectURL(file),
                        }));
                        form.setFieldValue('image', file);
                      }
                    }}
                  />
                </>
              ) : (
                <Dropzone
                  loading={isLoading}
                  onDrop={(file) => {
                    file?.[0] &&
                      setState((p) => ({
                        ...p,
                        url_image: URL.createObjectURL(file?.[0]),
                      }));
                    form.setFieldValue('image', file?.[0]);
                  }}
                  w={174}
                  multiple={false}
                  h={174}
                  pt={'50px'}
                  accept={IMAGE_MIME_TYPE}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={'/add_image_ic.svg'}
                      width={32}
                      height={32}
                      alt={'img'}
                    />
                    <p style={{ fontSize: '13px' }}>Add image</p>
                  </div>
                </Dropzone>
              )}
            </div>
          </Group>
          {form.errors?.image && (
            <span
              style={{
                color: '#ff0000',
              }}
            >
              {form.errors?.image}
            </span>
          )}
          <div>
            <Title align={'center'} order={2} c={'#B82C67'} mt={'4rem'}>
              Product detail
            </Title>

            <Grid gutter={7} gutterXs="md" gutterMd="xl" gutterXl={50}>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A', fontSize: 16 }}>Price</h4>
                <div style={{ display: 'grid', gap: 16 }}>
                  <div
                    className={'badge'}
                    style={{
                      minHeight: 'fit-content',
                    }}
                  >
                    <span style={{ color: '#707070' }}>
                      Price of product ($){' '}
                      <span style={{ color: '#FF0000' }}>*</span>
                    </span>
                    <NumberInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={472}
                      h={36}
                      pl={10}
                      mt={8}
                      maxLength={9}
                      max={999999999}
                      variant={'unstyled'}
                      precision={2}
                      decimalSeparator="."
                      {...form.getInputProps('price')}
                      min={0}
                    />
                  </div>
                  <div className={'badge'}>
                    <span style={{ color: '#707070' }}>Sale price ($) </span>
                    <NumberInput
                      min={0}
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={472}
                      h={36}
                      pl={10}
                      mt={8}
                      maxLength={9}
                      variant={'unstyled'}
                      precision={2}
                      decimalSeparator="."
                      {...form.getInputProps('current_price')}
                      value={form.values?.current_price || 0}
                    />
                  </div>
                </div>
              </Grid.Col>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A', fontSize: 16 }}>Quantity </h4>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <span style={{ color: '#707070' }}>
                      Mass (g) <span style={{ color: '#FF0000' }}>*</span>{' '}
                    </span>
                    <NumberInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      variant={'unstyled'}
                      precision={2}
                      decimalSeparator="."
                      min={0}
                      {...form.getInputProps('mass')}
                      value={form.values?.mass || 0}
                    />
                  </div>
                  <div>
                    <span style={{ color: '#707070' }}>
                      Quantity <span style={{ color: '#FF0000' }}>*</span>{' '}
                    </span>
                    <NumberInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      type="number"
                      maxLength={9}
                      variant={'unstyled'}
                      min={1}
                      {...form.getInputProps('quantity')}
                    />
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </div>
          <div>
            <h4 style={{ color: '#E7639A', marginBottom: '5px', fontSize: 16 }}>
              Attribute
            </h4>
            <Tabs
              value={tabSelected}
              onTabChange={(tab: string) => {
                handleChangeTab(tab);
              }}
            >
              <div style={{ width: '18.75rem' }}>
                <Tabs.List>
                  <Tabs.Tab value={'1'}>Color</Tabs.Tab>
                  <Tabs.Tab value={'2'}>Capacity</Tabs.Tab>
                  <Tabs.Tab value={'3'}>Package</Tabs.Tab>
                </Tabs.List>
              </div>
              <Tabs.Panel value={'1'}>
                <div style={{ display: 'flex' }}>
                  <img src={'/warning.svg'} alt={'icon'} />
                  <p
                    style={{
                      color: '#d72525',
                      fontSize: '13px',
                      marginLeft: '5px',
                      fontStyle: 'italic',
                    }}
                  >
                    The default value is the price of the product.
                  </p>
                </div>
                <ActionIcon
                  value={'filled'}
                  radius={'xl'}
                  bg={'#FFE7EF'}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      colorAttribute: [
                        ...colorAttribute,
                        { image: '', name: '', price: 0 },
                      ],
                    }))
                  }
                  disabled={colorAttribute.length >= 4}
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt={'1rem'}>
                  <Group>
                    {colorAttribute?.map((item: IAttribute, index: number) => (
                      <div key={index}>
                        <AttributeCards
                          onReplaceImage={async (file) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );

                            const image = await handlePostImage(file);
                            const addImage = {
                              ...colorAttribute[currentIndex],
                              image: image,
                              image_id: image?.id,
                            };
                            const newImage = [
                              ...colorAttribute.slice(0, currentIndex),
                              addImage,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];
                            setState((p) => ({
                              ...p,
                              colorAttribute: newImage,
                            }));
                          }}
                          onRemoveImage={() => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );

                            const addPrice = {
                              ...colorAttribute[currentIndex],
                              image: '',
                              imageFile: null,
                            };
                            const emptyImage = [
                              ...colorAttribute.slice(0, currentIndex),
                              addPrice,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];

                            setState((p) => ({
                              ...p,
                              colorAttribute: emptyImage,
                            }));
                          }}
                          attributeName={item.name}
                          attributePrice={item.price}
                          productImage={item.image?.url}
                          attributeTitle={'Color'}
                          onAddImage={async (file) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const image = await handlePostImage(file?.[0]);
                            const addImage = {
                              ...colorAttribute[currentIndex],
                              image: image,
                              image_id: image?.id,
                            };

                            const newImage = [
                              ...colorAttribute.slice(0, currentIndex),
                              addImage,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];
                            setState((p) => ({
                              ...p,
                              colorAttribute: newImage,
                            }));
                          }}
                          onCancel={() => {
                            setState((p) => ({
                              ...p,
                              colorAttribute: colorAttribute.filter(
                                (item: IAttribute) =>
                                  item !== colorAttribute[index],
                              ),
                              messageError: '',
                            }));
                          }}
                          onPriceChange={(e) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const addPrice = {
                              ...colorAttribute[currentIndex],
                              price: e,
                            };
                            const newPrice = [
                              ...colorAttribute.slice(0, currentIndex),
                              addPrice,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];
                            setState((p) => ({
                              ...p,
                              colorAttribute: newPrice,
                            }));
                          }}
                          onNameColorChange={(value: string) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const addColor = {
                              ...colorAttribute[currentIndex],
                              name: value,
                            };
                            const newColor = [
                              ...colorAttribute.slice(0, currentIndex),
                              addColor,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];

                            setState((p) => ({
                              ...p,
                              colorAttribute: newColor,
                              messageError: '',
                            }));
                          }}
                          onColorChange={(color) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const addColor = {
                              ...colorAttribute[currentIndex],
                              color: color,
                              name: GetColorName(color),
                            };
                            const newColor = [
                              ...colorAttribute.slice(0, currentIndex),
                              addColor,
                              ...colorAttribute.slice(currentIndex + 1),
                            ];

                            setState((p) => ({
                              ...p,
                              colorAttribute: newColor,
                              messageError: '',
                            }));
                          }}
                        />
                      </div>
                    ))}
                  </Group>
                </Box>
              </Tabs.Panel>{' '}
              <Tabs.Panel value={'2'}>
                <div style={{ display: 'flex' }}>
                  <img src={'/warning.svg'} alt={'icon'} />
                  <p
                    style={{
                      color: '#d72525',
                      fontSize: '13px',
                      marginLeft: '5px',
                      fontStyle: 'italic',
                    }}
                  >
                    The default value is the price of the product.
                  </p>
                </div>
                <ActionIcon
                  value={'filled'}
                  radius={'xl'}
                  bg={'#FFE7EF'}
                  onClick={() =>
                    setState((p) => ({
                      ...p,

                      capacityAttribute: [
                        ...capacityAttribute,
                        { image: '', name: '', price: 0, color: '' },
                      ],
                    }))
                  }
                  disabled={capacityAttribute.length >= 4}
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt="1rem">
                  <Group>
                    {capacityAttribute?.map(
                      (item: IAttribute, index: number) => (
                        <div key={index}>
                          <AttributeCards
                            onReplaceImage={async (file) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const image = await handlePostImage(file);
                              const addImage = {
                                ...capacityAttribute[currentIndex],
                                image: image,
                                image_id: image?.id,
                              };
                              const newImage = [
                                ...capacityAttribute.slice(0, currentIndex),
                                addImage,
                                ...capacityAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                capacityAttribute: newImage,
                              }));
                            }}
                            onRemoveImage={() => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const addPrice = {
                                ...capacityAttribute[currentIndex],
                                image: '',
                                imageFile: null,
                              };

                              const newPrice = [
                                ...capacityAttribute.slice(0, currentIndex),
                                addPrice,
                                ...capacityAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                capacityAttribute: newPrice,
                              }));
                            }}
                            attributeName={item.name}
                            attributePrice={item.price}
                            productImage={item.image?.url}
                            attributeTitle={'Capacity name'}
                            onAddImage={async (file) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );

                              const image = await handlePostImage(file?.[0]);
                              const addImage = {
                                ...capacityAttribute[currentIndex],
                                image: image,
                                image_id: image?.id,
                              };
                              const newImage = [
                                ...capacityAttribute.slice(0, currentIndex),
                                addImage,
                                ...capacityAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                capacityAttribute: newImage,
                              }));
                            }}
                            onCancel={() => {
                              setState((p) => ({
                                ...p,
                                messageError: '',
                                capacityAttribute: capacityAttribute.filter(
                                  (item: IAttribute) =>
                                    item !== capacityAttribute[index],
                                ),
                              }));
                            }}
                            onPriceChange={(e) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const addPrice = {
                                ...capacityAttribute[currentIndex],
                                price: e,
                              };
                              const newPrice = [
                                ...capacityAttribute.slice(0, currentIndex),
                                addPrice,
                                ...capacityAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                capacityAttribute: newPrice,
                              }));
                            }}
                            onAttributeChange={(e) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const addPrice = {
                                ...capacityAttribute[currentIndex],
                                name: e.target.value,
                              };
                              const newPrice = [
                                ...capacityAttribute.slice(0, currentIndex),
                                addPrice,
                                ...capacityAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                capacityAttribute: newPrice,
                                messageError: '',
                              }));
                            }}
                          />
                        </div>
                      ),
                    )}
                  </Group>
                </Box>
              </Tabs.Panel>{' '}
              <Tabs.Panel value={'3'}>
                <div style={{ display: 'flex' }}>
                  <img src={'/warning.svg'} alt={'icon'} />
                  <p
                    style={{
                      color: '#d72525',
                      fontSize: '13px',
                      marginLeft: '5px',
                      fontStyle: 'italic',
                    }}
                  >
                    The default value is the price of the product.
                  </p>
                </div>
                <ActionIcon
                  value={'filled'}
                  radius={'xl'}
                  bg={'#FFE7EF'}
                  onClick={() =>
                    setState((p) => ({
                      ...p,
                      packageAttribute: [
                        ...packageAttribute,
                        { image: '', name: '', price: 0 },
                      ],
                    }))
                  }
                  disabled={packageAttribute.length >= 4}
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt="1rem">
                  <Group>
                    {packageAttribute?.map(
                      (item: IAttribute, index: number) => (
                        <div key={index}>
                          <AttributeCards
                            onReplaceImage={async (file) => {
                              const currentIndex = packageAttribute.findIndex(
                                (i) => i === packageAttribute[index],
                              );
                              const image = await handlePostImage(file);
                              const addImage = {
                                ...packageAttribute[currentIndex],
                                image: image,
                                image_id: image?.id,
                              };
                              const newImage = [
                                ...packageAttribute.slice(0, currentIndex),
                                addImage,
                                ...packageAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packageAttribute: newImage,
                              }));
                            }}
                            onRemoveImage={() => {
                              const currentIndex = packageAttribute.findIndex(
                                (i) => i === packageAttribute[index],
                              );
                              const addPrice = {
                                ...packageAttribute[currentIndex],
                                image: '',
                                imageFile: null,
                              };
                              const newPrice = [
                                ...packageAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packageAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                messageError: '',
                                packageAttribute: newPrice,
                              }));
                            }}
                            attributeName={item.name}
                            attributePrice={item.price}
                            productImage={item.image?.url || item?.image}
                            attributeTitle={'Package name'}
                            onAddImage={async (file) => {
                              const currentIndex = packageAttribute.findIndex(
                                (i) => i === packageAttribute[index],
                              );

                              const image = await handlePostImage(file?.[0]);
                              const addImage = {
                                ...packageAttribute[currentIndex],
                                image: image,
                                image_id: image?.id,
                              };
                              const newImage = [
                                ...packageAttribute.slice(0, currentIndex),
                                addImage,
                                ...packageAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packageAttribute: newImage,
                              }));
                            }}
                            onCancel={() => {
                              setState((p) => ({
                                ...p,
                                messageError: '',
                                packageAttribute: packageAttribute.filter(
                                  (item: IAttribute) =>
                                    item !== packageAttribute[index],
                                ),
                              }));
                            }}
                            onPriceChange={(e) => {
                              const currentIndex = packageAttribute.findIndex(
                                (i) => i === packageAttribute[index],
                              );
                              const addPrice = {
                                ...packageAttribute[currentIndex],
                                price: e,
                              };
                              const newPrice = [
                                ...packageAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packageAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packageAttribute: newPrice,
                                messageError: '',
                              }));
                            }}
                            onAttributeChange={(e) => {
                              const currentIndex = packageAttribute.findIndex(
                                (i) => i === packageAttribute[index],
                              );
                              const addPrice = {
                                ...packageAttribute[currentIndex],
                                name: e.target.value,
                              };
                              const newPrice = [
                                ...packageAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packageAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packageAttribute: newPrice,
                                messageError: '',
                              }));
                            }}
                          />
                        </div>
                      ),
                    )}
                  </Group>
                </Box>
              </Tabs.Panel>
            </Tabs>
            {messageError && (
              <div
                style={{
                  fontSize: 12,
                  marginTop: 8,
                  color: '#ff0000',
                }}
              >
                {messageError}
              </div>
            )}
          </div>
          <Title order={2} c={'#B82C67'} align="center">
            Product description{' '}
          </Title>
          <Container
            style={{
              width: '100%',
              paddingLeft: 0,
              paddingRight: 0,
            }}
          >
            <Tabs defaultValue={'1'}>
              <Tabs.List grow>
                <Tabs.Tab value="1">
                  <Title order={4} c={'#B82C67'}>
                    Description
                  </Title>
                </Tabs.Tab>
                <Tabs.Tab value="2">
                  <Title order={4} c={'#B82C67'}>
                    Characteristics
                  </Title>
                </Tabs.Tab>
                <Tabs.Tab value="3">
                  <Title order={4} c={'#B82C67'}>
                    Use
                  </Title>
                </Tabs.Tab>
                <Tabs.Tab value="4">
                  <Title order={4} c={'#B82C67'}>
                    Composition
                  </Title>
                </Tabs.Tab>
              </Tabs.List>

              <Tabs.Panel value="1" pt={'md'}>
                <TextEditor editor={editor2} />
              </Tabs.Panel>
              <Tabs.Panel value="2" pt={'md'}>
                <TextEditor editor={editor} />
              </Tabs.Panel>
              <Tabs.Panel value="3" pt={'md'}>
                <TextEditor editor={editor3} />
              </Tabs.Panel>
              <Tabs.Panel value="4" pt={'md'}>
                <TextEditor editor={editor1} />
              </Tabs.Panel>
            </Tabs>
          </Container>
        </Stack>
        <Button
          type="submit"
          c={'#fff'}
          leftIcon={<img src="/tick.svg" width={16} alt="icon" />}
          w={100}
          h={40}
          sx={{ float: 'right' }}
          bg={'#B82C67'}
          radius={'md'}
          mt={'2rem'}
          disabled={isLoading}
        >
          Done
        </Button>
        <div style={{ height: '60px' }}></div>
      </form>
    </div>
  );
};

export default ProductEditForm;
