import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
 import Registration from './components/Registration'
import AuthApp from './components/Login'
import Home from './components/Admin/Home'
import Home_Supplier from './components/Supplier/Home_Supplier'
import WarehouseReport from './components/Admin/WarehouseReports'
import Login from './components/Login'
import RequestPickupPage from './components/Supplier/RequestPickupPage'
import AdminPickupRequests from './components/Admin/AdminPickupRequests'
import AdminStockManagement from './components/Admin/AdminStockManagement'
import WarehouseInventory from './components/Admin/WarehouseInventory'
import AcceptedPickupOrders from './components/Admin/AcceptedPickupOrders'
import SupplierInvoices from './components/Supplier/SupplierInvoices'
import ManageSuppliers from './components/Admin/ManageSuppliers'

function App() {

  return (
    <>
      <div>
        <Routes>
          <Route path='/adminhome' element={<Home/>}/>
          <Route path='/login' element={<Login/>}/>
          <Route path='/registration' element={<Registration/>}/>
          <Route path='/' element={<HomePage/>}/>
          <Route path='/supplierhome' element={<Home_Supplier/>}/>
          <Route path='/warehousereports' element={<WarehouseReport/>}/>
          <Route path='/requestpickup' element={<RequestPickupPage/>}/>
          <Route path='/adminpickup' element={<AdminPickupRequests/>}/>
          <Route path='/admin_stock_management' element={<AdminStockManagement/>}/>
          <Route path='/warehouseinventory' element={<WarehouseInventory/>}/>
          <Route path='/AcceptedPickupOrders' element={<AcceptedPickupOrders/>}/>
          <Route path='/supplier_invoices' element={<SupplierInvoices/>}/>
          <Route path='/ManageSuppliers' element={<ManageSuppliers/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
