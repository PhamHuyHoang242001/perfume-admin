import { Title, Button, TextInput, Checkbox } from '@mantine/core';

import { useForm } from '@mantine/form';
// import {
//   ref,
//   deleteObject,
//   uploadBytes,
//   getDownloadURL,
// } from 'firebase/storage';
import { useEffect, useState } from 'react';
// import ImagePreview from '../components/common/ImagePreview';
// import { storage } from '../utils/firebaseConfig';
// import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { POST } from '../utils/fetch';
import { apiRoute } from '../utils/apiRoute';
import { CategoryType } from '../utils/utilsInterface';
import CustomSelect from '../components/common/CustomSelect';

const CategoryPage = () => {
  // const [state, setState] = useState({
  //   image: '',
  //   loading: false,
  // });
  // const { image, loading } = state;
  const [category, setCategory] = useState([]);
  const categoryForm = useForm<Partial<CategoryType>>({
    initialValues: {
      name: '',
      index: 0,
      enable: true,
      slug: '',
    },
  });
  const subCategoryForm = useForm({
    initialValues: {
      name: '',
      slug: '',
      category: 0,
    },
  });
  async function createCategory(v: CategoryType) {
    try {
      return await POST(apiRoute.create_category, v);
    } catch (error) {
      alert(error);
    }
  }
  async function createSubcategory(v: CategoryType) {
    try {
      return await POST('/api/subcategory/create', v);
    } catch (error) {
      alert(error);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    fetch('/api/category/list', {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((data) =>
        setCategory(
          data.map((item: Partial<CategoryType>) => ({
            label: item.name,
            value: item.id,
          })),
        ),
      );
    return () => controller.abort();
  }, []);
  return (
    <div
      style={{
        display: 'flex',
        gap: 20,
        maxWidth: 1440,
        margin: 'auto',
        justifyContent:'space-evenly'
      }}
    >
      <form
        onSubmit={categoryForm.onSubmit((v: CategoryType) => createCategory(v))}
      >
        <Title order={2} c={'#B82C67'}>
          Create category
        </Title>

        <div className="category-form">
          <div className={'badge'}>
            <span style={{ color: '#858585' }}>Category Name</span>
            <TextInput
              p={'0 10px'}
              h={36}
              variant={'unstyled'}
              width={313}
              mt={'8px'}
              {...categoryForm.getInputProps('name')}
              sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              required
            />
          </div>
          <div className={'badge'}>
            <span style={{ color: '#858585' }}>Index</span>
            <TextInput
              p={'0 10px'}
              h={36}
              variant={'unstyled'}
              width={313}
              min={1}
              type="number"
              mt={'8px'}
              onChange={(v) =>
                categoryForm.setFieldValue('index', +v.target.value)
              }
              sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              required
            />
          </div>
          <div className="badge">
            <Checkbox
              label="Enable"
              {...categoryForm.getInputProps('enable')}
              defaultChecked
            />
          </div>
          {/* <div>
          <h4 style={{ color: '#E7639A' }}>Image</h4>
          {image ? (
            <>
              <ImagePreview
                imageWidth={174}
                imageHeight={174}
                remove={false}
                image={image}
                onReplace={(file) => {
                  setState((p) => ({ ...p, loading: true }));
                  const deleteRef = ref(storage, image);
                  deleteObject(deleteRef)
                    .then(() => console.log('success'))
                    .catch((e) => console.warn(e));
                  const imageRef = ref(storage, `test_image/${Date.now()}`);
                  uploadBytes(imageRef, file).then((snapshot) => {
                    getDownloadURL(snapshot.ref)
                      .then((url) => {
                        setState((p) => ({
                          ...p,
                          image: url,
                          loading: false,
                        }));

                        form.setFieldValue('image', url);
                      })
                      .catch((e) => console.warn(e));
                  });
                }}
              />
            </>
          ) : (
            <Dropzone
              onDrop={function (file: File[]) {
                setState((p) => ({ ...p, loading: true }));

                const imageRef = ref(storage, `test_image/${Date.now()}`);
                uploadBytes(imageRef, file?.[0]).then((snapshot) => {
                  getDownloadURL(snapshot.ref)
                    .then((url) => {
                      setState((p) => ({
                        ...p,
                        image: url,
                        loading: false,
                      }));
                      form.setFieldValue('image', url);
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
        </div> */}
          <div className={'badge'}>
            <span style={{ color: '#858585' }}>Slug</span>
            <TextInput
              p={'0 10px'}
              h={36}
              variant={'unstyled'}
              width={313}
              min={1}
              mt={'8px'}
              {...categoryForm.getInputProps('slug')}
              sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              required
            />
          </div>
          <Button
            rightIcon={<img src="/plus.svg" alt="icon" />}
            bg={'#B82C67'}
            w={'11.6875rem'}
            h={'2.625rem'}
            type="submit"
          >
            Create category{' '}
          </Button>
        </div>
      </form>
      <form onSubmit={subCategoryForm.onSubmit((v) => createSubcategory(v))}>
        <Title order={2} c={'#B82C67'}>
          Create Subcategory
        </Title>
        <div className="category-form">
          <div className={'badge'}>
            <span style={{ color: '#858585' }}>Sub Category Name</span>
            <TextInput
              p={'0 10px'}
              h={36}
              variant={'unstyled'}
              width={313}
              mt={'8px'}
              {...subCategoryForm.getInputProps('name')}
              sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              required
            />
          </div>
          <div className="badge">
            <span style={{ color: '#858585' }}>Category</span>
            <CustomSelect
              selectBG={{
                color: '#FFE7EF',
                image: '/down_arrow.svg',
                posX: '18.5625rem',
                posY: '18px',
              }}
              data={category}
              onChange={function (
                e: React.ChangeEvent<HTMLSelectElement>,
              ): void {
                subCategoryForm.setFieldValue('category', +e.target.value);
              }}
              width="19.5625rem"
              height="2.25rem"
            />
          </div>

          <div className={'badge'}>
            <span style={{ color: '#858585' }}>Slug</span>
            <TextInput
              p={'0 10px'}
              h={36}
              variant={'unstyled'}
              width={313}
              min={1}
              mt={'8px'}
              {...subCategoryForm.getInputProps('slug')}
              sx={{ border: '1px solid #B82C67', borderRadius: '5px' }}
              required
            />
          </div>
          <Button
            rightIcon={<img src="/plus.svg" alt="icon" />}
            bg={'#B82C67'}
            w={'11.6875rem'}
            h={'2.625rem'}
            type="submit"
          >
            Create Subcategory{' '}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default CategoryPage;
