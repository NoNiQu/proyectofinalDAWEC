let plantilla = document.getElementById("cardPokemon");
let contenedor = plantilla.parentNode;

// Remover la plantilla original para usarla como base
contenedor.removeChild(plantilla);

// Variable para controlar qué sprites mostrar
let spriteVersion = "red-blue"; // Por defecto, sprites de Pokémon Rojo/Azul

// Variable para almacenar datos cargados
let pokemonsData = [];

// Función para cargar Pokémon
async function cargarPokemon() {
  for (let i = 1; i <= 151; i++) {
    try {
      const response = await fetch(`http://localhost:9090/pokemon/${i}`);
      const jsondata = await response.json();
      pokemonsData.push(jsondata); // Guardar los datos en el array global
      procesarJSON(jsondata);
    } catch (e) {
      console.log(`Error al cargar el Pokémon con ID ${i}:`, e);
    }
  }
}

// Función para procesar cada Pokémon
function procesarJSON(jsondata) {
  if (!jsondata.id) return;

  // Clonar la plantilla y añadirla al contenedor
  let columna = plantilla.cloneNode(true);
  contenedor.appendChild(columna);
  columna.setAttribute("id", `CardPokemon${jsondata.id}`);

  // Formatear el ID del Pokémon
  let formattedID = jsondata.id.toString().padStart(3, "0");

  // Asignar el ID del Pokémon
  let propiedad = columna.querySelector("#idpokemon");
  propiedad.textContent = formattedID;

  // Asignar el nombre del Pokémon
  propiedad = columna.querySelector("#nombrePokemon");
  propiedad.setAttribute("id", `nombrePokemon${jsondata.id}`);
  propiedad.textContent = jsondata.name || "Pokémon no encontrado";

  // Crear el enlace a la página de descripción (descripcion.html)
  let enlace = columna.querySelector("#enlacePokemon");
  enlace.setAttribute("href", `descripcion.html?id=${jsondata.id}`);

  // Asignar la imagen del Pokémon
  propiedad = columna.querySelector("#spritePokemon");
  propiedad.setAttribute("id", `spritePokemon${jsondata.id}`);
  // Actualizar sprite basado en la versión seleccionada
  actualizarSpriteEnCard(jsondata, columna);

  // Gestionar los tipos de Pokémon
  let plantillaTipo = columna.querySelector("#tipoPokemon");
  let contenedorTipos = plantillaTipo.parentNode;

  // Limpiar los tipos existentes
  contenedorTipos.innerHTML = "";

  // Verificar los tipos
  let tipos = jsondata.types?.map((data) => data.type.name) || ["normal"];
  tipos = tipos.map((tipo) => (tipo === "electric" ? "elec" : tipo));
  tipos = tipos.map((tipo) => (tipo === "fighting" ? "fight" : tipo));
  tipos = tipos.filter((tipo) => tipo !== "steel" && tipo !== "fairy");

  if (tipos.length === 0) tipos = ["normal"];

  if (tipos.length === 1) {
    let unicoTipo = plantillaTipo.cloneNode(true);
    contenedorTipos.appendChild(unicoTipo);
    unicoTipo.setAttribute("id", `tipo${jsondata.id}_1`);
    unicoTipo.textContent = tipos[0];
    contenedorTipos.classList.remove("justify-content-between");
    contenedorTipos.classList.add("justify-content-center");
  } else {
    contenedorTipos.classList.remove("justify-content-center");
    contenedorTipos.classList.add("justify-content-between");

    tipos.forEach((tipo, index) => {
      let tipoElemento = plantillaTipo.cloneNode(true);
      contenedorTipos.appendChild(tipoElemento);
      tipoElemento.setAttribute("id", `tipo${jsondata.id}_${index + 1}`);
      tipoElemento.textContent = tipo;
    });
  }
}

// Función para actualizar la imagen del sprite en la tarjeta
function actualizarSpriteEnCard(pokemon, columna) {
  let spriteImg = columna.querySelector(`#spritePokemon${pokemon.id}`);
  if (spriteVersion === "yellow") {
    spriteImg.setAttribute(
      "src",
      pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]?.front_default ||
        pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]?.front_gray ||
        ""
    );
  } else {
    spriteImg.setAttribute(
      "src",
      pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]?.front_gray || ""
    );
  }
}

// Listeners para cambiar los sprites
document.querySelector(".iconoRB").addEventListener("click", () => {
  spriteVersion = "red-blue"; // Cambiar a sprites de Rojo/Azul (gris)
  actualizarSprites();
});

document.querySelector(".iconoA").addEventListener("click", () => {
  spriteVersion = "yellow"; // Cambiar a sprites de Amarillo (color)
  actualizarSprites();
});

// Función para actualizar todos los sprites de las tarjetas
function actualizarSprites() {
  pokemonsData.forEach((pokemon) => {
    let card = document.querySelector(`#CardPokemon${pokemon.id}`);
    if (card) {
      actualizarSpriteEnCard(pokemon, card);
    }
  });
}

// Cargar los primeros 151 Pokémon cuando la página se cargue
cargarPokemon();

