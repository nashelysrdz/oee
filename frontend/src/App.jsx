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
import Fallas from "./pages/admin/Fallas";
import Empleados from "./pages/admin/Empleados";
import Celdas from "./pages/admin/Celdas";
import Maquinas from "./pages/admin/Maquinas";
import CeldasMaquinas from "./pages/admin/CeldasMaquinas";

//Pages Emp
import HomeEmp from "./pages/emp/Home";
import HomeTecnico from "./pages/emp/HomeTecnico";
import HomeOperador from "./pages/emp/HomeOperador";
import CeldaDetalle from "./pages/emp/CeldaDetalle";

// protección
import PrivateRoute from "./components/PrivateRoute";

import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <BrowserRouter>
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/registro" element={<Register />} />
        <Route path="/olvide-password" element={<ForgetPassword />} />

        <Route path="/" element={
            <PrivateRoute adminOnly={true}>
              <LayoutAdmin />
            </PrivateRoute>
          }
        >
          <Route index element={<Home />} />
          <Route path="perfil" element={<Profile />} />
          <Route path="chat" element={<Chat />} />
          <Route path="tickets" element={<Tickets />} />
          <Route path="fallas" element={<Fallas />} />
          <Route path="empleados" element={<Empleados />} />
          <Route path="celdas" element={<Celdas />} />
          <Route path="celdasMaquinas" element={<CeldasMaquinas />}/>
          <Route path="/maquinas/:id_celda" element={<Maquinas />} />
        </Route>

        <Route path="dashboard" element={
            <PrivateRoute allowedRoles={["tecnico", "operador"]}>
              <LayoutEmp />
            </PrivateRoute>
          }>
          <Route path="tecnico" element={<HomeTecnico/>} />
          <Route path="operador" element={<HomeOperador/>} />
          <Route path="celda/:id" element={<CeldaDetalle />} />
        </Route>

        <Route path="*" element={<Error404 />} />
      </Routes>
      <ToastContainer />
      </>
    </BrowserRouter>
  );
}

export default App;
