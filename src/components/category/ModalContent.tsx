import { Button, Modal, Select, TextInput, Title } from '@mantine/core';
import { Dropzone, IMAGE_MIME_TYPE } from '@mantine/dropzone';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { useEffect, useState } from 'react';
import { ModalType } from '../../pages/CategoryPage';
import { apiRoute } from '../../utils/apiRoute';
import { DELETE, GET, PATCH, POST, instance } from '../../utils/fetch';
import { itemSelectType } from '../../utils/utilsInterface';
import ImagePreview from '../common/ImagePreview';

type ModalContentProps = {
  opened: boolean;
  handleCloseModal: () => void;
  typeModal: ModalType | null;
  optionSelected: 'category' | 'subcategory' | 'sub-subcategory';
  listCategory: itemSelectType[] | [];
  onSuccess: () => void;
  itemSelected: any;
};

const ModalContent = ({
  opened,
  handleCloseModal,
  typeModal,
  optionSelected,
  listCategory,
  onSuccess,
  itemSelected,
}: ModalContentProps) => {
  const nameType =
    optionSelected === 'category'
      ? 'category'
      : optionSelected === 'subcategory'
      ? 'sub-category'
      : 'sub-sub-category';

  const form = useForm({
    validate: {
      name: (value) => (value.length < 2 ? 'Name is required' : null),
      category_id: (value) =>
        optionSelected !== 'category' && value.length < 1
          ? 'Category is required'
          : null,
      subcategory_id: (value) =>
        optionSelected === 'sub-subcategory' && value.length < 1
          ? 'Sub-category is required'
          : null,
    },
    validateInputOnBlur: true,
    initialValues: {
      image: null as { url: string; id: number } | null,
      name: '',
      description: '',
      category_id: '',
      subcategory_id: '',
    },
  });

  const [isLoading, setIsLoading] = useState(false);
  const [listSubCategory, setListSubCategory] = useState<itemSelectType[] | []>(
    [],
  );

  const variantApi = {
    category: {
      create: apiRoute.create_category,
      update: apiRoute.list_category + itemSelected?.id + '/patch/',
      delete: apiRoute.delete_category + `?ids=${itemSelected?.id}`,
    },
    subcategory: {
      create: apiRoute.create_subcategory,
      update: apiRoute.list_subcategory + itemSelected?.id + '/patch/',
      delete: apiRoute.delete_subcategory + `?ids=${itemSelected?.id}`,
    },
    'sub-subcategory': {
      create: apiRoute.create_sub_subcategory,
      update: apiRoute.list_sub_subcategory + itemSelected?.id + '/patch/',
      delete: apiRoute.delete_sub_subcategory + `?ids=${itemSelected?.id}`,
    },
  };

  const getListOptions = async (value?: string) => {
    try {
      const res = await GET(
        apiRoute.list_subcategory + `?category_id=${value}`,
      );
      const newData = res.data?.results?.map((item: any) => ({
        label: item?.name,
        value: item?.id,
      }));

      setListSubCategory(newData);
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const handlePostImage = async (image: File) => {
    if (!image) return null;

    try {
      const formData = new FormData();

      formData.append('name', image?.name);
      formData.append('source ', 'product');
      formData.append('file', image);

      const resFile = await instance.post(apiRoute.upload_image, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return resFile.data;
    } catch (error) {
      console.log('error :>> ', error);
    }
  };

  const onSubmit = async (value: any) => {
    if (isLoading) return;
    setIsLoading(true);

    if (typeModal === 'EDIT') {
      handleUpdate(value);
      return;
    }

    let payload = {
      name: value?.name,
    } as any;

    payload = { ...payload, image: value?.image?.id };

    if (optionSelected === 'subcategory') {
      payload = { ...payload, category: value?.category_id };
    }
    if (optionSelected === 'sub-subcategory') {
      payload = {
        ...payload,
        category: value?.category_id,
        subcategory: value?.subcategory_id,
      };
    }

    const url = variantApi[optionSelected]?.create;

    try {
      const res = await POST(url, payload);

      if (res.status === 201) {
        notifications.show({
          message: `Add new ${nameType} successfully`,
          color: 'green',
        });
        onSuccess();
        handleCloseModal();
        form.reset();
      } else {
        notifications.show({
          message: `Add new ${nameType} fail`,
          color: 'red',
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error :>> ', error);
    }
  };

  const handleUpdate = async (value: any) => {
    let payload = {
      name: value?.name,
    } as any;
    if (value?.image && value?.image?.id !== itemSelected?.image?.id) {
      payload = { ...payload, image: value?.image?.id };
    }

    if (
      optionSelected === 'subcategory' &&
      +value?.category_id !== +itemSelected?.category?.id
    ) {
      payload = { ...payload, category: value?.category_id };
    }
    if (optionSelected === 'sub-subcategory') {
      payload = {
        ...payload,
        category: value?.category_id,
        subcategory: value?.subcategory_id,
      };
    }

    const url = variantApi[optionSelected]?.update;

    try {
      const res = await PATCH(url, payload);

      if (res.status === 200) {
        notifications.show({
          message: `Update ${nameType} successfully`,
          color: 'green',
        });
        onSuccess();
        handleCloseModal();
        form.reset();
      } else {
        notifications.show({
          message: `Update ${nameType} fail`,
          color: 'red',
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error :>> ', error);
    }
  };

  const handleDelete = async () => {
    if (isLoading) return;

    setIsLoading(true);

    const url = variantApi[optionSelected]?.delete;

    try {
      const res = await DELETE(url);

      if (res.status === 204) {
        notifications.show({
          message: `Delete ${nameType} successfully`,
          color: 'green',
        });
        onSuccess();
        handleCloseModal();
        form.reset();
      } else {
        notifications.show({
          message: `Delete ${nameType} fail`,
          color: 'red',
        });
      }
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
      console.log('error :>> ', error);
    }
  };

  useEffect(() => {
    if (itemSelected) {
      form.setValues({
        ...itemSelected,
        category_id: itemSelected?.category?.id,
        subcategory_id: itemSelected?.subcategory?.id,
      });
    }
  }, [itemSelected]);

  const contentDelete = (
    <div className="w-[370px]">
      <div className="text-sm">
        Do you really want to delete this {nameType}?
      </div>
      <div className="flex float-right gap-2 mt-10 mb-5">
        <Button
          variant={'subtle'}
          className="text-sm font-medium"
          onClick={handleCloseModal}
        >
          <span style={{ color: '#333' }}>Cancel</span>
        </Button>
        <Button
          onClick={handleDelete}
          className="text-sm font-medium"
          bg="#E13434"
          color="white"
        >
          Delete
        </Button>
      </div>
    </div>
  );

  return (
    <Modal.Root
      opened={opened}
      onClose={() => {
        handleCloseModal();
        form.reset();
      }}
      size={'auto'}
    >
      <Modal.Overlay />
      <Modal.Content
        sx={{
          top: '50%',
        }}
      >
        {typeModal !== 'DELETE' && (
          <Modal.Header>
            <Modal.Title>
              <Title c={'#B82C67'} order={1} mt={32} ml={64}>
                {typeModal === 'ADD'
                  ? `Add new ${nameType}`
                  : `Update ${nameType}`}
              </Title>
            </Modal.Title>
            <Modal.CloseButton style={{ marginRight: 24 }}>
              <img src={'/close.svg'} alt={'icon'} />
            </Modal.CloseButton>
          </Modal.Header>
        )}
        <Modal.Body>
          {typeModal === 'DELETE' ? (
            contentDelete
          ) : (
            <form
              onSubmit={form.onSubmit((v) => onSubmit(v))}
              className="min-w-[1100px] pt-6 px-16 pb-8"
            >
              <div className="flex flex-col gap-5">
                <div className="grid grid-cols-3 gap-4">
                  <div className="flex flex-col gap-2">
                    <span style={{ color: '#707070', fontSize: 12 }}>
                      Name of {nameType}
                      <span className="text-[#FF0000]">*</span>
                    </span>

                    <TextInput
                      variant="unstyled"
                      sx={{
                        border: form.errors?.name
                          ? '1px solid #FF0000'
                          : '1px solid #BFBFBF',
                        padding: '0 5px',
                        borderRadius: '5px',
                        maxWidth: '347px',
                        fontSize: 14,
                      }}
                      h={38}
                      {...form.getInputProps('name')}
                    />
                  </div>
                  {optionSelected !== 'category' && (
                    <div className="flex flex-col gap-2">
                      <span style={{ color: '#707070', fontSize: 12 }}>
                        Category
                        <span className="text-[#FF0000]">*</span>
                      </span>
                      <Select
                        data={listCategory as any}
                        variant="unstyled"
                        rightSection={<img alt="icon" src="/down_arrow.svg" />}
                        bg={'#FFE7EF'}
                        dropdownPosition="bottom"
                        maxDropdownHeight={130}
                        sx={{
                          borderRadius: 4,
                          height: 38,
                          '.mantine-bkyer9': {
                            fontSize: 12,
                          },
                        }}
                        {...form.getInputProps('category_id')}
                        onChange={(v) => {
                          form.setFieldValue('category_id', v as any);
                          form.setFieldValue('subcategory_id', '');
                          optionSelected === 'sub-subcategory' &&
                            getListOptions(v as string);
                        }}
                        value={form.values?.category_id as any}
                      />
                    </div>
                  )}
                  {optionSelected === 'sub-subcategory' && (
                    <div className="flex flex-col gap-2">
                      <span style={{ color: '#707070', fontSize: 12 }}>
                        Sub-category
                        <span className="text-[#FF0000]">*</span>
                      </span>
                      <Select
                        data={listSubCategory as any}
                        variant="unstyled"
                        rightSection={<img alt="icon" src="/down_arrow.svg" />}
                        maxDropdownHeight={150}
                        bg={'#FFE7EF'}
                        sx={{
                          borderRadius: 4,
                          height: 38,
                          '.mantine-bkyer9': {
                            fontSize: 12,
                          },
                        }}
                        {...form.getInputProps('subcategory_id')}
                        value={form.values?.subcategory_id as any}
                        onChange={(v) => {
                          form.setFieldValue('subcategory_id', v as any);
                        }}
                      />
                    </div>
                  )}
                </div>
                {optionSelected === 'category' && (
                  <div className="flex flex-col gap-2">
                    <span style={{ color: '#707070', fontSize: 12 }}>
                      Category’s image
                    </span>

                    {form?.values?.image?.url ? (
                      <>
                        <ImagePreview
                          imageWidth={174}
                          imageHeight={174}
                          remove={false}
                          image={form?.values?.image?.url}
                          onReplace={(file) => {
                            if (file) {
                              handlePostImage(file).then((res) => {
                                form.setFieldValue('image', res);
                                console.log('res :>> ', res);
                              });
                            }
                          }}
                        />
                      </>
                    ) : (
                      <Dropzone
                        onDrop={(file) => {
                          if (file) {
                            handlePostImage(file?.[0]).then((res) => {
                              form.setFieldValue('image', res);
                              console.log('res :>> ', res);
                            });
                          }
                        }}
                        w={174}
                        multiple={false}
                        h={174}
                        accept={IMAGE_MIME_TYPE}
                      >
                        <div className="flex flex-col items-center gap-2 mt-10">
                          <img
                            src={'/add_image_ic.svg'}
                            width={32}
                            height={32}
                            alt={'img'}
                          />
                          <p className="text-xs">Add image</p>
                        </div>
                      </Dropzone>
                    )}
                  </div>
                )}
              </div>
              <Button
                type="submit"
                className="block mx-auto mt-14"
                bg={'#B82C67'}
                radius={'md'}
                w={120}
                h={42}
                disabled={isLoading}
              >
                Done
              </Button>
            </form>
          )}
        </Modal.Body>
      </Modal.Content>
    </Modal.Root>
  );
};

export default ModalContent;
