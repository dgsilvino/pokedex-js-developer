const pokemonList = document.getElementById("pokemonList");
const searchInput = document.getElementById("searchInput");
const filterButtons = document.querySelectorAll(".filter-btn");
const loadMoreButton = document.getElementById("loadMoreButton"); 

const modal = document.getElementById("pokedexModal");
const modalContentScreen = document.getElementById("modalContent");
const closeModalButton = document.getElementById("closeModalButton");


let allPokemonsLoaded = [];
let currentSearchTerm = "";
let currentTypeFilter = "all";

function getPokemonCardInnerHtml(pokemon) {
  return `
        <span class="number">#${String(pokemon.number).padStart(3, "0")}</span>
        <span class="name">${pokemon.name}</span>
        <div class="detail">
            <ol class="types">
                ${pokemon.types.map((type) => `<li class="type ${type}">${type}</li>`).join("")}
            </ol>
            <img src="${pokemon.photo}" alt="${pokemon.name}">
        </div>
    `;
}

function renderPokemons(pokemons) {
  pokemonList.innerHTML = "";
  pokemons.forEach((pokemon) => {
    const li = document.createElement("li");
    li.className = "pokemon";
    li.innerHTML = getPokemonCardInnerHtml(pokemon);
    li.addEventListener("click", () => openPokedexModal(pokemon));
    pokemonList.appendChild(li);
  });
}

function applyFiltersAndRender() {
  let filteredPokemons = allPokemonsLoaded;

  if (currentTypeFilter !== "all") {
    filteredPokemons = filteredPokemons.filter((pokemon) =>
      pokemon.types.includes(currentTypeFilter),
    );
  }
  if (currentSearchTerm !== "") {
    filteredPokemons = filteredPokemons.filter(
      (pokemon) =>
        pokemon.name.toLowerCase().includes(currentSearchTerm) ||
        String(pokemon.number).includes(currentSearchTerm),
    );
  }
  renderPokemons(filteredPokemons);
}

// Carrega os 151 Pokémons DE UMA SÓ VEZ
function loadInitialPokemons() {
  pokeApi.getPokemons(0, 151).then((pokemons = []) => {
    allPokemonsLoaded = pokemons;
    applyFiltersAndRender();

    // Esconde o botão de carregamento após a primeira carga
    if (loadMoreButton) {
      loadMoreButton.style.display = "none";
    }
  });
}

loadInitialPokemons();

// --- MODAL ---
function convertPokemonToModalHtml(
  pokemon,
  curiosityText = "Acessando banco de dados da Pokédex...",
) {
  const statsHtml = Object.entries(pokemon.stats)
    .map(([key, value]) => {
      const percentage = Math.min((value / 160) * 100, 100);
      return `
            <div class="stat-row">
                <span class="stat-name-label">${key}</span>
                <span class="stat-value-label">${value}</span>
                <div class="stat-bar-background">
                    <div class="stat-bar-fill-progress" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    })
    .join("");

  return `
        <div class="modal-top-info">
            <img src="${pokemon.photo}" alt="${pokemon.name}">
            <span class="modal-number-title">#${String(pokemon.number).padStart(3, "0")}</span>
            <h2 class="modal-name-title">${pokemon.name}</h2>
            <div class="modal-types types">
                 ${pokemon.types.map((type) => `<span class="type ${type}">${type}</span>`).join("")}
            </div>
        </div>
        
        <p class="modal-curiosity-text" id="curiosityText">"${curiosityText}"</p>
        
        <div class="modal-details" style="display: flex; justify-content: space-around; margin-bottom: 1.5rem; font-weight: 500; font-size: 0.9rem;">
            <div class="detail-row"><span>Peso:</span> ${pokemon.weight}kg</div>
            <div class="detail-row"><span>Altura:</span> ${pokemon.height}m</div>
        </div>
        <div class="modal-stats">
            <h3 style="margin-bottom: 0.8rem; text-align: center; font-size: 1rem;">Status Base</h3>
            ${statsHtml}
        </div>
    `;
}

function openPokedexModal(pokemon) {
  modalContentScreen.innerHTML = convertPokemonToModalHtml(pokemon);
  modal.classList.add("active");

  pokeApi.getPokemonCuriosity(pokemon.number).then((translatedText) => {
    const textElement = document.getElementById("curiosityText");
    if (textElement) {
      textElement.innerText = `"${translatedText}"`;
    }
  });
}

function closePokedexModal() {
  modal.classList.remove("active");
}

closeModalButton.addEventListener("click", closePokedexModal);
modal.addEventListener("click", (e) => {
  if (e.target === modal) closePokedexModal();
});

// --- FILTROS IMEDIATOS ---
searchInput.addEventListener("input", (e) => {
  currentSearchTerm = e.target.value.toLowerCase();
  applyFiltersAndRender();
});

filterButtons.forEach((button) => {
  button.addEventListener("click", (e) => {
    currentTypeFilter = e.target.getAttribute("data-type");
    applyFiltersAndRender();
  });
});
