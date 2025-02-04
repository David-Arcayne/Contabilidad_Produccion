export async function edit_table(event, columnas, Lista_Objeto, codigo, columnas_select, names_columnas) {
    console.log(names_columnas);
    let obt_Objeto_aux;
    const formData = new FormData();
    const boton = event.currentTarget;
    const fila = boton.closest("tr");
    const celdas = fila.querySelectorAll("td");
    const dataid = boton.getAttribute('data-id');
    const [funcion, id1, id2] = dataid.split(',');
    const obj_select = Lista_Objeto.find(obj => obj.id === Number(id1));
    console.log(obj_select);
    
    const obj_selectc = { ...obj_select };
    let originalValues = {};
    
    console.log(funcion, id1, id2);
    
    if (boton.innerHTML.includes('bi-pencil-square')) {
        // Modo Editar
        let firstInput;
        celdas.forEach((celda, index) => {
            if (columnas.includes(index)) {
                const valorOriginal = celda.textContent.trim();
                originalValues[index] = valorOriginal;
    
                let input;
                if (columnas_select.includes(index)) {
                    
                    input = createSelectElement(names_columnas[columnas.indexOf(index)]); // Crear el elemento select correctamente
                    if (input) {
                        celda.innerHTML = '';
                        input.value = obj_select[names_columnas[columnas.indexOf(index)]];
    
                        celda.appendChild(input);
                    } else {
                        console.error(`No se encontró el elemento con id #${names_columnas[index]}`);
                        return;
                    }
                } else {
                    input = document.createElement('input');
                    input.id = `ediinp${codigo}`;
                    input.className = "form-control";
                    input.type = "text";
                    input.value = valorOriginal;
                    celda.innerHTML = '';
                    celda.appendChild(input);
                    
                }
    
                // Añadir evento de teclado
                input.addEventListener("keydown", handleKeyDown);
    
                // Establecer el primer input para enfocar
                if (!firstInput) {
                    firstInput = input;
                }
            }
        });
    
        // Enfocar el primer input
        if (firstInput) {
            firstInput.focus();
        }
    
        boton.innerHTML = '<i class="bi bi-floppy"></i>';
        async function handleKeyDown(event) {
            if (event.key === "Enter") {
                await guardarCambios(); // Esperar a que se guarden los cambios al presionar Enter
            } else if (event.key === "Escape") {
                cancelarCambios();
            }
        }
    } else {
        await guardarCambios(); // Esperar a que se guarden los cambios
    }
    
   
    
    async function guardarCambios() {
        const datosnuevos = [];
        let linea = true;
        let nuevoValor = "";
        celdas.forEach((celda, index) => {
            if (columnas.includes(index)) {
                const input = celda.querySelector(`input`);
                const select = celda.querySelector('select');
                if (input) {
                    nuevoValor = input.value.trim();
                    if (nuevoValor !== "") {
                        celda.textContent = nuevoValor;
                        datosnuevos.push(nuevoValor);
                        linea *= true;
                    } else {
                        linea *= false;
                    }
                } else if (select) {
                    nuevoValor = select.value;
                    console.log(nuevoValor);
                    celda.textContent = select.options[select.selectedIndex].text;
                    datosnuevos.push(nuevoValor);

                }
                
            }
        });
        console.error(linea);
        
        if(linea){
            for (let i = 0; i < datosnuevos.length; i++) {
                console.log(names_columnas[i]);
                console.log(datosnuevos[i]);
                obj_select[names_columnas[i]] = datosnuevos[i];
                
            }
            if (obj_select) {
                Object.assign(Lista_Objeto, obj_select);
            }
            console.log(obj_select);
            console.log(obj_selectc);
            console.log(areObjectsEqual(obj_select, obj_selectc));
            if (!areObjectsEqual(obj_select, obj_selectc)) {
                
                formData.append('ver', funcion);
                formData.append('empresa', id2);
                Object.entries(obj_select).forEach(([key, value]) => {
                    formData.append(key, value);
                });
                formData.forEach((valor, clave) => {
                    console.log(clave, valor);
                });
                obt_Objeto_aux = { ...obt_Objeto_aux, ...obj_selectc };
                console.log(obt_Objeto_aux);
                
            }

            console.log(Lista_Objeto);

            boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
            celdas.forEach(celda => {
                const input = celda.querySelector(`#ediinp${codigo}`);
                if (input) {
                    input.removeEventListener("keydown", handleKeyDown);
                }
            });
            
        }else{
            cancelarCambios();
        }
    }
       
    function cancelarCambios() {
        
        celdas.forEach((celda, index) => {
            if (columnas.includes(index)) {
                const input = celda.querySelector('input');
                const select = celda.querySelector('select');
                
                if (input) {
                    celda.innerHTML = originalValues[index];
                } else if (select) {
                    celda.innerHTML = originalValues[index];
                }
            }
        });

        boton.innerHTML = '<i class="bi bi-pencil-square"></i>';
        celdas.forEach(celda => {
            const input = celda.querySelector(`#ediinp${codigo}`);
            if (input) {
                input.removeEventListener("keydown", handleKeyDown);
            }
        });
    }

    boton.removeEventListener("click", edit_table);
    boton.addEventListener("click", edit_table);

    return [formData, obt_Objeto_aux]; // Este return se ejecutará después de guardarCambios cuando se hace click en el botón
}


function areObjectsEqual(obj1, obj2) {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);
   
    if (keys1.length !== keys2.length) {
        return false;
    }

    for (let key of keys1) {
        console.log(key);
        if (obj1[key] !== obj2[key]) {
            return false;
        }
    }

    return true;
}
function createSelectElement(inpKey) {
    const elementId = `${inpKey}${codigo}`;
    console.log(elementId);
    const innerHTMLContent = document.querySelector(`#${elementId}`).innerHTML;
    if (!innerHTMLContent) return null;
    
    const select = document.createElement('select');
    select.className = 'form-select';
    select.name = inpKey;
    select.innerHTML = innerHTMLContent;
    return select;
}