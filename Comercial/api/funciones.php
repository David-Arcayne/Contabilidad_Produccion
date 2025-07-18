<?php
require_once "../db/conexion.php";
class Funciones
{
    private $conexion;
    private $em;
    private $rh;
    public function __construct()
    {
        $this->conexion = new Conexion();
        $this->em = $this->conexion->em;
        $this->rh = $this->conexion->rh;
    }

    public function verificarIDUSERMD5($idMd5)
    {
        $consulta = $this->rh->query("select idusuario from usuario WHERE MD5(idusuario) = '$idMd5'");
        if ($consulta->num_rows > 0) {
            $fila = $this->rh->fetch($consulta);
            $id = $fila[0];
            return json_decode($id);
        } else {
            return "false";
        }
    }

    public function verificarIDEMPRESAMD5($idMd5)
    {
        $consulta = $this->em->query("select idorganizacion from organizacion WHERE MD5(idorganizacion) = '$idMd5'");
        if ($consulta->num_rows > 0) {
            $fila = $this->em->fetch($consulta);
            $id = $fila[0];
            return $id;
        } else {
            return "false";
        }
    }

    public function convertirObjeto($objeto) {
        $nuevoFormato = [];

        foreach ($objeto->data as $moneda) {
            // Verificar si el objeto tiene la propiedad 'codigo'
            if (isset($moneda->codigo)) {
                $codigoActividad = isset($moneda->codigoActividad) ? $moneda->codigoActividad : null;
                $nuevoFormato[$moneda->codigo] = [
                    "descripcion" => $moneda->descripcion,
                    "isActive" => $moneda->isActive,
                    'codigoActividad' => $codigoActividad
                ];
            }
        }
    
        return $nuevoFormato;
    }

  public function obtenerDatosUsuario($id, $tipo)
  {
    $datos = "";
    $consulta = $this->rh->query("SELECT u.idusuario, u.nombre, t.nombre, t.apellido FROM usuario u 
    LEFT JOIN trabajador t ON u.trabajador_idtrabajador=t.idtrabajador
    WHERE u.idusuario = '$id'");
        if ($consulta->num_rows > 0) {
            $fila = $this->rh->fetch($consulta);
            $datos = [
              "id" => $fila[0],
              "usuario" => $fila[1],
              "nombre" => $fila[2],
              "apellido" => $fila[3]
            ];
            if ($tipo == 1) {
              return $datos;
            } else {
              json_encode($datos);
            }
            
        } else {
            return "false";
        }
  }

  public function redondear($num)
  {
    if (!is_numeric($num)) {
      return null;
    }
    $signo = $num >= 0 ? 1 : -1;

    return round(($num * pow(10, 2) + ($signo * 0.0001)) / pow(10, 2), 2);
  }
  public function validarFecha($fecha)
  {
      return preg_match('/^\d{4}-\d{2}-\d{2}$/', $fecha);
  }
  public function VerificarTipoFactura() {
    
  }

    public function datosExtras() {
        $datos = '{
            "tiposDocumentos": [
              {
                "id": "1",
                "descripcion": "CI"
              },
              {
                "id": "2",
                "descripcion": "CEX"
              },
              {
                "id": "3",
                "descripcion": "PAS"
              },
              {
                "id": "4",
                "descripcion": "Otro documento de identidad"
              },
              {
                "id": "5",
                "descripcion": "NIT"
              }
            ],
            "motivos": [
              {
                "id": "1",
                "descripcion": "Factura mal emitida"
              },
              {
                "id": "2",
                "descripcion": "Nota de credito-debito mal emitida"
              },
              {
                "id": "3",
                "descripcion": "Datos de emision incorrectos"
              },
              {
                "id": "4",
                "descripcion": "Factura o nota de credito-debito devuelta"
              }
            ],
            "motivos": [
              {
                "id": "1",
                "descripcion": "Factura mal emitida"
              },
              {
                "id": "2",
                "descripcion": "Nota de credito-debito mal emitida"
              },
              {
                "id": "3",
                "descripcion": "Datos de emision incorrectos"
              },
              {
                "id": "4",
                "descripcion": "Factura o nota de credito-debito devuelta"
              }
            ]
          }';
          
        return $datos;
    }
}
