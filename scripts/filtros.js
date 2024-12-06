document.addEventListener("DOMContentLoaded", function () {
    let plantilla = document.getElementById("cardPokemon");
    let contenedor = plantilla.parentNode;
    contenedor.removeChild(plantilla);

    // Variable para almacenar los datos de los Pokémon que obtenemos de la API.
    let pokemonsData = [];

    // Variable para controlar qué sprites mostrar (por defecto, los sprites de Pokémon Rojo/Azul).
    let spriteVersion = "red-blue";

    // Función para cargar Pokémon
    async function cargarPokemon() {
        for (let i = 1; i <= 151; i++) {
            try {
                const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
                const jsondata = await response.json();
                pokemonsData.push(jsondata); // Guardar los datos en el array global
                procesarJSON(jsondata);
            } catch (e) {
                console.log(`Error al cargar el Pokémon con ID ${i}:`, e);
            }
        }
    }

    // Función para procesar cada Pokémon que recoge el fetch.
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

        // Asignar la imagen del Pokémon.
        propiedad = columna.querySelector("#spritePokemon");
        propiedad.setAttribute("id", `spritePokemon${jsondata.id}`);
        // Actualizar sprite con la imagen de la versión seleccionada.
        actualizarSpriteEnCard(jsondata, columna);

        // Crear el enlace a la página de descripción (descripcion.html).
        let enlace = columna.querySelector("#enlacePokemon");
        if (enlace) {
            enlace.setAttribute("href", `descripcion.html?id=${jsondata.id}`);
        }
    }

    // Función para actualizar la imagen del sprite en la tarjeta.
    function actualizarSpriteEnCard(pokemon, columna) {
        let spriteImg = columna.querySelector(`#spritePokemon${pokemon.id}`);
        if (spriteVersion === "yellow") {
            spriteImg.setAttribute(
                "src",
                pokemon.sprites?.versions?.["generation-i"]?.["yellow"]?.front_default ||
                pokemon.sprites?.versions?.["generation-i"]?.["yellow"]?.front_gray ||
                ""
            );
        } else {
            spriteImg.setAttribute(
                "src",
                pokemon.sprites?.versions?.["generation-i"]?.["red-blue"]?.front_gray || ""
            );
        }
    }

    // EventListeners para los botones que cambian los sprites.
    document.querySelector(".iconoRB").addEventListener("click", () => {
        spriteVersion = "red-blue"; // Cambiar a sprites de Rojo/Azul (blanco y negro).
        actualizarSprites();
    });

    document.querySelector(".iconoA").addEventListener("click", () => {
        spriteVersion = "yellow"; // Cambiar a sprites de Amarillo (color).
        actualizarSprites();
    });

    // Función para actualizar todos los sprites de las tarjetas.
    function actualizarSprites() {
        pokemonsData.forEach((pokemon) => {
            let card = document.querySelector(`#CardPokemon${pokemon.id}`);
            if (card) {
                actualizarSpriteEnCard(pokemon, card);
            }
        });
    }

    // Función para filtrar y ordenar los Pokémon
    function filtrarPokemons() {
        let nombre = document.getElementById('pokemonName').value.toLowerCase();
        let tipo = document.getElementById('pokemonType').value.toLowerCase();
        let altura = document.getElementById('pokemonHeightFilter').value;  // Obtener valor de altura
        let peso = document.getElementById('pokemonWeightFilter').value;    // Obtener valor de peso

        // Limpiar el contenedor antes de agregar los Pokémon filtrados
        contenedor.innerHTML = ''; // Limpiar el contenedor de resultados

        // Filtrar los Pokémon según los criterios
        let filteredPokemons = pokemonsData.filter(pokemon => {
            // Filtrar por nombre
            let matchNombre = pokemon.name.toLowerCase().includes(nombre);

            // Filtrar por tipo
            let matchTipo = tipo ? pokemon.types.some(t => t.type.name.toLowerCase() === tipo) : true;

            // Retornar el Pokémon si cumple todos los criterios de búsqueda
            return matchNombre && matchTipo;
        });

        // Ordenar los Pokémon por altura si es necesario
        if (altura) {
            filteredPokemons.sort((a, b) => {
                if (altura === 'heightAsc') {
                    return a.height - b.height; // Orden ascendente
                } else if (altura === 'heightDesc') {
                    return b.height - a.height; // Orden descendente
                }
                return 0; // Sin orden si no se selecciona altura
            });
        }

        // Ordenar los Pokémon por peso si es necesario
        if (peso) {
            filteredPokemons.sort((a, b) => {
                if (peso === 'weightAsc') {
                    return a.weight - b.weight; // Orden ascendente
                } else if (peso === 'weightDesc') {
                    return b.weight - a.weight; // Orden descendente
                }
                return 0; // Sin orden si no se selecciona peso
            });
        }

        // Mostrar los Pokémon filtrados y ordenados
        filteredPokemons.forEach(procesarJSON);

        // Asegurarse de que los resultados se muestren
        document.getElementById('contenedorResultados').classList.remove('d-none');
    }

    // Función para mostrar todos los Pokémon
    function mostrarTodosLosPokemons() {
        contenedor.innerHTML = ''; // Limpiar el contenedor de resultados

        // Mostrar todos los Pokémon cargados
        pokemonsData.forEach(procesarJSON);

        // Asegurarse de que los resultados se muestren
        document.getElementById('contenedorResultados').classList.remove('d-none');
    }

    // Configurar el listener para el botón de búsqueda
    document.getElementById('btnSearch').addEventListener('click', filtrarPokemons);

    // Configurar el listener para el botón de "Show All"
    document.getElementById('btnShollAll').addEventListener('click', mostrarTodosLosPokemons);

    // Cargar los primeros 151 Pokémon cuando la página se cargue. Esta función llamará al resto de funciones necesarias.
    cargarPokemon();
});


