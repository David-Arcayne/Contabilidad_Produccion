import { URL_APIPANEL } from "./lib/services.js";
//import { sayHello } from './panel/js/services.js';
//sayHello();

const app=document.querySelector("#app");



if(app){
    if(localStorage.getItem("Yofinanciero")){
        window.location.href="./panel/";
    }else{
    Login();
    }
}

function menuempresa(event){
    const dataid = event.currentTarget.getAttribute('data-id');
    const [funcion, id] = dataid.split(',');
    
    switch (funcion) {
        case "login":
            Login();
            break;
        case "registro":
            Registro();
            break;
        case "recovery":
            Recovery()
            break;
        
        // Agrega otros casos según sea necesario
        default:
            // Manejo para casos no coincidentes
            Login();
            break;
    }

}

function Login(){
    
    let view=`
    <div class="container">
    <div class="row justify-content-center">
        <div class="col-md-9 col-lg-12 col-xl-10">
        
            <div class="card shadow-lg o-hidden border-0 my-5">
                <div class="card-body p-0">
                    <div class="row">
                        <div class="col-lg-6 d-none d-lg-flex">
                            <div class="flex-grow-1 bg-login-image" style="background-image: url('./assets/img/bg.jpg');background-size: cover;"></div>
                        </div>
                        <div class="col-lg-6">
                            <div class="p-5">
                                <div class="text-center">
                                
                                    <h4 class="text-dark mb-4"><img src="./assets/img/icon.png" width="50"> Yo Financiero</h4>
                                </div>
                                <form id="formulario">
                                
                                
                                    <div class="mb-3"><input class="form-control form-control-user" type="text"  id="usuario" placeholder="Usuario" name="usuario"></div>
                                    <div class="mb-3"><input class="form-control form-control-user" type="password"  placeholder="Password" name="password"></div>
                                    
                                    <button class="btn btn-primary d-block btn-user w-100" type="submit">Ingresar <img src="./assets/img/icon.png" width="30"></button>
                                    
                                    <hr>
                                </form>
                                <div id="respuesta"></div>
                                <div id="menu-page">
                                <div class="text-center"><a class="small"  data-id="recovery" class="nav-link">Olvidaste tu clave?</a></div>
                                <div class="text-center"><a class="small"  data-id="registro" class="nav-link">Create cuenta empresarial!</a></div>
                                </div>
                                <hr>
                                <div class="d-grid">
                                <button id="installButton" style="display: none;" class="btn btn-success">Instalar YoFinanciero <img src="./assets/img/icon.png" width="30"></button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    </div>
    
    `;
    app.innerHTML=view;
    const forme = document.querySelector(`#formulario`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const buttons = document.querySelectorAll('.small');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    });

    }
function Registro(){
    console.log("registro")
        let view=`
        <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-9 col-lg-12 col-xl-10">
                <div class="card shadow-lg o-hidden border-0 my-5">
                    <div class="card-body p-0">
                        <div class="row">
                            <div class="col-lg-6 d-none d-lg-flex">
                                <div class="flex-grow-1 bg-login-image" style="background-image: url('./assets/img/bg.jpg');background-size: cover;"></div>
                            </div>
                            <div class="col-lg-6">
                                <div class="p-5">
                                    <div class="text-center">
                                        <h4 class="text-dark mb-4"><img src="./assets/img/icon.png" width="50"> Yo Financiero</h4>
                                    </div>
                                    <form class="user" id="formularioForm">
                                        <input name="ver" type="hidden" value="registroUsuario">
                                        <div class="mb-3"><input class="form-control form-control-user" type="text" id="nombre" aria-describedby="emailHelp" placeholder="Nombre" name="nombre" required></div>
                                        <div class="mb-3"><input class="form-control form-control-user" type="text" id="apellido" aria-describedby="emailHelp" placeholder="Apellido" name="apellido"></div>
                                        <div class="mb-3"><input class="form-control form-control-user" type="text" id="telefono" aria-describedby="emailHelp" placeholder="Telefono" name="telefono"></div>
                                        
                                        <div class="mb-3"><input class="form-control form-control-user" type="email" id="email" aria-describedby="emailHelp" placeholder="Email" name="email" required></div>
                                        
    
                                        <div class="mb-3"><input class="form-control form-control-user" type="text" id="password" placeholder="Password" name="password"></div>
                                        

                                        <button class="btn btn-primary d-block btn-user w-100" type="submit">Registrarme <img src="./assets/img/icon.png" width="30"></button>
                                        
                                        <hr>
                                    </form>
                                    <div id="respuesta"></div>
                                    <div id="menu-page">
                                    <div class="text-center"><a class="small " id="recovery" data-id="recovery" class="nav-link">Olvidaste tu clave?</a></div>
                                    <div class="text-center"><a class="small " id="login" data-id="login" class="nav-link">desea Ingresar..?</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    
    app.innerHTML=view;
    const forme = document.querySelector(`#formularioForm`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const buttons = document.querySelectorAll('.small');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    });
    }
    
    function Recovery(){
    
        let view=`
        <div class="container">
        <div class="row justify-content-center">
            <div class="col-md-9 col-lg-12 col-xl-10">
                <div class="card shadow-lg o-hidden border-0 my-5">
                    <div class="card-body p-0">
                        <div class="row">
                            <div class="col-lg-6 d-none d-lg-flex">
                                <div class="flex-grow-1 bg-login-image" style="background-image: url('./assets/img/bg.jpg');background-size: cover;"></div>
                            </div>
                            <div class="col-lg-6">
                                <div class="p-5">
                                    <div class="text-center">
                                        <h4 class="text-dark mb-4"><img src="./assets/img/icon.png" width="50"> Yo Financiero</h4>
                                    </div>
                                    <form class="user" id="formularioRecovery">
                                        <div class="mb-3"><input class="form-control form-control-user" type="text" id="recoveryusuario" aria-describedby="emailHelp" placeholder="Usuario" name="usuario"></div>
                                        
                                        <button class="btn btn-primary d-block btn-user w-100" type="submit">Recuperar cuenta <img src="./assets/img/icon.png" width="30"></button>
                                        
                                        <hr>
                                    </form>
                                    <div id="respuesta"></div>
                                    <div id="menu-page">
                                    <div class="text-center"><a class="small" data-id="registro"  class="nav-link">No tiene cuenta..?</a></div>
                                    <div class="text-center"><a class="small" data-id="login"  class="nav-link">desea Ingresar..?</a></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    `;
    app.innerHTML=view;
    const forme = document.querySelector(`#formularioRecovery`);
    forme.addEventListener("submit", (e) => sendform(e, forme));

    const buttons = document.querySelectorAll('.small');
    buttons.forEach(button => {
        button.addEventListener('click', menuempresa);
    });
    }
    
    function sendform(e,form){
        
            e.preventDefault();
            const dato=new FormData(form);
            const usuarioInput = form.querySelector("#usuario");
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            // Verifica si el elemento #usuario existe en el formulario
            if (usuarioInput) {
                const usuario = usuarioInput.value;
        
                if (emailRegex.test(usuario)) {
                    dato.append("ver", "empresa");
                    console.log("empresa");
                } else {
                    dato.append("ver", "usuario");
                }
            }

            const recou=form.querySelector("#recoveryusuario");
            if (recou) {
                const adm = recou.value;
                if (emailRegex.test(adm)) {
                    console.log("empresa")
                    dato.append("ver", "recoveryadmin");
                } else {
                    alert("Por favor consulte con su admnistrador..!!");
                }
            }

            fetch(`${URL_APIPANEL}api/`,{
                method:"POST",
                body:dato
            })
            .then(res=>res.json())
            .then(data=>{
                console.log(data);
                

                
                if(data[0].ok==="success"){

                    if(data[0].estado=="registro"){
                        form.innerHTML=`<div class="alert alert-success" id="alerta">Gracias por Registrarse Ahora puede ingresar.</div>`;
                        
                        setTimeout(() => {
                        
                            window.location.href="./panel/";
                        }, 4000);
                        return;

                    }

                    if(data[0].estado=="recovery"){
                        form.innerHTML=`<div class="alert alert-success" id="alerta">Se le envio a su email su nueva clave.</div>`;
                        
                        setTimeout(() => {
                        
                            Login();
                        }, 5000);
                        return;

                    }
                    
                    if(data[0].login=="usuario"){

                    localStorage.setItem('yofinanciero', JSON.stringify(data));
                    
                    form.innerHTML=`<div class="alert alert-success" id="alerta">Bienvenido ${data[0].nombre}</div>`;
                    
                    setTimeout(() => {
                        form.remove();
                        window.location.href="./panel/";
                    }, 2000);
                    return;
                    }
                    if(data[0].login=="empresa"){
                    localStorage.setItem('yofinanciero', JSON.stringify(data));
                    
                    form.innerHTML=`<div class="alert alert-success" id="alerta">Bienvenido ${data[0].nombre}</div>`;
                    
                    setTimeout(() => {
                        form.remove();
                        window.location.href="./em/";
                    }, 2000);
                    return;

                    }

                }
                else{
                    form.innerHTML=`<div class="alert alert-danger" id="alerta">Su Usuario y Contraseña son incorrectos ... </div>`;
                    setTimeout(() => {
                        form.reset();
                        Login();
                    }, 3000);
                    return;
                }
                
                


            })
    
    }
    