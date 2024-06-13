import {
  ActionIcon,
  Box,
  Button,
  Container,
  Grid,
  Group,
  Stack,
  Tabs,
  TextInput,
  Title,
} from '@mantine/core';
import { DateInput } from '@mantine/dates';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { isNotEmpty, useForm } from '@mantine/form';
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
  uploadBytesResumable,
} from 'firebase/storage';
import { GetColorName } from 'hex-color-to-color-name';
import { useState } from 'react';
import { apiRoute } from '../../utils/apiRoute';
import { POST } from '../../utils/fetch';
import { storage } from '../../utils/firebaseConfig';
import { IAttribute, IProductForm, subsub } from '../../utils/utilsInterface';
import AttributeCards from '../common/AttributeCards';
import CustomSelect from '../common/CustomSelect';
import ImagePreview from '../common/ImagePreview';
import TextEditor from '../common/TextEditor';
// import { productSchema } from '../../utils/validate';
const ProductForm = (props: { onSuccess: () => void }) => {
  const [state, setState] = useState({
    subCategory: [],
    subsubCategory: {} as subsub,
    categories: [],
    attributes: [],
    url_image: '',
    progress: 0,
    loading: false,
    colorAttribute: [] as IAttribute[],
    capacityAttribute: [] as IAttribute[],
    packagingAttribute: [] as IAttribute[],
    start_date: '',
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
    start_date,
  } = state;
  const [firebaseImage, setFireBaseImage] = useState<string[]>([]);
  const today = new Date().getDate();
  const thisMonth = new Date().getMonth() + 1;
  const thisYear = new Date().getFullYear();
  const createdDay = `${today}-${thisMonth}-${thisYear}`;

  // const [images, setImages] = useState<File>();
  const form = useForm<IProductForm>({
    validate: {
      url_image: isNotEmpty('please upload image'),
      price: (value) => (value.toString().length >= 9 ? 'error' : null),
    },
    initialValues: {
      name: '',
      weight: 0,
      status: 'Active',
      available: true,
      publish_date: `${thisYear}-${thisMonth}-${today}`,
      price: 0,
      discount_price: 0,
      url_image: '',
      note: {
        Caractéristiques: '',
        Composition: '',
        Description: '',
        Utilisation: '',
      },
      category_id: 0,
      subcategory_id: 0,
      subsubcategory_id: 0,
      amount: 0,
      discount_start_date: '',
      discount_end_date: '',
      album: [],
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

  async function getSubCategory(id: string) {
    const controller = new AbortController();

    try {
      await fetch(`/api/subcategory/list/${+id}`, {
        signal: controller.signal,
      });
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
  async function createNewProduct(v: IProductForm) {
    try {
      const res = await POST(apiRoute.create_product, v).then((res) =>
        res.json(),
      );
      if (res.message !== 'Data not valid') {
        props.onSuccess();
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

  return (
    <div>
      <form
        onSubmit={form.onSubmit((v) => createNewProduct(v))}
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
                {...form.getInputProps('name')}
                sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                required
              />
            </div>
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Date de création</span>
              <div className={'badge_child'}>
                <p>{createdDay}</p>
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
              <div className={'badge_child'}>
                <p>Active</p>
              </div>
            </div>{' '}
          </Group>
          <Group>
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Categories</span>
              <CustomSelect
                width="19.5625rem"
                height="2.25rem"
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
                required={true}
              />
            </div>{' '}
            <div className={'badge'}>
              <span style={{ color: '#858585' }}>Sub-catégorie</span>
              <CustomSelect
                width="19.5625rem"
                height="2.25rem"
                data={subCategory}
                selectBG={{
                  color: '#FFE7EF',
                  image: '/down_arrow.svg',
                  posX: '18.5625rem',
                  posY: '18px',
                }}
                onChange={(e) => {
                  getSubSub(+e.target.value);
                  form.setFieldValue('subcategory_id', +e.target.value);
                }}
                required={true}
              />
            </div>{' '}
            <div className={'badge'} style={{ marginLeft: '1rem' }}>
              <div className={'badge_child'} style={{ marginTop: '2rem' }}>
                <p>{subsubCategory && subsubCategory?.name}</p>
              </div>
            </div>
          </Group>

          <Title order={3} c={'#E7639A'} mt={18}>
            Image du produit
          </Title>
          <Group spacing={'xl'}>
            <div>
              <h4 style={{ color: '#E7639A' }}>Grande</h4>
              {url_image ? (
                <>
                  <ImagePreview
                    imageWidth={174}
                    imageHeight={174}
                    remove={false}
                    image={url_image}
                    onReplace={(file) => {
                      setState((p) => ({ ...p, loading: true }));
                      const deleteRef = ref(storage, url_image);
                      deleteObject(deleteRef)
                        .then(() => console.log('success'))
                        .catch((e) => console.warn(e));
                      const imageRef = ref(storage, `test_image/${Date.now()}`);
                      uploadBytes(imageRef, file).then((snapshot) => {
                        getDownloadURL(snapshot.ref)
                          .then((url) => {
                            setState((p) => ({
                              ...p,
                              url_image: url,
                              loading: false,
                            }));

                            form.setFieldValue('url_image', url);
                          })
                          .catch((e) => console.warn(e));
                      });
                    }}
                  />
                </>
              ) : (
                <Dropzone
                  onDrop={function (file) {
                    setState((p) => ({ ...p, loading: true }));

                    const imageRef = ref(storage, `test_image/${Date.now()}`);
                    uploadBytes(imageRef, file?.[0]).then((snapshot) => {
                      getDownloadURL(snapshot.ref)
                        .then((url) => {
                          setState((p) => ({
                            ...p,
                            url_image: url,
                            loading: false,
                          }));
                          form.setFieldValue('url_image', url);
                        })
                        .catch((e) => console.warn(e));
                    });
                  }}
                  loading={loading}
                  w={174}
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
                    <p style={{ fontSize: '13px' }}>Ajouter une photo</p>
                  </div>
                </Dropzone>
              )}
            </div>
            <div style={{ marginLeft: '5rem' }}>
              <h4 style={{ color: '#E7639A' }}>Album</h4>
              <Group>
                <Dropzone
                  multiple={false}
                  disabled={firebaseImage.length >= 6}
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
                          setState((p) => ({ ...p, progress: prog }));
                        },
                        (error) => console.warn(error),
                        async () => {
                          await getDownloadURL(uploadTask.snapshot.ref).then(
                            (downloadURLs) => {
                              setFireBaseImage((p) => [...p, downloadURLs]);
                            },
                          );
                        },
                      );
                    });
                  }}
                  accept={IMAGE_MIME_TYPE}
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
                  style={{ overflowX: 'auto', display: 'flex', width: '520px' }}
                >
                  {firebaseImage &&
                    firebaseImage.map((image, index) => (
                      <div key={index} style={{ marginLeft: '1rem' }}>
                        <ImagePreview
                          image={image}
                          remove={true}
                          onRemove={function (): void {
                            setFireBaseImage(
                              firebaseImage.filter((item) => item !== image),
                            );
                            const deleteRef = ref(storage, image);
                            deleteObject(deleteRef)
                              .then(() => console.log('success delete'))
                              .catch((e) => console.warn(e));
                          }}
                          onReplace={function (e: File): void {
                            const newImage = [...firebaseImage];
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
                                  setFireBaseImage(newImage);
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
                    required
                    min={0}
                    error={Object.hasOwn(form.errors, 'price') ? 'error' : null}
                  />
                </div>

                <div className={'badge'} style={{ marginTop: '8px' }}>
                  <span style={{ color: '#7C7C7C' }}>Prix bas ( € ) </span>
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
                      form.setFieldValue('discount_price', +e.target.value)
                    }
                    // {...form.getInputProps('discount_price')}
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
                      minDate={new Date()}
                      mt={8}
                      variant={'unstyled'}
                      onChange={(e) => {
                        form.setFieldValue('discount_start_date', e);
                        setState((p) => ({ ...p, start_date: String(e) }));
                      }}
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                      required
                    />
                  </div>
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Pour</span>
                    <DateInput
                      required
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      mt={8}
                      variant={'unstyled'}
                      minDate={new Date(start_date)}
                      rightSection={<img src={'calendar.svg'} alt={'icon'} />}
                      disabled={start_date === ''}
                      {...form.getInputProps('discount_end_date')}
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
                      onChange={(e) =>
                        form.setFieldValue('weight', +e.target.value)
                      }
                      required
                      min={0}
                    />
                  </div>
                  <div>
                    <span style={{ color: '#7C7C7C' }}>Entre pôt </span>
                    <TextInput
                      sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
                      w={228}
                      h={36}
                      pl={10}
                      mt={8}
                      variant={'unstyled'}
                      type={'number'}
                      onChange={(e) =>
                        form.setFieldValue('amount', +e.target.value)
                      }
                      required
                      min={0}
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
