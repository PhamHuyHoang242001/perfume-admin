import {
  UnstyledButton,
  BackgroundImage,
  Text,
  Button,
  Paper,
  Indicator,
  Box,
  Menu,
  createStyles,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { POST } from '../utils/fetch';
const useStyles = createStyles((theme) => ({
  item: {
    '&[data-hovered]': {
      backgroundColor:
        theme.colors[theme.primaryColor][theme.fn.primaryShade()],
      color: theme.white,
    },
  },
}));
const { Target, Dropdown, Item } = Menu;
const HeaderMenu = () => {
  const { classes } = useStyles();
  const logout = async () => {
    try {
      const res = await POST('/api/admin/logout');
      if (res.status === 200) {
        localStorage.removeItem('auth');
        window.location.reload();
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
    <BackgroundImage src={'/banner.png'} h={'26vh'} p={'lg'}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <Menu trigger="hover" classNames={classes}>
          <Target>
            <UnstyledButton>
              <div style={{ textAlign: 'center' }}>
                <img src={'/bars.svg'} alt={'icon'} />
                <br />
                <Text c={'pink'} fz={'md'} fw={700}>
                  Menu
                </Text>
              </div>
            </UnstyledButton>
          </Target>
          <Dropdown bg={'#B82C67'}>
            <Item>
              <a
                href={'/category'}
                style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 400,
                  cursor: 'pointer',
                }}
              >
                Category
              </a>
            </Item>
            <Item>
              <a
                href={'/'}
                style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 400,
                  cursor: 'pointer',
                }}
              >
                Chef de produit
              </a>
            </Item>
            <Item>
              <a
                href={'/voucher_manager'}
                style={{
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 400,
                  cursor: 'pointer',
                }}
              >
                Gestionnaire de bons
              </a>
            </Item>
            <Item>
              <a
                href={'/delivery_cost'}
                style={{
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
              >
                Frais de port
              </a>
            </Item>{' '}
            <Item>
              <a
                href={'/list_order'}
                style={{
                  cursor: 'pointer',
                  color: '#fff',
                  fontSize: '16px',
                  fontWeight: 400,
                }}
              >
                Ordre de la liste
              </a>
            </Item>
          </Dropdown>
        </Menu>
        <div style={{ display: 'flex' }}>
          <Box mr={8} component={'div'}>
            <Menu>
              <Target>
                <Indicator inline position={'bottom-end'}>
                  <img src={'/bell.svg'} alt={'icon'} />
                </Indicator>
              </Target>
              <Dropdown bg={'pink'}>
                <Paper>test</Paper>
              </Dropdown>
            </Menu>
          </Box>
          <Menu classNames={classes}>
            <Target>
              <UnstyledButton>
                <div style={{ textAlign: 'center' }}>
                  <img alt={'icon'} src={'/user.svg'} width={24} height={24} />
                  <Text c={'pink'}>Admin@email.com</Text>
                </div>
              </UnstyledButton>
            </Target>
            <Dropdown bg={'#B82C67'}>
              <Item>
                <Button onClick={() => logout()} variant="unstyled">
                  Se déconnecter
                </Button>
              </Item>
            </Dropdown>
          </Menu>
        </div>
      </div>
    </BackgroundImage>
  );
};

export default HeaderMenu;
