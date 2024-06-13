import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from './components/Layout.tsx';
import Login from './Login.tsx';
import CategoryPage from './pages/CategoryPage.tsx';
import DataAnalytics from './pages/DataAnalytics.tsx';
import DeliveryCost from './pages/DeliveryCost.tsx';
import ListOrder from './pages/ListOrder.tsx';
import ProductManager from './pages/ProductManager.tsx';
import VoucherManager from './pages/VoucherManager.tsx';
import { getCookie } from './utils/cookies.ts';
const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <ProductManager />,
  },
  { path: '/voucher_manager', element: <VoucherManager /> },
  { path: '/delivery_cost', element: <DeliveryCost /> },
  { path: '/data_analytics', element: <DataAnalytics /> },
  { path: '/list_order', element: <ListOrder /> },
  { path: '/category', element: <CategoryPage /> },
]);
function App() {
  console.log('object :>> ', getCookie('refresh_token'));
  return (
    <>
      {getCookie('refresh_token') ? (
        <Layout>
          <RouterProvider router={webRouter} />
        </Layout>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
