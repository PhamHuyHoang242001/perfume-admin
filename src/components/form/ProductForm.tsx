import {
  ActionIcon,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Select,
  Stack,
  Tabs,
  TextInput,
  Title,
} from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import { useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
import { GetColorName } from 'hex-color-to-color-name';
import { yupResolver } from 'mantine-form-yup-resolver';
import { ChangeEvent, useState } from 'react';
import * as yup from 'yup';
import { apiRoute } from '../../utils/apiRoute';
import { POST } from '../../utils/fetch';
import { storage } from '../../utils/firebaseConfig';
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
  categorySelected: string | number | null;
};

const schema = yup.object().shape({
  name: yup.string().required('Name is required'),
  price: yup
    .string()
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
      message: 'Price must have at most 1 decimal places',
      test: function (currentPrice) {
        if (!currentPrice) {
          return true; // Skip validation if value is missing
        }
        const decimalPlaces =
          currentPrice.toString().split('.')[1]?.length || 0;
        return decimalPlaces <= 1;
      },
    })

    .typeError('Invalid number')
    .min(1, 'Price must be greater than or equal to 1'),

  current_price: yup.string().when('price', (price, schema) => {
    return schema
      .test({
        name: 'currentPriceLessThanPrice',
        exclusive: false,
        message: 'Current price must be less than price',
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
        message: 'Current price must have at most 1 decimal places',
        test: function (currentPrice) {
          if (!currentPrice) {
            return true; // Skip validation if value is missing
          }
          const decimalPlaces =
            currentPrice.toString().split('.')[1]?.length || 0;

          return decimalPlaces <= 1;
        },
      })
      .typeError('Invalid number')
      .max(999999.99, 'Current price must be less than 999999.99');
  }),
});

const ProductForm = ({
  listCategory,
  onSuccess,
  categorySelected,
}: ProductFormProps) => {
  const listSubCategoryCurr = listCategory.find(
    (item) => item.id === categorySelected,
  );

  const [state, setState] = useState({
    subCategory:
      listSubCategoryCurr?.subcategories?.map((item) => ({
        value: item.id,
        label: item.name,
      })) || [],
    subsubCategory: [] as any,
    categories: listCategory.map((item) => ({
      value: item.id,
      label: item.name,
    })),
    attributes: [],
    url_image: '',
    progress: 0,
    loading: false,
    colorAttribute: [] as IAttribute[],
    capacityAttribute: [] as IAttribute[],
    packagingAttribute: [] as IAttribute[],
  });
  const {
    loading,
    url_image,
    subCategory,
    subsubCategory,
    categories,
    colorAttribute,
    capacityAttribute,
    packagingAttribute,
  } = state;

  const today = new Date().getDate();
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const createdDay = `${today}-${thisMonth}-${thisYear}`;

  const form = useForm<IProductForm | any>({
    validate: yupResolver(schema),
    initialValues: {
      name: '',
      weight: 0,
      status: 'Active',
      available: true,
      price: 0,
      current_price: 0,
      url_image: '',
      note: {
        Caractéristiques: '',
        Composition: '',
        Description: '',
        Utilisation: '',
      },
      category_id: categorySelected as any,
      subcategory_id: null,
      sub_subcategory_id: null,
      quantity: 0,
      capacity: {},
      color: {},
      packaging: {},
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
      form.setFieldValue('note.Caractéristiques', content);
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
      form.setFieldValue('note.Composition', content);
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
      form.setFieldValue('note.Description', content);
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
      form.setFieldValue('note.Utilisation', content);
    },
  });

  async function createNewProduct(v: IProductForm) {
    try {
      const res = await POST(apiRoute.create_product, v);

      if (res.status === 200) {
        onSuccess();
      } else {
        notifications.show({
          message: 'veuillez saisir tous les champs',
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        message: `${error}`,
        color: 'red',
      });
    }
  }

  const handleInput = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.value.length > 9) {
      e.target.value = e.target.value.slice(0, 9);
    }
  };

  return (
    <div>
      <form
        onSubmit={form.onSubmit((v) => createNewProduct(v))}
        style={{ padding: '32px 64px' }}
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
                width={313}
                maxLength={100}
                mt={'8px'}
                {...form.getInputProps('name')}
                sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                required
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
                  fontSize: 12,
                  marginTop: 8,
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
                  form.setFieldValue('subcategory_id', null);
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
                  fontSize: 12,
                  marginTop: 8,
                }}
                onChange={(v) => {
                  form.setFieldValue('subcategory_id', v as any);
                  const newSubCate = subCategory.find(
                    (item: any) => v && +item.value === +v,
                  ) as any;

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
                  fontSize: 12,
                }}
                onChange={(v) => {
                  form.setFieldValue('sub_subcategory_id', v as any);
                }}
              />
            </div>{' '}
          </div>

          <Group spacing={'xl'}>
            <div>
              <h4 style={{ color: '#B82C67' }}>Product image</h4>
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
                  onDrop={(file) => {
                    file?.[0] &&
                      setState((p) => ({
                        ...p,
                        url_image: URL.createObjectURL(file?.[0]),
                      }));
                    form.setFieldValue('image', file);
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
          <div>
            <Title align={'center'} order={2} c={'#B82C67'} mt={'4rem'}>
              Product detail
            </Title>

            <Grid gutter={7} gutterXs="md" gutterMd="xl" gutterXl={50}>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A' }}>Price</h4>

                <div className={'badge'}>
                  <span style={{ color: '#707070' }}>
                    Price of product ($){' '}
                    <span style={{ color: '#FF0000' }}>*</span>
                  </span>
                  <TextInput
                    sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                    w={472}
                    h={36}
                    pl={10}
                    mt={8}
                    variant={'unstyled'}
                    type={'number'}
                    inputMode="numeric"
                    onInput={handleInput}
                    onChange={(e) =>
                      form.setFieldValue('price', +e.target.value)
                    }
                    required
                    min={0}
                    error={Object.hasOwn(form.errors, 'price') ? 'error' : null}
                  />
                </div>
                <div className={'badge'} style={{ marginTop: '8px' }}>
                  <span style={{ color: '#707070' }}>Sale price ($) </span>
                  <TextInput
                    min={0}
                    required
                    sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                    w={472}
                    h={36}
                    pl={10}
                    mt={8}
                    type={'text'}
                    inputMode="numeric"
                    variant={'unstyled'}
                    onChange={(e) =>
                      form.setFieldValue('current_price', +e.target.value)
                    }
                    // {...form.getInputProps('discount_price')}
                  />
                </div>
              </Grid.Col>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A' }}>Quantity </h4>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <span style={{ color: '#707070' }}>
                      Mass (g) <span style={{ color: '#FF0000' }}>*</span>{' '}
                    </span>
                    <TextInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      variant={'unstyled'}
                      type={'text'}
                      inputMode="numeric"
                      onChange={(e) =>
                        form.setFieldValue('weight', +e.target.value)
                      }
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <span style={{ color: '#707070' }}>
                      Quantity <span style={{ color: '#FF0000' }}>*</span>{' '}
                    </span>
                    <TextInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      max={9999999999}
                      variant={'unstyled'}
                      type={'number'}
                      onChange={(e) =>
                        form.setFieldValue('quantity', +e.target.value)
                      }
                      required
                      min={1}
                    />
                  </div>
                </div>
              </Grid.Col>
            </Grid>
          </div>
          <div>
            <h4 style={{ color: '#E7639A', marginBottom: '5px' }}>Attribute</h4>
            <Tabs defaultValue={'1'}>
              <div style={{ width: '18.75rem' }}>
                <Tabs.List>
                  <Tabs.Tab value={'1'}>Color</Tabs.Tab>
                  <Tabs.Tab value={'2'}>Contenace</Tabs.Tab>
                  <Tabs.Tab value={'3'}>Packaging</Tabs.Tab>
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
                          onReplaceImage={(file) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const deleteRef = ref(storage, item.image);
                            deleteObject(deleteRef)
                              .then(() => console.log('success delete'))
                              .catch((e) => console.warn(e));
                            const imageRef = ref(
                              storage,
                              `test_image/${Date.now()}`,
                            );
                            uploadBytes(imageRef, file).then((snapshot) => {
                              getDownloadURL(snapshot.ref)
                                .then((url) => {
                                  const addImage = {
                                    ...colorAttribute[currentIndex],
                                    image: url,
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
                                })
                                .catch((e) => console.warn(e));
                            });
                          }}
                          onRemoveImage={() => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );

                            const addPrice = {
                              ...colorAttribute[currentIndex],
                              image: '',
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
                            const deleteRef = ref(storage, item.image);
                            deleteObject(deleteRef)
                              .then(() => console.log('success delete'))
                              .catch((e) => console.warn(e));
                          }}
                          productImage={item.image}
                          attributeTitle={'Colour'}
                          onAddImage={(file) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );

                            const imageRef = ref(
                              storage,
                              `test_image/${Date.now()}`,
                            );
                            uploadBytes(imageRef, file?.[0]).then(
                              (snapshot) => {
                                getDownloadURL(snapshot.ref)
                                  .then((url) => {
                                    const addImage = {
                                      ...colorAttribute[currentIndex],
                                      image: url,
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
                                  })
                                  .catch((e) => console.warn(e));
                              },
                            );
                          }}
                          onCancel={() => {
                            setState((p) => ({
                              ...p,

                              colorAttribute: colorAttribute.filter(
                                (item: IAttribute) =>
                                  item !== colorAttribute[index],
                              ),
                            }));
                            if (item.image !== '') {
                              const deleteRef = ref(storage, item.image);
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                            }
                          }}
                          onPriceChange={(e) => {
                            const currentIndex = colorAttribute.findIndex(
                              (i) => i === colorAttribute[index],
                            );
                            const addPrice = {
                              ...colorAttribute[currentIndex],
                              price: +e.target.value,
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
                            onReplaceImage={(file) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const deleteRef = ref(storage, item.image);
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                              const imageRef = ref(
                                storage,
                                `test_image/${Date.now()}`,
                              );
                              uploadBytes(imageRef, file).then((snapshot) => {
                                getDownloadURL(snapshot.ref).then((url) => {
                                  const addImage = {
                                    ...capacityAttribute[currentIndex],
                                    image: url,
                                  };
                                  const newImage = [
                                    ...capacityAttribute.slice(0, currentIndex),
                                    addImage,
                                    ...capacityAttribute.slice(
                                      currentIndex + 1,
                                    ),
                                  ];
                                  setState((p) => ({
                                    ...p,
                                    capacityAttribute: newImage,
                                  }));
                                });
                              });
                            }}
                            onRemoveImage={() => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const addPrice = {
                                ...capacityAttribute[currentIndex],
                                image: '',
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
                              const deleteRef = ref(storage, item.image);
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                            }}
                            productImage={item.image}
                            attributeTitle={'Contennace'}
                            onAddImage={(file) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const imageRef = ref(
                                storage,
                                `test_image/${Date.now()}`,
                              );
                              uploadBytes(imageRef, file?.[0])
                                .then((snapshot) => {
                                  getDownloadURL(snapshot.ref).then((url) => {
                                    const addImage = {
                                      ...capacityAttribute[currentIndex],
                                      image: url,
                                    };
                                    const newImage = [
                                      ...capacityAttribute.slice(
                                        0,
                                        currentIndex,
                                      ),
                                      addImage,
                                      ...capacityAttribute.slice(
                                        currentIndex + 1,
                                      ),
                                    ];
                                    setState((p) => ({
                                      ...p,
                                      capacityAttribute: newImage,
                                    }));
                                  });
                                })
                                .catch((e) => console.warn(e));
                            }}
                            onCancel={() => {
                              setState((p) => ({
                                ...p,

                                capacityAttribute: capacityAttribute.filter(
                                  (item: IAttribute) =>
                                    item !== capacityAttribute[index],
                                ),
                              }));
                              if (item.image !== '') {
                                const deleteRef = ref(storage, item.image);
                                deleteObject(deleteRef)
                                  .then(() => console.log('success delete'))
                                  .catch((e) => console.warn(e));
                              }
                            }}
                            onPriceChange={(e) => {
                              const currentIndex = capacityAttribute.findIndex(
                                (i) => i === capacityAttribute[index],
                              );
                              const addPrice = {
                                ...capacityAttribute[currentIndex],
                                price: +e.target.value,
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

                      packagingAttribute: [
                        ...packagingAttribute,
                        { image: '', name: '', price: 0 },
                      ],
                    }))
                  }
                  disabled={packagingAttribute.length >= 4}
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt="1rem">
                  <Group>
                    {packagingAttribute?.map(
                      (item: IAttribute, index: number) => (
                        <div key={index}>
                          <AttributeCards
                            onReplaceImage={(file) => {
                              const currentIndex = packagingAttribute.findIndex(
                                (i) => i === packagingAttribute[index],
                              );
                              const deleteRef = ref(storage, item.image);
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                              const imageRef = ref(
                                storage,
                                `test_image/${Date.now()}`,
                              );
                              uploadBytes(imageRef, file).then((snapshot) => {
                                getDownloadURL(snapshot.ref).then((url) => {
                                  const addImage = {
                                    ...packagingAttribute[currentIndex],
                                    image: url,
                                  };

                                  const newImage = [
                                    ...packagingAttribute.slice(
                                      0,
                                      currentIndex,
                                    ),
                                    addImage,
                                    ...packagingAttribute.slice(
                                      currentIndex + 1,
                                    ),
                                  ];
                                  setState((p) => ({
                                    ...p,
                                    packagingAttribute: newImage,
                                  }));
                                });
                              });
                            }}
                            onRemoveImage={() => {
                              const currentIndex = packagingAttribute.findIndex(
                                (i) => i === packagingAttribute[index],
                              );
                              const addPrice = {
                                ...packagingAttribute[currentIndex],
                                image: '',
                              };
                              const newPrice = [
                                ...packagingAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packagingAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packagingAttribute: newPrice,
                              }));
                              const deleteRef = ref(storage, item.image);
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                            }}
                            productImage={item.image}
                            attributeTitle={'Pakaging'}
                            onAddImage={(file) => {
                              const currentIndex = packagingAttribute.findIndex(
                                (i) => i === packagingAttribute[index],
                              );
                              const imageRef = ref(
                                storage,
                                `test_image/${Date.now()}`,
                              );
                              uploadBytes(imageRef, file?.[0]).then(
                                (snapshot) => {
                                  getDownloadURL(snapshot.ref).then((url) => {
                                    const addImage = {
                                      ...packagingAttribute[currentIndex],
                                      image: url,
                                    };
                                    const newImage = [
                                      ...packagingAttribute.slice(
                                        0,
                                        currentIndex,
                                      ),
                                      addImage,
                                      ...packagingAttribute.slice(
                                        currentIndex + 1,
                                      ),
                                    ];
                                    setState((p) => ({
                                      ...p,
                                      packagingAttribute: newImage,
                                    }));
                                  });
                                },
                              );
                            }}
                            onCancel={() => {
                              setState((p) => ({
                                ...p,

                                packagingAttribute: packagingAttribute.filter(
                                  (item: IAttribute) =>
                                    item !== packagingAttribute[index],
                                ),
                              }));
                              if (item.image !== '') {
                                const deleteRef = ref(storage, item.image);
                                deleteObject(deleteRef)
                                  .then(() => console.log('success delete'))
                                  .catch((e) => console.warn(e));
                              }
                            }}
                            onPriceChange={(e) => {
                              const currentIndex = packagingAttribute.findIndex(
                                (i) => i === packagingAttribute[index],
                              );
                              const addPrice = {
                                ...packagingAttribute[currentIndex],
                                price: +e.target.value,
                              };
                              const newPrice = [
                                ...packagingAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packagingAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packagingAttribute: newPrice,
                              }));
                            }}
                            onAttributeChange={(e) => {
                              const currentIndex = packagingAttribute.findIndex(
                                (i) => i === packagingAttribute[index],
                              );
                              const addPrice = {
                                ...packagingAttribute[currentIndex],
                                name: e.target.value,
                              };
                              const newPrice = [
                                ...packagingAttribute.slice(0, currentIndex),
                                addPrice,
                                ...packagingAttribute.slice(currentIndex + 1),
                              ];
                              setState((p) => ({
                                ...p,
                                packagingAttribute: newPrice,
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
          </div>
          <Title order={2} c={'#B82C67'} align="center">
            Description du produit{' '}
          </Title>
          <Container>
            <Tabs defaultValue={'1'}>
              <Tabs.List grow>
                <Tabs.Tab value="1">
                  <Title order={4} c={'#B82C67'}>
                    Description
                  </Title>
                </Tabs.Tab>
                <Tabs.Tab value="2">
                  <Title order={4} c={'#B82C67'}>
                    Caractéristiques
                  </Title>
                </Tabs.Tab>
                <Tabs.Tab value="3">
                  <Title order={4} c={'#B82C67'}>
                    Utilisation
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
          rightIcon={<img src="/tick.svg" alt="icon" />}
          w={154}
          h={56}
          sx={{ float: 'right' }}
          bg={'#B82C67'}
          radius={'md'}
          mt={'2rem'}
        >
          Done
        </Button>
        <div style={{ height: '60px' }}></div>
      </form>
    </div>
  );
};

export default ProductForm;
