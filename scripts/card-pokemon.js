let plantilla = document.getElementById("cardPokemon");
let contenedor = plantilla.parentNode;
contenedor.removeChild(plantilla);

async function cargarPokemon() {
  for (let i = 1; i <= 151; i++) {
    try {
      const response = await fetch("http://localhost:9090/pokemon/" + i);
      const jsondata = await response.json();
      procesarJSON(jsondata);
    } catch (e) {
      console.log(`Error al cargar el Pokémon con ID ${i}:`, e);
    }
  }
}

function procesarJSON(jsondata) {
  let propiedad;

  if (jsondata.id) {
    let columna = plantilla.cloneNode(true);
    contenedor.appendChild(columna);
    columna.setAttribute("id", "CardPokemon" + jsondata.id);

    // Asignar el ID del Pokémon
    propiedad = columna.querySelector("#idpokemon p");
    propiedad.textContent = jsondata.id;

    // Llamar a la función para ajustar el tamaño del círculo según la longitud del ID
    ajustarCirculo(columna, jsondata.id);

    // Asignar el nombre del Pokémon
    propiedad = columna.querySelector("#nombrePokemon");
    propiedad.setAttribute("id", "nombrePokemon" + jsondata.id);
    propiedad.textContent = jsondata.name || "Pokémon no encontrado";

    // Asignar la imagen del Pokémon
    propiedad = columna.querySelector("#spritePokemon");
    propiedad.setAttribute("id", "spritePokemon" + jsondata.id);
    propiedad.setAttribute(
      "src",
      jsondata.sprites?.versions?.["generation-i"]?.["red-blue"]?.front_gray || ""
    );

    // Gestionar los tipos de Pokémon
    let plantillaTipo = columna.querySelector("#tipoPokemon");
    let contenedorTipos = plantillaTipo.parentNode;
    contenedorTipos.removeChild(plantillaTipo);

    if (jsondata.types && jsondata.types.length > 0) {
      if (jsondata.types.length === 1) {
        // Si el Pokémon tiene un solo tipo, centramos el tipo
        let unicoTipo = plantillaTipo.cloneNode(true);
        contenedorTipos.appendChild(unicoTipo);
        unicoTipo.setAttribute("id", "tipo" + jsondata.id + "_1");
        unicoTipo.textContent = jsondata.types[0].type.name;

        // Cambiar las clases del contenedor para centrar
        contenedorTipos.classList.remove("justify-content-between");
        contenedorTipos.classList.add("justify-content-center");
      } else {
        // Si tiene múltiples tipos, añadirlos y mantener separación
        contenedorTipos.classList.remove("justify-content-center");
        contenedorTipos.classList.add("justify-content-between");

        for (const data of jsondata.types) {
          let tipo = plantillaTipo.cloneNode(true);
          contenedorTipos.appendChild(tipo);
          tipo.setAttribute("id", "tipo" + jsondata.id + "_" + data.slot);
          tipo.textContent = data.type.name;
        }
      }
    }
  }
}

// Función para ajustar el tamaño del círculo según el número de dígitos en el ID
function ajustarCirculo(columna, id) {
  let circulo = columna.querySelector(".circulo");
  let idLength = id.toString().length;  // Obtener el tamaño del ID en número de dígitos

  // Limpiar clases previas si existen
  circulo.classList.remove("circulo-1", "circulo-2", "circulo-3");

  // Aplicar la clase adecuada según la longitud del ID
  if (idLength === 1) {
    circulo.classList.add("circulo-1");  // Un dígito
  } else if (idLength === 2) {
    circulo.classList.add("circulo-2");  // Dos dígitos
  } else if (idLength === 3) {
    circulo.classList.add("circulo-3");  // Tres dígitos
  }
}

cargarPokemon();


