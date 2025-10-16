import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
 import Registration from './components/Registration'
import AuthApp from './components/Login'
import Home from './components/Admin/Home'
import Home_Supplier from './components/Supplier/Home_Supplier'
import WarehouseReport from './components/Admin/WarehouseReports'
import Login from './components/Login'

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
        </Routes>
      </div>
    </>
  )
}

export default App
