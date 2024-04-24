import {
  TextInput,
  PasswordInput,
  Paper,
  Title,
  Container,
  Button,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { POST } from './utils/fetch';
import { notifications } from '@mantine/notifications';
export default function Login() {
  const form = useForm({
    initialValues: {
      email: '',
      password: '',
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'Invalid email'),
    },
  });
  const login = async (v: { email: string; password: string }) => {
    try {
      const res = await POST('/api/admin/login', v).then((res) => res.json());
      if (res.is_admin) {
        localStorage.setItem('auth', 'true');
        window.location.reload();
      } else {
        notifications.show({
          title: 'Warning',
          message: `You do not have permison`,
          color: 'red',
        });
      }
    } catch (error) {
      notifications.show({
        title: 'Warning',
        message: `${error}`,
        color: 'red',
      });
    }
  };
  return (
    <Container size={420} my={40}>
      <Title align="center">Content De Te Revoir!</Title>
      <Paper
        withBorder
        shadow="md"
        p={30}
        mt={30}
        radius="md"
        component="form"
        onSubmit={form.onSubmit((v) => login(v))}
      >
        <TextInput label="E-mail" required {...form.getInputProps('email')} />
        <PasswordInput
          label="Mot De Passe"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Button type="submit" fullWidth mt="xl">
          Connexion
        </Button>
      </Paper>
    </Container>
  );
}
