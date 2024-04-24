import {
  Box,
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Tabs,
  TextInput,
  Title,
  ActionIcon,
  Modal,
  Paper,
  Text,
} from '@mantine/core';
import { IAttribute, IProductForm, subsub } from '../../utils/utilsInterface';
import React, { useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
// import { DateInput } from '@mantine/dates';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import TextAlign from '@tiptap/extension-text-align';
import { useForm } from '@mantine/form';
import { Dropzone, FileWithPath } from '@mantine/dropzone';
// import { FileWithPath, Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { storage } from '../../utils/firebaseConfig';
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  uploadBytesResumable,
} from 'firebase/storage';
import { formatDay } from '../../utils/format';
import TextEditor from '../common/TextEditor';
import { useEditor } from '@tiptap/react';
import useSWR from 'swr';
import ImagePreview from '../common/ImagePreview';
import CustomSelect from '../common/CustomSelect';
import AttributeCards from '../common/AttributeCards';
import { GetColorName } from 'hex-color-to-color-name';
import * as _ from 'lodash';
import { PUT } from '../../utils/fetch';
import { DateInput } from '@mantine/dates';
import { useDisclosure } from '@mantine/hooks';
interface productEditFormProps {
  id: number;
  onSuccess: () => void;
}
const statusData = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'stockout', label: 'Stockout' },
];
const ProductEditForm: React.FC<productEditFormProps> = ({ id, onSuccess }) => {
  const { data, isLoading } = useSWR<IProductForm>(
    `/api/product/${id}`,
    getDetail,
  );
  const [state, setState] = useState({
    subCategory: [],
    categories: [],
    imgeUrl: '',
    albums: [] as FileWithPath[],
    subsubCategory: {} as subsub,
    colorAttribute: [] as IAttribute[],
    capacityAttribute: [] as IAttribute[],
    packagingAttribute: [] as IAttribute[],
    deleteProperties: {} as IAttribute,
    deleteType: '',
  });
  const {
    subCategory,
    categories,
    subsubCategory,
    colorAttribute,
    capacityAttribute,
    packagingAttribute,
    imgeUrl,
    deleteProperties,
    deleteType,
  } = state;
  async function getDetail() {
    return await fetch(`/api/product/${id}`).then((res) => res.json());
  }
  const [opened, { open, close }] = useDisclosure(false);

  const [albumsImage, setAlbumsImage] = useState<string[]>([]);
  const pusblishDate = `${new Date(String(data?.publish_date)).getFullYear()}-${
    new Date(String(data?.publish_date)).getMonth() + 1
  }-${new Date(String(data?.publish_date)).getDate()}`;
  const form = useForm<IProductForm>({
    initialValues: data,
  });

  async function getSubCategory(id: string) {
    const controller = new AbortController();
    try {
      await fetch(`/api/subcategory/list/${+id}`, { signal: controller.signal })
        .then((res) => res.json())
        .then((data) =>
          setState((p) => ({
            ...p,
            subCategory: data?.map((item: { name: string; id: number }) => ({
              value: item.id,
              label: item.name,
            })),
          })),
        );
    } catch (e) {
      controller.abort();
      notifications.show({
        title: 'Warning',
        message: `${e}`,
        color: 'red',
      });
    }
  }
  async function getSubSub(id: number) {
    await fetch(`/api/subsubcategory/detail/${id}`)
      .then((res) => res.json())
      .then((data) => setState((p) => ({ ...p, subsubCategory: data })));
  }
  function removeEmpty(obj: object) {
    return Object.fromEntries(
      Object.entries(obj).filter(([_, v]) => v !== null),
    );
  }
  async function editProduct(v: IProductForm) {
    const putData = _.omit(v, [
      'slug',
      'subcategory',
      'description',
      'image',
      'evaluate',
      'subsubcategory',
      'real_price',
      'created_time',
      'modified_time',
      'id',
      'album',
      'category',
      'available',
      'color',
      'capacity',
      'packaging',
      'publish_date',
    ]);
    console.log(putData);
    const res = await PUT(
      `/api/product/detail/${id}`,
      removeEmpty(
        Object.assign(putData, {
          album: albumsImage,
          color: colorAttribute,
          packaging: packagingAttribute,
          capacity: capacityAttribute,
          publish_date: pusblishDate,
        }),
      ),
    )
      .then((res) => res.json())
      .catch((e) => alert(e));
    if (res?.message !== 'Data is invalid') {
      form.reset();
      onSuccess();
    } else {
      alert(res?.message);
    }
  }
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
    content: data?.note?.Caractéristiques,
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
    content: data?.note?.Composition
      ? data?.note?.Composition
      : data?.note?.Composition,
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
    content: data?.note?.Description
      ? data?.note?.Description
      : data?.note?.Description,
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
    content: data?.note?.Utilisation
      ? data?.note?.Utilisation
      : data?.note?.Utilisation,
  });

  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/category/create', { signal: controller.signal })
      .then((res) => res.json())
      .then((data) =>
        setState((p) => ({
          ...p,
          categories: data.map((item: { id: number; name: string }) => ({
            value: item.id,
            label: item.name,
          })),
        })),
      );
    return () => {
      controller.abort();
    };
  }, []);
  // console.log(data);

  useEffect(() => {
    if (data?.color) {
      setState((p) => ({ ...p, colorAttribute: Object.values(data?.color) }));
    }
    if (data?.capacity) {
      setState((p) => ({
        ...p,
        capacityAttribute: Object.values(data?.capacity),
      }));
    }
    if (data?.packaging) {
      setState((p) => ({
        ...p,
        packagingAttribute: Object.values(data?.packaging),
      }));
    }
    if (data?.url_image) {
      setState((p) => ({ ...p, imgeUrl: data?.url_image }));
    }
  }, [data?.url_image, data?.color, data?.capacity, data?.packaging]);
  useEffect(() => {
    if (data?.album) {
      setAlbumsImage(data?.album);
    }
    if (subsubCategory.id) {
      form.setFieldValue('subsubcategory_id', subsubCategory.id);
    }
  }, [data?.album, subsubCategory]);
  if (!data) return null;

  if (isLoading) return 'loading';
  return (
    <div>
      <form
        onSubmit={form.onSubmit((v) => editProduct(v))}
        style={{ padding: '32px 64px' }}
      >
        <Stack spacing={'lg'}>
          <Group spacing={'xl'}>
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Nom du produit</span>
              <TextInput
                p={'0 10px'}
                h={36}
                variant={'unstyled'}
                width={313}
                mt={'8px'}
                defaultValue={data.name}
                {...form.getInputProps('name')}
                sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              />
            </div>
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Date de création</span>
              <div className={'badge_child'}>
                <p>{formatDay(data.publish_date)}</p>
                <img
                  src={'/calendar.svg'}
                  alt={'icon'}
                  width={30}
                  height={30}
                />
              </div>
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Statut</span>

              <CustomSelect
                width="19.5625rem"
                height="2.25rem"
                default={data?.status as string}
                data={statusData}
                selectBG={{
                  color: '#FFE7EF',
                  image: '/down_arrow.svg',
                  posX: '18.5625rem',
                  posY: '18px',
                }}
                onChange={function (
                  e: React.ChangeEvent<HTMLSelectElement>,
                ): void {
                  form.setFieldValue('status', e.target.value);
                }}
              />
            </div>
          </Group>
          <Group>
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Categories</span>

              <CustomSelect
                width="19.5625rem"
                height="2.25rem"
                default={data?.category?.name as string}
                data={categories}
                selectBG={{
                  color: '#FFE7EF',
                  image: '/down_arrow.svg',
                  posX: '18.5625rem',
                  posY: '18px',
                }}
                onChange={function (
                  e: React.ChangeEvent<HTMLSelectElement>,
                ): void {
                  getSubCategory(e.target.value);
                  form.setFieldValue('category_id', +e.target.value);
                }}
              />
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Sub-catégorie</span>
              <CustomSelect
                width="19.5625rem"
                height="2.25rem"
                default={data?.subcategory?.name as string}
                data={subCategory}
                selectBG={{
                  color: '#FFE7EF',
                  image: '/down_arrow.svg',
                  posX: '18.5625rem',
                  posY: '18px',
                }}
                onChange={function (
                  e: React.ChangeEvent<HTMLSelectElement>,
                ): void {
                  getSubSub(+e.target.value);
                  form.setFieldValue('subcategory_id', +e.target.value);
                }}
              />
            </div>
            <div className={'badge'} style={{ marginLeft: '1rem' }}>
              <div className={'badge_child'} style={{ marginTop: '2rem' }}>
                <p>
                  {subsubCategory?.name
                    ? subsubCategory?.name
                    : data.subcategory?.name}
                </p>
              </div>
            </div>
          </Group>
          <Title order={3} c={'#E7639A'} mt={18}>
            Image du produit
          </Title>
          <Group spacing={'xl'}>
            <div>
              <h4 style={{ color: '#E7639A' }}>Grande</h4>
              <ImagePreview
                remove={false}
                image={imgeUrl}
                onReplace={(file) => {
                  const deleteRef = ref(storage, data.url_image);
                  deleteObject(deleteRef)
                    .then(() => console.log('success'))
                    .catch((e) => console.warn(e));
                  const imageRef = ref(storage, `test_image/${Date.now()}`);
                  uploadBytes(imageRef, file).then((snapshot) => {
                    getDownloadURL(snapshot.ref)
                      .then((url) => {
                        setState((p) => ({ ...p, imgeUrl: url }));
                        form.setFieldValue('url_image', url);
                      })
                      .catch((e) => console.warn(e));
                  });
                }}
                imageWidth={174}
                imageHeight={174}
              />
            </div>
            <div style={{ marginLeft: '5rem' }}>
              <h4 style={{ color: '#E7639A' }}>Album</h4>
              <Group>
                <Dropzone
                  multiple={false}
                  disabled={albumsImage.length >= 6}
                  onDrop={function (file) {
                    const images = [];
                    file.map((item) => {
                      const storageRef = ref(
                        storage,
                        `test_image/${(Math.random() + 1)
                          .toString(36)
                          .substring(2)}`,
                      );
                      const uploadTask = uploadBytesResumable(storageRef, item);
                      images.push(uploadTask);
                      uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                          const prog = Math.round(
                            (snapshot.bytesTransferred / snapshot.totalBytes) *
                              100,
                          );
                          console.log(prog);
                        },
                        (error) => console.warn(error),
                        async () => {
                          await getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURLs) => {
                              setAlbumsImage((p) => [...p, downloadURLs]);
                              console.log('success upload', downloadURLs);
                            },
                          );
                        },
                      );
                    });
                  }}
                  w={174}
                  h={174}
                  pt={'50px'}
                >
                  <div style={{ textAlign: 'center' }}>
                    <img
                      src={'/add_image_ic.svg'}
                      width={32}
                      height={32}
                      alt={'img'}
                    />
                    <p style={{ fontSize: '13px' }}>Ajouter une photo</p>
                  </div>
                </Dropzone>
                <div
                  style={{ display: 'flex', width: '520px', overflow: 'auto' }}
                >
                  {albumsImage &&
                    albumsImage.map((image: string, index: number) => (
                      <div key={index} style={{ marginLeft: '1rem' }}>
                        <ImagePreview
                          image={image}
                          remove={true}
                          onRemove={function (): void {
                            setAlbumsImage(
                              albumsImage.filter((i) => i !== image),
                            );
                            const deleteRef = ref(storage, image);
                            if (image !== '') {
                              deleteObject(deleteRef)
                                .then(() => console.log('success delete'))
                                .catch((e) => console.warn(e));
                            }
                          }}
                          onReplace={function (e: File): void {
                            const newImage = [...albumsImage];
                            const deleteRef = ref(storage, image);
                            deleteObject(deleteRef)
                              .then(() => console.log('delete success'))
                              .catch((e) => console.warn(e));
                            const imageRef = ref(
                              storage,
                              `test_image/${(Math.random() + 1)
                                .toString(36)
                                .substring(2)}`,
                            );
                            uploadBytes(imageRef, e).then((snapshot) => {
                              getDownloadURL(snapshot.ref)
                                .then((url) => {
                                  newImage[index] = url;
                                  setAlbumsImage(newImage);
                                })
                                .catch((e) => console.warn(e));
                            });
                          }}
                          imageWidth={174}
                          imageHeight={174}
                        />
                      </div>
                    ))}
                </div>
              </Group>
            </div>
          </Group>
          <div>
            <Title align={'center'} order={2} c={'#B82C67'} mt={'4rem'}>
              Données du produit
            </Title>

            <Grid gutter={7} gutterXs="md" gutterMd="xl" gutterXl={50}>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A' }}>Prix</h4>
                <div className={'badge'}>
                  <span style={{ color: '#7C7C7C' }}>
                    Prix du produit ( € ){' '}
                  </span>
                  <TextInput
                    sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                    w={472}
                    h={36}
                    pl={10}
                    mt={8}
                    variant={'unstyled'}
                    type={'text'}
                    inputMode="numeric"
                    onChange={(e) =>
                      form.setFieldValue('price', +e.target.value)
                    }
                    defaultValue={data.price}
                    min={0}
                  />
                </div>
                <div className={'badge'} style={{ marginTop: '8px' }}>
                  <span style={{ color: '#7C7C7C' }}>Prix bas ( € ) </span>
                  <TextInput
                    sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                    w={472}
                    h={36}
                    pl={10}
                    mt={8}
                    type={'text'}
                    inputMode="numeric"
                    variant={'unstyled'}
                    onChange={(e) =>
                      form.setFieldValue('discount_price', +e.target.value)
                    }
                    min={0}
                    defaultValue={data.discount_price}
                  />
                </div>

                <Box
                  component={'div'}
                  sx={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Depuis</span>
                    <DateInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      mt={8}
                      variant={'unstyled'}
                      onChange={(e) =>
                        form.setFieldValue('discount_start_date', e)
                      }
                      minDate={new Date(data?.discount_start_date as Date)}
                      defaultValue={new Date(data?.discount_start_date as Date)}
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                    />
                  </div>
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Pour</span>
                    <DateInput
                      onChange={(e) =>
                        form.setFieldValue('discount_end_date', String(e))
                      }
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      mt={8}
                      variant={'unstyled'}
                      defaultValue={new Date(data?.discount_end_date as Date)}
                      minDate={new Date(data?.discount_start_date as Date)}
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                    />
                  </div>
                </Box>
              </Grid.Col>
              <Grid.Col span={6}>
                <h4 style={{ color: '#E7639A' }}>Entrepôt</h4>
                <div
                  style={{ display: 'flex', justifyContent: 'space-between' }}
                >
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Lester ( g ) </span>
                    <TextInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      variant={'unstyled'}
                      type={'text'}
                      inputMode="numeric"
                      {...form.getInputProps('weight')}
                      defaultValue={data.weight}
                      min={0}
                      required
                    />
                  </div>
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Entre pôt </span>
                    <TextInput
                      defaultValue={data.amount}
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      variant={'unstyled'}
                      type={'number'}
                      {...form.getInputProps('amount')}
                      min={0}
                      required
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
                  <Tabs.Tab value={'1'}>Colour</Tabs.Tab>
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
                    }}
                  >
                    La valeur par défaut est le prix du produit
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
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt={'1rem'}>
                  <Group>
                    {colorAttribute?.map((item: IAttribute, index: number) => (
                      <div key={index}>
                        <AttributeCards
                          attributeType="edit"
                          attributePrice={item.price}
                          defaultColor={item.color}
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
                                  // PUT(`/api/product/detail/${id}`, { url_image: newImage });
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
                              deleteType: 'color',
                              deleteProperties: colorAttribute[index],
                            }));
                            open();
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
                    }}
                  >
                    La valeur par défaut est le prix du produit
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
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt="1rem">
                  <Group>
                    {capacityAttribute?.map(
                      (item: IAttribute, index: number) => (
                        <div key={index}>
                          <AttributeCards
                            attributeName={item.name}
                            attributePrice={item.price}
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
                              // setState((p) => ({
                              //   ...p,
                              //
                              //   capacityAttribute: capacityAttribute.filter(
                              //     (item: IAttribute) =>
                              //       item !== capacityAttribute[index],
                              //   ),
                              // }));
                              setState((p) => ({
                                ...p,
                                deleteType: 'capacity',
                                deleteProperties: capacityAttribute[index],
                              }));
                              open();
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
                            attributeType="edit"
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
                    }}
                  >
                    La valeur par défaut est le prix du produit
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
                >
                  <img src={'/plus_pink.svg'} alt={'icon'} />
                </ActionIcon>
                <Box mt="1rem">
                  <Group>
                    {packagingAttribute?.map(
                      (item: IAttribute, index: number) => (
                        <div key={index}>
                          <AttributeCards
                            attributeType="edit"
                            attributeName={item.name}
                            attributePrice={item.price}
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
                                deleteType: 'packaging',
                                deleteProperties: packagingAttribute[index],
                              }));
                              open();
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
              {data?.note !== null && (
                <>
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
                </>
              )}
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
      <Modal
        opened={opened}
        onClose={close}
        centered
        radius={'md'}
        withCloseButton={false}
      >
        <Paper pt={'1rem'}>
          <Text align={'center'} sx={{ fontSize: '16px', fontWeight: 600 }}>
            Voulez-vous supprimer cette propriété ?
          </Text>
          <Group sx={{ float: 'right' }} my={32}>
            <Button variant={'subtle'} onClick={close}>
              <span style={{ color: '#333' }}>Non</span>
            </Button>
            <Button
              onClick={() => {
                if (deleteType === 'color') {
                  setState((p) => ({
                    ...p,
                    colorAttribute: colorAttribute.filter(
                      (item) => item !== deleteProperties,
                    ),
                  }));
                } else if (deleteType === 'capacity') {
                  setState((p) => ({
                    ...p,
                    capacityAttribute: capacityAttribute.filter(
                      (item) => item !== deleteProperties,
                    ),
                  }));
                } else {
                  setState((p) => ({
                    ...p,
                    packagingAttribute: packagingAttribute.filter(
                      (item) => item !== deleteProperties,
                    ),
                  }));
                }
                if (deleteProperties.image !== '') {
                  const deleteRef = ref(storage, deleteProperties.image);
                  deleteObject(deleteRef)
                    .then(() => console.log('success delete'))
                    .catch((e) => console.warn(e));
                }
                close();
              }}
            >
              Qui
            </Button>
          </Group>
        </Paper>
      </Modal>
    </div>
  );
};

export default ProductEditForm;
