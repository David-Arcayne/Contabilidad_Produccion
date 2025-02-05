import { uk } from "../listaSolicitudess/listaSolicitudes.js";
import { URL_APIP } from "../../../../lib/services.js";
export let envaseArray =[];
export let medidaArray = [];
export let materialArray = [];
export let proveedorArray = [];
export function listarTipo_envase(envase){
    console.log("listo");
     const listar=document.querySelector(`#${envase}`);
    return fetch(`${URL_APIP}/api/listaenvases/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        console.log(data);
        envaseArray.length = 0;
        envaseArray = data;
        let view="";
        data.map(lista=>{
            
            view+=`
                <option value="${lista.id}">${lista.nombre} </option>
            `;
        })
         listar.innerHTML=view;
        console.log("lista envase completa");
        
    })   
}
export function listarmedida(medida){
    console.log("listo medida");

    //  const listar=document.querySelector(`#${medida}`);
    return fetch(`${URL_APIP}/api/listar_unidad_producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        medidaArray.length = 0;
        medidaArray = data;     
        console.log(data);
        // let view="",ind=1;
        // data.map(lista=>{
                
        //     view+=`
        //         <option value="${lista.id}">${lista.nombre} (${lista.sigla})</option>
        //     `;
        // })
        //  listar.innerHTML=view;
        console.log("lista medida completa");

    })
}
export function listarmedida2(){
    console.log("listo medida");

    //  const listar=document.querySelector("#medida");
    return fetch(`${URL_APIP}/api/listar_unidad_producto/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        medidaArray.length = 0;
        medidaArray = data;     
        console.log(data);
    })
}
export function listarMaterial(material){
    console.log("listo material");

     const listar=document.querySelector(`#${material}`);
    return fetch(`${URL_APIP}/api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        materialArray.length = 0;
        materialArray = data;    

        console.log(data);
        let view="",ind=1;
        data.map(lista=>{
            let itemMedida = medidaArray.find(dat => dat.id === lista.medida);
            view+=`
                <option value="${lista.id}">${lista.nombre} ${itemMedida.nombre}</option>
            `;
        })
         listar.innerHTML=view;
        console.log("lista material completa");

    })
}
export function listarMaterial2(){
    console.log("listo material22");
    return fetch(`${URL_APIP}/api/listar_material/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        materialArray.length = 0;
        materialArray = data;    

        console.log(data);
    })
}
export function listarProveedorSelect(proveedor, proveedorActual){
    console.log("listo proveedor seleccionable ");

    const listar=document.querySelector(`#${proveedor}`);
    return fetch(`${URL_APIP}/api/listarProveedor/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    // fetch(`./api/listarProveedor/${uk[0].empresa.idempresa}`)
    
    .then(res=>res.json())
    .then(data=>{
        proveedorArray.length = 0;
        proveedorArray = data;  
        console.log(data);  
        console.log(proveedorActual); 
        console.log("entre al data");
        let view="",ind=1;
        data.map(lista=>{
            console.log(lista.nombre);
                if(lista.nombre == proveedorActual){
                    console.log("hola soy"+ proveedorActual);
                    view+=`
                    <option value="${lista.id}" selected>${lista.nombre} </option>
                `;
                }else{
                    view+=`
                    <option value="${lista.id}">${lista.nombre} </option>
                `;
                console.log("soy 2da opcion del selecttt");
                }
        })
        listar.innerHTML=view;
        console.log("lista proveedor completa");

    })
}
export function listarProveedor(){
    console.log("listo proveedor ");
    return fetch(`${URL_APIP}/api/listarProveedor/${uk[0].empresa.idempresa}`, {
        headers: {
            'Usar-Listado-David': 'true' // Cambia este valor según sea necesario
        }
    })
    // fetch(`./api/listarProveedor/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        proveedorArray.length = 0;
        proveedorArray = data;     
    })
}
export function listarTipo_envase2(envase){
    console.log("listo tipoenvase222");
    return fetch(`${URL_APIP}/api/listaenvases/${uk[0].empresa.idempresa}`)
    .then(res=>res.json())
    .then(data=>{
        envaseArray.length = 0;
        envaseArray = data;    

        console.log(data);
    })
}