// celda_editar.js

/**
 * Creates an input element based on the specified type
 */
function createInputElement({ isSelect, inpKey, codigo, originalValue, isNumber, elemento, inpKey2 }) {
  let input;

  if (isSelect) {
    input = createSelectElement(inpKey, codigo);
    if (!input) {
      throw new Error(`Select element creation failed for ${inpKey}${codigo}`);
    }
    input.value = elemento[inpKey2];
  } else {
    input = document.createElement('input');
    input.type = isNumber ? 'number' : 'text';
    input.value = originalValue;
    input.className = 'form-control';
    if (isNumber) input.step = '0.01';
  }
  input.style.width = '300px';
  return input;
}

/**
 * Creates a select element with options from an existing element
 */
function createSelectElement(inpKey, codigo) {
  const elementId = `${inpKey}${codigo}`;
  const element = document.querySelector(`#${elementId}`);
  if (!element?.innerHTML) {
    return null;
  }
  const select = document.createElement('select');
  select.className = 'form-select';
  select.name = inpKey;
  select.innerHTML = element.innerHTML;
  return select;
}

/**
 * Prepares a cell for editing
 */
function setupEditableCell(target, input) {
  target.classList.add('editing');
  target.innerHTML = '';
  target.appendChild(input);
  input.focus();
}

/**
 * Updates the cell value after editing
 */
function updateCellValue({ target, elemento, elementoOriginal, inpKey2, newValue, state, isSelect }) {
  target.classList.remove('editing');

  const updatedValue = isSelect
    ? state.input.options[state.input.selectedIndex]?.text || state.originalValue
    : newValue || state.originalValue;
  
  const idselect = isSelect? Number(newValue) || confirm[inpKey] : newValue || confirm[inpKey];
  elemento[inpKey2] = idselect;
  target.textContent = updatedValue;

  if (!target.textContent.trim()) {
    target.textContent = state.originalValue;
    return ['warning', 'No se permiten valores vacíos'];
  }

  return areObjectsEqual(elemento, elementoOriginal)
    ? ['danger', 'Error: no se pudo editar']
    : elemento;
}

/**
 * Attaches event listeners to the input element
 */
/**
 * Attaches event listeners to the input element
 */
function attachEventListeners(input, handlers) {
  let actionTaken = false; // Bandera para evitar múltiples ejecuciones

  input.addEventListener('keydown', (event) => {
    if (actionTaken) return;

    if (event.key === 'Enter') {
      event.preventDefault(); // Evita cualquier comportamiento predeterminado
      actionTaken = true; // Marca como manejado
      handlers.handleInputChange(input.value);
    } else if (event.key === 'Escape') {
      event.preventDefault(); // Evita cualquier comportamiento predeterminado
      actionTaken = true; // Marca como manejado
      handlers.cancelEdit();
    }
  });

  input.addEventListener('blur', () => {
    if (actionTaken) return; // Evita la ejecución si ya se tomó acción
    actionTaken = true; // Marca como manejado
    handlers.cancelEdit();
  });
}


/**
 * Compares two objects for equality
 */
function areObjectsEqual(obj1, obj2) {
  const keys1 = Object.keys(obj1);
  const keys2 = Object.keys(obj2);

  if (keys1.length !== keys2.length) return false;

  return keys1.every(key => obj1[key] === obj2[key]);
}

/**
 * Main function to handle cell editing
 */
export async function editarCelda(e, Lista_elementos, codigo, elementos_select, elementos_number, id) {
  try {
    // Input validation
    if (!e?.target || !Array.isArray(Lista_elementos) || !codigo || !id) {
      console.error('Invalid parameters provided to editarCelda');
      return ['danger', 'Error: Parámetros inválidos'];
    }

    const target = e.target;
    
    if (target.tagName.toLowerCase() !== 'td' || target.classList.contains('editing')) {
      return;
    }

    const state = {
      originalValue: target.textContent.trim(),
      dataType: target.getAttribute('data-type')?.split(',') || [],
      input: null
    };

    if (state.dataType.length !== 3) {
      console.error('Invalid data-type attribute format');
      return ['danger', 'Error: Formato de data-type inválido'];
    }

    const [inpId, inpKey, inpKey2] = state.dataType;
    
    const elemento = Lista_elementos.find(obj => Number(obj[id]) === Number(inpId));
    if (!elemento) {
      console.error(`Element with id ${inpId} not found`);
      return ['danger', `Error: Elemento con id ${inpId} no encontrado`];
    }

    const elementoOriginal = { ...elemento };

    state.input = createInputElement({
      isSelect: elementos_select.includes(inpKey),
      inpKey,
      codigo,
      originalValue: state.originalValue,
      isNumber: elementos_number.includes(inpKey),
      elemento,
      inpKey2
    });

    setupEditableCell(target, state.input);

    return new Promise((resolve) => {
      const handlers = {
        handleInputChange: (newValue) => {
          const result = updateCellValue({target,elemento,elementoOriginal,inpKey2,newValue,state,isSelect: elementos_select.includes(inpKey)});
          resolve(result);
        },

        cancelEdit: () => {
          target.classList.remove('editing');
          target.textContent = state.originalValue;
          resolve(['info', 'Edición cancelada']);
        }
      };

      attachEventListeners(state.input, handlers);
    });

  } catch (error) {
    console.error('Error en editarCelda:', error);
    return ['danger', 'Error: No se pudo editar la celda'];
  }
}