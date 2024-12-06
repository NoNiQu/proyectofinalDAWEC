// Variable para controlar qué sprites mostrar (por defecto, los sprites de Pokémon Rojo/Azul).
let spriteVersion = "red-blue";
let descripcion = ""; // Variable para la descripción del Pokémon.

// Cargar los detalles del Pokémon.
async function cargarDetallePokemon() {
    const urlParams = new URLSearchParams(window.location.search);
    const pokemonId = parseInt(urlParams.get('id')); // Obtener el ID del Pokémon desde la URL.

    // Comprobar si se ha recibido un ID correctamente.
    if (!pokemonId) {
        console.error("No se ha proporcionado un ID de Pokémon.");
        return;
    }

    // Actualizar los enlaces de navegación.
    actualizarEnlacesDeFlechas(pokemonId);

    // Primer fetch para obtener la descripción y el genus (categoría).
    try {
        console.log("Obteniendo datos de la especie del Pokémon...");
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonId}`);
        const jsondataSpecies = await response.json();
        console.log("Datos de la especie obtenidos:", jsondataSpecies);

        // Extraer el genus (categoría) para mostrar.
        const genusData = jsondataSpecies.genera.find(
            (entry) => entry.language.name === "en"
        );
        const genus = genusData ? genusData.genus : null;

        // Filtrar la descripción para la versión y el idioma.
        if (spriteVersion === "yellow") {
            descripcion = jsondataSpecies.flavor_text_entries
                .filter(entry => entry.language.name === "en" && entry.version.name === "yellow")
                .find(entry => entry.version.name === "yellow");
        } else if (spriteVersion === "red-blue") {
            descripcion = jsondataSpecies.flavor_text_entries
                .filter(entry => entry.language.name === "en" && entry.version.name === "blue")
                .find(entry => entry.version.name === "blue");

            if (!descripcion) {
                descripcion = jsondataSpecies.flavor_text_entries
                    .find(entry => entry.version.name === "blue");
            }
        }

        // Adjuntar genus a la descripción para su uso posterior
        descripcion = { ...descripcion, genus };

        console.log("Descripción obtenida:", descripcion);
    } catch (e) {
        console.error(`Error al cargar la descripción del Pokémon con ID ${pokemonId}:`, e);
    }

    // Segundo fetch para obtener los detalles del Pokémon
    try {
        console.log("Obteniendo datos del Pokémon...");
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${pokemonId}`);
        const jsondata = await response.json();
        console.log("Datos del Pokémon obtenidos:", jsondata);
        mostrarDetalle(jsondata);
    } catch (e) {
        console.error(`Error al cargar los datos del Pokémon con ID ${pokemonId}:`, e);
    }
}

// Función para mostrar los detalles del Pokémon
function mostrarDetalle(jsondata) {
    const parentElement = document.querySelector('.parent');
    if (!parentElement) {
        console.error("Elemento .parent no encontrado.");
        return;
    }

    // Mostrar el nombre
    const nombre = parentElement.querySelector('#nombrePokemonDetalle');
    nombre.textContent = jsondata.name;

    // Mostrar el ID con formato de 3 dígitos
    const id = parentElement.querySelector('#idPokemonDetalle');
    const idFormateado = jsondata.id.toString().padStart(3, '0');
    id.textContent = `Nº ${idFormateado}`;

    // Usar la función para actualizar el sprite
    actualizarSpriteEnCard(jsondata, parentElement);

    // Mostrar el peso
    const peso = parentElement.querySelector('#pesoPokemonDetalle');
    peso.textContent = `WT: ${jsondata.weight / 10} kg`;

    // Mostrar la altura
    const altura = parentElement.querySelector('#alturaPokemonDetalle');
    altura.textContent = `HT: ${jsondata.height / 10} m`;

    // Usar la función para actualizar la descripción
    actualizarDescripcionEnCard(descripcion, parentElement);

    // Mostrar el genus (categoría). Hay que añadirle "POKEMON" a cada categoría antes de mostrarla.
    const genusContenedor = parentElement.querySelector('#tipoPokemonDetalle');
    if (descripcion && descripcion.genus) {
        const genusSinPokemon = descripcion.genus.replace(/Pokémon/i, "").trim();
        if (genusSinPokemon) {
            genusContenedor.textContent = `${genusSinPokemon} POKEMON `;
        } else {
            genusContenedor.textContent = "Categoría no disponible.";
        }
    } else {
        genusContenedor.textContent = "Categoría no disponible.";
    }
}


// Función para actualizar el sprite del Pokémon en la tarjeta.
function actualizarSpriteEnCard(pokemon, columna) {
    let spriteImg = columna.querySelector(`#spritePokemonDetalle`);
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

// Función para actualizar la descripción del Pokémon en la tarjeta
function actualizarDescripcionEnCard(descripcion, columna) {
    const descripcionElemento = columna.querySelector('#descripcionPokemonDetalle');
    if (descripcion) {
        // Reemplazar "Pokémon" con tilde por "Pokemon" sin tilde
        const descripcionSinAcento = descripcion.flavor_text.replace(/Pokémon/gi, "Pokemon");
        descripcionElemento.textContent = descripcionSinAcento.replace(/\f/gi, " ");
    } else {
        descripcionElemento.textContent = "Descripción no disponible.";
    }
}

// Función para actualizar los enlaces de las flechas
function actualizarEnlacesDeFlechas(pokemonId) {
    const anteriorEnlace = document.querySelector('#anterior');
    const siguienteEnlace = document.querySelector('#siguiente');

    // Actualizar enlace anterior
    if (pokemonId > 1) {
        anteriorEnlace.setAttribute("href", `?id=${pokemonId - 1}`);
        anteriorEnlace.classList.remove("disabled");
    } else {
        anteriorEnlace.setAttribute("href", "javascript:void(0)");
        anteriorEnlace.classList.add("disabled");
    }

    // Actualizar enlace siguiente
    if (pokemonId < 151) {
        siguienteEnlace.setAttribute("href", `?id=${pokemonId + 1}`);
        siguienteEnlace.classList.remove("disabled");
    } else {
        siguienteEnlace.setAttribute("href", "javascript:void(0)");
        siguienteEnlace.classList.add("disabled");
    }
}

// Listeners para manejar navegación
document.querySelector('#anterior').addEventListener('click', (e) => {
    e.preventDefault();
    const prevId = parseInt(new URLSearchParams(window.location.search).get('id'), 10) - 1;
    if (prevId > 0) {
        window.location.search = `?id=${prevId}`;
    }
});

document.querySelector('#siguiente').addEventListener('click', (e) => {
    e.preventDefault();
    const nextId = parseInt(new URLSearchParams(window.location.search).get('id'), 10) + 1;
    if (nextId <= 151) {
        window.location.search = `?id=${nextId}`;
    }
});

// Función para cambiar los sprites y las descripciones
document.querySelector(".iconoRB").addEventListener("click", () => {
    spriteVersion = "red-blue";
    cargarDetallePokemon();
});

document.querySelector(".iconoA").addEventListener("click", () => {
    spriteVersion = "yellow";
    cargarDetallePokemon();
});

// Cargar los detalles del Pokémon cuando la página se carga
cargarDetallePokemon();

