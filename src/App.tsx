import Layout from './components/Layout.tsx';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProductManager from './pages/ProductManager.tsx';
import VoucherManager from './pages/VoucherManager.tsx';
import DataAnalytics from './pages/DataAnalytics.tsx';
import Login from './Login.tsx';
import DeliveryCost from './pages/DeliveryCost.tsx';
import  ListOrder  from './pages/ListOrder.tsx';
import CategoryPage from './pages/CategoryPage.tsx';
const webRouter = createBrowserRouter([
  {
    path: '/',
    element: <ProductManager />,
  },
  { path: '/voucher_manager', element: <VoucherManager /> },
  { path: '/delivery_cost', element: <DeliveryCost /> },
  { path: '/data_analytics', element: <DataAnalytics /> },
  { path: '/list_order', element: <ListOrder /> },
  {path:'/category',element:<CategoryPage/>}
]);
function App() {
  return (
    <>
      {localStorage.getItem('auth') ? (
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
