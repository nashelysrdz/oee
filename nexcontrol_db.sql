-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 27-04-2026 a las 23:41:06
-- Versión del servidor: 10.4.21-MariaDB
-- Versión de PHP: 8.0.19

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `nexcontrol_db`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_celda`
--

CREATE TABLE `tbl_celda` (
  `id_celda` int(11) NOT NULL,
  `nombre_celda` varchar(100) DEFAULT NULL,
  `columna` int(11) NOT NULL DEFAULT 0,
  `fila` int(11) NOT NULL DEFAULT 0,
  `activo` tinyint(1) DEFAULT 1,
  `posicion_activa` varchar(20) GENERATED ALWAYS AS (case when `activo` = 1 then concat(`fila`,'-',`columna`) else NULL end) STORED,
  `id_usuario_creacion` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `id_usuario_modificacion` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_celda`
--

INSERT INTO `tbl_celda` (`id_celda`, `nombre_celda`, `columna`, `fila`, `activo`, `id_usuario_creacion`, `fecha_creacion`, `id_usuario_modificacion`, `fecha_modificacion`) VALUES
(1, 'celda1', 2, 2, 0, 1, '2026-04-22 16:19:32', 1, '2026-04-22 16:19:57'),
(2, 'celda1', 1, 0, 0, 1, '2026-04-22 16:20:33', 1, '2026-04-22 16:48:06'),
(3, 'celda2', 2, 2, 0, 1, '2026-04-22 16:21:02', 1, '2026-04-22 16:47:22'),
(4, 'hh', 1, 0, 0, 1, '2026-04-22 17:59:18', 1, '2026-04-22 17:59:20'),
(5, 'celda 2 mod', 5, 2, 0, 1, '2026-04-22 18:14:29', 1, '2026-04-22 19:10:07'),
(6, 'celda3', 2, 3, 0, 1, '2026-04-22 18:17:50', 1, '2026-04-22 19:09:31'),
(7, 'celda1', 3, 1, 1, 1, '2026-04-22 19:11:10', NULL, NULL),
(8, 'celda 2', 6, 1, 1, 1, '2026-04-22 19:41:08', 1, '2026-04-23 11:24:14');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_detalle_registro`
--

CREATE TABLE `tbl_detalle_registro` (
  `id_detalle_registro` int(11) NOT NULL,
  `id_registro_falla` int(11) NOT NULL,
  `id_falla` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_trabajador_creacion` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_trabajador_modificacion` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_estatus_maquina`
--

CREATE TABLE `tbl_estatus_maquina` (
  `id_estatus_maquina` int(11) NOT NULL,
  `estatus_maquina` varchar(50) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_usuario_creacion` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_usuario_modificacion` int(11) NOT NULL,
  `fecha_modificacion` datetime NOT NULL,
  `codigo` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_estatus_maquina`
--

INSERT INTO `tbl_estatus_maquina` (`id_estatus_maquina`, `estatus_maquina`, `activo`, `id_usuario_creacion`, `fecha_creacion`, `id_usuario_modificacion`, `fecha_modificacion`, `codigo`) VALUES
(1, 'Disponible', 1, 1, '2026-04-07 11:32:49', 1, '2026-04-07 11:32:49', 'DISPONIBLE'),
(2, 'En mantenimiento', 1, 1, '2026-04-07 11:32:49', 1, '2026-04-07 11:32:49', 'MANTENIMIENTO');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_falla`
--

CREATE TABLE `tbl_falla` (
  `id_falla` int(11) NOT NULL,
  `codigo` varchar(10) NOT NULL,
  `falla` varchar(300) NOT NULL,
  `tipo_falla` varchar(100) NOT NULL,
  `activo` tinyint(1) DEFAULT 1,
  `id_usuario_creacion` int(11) DEFAULT NULL,
  `fecha_creacion` datetime DEFAULT NULL,
  `id_usuario_modificacion` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_falla`
--

INSERT INTO `tbl_falla` (`id_falla`, `codigo`, `falla`, `tipo_falla`, `activo`, `id_usuario_creacion`, `fecha_creacion`, `id_usuario_modificacion`, `fecha_modificacion`) VALUES
(1, '01', 'AGUJA DAÑADA / MAL COLOCADA', 'OPERATIVA', 1, 1, '2026-04-07 14:10:26', 1, '2026-04-17 23:13:31'),
(2, '02', 'AJUSTE DE ABRIDOR MECANICO', 'CORRECTIVA', 1, 1, '2026-04-07 14:10:26', 1, '2026-04-17 17:00:46'),
(3, '03', 'AJUSTE DE ALIMENTADOR', 'Correctiva', 1, 1, '2026-04-07 14:10:26', 1, '2026-04-07 14:10:26'),
(4, '04', 'AJUSTE DE ALTURA DE AGUJA', 'Correctiva', 1, 1, '2026-04-07 14:10:26', 1, '2026-04-07 14:10:26'),
(5, '05', 'AJUSTE DE BANDA', 'Correctiva', 1, 1, '2026-04-07 14:10:26', 1, '2026-04-07 14:10:26'),
(6, '6', 'AJUSTE DE CANASTILLA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(7, '7', 'AJUSTE DE DEVANADOR', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(8, '8', 'AJUSTE DE DISTANCIA DE CARRO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(9, '9', 'AJUSTE DE FOLDER/GUIA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(10, '10', 'AJUSTE DE GUARDA DE GANCHO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(11, '11', 'AJUSTE DE LEVA DE LOOPERS', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(12, '12', 'AJUSTE DE NAVAJAS', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(13, '13', 'AJUSTE DE PEDAL', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(14, '14', 'AJUSTE DE PLACA DE ALIMENTACION', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(15, '15', 'AJUSTE DE PLACA DE TENSIONES', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(16, '16', 'AJUSTE DE PUNTADAS X PULGADA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(17, '17', 'AJUSTE DE PRESION DE PIES', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(18, '18', 'AJUSTE DE RACKS', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(19, '19', 'AJUSTE DE REMATE', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(20, '20', 'AJUSTE DE RESORTE VERIFICADOR', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(21, '21', 'AJUSTE DE TIEMPO DEL GANCHO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(22, '22', 'AJUSTE DE VELOCIDAD', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(23, '23', 'ALTERNACION DE PIES', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(24, '24', 'CAMBIO DE ALIMENTADOR', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(25, '25', 'CAMBIO DE BANDA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(26, '26', 'CAMBIO DE GANCHO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(27, '27', 'CAMBIO DE OPRESOR', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(28, '28', 'CAMBIO DE PLACA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(29, '29', 'CAMBIO DE POSICIONADOR', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(30, '30', 'CAMBIO DE TEFLON', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(31, '31', 'CAMBIO DE TORNILLO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(32, '32', 'CAMBIO DE PIES', 'OPERATIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(33, '33', 'DANA MATERIAL', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(34, '34', 'DESENHEBRA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(35, '35', 'ENGARRUNA / ONDULACIONES', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(36, '36', 'ERROR EN PANEL', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(37, '37', 'EXTENSION DE MADERA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(38, '42', 'FALTA LUBRICACION', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(39, '43', 'FUERA DE TIEMPO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(40, '44', 'FUGA DE ACEITE', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(41, '45', 'FUGA DE AIRE', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(42, '46', 'GUARDA DE BANDA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(43, '47', 'GUARDA DE MOTOR', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(44, '48', 'GUARDA DE TIRA HILOS', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(45, '49', 'HILOS ENREDADOS', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(46, '50', 'LAMPARA DE MAQUINA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(47, '51', 'LIMPIEZA DE CARTER', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(48, '52', 'SISTEMA DE LUBRICACION', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(49, '53', 'MAL ENHEBRADO', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(50, '54', 'MANGUERA TPM', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(51, '55', 'MANTENIMIENTO PREVENTIVO', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(52, '56', 'MAQUINA AMARRADA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(53, '57', 'MAQUINA DE APOYO', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(54, '58', 'MAQUINA DESCONECTADA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(55, '59', 'MARCO DE BARRA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(56, '60', 'MATERIAL ATRAPADO', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(57, '61', 'NO AVANZA EL MATERIAL', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(58, '62', 'NO CORTA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(59, '63', 'NO HACE CADENA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(60, '64', 'NO LEVANTA EL PIE', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(61, '65', 'VARIAN MEDIDAS', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(62, '66', 'ORDEN MAL INGRESADA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(63, '67', 'PATINA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(64, '68', 'PIEZA MECANICA DANADA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(65, '69', 'POSICIONES DE AGUJA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(66, '70', 'QUIEBRA AGUJAS', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(67, '71', 'REPARACION FUERA DE LINEA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(68, '72', 'ROTACION INVERTIDA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(69, '73', 'ROTURA DE HILO', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(70, '74', 'SALTO DE PUNTADA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(71, '75', 'SEGURO DE GUIA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(72, '76', 'TAMANO DE LA HEBRA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(73, '77', 'TAPETE DANADO', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(74, '78', 'TENSIONES', 'OPERATIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(75, '79', 'TORNILLOS FALTANTES', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(76, '80', 'GUARDAS DE PISACOSTURAS', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(77, '81', 'NO PLISA', 'CORRECTIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(78, '841', 'CARRETE COMPRIMIDO', 'OPERATIVA', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(79, '842', 'CAMBIO DE CELDA', 'SIN AFECTACION', 1, 1, '2026-04-15 00:00:00', 1, '2026-04-15 00:00:00'),
(80, '0006', 'pueva de fallas modificado', 'SIN AFECTACION', 1, NULL, NULL, 1, '2026-04-17 16:59:29'),
(81, '00099', 'prueba insert', 'SIN AFECTACION', 1, 1, '2026-04-17 17:00:14', NULL, NULL),
(82, '00022', 'detalle', 'CORRECTIVA', 0, 1, '2026-04-17 23:13:24', 1, '2026-04-20 16:45:09'),
(83, '', '', 'CORRECTIVA', 0, 1, '2026-04-17 23:14:56', 1, '2026-04-20 16:41:59');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_maquina`
--

CREATE TABLE `tbl_maquina` (
  `id_maquina` int(11) NOT NULL,
  `id_celda` int(11) NOT NULL,
  `nombre_maquina` varchar(100) DEFAULT NULL,
  `id_estatus_maquina` int(11) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL,
  `id_usuario_creacion` int(11) NOT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `id_usuario_modificacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_maquina`
--

INSERT INTO `tbl_maquina` (`id_maquina`, `id_celda`, `nombre_maquina`, `id_estatus_maquina`, `activo`, `fecha_creacion`, `id_usuario_creacion`, `fecha_modificacion`, `id_usuario_modificacion`) VALUES
(1, 7, 'Maquina 1', 1, 1, '2026-04-22 12:25:08', 1, '2026-04-22 12:25:08', 1),
(2, 8, 'maquina de la celda 2', 1, 1, '2026-04-22 12:51:34', 1, '2026-04-23 11:21:09', 1),
(3, 8, 'mnnnmm', 2, 0, '2026-04-23 11:06:16', 1, '2026-04-23 11:06:30', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_registro_falla`
--

CREATE TABLE `tbl_registro_falla` (
  `id_registro_falla` int(11) NOT NULL,
  `id_maquina` int(11) NOT NULL,
  `id_trabajador_mantenimiento` int(11) DEFAULT NULL,
  `folio` varchar(100) NOT NULL,
  `hora_inicio` datetime DEFAULT NULL,
  `hora_fin` datetime DEFAULT NULL,
  `numero_orden` varchar(15) DEFAULT NULL,
  `fecha_registro` date NOT NULL,
  `comentarios` varchar(500) DEFAULT NULL,
  `id_trabajador_creacion` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_trabajador_modificacion` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_tipo_trabajador`
--

CREATE TABLE `tbl_tipo_trabajador` (
  `id_tipo_trabajador` int(11) NOT NULL,
  `tipo_trabajador` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_usuario_creacion` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_usuario_modificacion` int(11) NOT NULL,
  `fecha_modificacion` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_tipo_trabajador`
--

INSERT INTO `tbl_tipo_trabajador` (`id_tipo_trabajador`, `tipo_trabajador`, `activo`, `id_usuario_creacion`, `fecha_creacion`, `id_usuario_modificacion`, `fecha_modificacion`) VALUES
(1, 'Operador', 1, 1, '2026-04-01 11:57:17', 1, '2026-04-01 11:57:17'),
(2, 'Tecnico', 1, 1, '2026-04-01 11:57:32', 1, '2026-04-01 11:57:32');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_trabajador`
--

CREATE TABLE `tbl_trabajador` (
  `id_trabajador` int(11) NOT NULL,
  `numero_empleado` varchar(20) NOT NULL,
  `id_tipo_trabajador` int(11) NOT NULL,
  `nombre_trabajador` varchar(250) NOT NULL,
  `es_admin` tinyint(1) NOT NULL DEFAULT 0,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `fecha_creacion` datetime NOT NULL,
  `id_usuario_creacion` tinyint(1) NOT NULL,
  `fecha_modificacion` datetime DEFAULT NULL,
  `id_usuario_modificacion` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_trabajador`
--

INSERT INTO `tbl_trabajador` (`id_trabajador`, `numero_empleado`, `id_tipo_trabajador`, `nombre_trabajador`, `es_admin`, `activo`, `fecha_creacion`, `id_usuario_creacion`, `fecha_modificacion`, `id_usuario_modificacion`) VALUES
(1, '5678', 2, 'Juan Perez', 1, 1, '2026-04-01 12:01:38', 1, '2026-04-24 17:51:06', 4),
(2, '9222', 1, 'Martin Ruiz', 0, 1, '2026-04-01 12:02:24', 1, '2026-04-20 16:06:07', 1),
(3, '01010', 2, 'Edgar Salas', 1, 1, '2026-04-01 12:03:16', 1, '2026-04-24 17:54:50', 4),
(4, '090909', 2, 'Pedro ruiz', 0, 1, '2026-04-20 17:20:20', 1, '2026-04-24 18:07:15', 4),
(5, '0808', 2, 'hhhh', 1, 0, '2026-04-20 17:21:39', 1, '2026-04-24 17:52:13', 4),
(10, '87327386', 1, 'ddddd', 1, 1, '2026-04-20 18:18:20', 1, NULL, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tbl_usuario`
--

CREATE TABLE `tbl_usuario` (
  `id_usuario` int(11) NOT NULL,
  `id_trabajador` int(11) NOT NULL,
  `password` varchar(250) NOT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1,
  `id_usuario_creacion` int(11) NOT NULL,
  `fecha_creacion` datetime NOT NULL,
  `id_usuario_modificacion` int(11) DEFAULT NULL,
  `fecha_modificacion` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Volcado de datos para la tabla `tbl_usuario`
--

INSERT INTO `tbl_usuario` (`id_usuario`, `id_trabajador`, `password`, `activo`, `id_usuario_creacion`, `fecha_creacion`, `id_usuario_modificacion`, `fecha_modificacion`) VALUES
(1, 3, '$2b$12$0GMYsV.vhF6PFKgPWlp0z./g2lLDZJ0mFAfAE/6kLJXrmH3H95JyW', 1, 1, '2026-04-01 12:06:36', 1, '2026-04-20 18:23:52'),
(2, 10, '$2b$12$Lb7FMRFGgyPhxw.uDMkhd.pYb207uJE4XODPgAni7F60mWt4sSHa.', 1, 1, '2026-04-20 18:18:20', NULL, NULL),
(3, 5, '$2b$12$3czf8GgjaiZ3SdgMwarare6FVImx0X/m.py6wsSZ.LjuHTEKAt0DK', 0, 1, '2026-04-20 18:23:22', 1, '2026-04-20 18:27:51'),
(4, 4, '$2b$12$gpW9Tl9Vco5vdKYLeUTSceWR91AsNmANdZKCn9TrwrYCHnB/yEC1G', 0, 1, '2026-04-24 17:41:37', 4, '2026-04-24 18:07:15'),
(7, 1, '$2b$12$n7Yb7/I1mhk.Obb2r1kZJOM8ZcDMmWiNmwNRI1naBhUmiByxDos3u', 1, 4, '2026-04-24 17:51:06', NULL, NULL);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `tbl_celda`
--
ALTER TABLE `tbl_celda`
  ADD PRIMARY KEY (`id_celda`),
  ADD UNIQUE KEY `unique_posicion_activa` (`posicion_activa`);

--
-- Indices de la tabla `tbl_detalle_registro`
--
ALTER TABLE `tbl_detalle_registro`
  ADD PRIMARY KEY (`id_detalle_registro`),
  ADD KEY `fk_detall_falla` (`id_registro_falla`),
  ADD KEY `fk_falla_detalle` (`id_falla`);

--
-- Indices de la tabla `tbl_estatus_maquina`
--
ALTER TABLE `tbl_estatus_maquina`
  ADD PRIMARY KEY (`id_estatus_maquina`),
  ADD UNIQUE KEY `codigo` (`codigo`);

--
-- Indices de la tabla `tbl_falla`
--
ALTER TABLE `tbl_falla`
  ADD PRIMARY KEY (`id_falla`);

--
-- Indices de la tabla `tbl_maquina`
--
ALTER TABLE `tbl_maquina`
  ADD PRIMARY KEY (`id_maquina`),
  ADD KEY `celda_maquina` (`id_celda`),
  ADD KEY `estatus_maquina` (`id_estatus_maquina`);

--
-- Indices de la tabla `tbl_registro_falla`
--
ALTER TABLE `tbl_registro_falla`
  ADD PRIMARY KEY (`id_registro_falla`),
  ADD KEY `fk_maquina_falla` (`id_maquina`),
  ADD KEY `fk_mantenimiento_falla` (`id_trabajador_mantenimiento`);

--
-- Indices de la tabla `tbl_tipo_trabajador`
--
ALTER TABLE `tbl_tipo_trabajador`
  ADD PRIMARY KEY (`id_tipo_trabajador`);

--
-- Indices de la tabla `tbl_trabajador`
--
ALTER TABLE `tbl_trabajador`
  ADD PRIMARY KEY (`id_trabajador`),
  ADD KEY `fk_trabajador_tipo` (`id_tipo_trabajador`);

--
-- Indices de la tabla `tbl_usuario`
--
ALTER TABLE `tbl_usuario`
  ADD PRIMARY KEY (`id_usuario`),
  ADD KEY `fk_usuario_trabajador` (`id_trabajador`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `tbl_celda`
--
ALTER TABLE `tbl_celda`
  MODIFY `id_celda` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT de la tabla `tbl_detalle_registro`
--
ALTER TABLE `tbl_detalle_registro`
  MODIFY `id_detalle_registro` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_estatus_maquina`
--
ALTER TABLE `tbl_estatus_maquina`
  MODIFY `id_estatus_maquina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_falla`
--
ALTER TABLE `tbl_falla`
  MODIFY `id_falla` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=84;

--
-- AUTO_INCREMENT de la tabla `tbl_maquina`
--
ALTER TABLE `tbl_maquina`
  MODIFY `id_maquina` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `tbl_registro_falla`
--
ALTER TABLE `tbl_registro_falla`
  MODIFY `id_registro_falla` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `tbl_tipo_trabajador`
--
ALTER TABLE `tbl_tipo_trabajador`
  MODIFY `id_tipo_trabajador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT de la tabla `tbl_trabajador`
--
ALTER TABLE `tbl_trabajador`
  MODIFY `id_trabajador` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT de la tabla `tbl_usuario`
--
ALTER TABLE `tbl_usuario`
  MODIFY `id_usuario` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `tbl_detalle_registro`
--
ALTER TABLE `tbl_detalle_registro`
  ADD CONSTRAINT `fk_detall_falla` FOREIGN KEY (`id_registro_falla`) REFERENCES `tbl_registro_falla` (`id_registro_falla`),
  ADD CONSTRAINT `fk_falla_detalle` FOREIGN KEY (`id_falla`) REFERENCES `tbl_falla` (`id_falla`);

--
-- Filtros para la tabla `tbl_maquina`
--
ALTER TABLE `tbl_maquina`
  ADD CONSTRAINT `celda_maquina` FOREIGN KEY (`id_celda`) REFERENCES `tbl_celda` (`id_celda`),
  ADD CONSTRAINT `estatus_maquina` FOREIGN KEY (`id_estatus_maquina`) REFERENCES `tbl_estatus_maquina` (`id_estatus_maquina`);

--
-- Filtros para la tabla `tbl_registro_falla`
--
ALTER TABLE `tbl_registro_falla`
  ADD CONSTRAINT `fk_mantenimiento_falla` FOREIGN KEY (`id_trabajador_mantenimiento`) REFERENCES `tbl_trabajador` (`id_trabajador`),
  ADD CONSTRAINT `fk_maquina_falla` FOREIGN KEY (`id_maquina`) REFERENCES `tbl_maquina` (`id_maquina`);

--
-- Filtros para la tabla `tbl_trabajador`
--
ALTER TABLE `tbl_trabajador`
  ADD CONSTRAINT `fk_trabajador_tipo` FOREIGN KEY (`id_tipo_trabajador`) REFERENCES `tbl_tipo_trabajador` (`id_tipo_trabajador`);

--
-- Filtros para la tabla `tbl_usuario`
--
ALTER TABLE `tbl_usuario`
  ADD CONSTRAINT `fk_usuario_trabajador` FOREIGN KEY (`id_trabajador`) REFERENCES `tbl_trabajador` (`id_trabajador`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
