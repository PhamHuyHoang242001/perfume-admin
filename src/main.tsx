import { MantineProvider } from '@mantine/core';
import { DatesProvider } from '@mantine/dates';
import { Notifications } from '@mantine/notifications';
import 'dayjs/locale/fr';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import './styles/styles.css';
ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider
    withNormalizeCSS
    withGlobalStyles
    theme={{
      colors: {
        brand: [
          '#F0BBDD',
          '#ED9BCF',
          '#EC7CC3',
          '#ED5DB8',
          '#F13EAF',
          '#F71FA7',
          '#FF00A1',
          '#E00890',
          '#C50E82',
        ],
      },
      primaryColor: 'brand',
      fontFamily: 'Montserrat, sans serif',
    }}
  >
    <Notifications position="top-right" />

    <DatesProvider settings={{ locale: 'fr' }}>
      <App />
    </DatesProvider>
  </MantineProvider>,
);
