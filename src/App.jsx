import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layouts
import LayoutEmp from "./layouts/LayoutEmp";
import LayoutAdmin from "./layouts/LayoutAdmin";
// Pages auth
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgetPassword from "./pages/auth/ForgetPassword";
// Pages admin
import Home from "./pages/admin/Home";
import Profile from "./pages/admin/Profile";
import Chat from "./pages/admin/Chat";
import Error404 from "./pages/Error404";
import Tickets from "./pages/admin/Tickets";
//Pages Emp
import HomeEmp from "./pages/emp/Home";
import HomeTecnico from "./pages/emp/HomeTecnico";
import HomeOperador from "./pages/emp/HomeOperador";
import CeldaDetalle from "./pages/emp/CeldaDetalle";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/olvide-password" element={<ForgetPassword />} />

        <Route path="/" element={<LayoutAdmin />}>
          <Route index element={<Home />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tickets" element={<Tickets />} />
        </Route>

        <Route path="dashboard" element={<LayoutEmp/>}>
          <Route path="tecnico" element={<HomeTecnico/>} />
          <Route path="operador" element={<HomeOperador/>} />
          <Route path="celda/:id" element={<CeldaDetalle />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
