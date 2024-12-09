// Obtener la plantilla de la tarjeta y su contenedor.
let plantilla = document.getElementById("cardPokemon");
let contenedor = plantilla.parentNode;
contenedor.removeChild(plantilla);

// Variables globales
let spriteVersion = "red-blue"; // Versión de sprites (red-blue por defecto).
let pokemonsData = []; // Array para almacenar los datos de los Pokémon.
let offset = 0; // Posición inicial para cargar Pokémon.
const limit = 18; // Cantidad de Pokémon a cargar por lote.
let cargando = false; // Para evitar múltiples llamadas mientras se carga un lote.

// Función para cargar un lote de Pokémon.
async function cargarPokemonLote(offset, limit) {
  const pokemonPromises = [];

  for (let i = offset + 1; i <= Math.min(offset + limit, 151); i++) {
    pokemonPromises.push(
      fetch(`https://pokeapi.co/api/v2/pokemon/${i}`).then((res) => res.json())
    );
  }

  try {
    const pokemons = await Promise.all(pokemonPromises);
    pokemons.forEach((pokemon) => {
      pokemonsData.push(pokemon); // Guardar datos en el array global.
      procesarJSON(pokemon); // Renderizar la tarjeta del Pokémon.
    });
  } catch (e) {
    console.log("Error al cargar el lote de Pokémon:", e);
  } finally {
    cargando = false; // Permitir nuevas cargas.
  }
}

// Función para procesar cada Pokémon y generar su tarjeta.
function procesarJSON(jsondata) {
  if (!jsondata.id) return;

  // Clonar la plantilla y añadirla al contenedor.
  let columna = plantilla.cloneNode(true);
  contenedor.appendChild(columna);
  columna.setAttribute("id", `CardPokemon${jsondata.id}`);

  // Formatear el ID del Pokémon.
  let formattedID = jsondata.id.toString().padStart(3, "0");

  // Asignar el ID del Pokémon.
  let propiedad = columna.querySelector("#idpokemon");
  propiedad.textContent = formattedID;

  // Asignar el nombre del Pokémon.
  propiedad = columna.querySelector("#nombrePokemon");
  propiedad.setAttribute("id", `nombrePokemon${jsondata.id}`);
  propiedad.textContent = jsondata.name || "Pokémon no encontrado";

  // Crear el enlace a la página de descripción (descripcion.html).
  let enlace = columna.querySelector("#enlacePokemon");
  enlace.setAttribute("href", `descripcion.html?id=${jsondata.id}`);

  // Asignar la imagen del Pokémon.
  propiedad = columna.querySelector("#spritePokemon");
  propiedad.setAttribute("id", `spritePokemon${jsondata.id}`);
  actualizarSpriteEnCard(jsondata, columna); // Asignar sprite según versión.

  // Gestionar los tipos de Pokémon.
  let plantillaTipo = columna.querySelector("#tipoPokemon");
  let contenedorTipos = plantillaTipo.parentNode;
  contenedorTipos.innerHTML = ""; // Limpiar los tipos existentes.

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

// Función para actualizar la imagen del sprite en la tarjeta.
function actualizarSpriteEnCard(pokemon, columna) {
  let spriteImg = columna.querySelector(`#spritePokemon${pokemon.id}`);
  if (spriteVersion === "yellow") {
    spriteImg.setAttribute(
      "src",
      pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]
        ?.front_default ||
        pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]
          ?.front_gray ||
        ""
    );
  } else {
    spriteImg.setAttribute(
      "src",
      pokemon.sprites?.versions?.["generation-i"]?.[spriteVersion]
        ?.front_gray || ""
    );
  }
}

// EventListeners para cambiar sprites según la versión seleccionada.
document.querySelector(".iconoRB").addEventListener("click", () => {
  spriteVersion = "red-blue"; // Cambiar a sprites de Rojo/Azul.
  actualizarSprites();
});

document.querySelector(".iconoA").addEventListener("click", () => {
  spriteVersion = "yellow"; // Cambiar a sprites de Amarillo.
  actualizarSprites();
});

// Función para actualizar los sprites de todas las tarjetas.
function actualizarSprites() {
  pokemonsData.forEach((pokemon) => {
    let card = document.querySelector(`#CardPokemon${pokemon.id}`);
    if (card) {
      actualizarSpriteEnCard(pokemon, card);
    }
  });
}

// Función para cargar más Pokémon al hacer scroll.
function manejarScroll() {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 100 &&
    !cargando &&
    offset < 151
  ) {
    cargando = true;
    cargarPokemonLote(offset, limit);
    offset += limit; // Actualizar el offset para el siguiente lote.
  }
}

// Escuchar el evento de scroll.
window.addEventListener("scroll", manejarScroll);

// Inicializar la carga con el primer lote al cargar la página.
cargarPokemonLote(offset, limit);
offset += limit;