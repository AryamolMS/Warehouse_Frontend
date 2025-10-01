import { Route, Routes } from 'react-router-dom'
import './App.css'
import HomePage from './components/HomePage'
 import Registration from './components/Registration'
import AuthApp from './components/Login'
import Home from './components/Admin/Home'

function App() {

  return (
    <>
      <div>
        <Routes>
          <Route path='/adminhome' element={<Home/>}/>
          <Route path='/login' element={<AuthApp/>}/>
          <Route path='/registration' element={<Registration/>}/>
          <Route path='/' element={<HomePage/>}/>
        </Routes>
      </div>
    </>
  )
}

export default App
