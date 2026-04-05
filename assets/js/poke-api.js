const pokeApi = {};

function mapStatName(apiName) {
  const map = {
    hp: "hp",
    attack: "atk",
    defense: "def",
    "special-attack": "spAtk",
    "special-defense": "spDef",
    speed: "speed",
  };
  return map[apiName] || apiName;
}

function convertPokeApiDetailToPokemon(pokeDetail) {
  const pokemon = new Pokemon();
  pokemon.number = pokeDetail.id;
  pokemon.name = pokeDetail.name;

  const types = pokeDetail.types.map((typeSlot) => typeSlot.type.name);
  pokemon.types = types;
  pokemon.type = types[0];

  pokemon.photo =
    pokeDetail.sprites.other["official-artwork"].front_default ||
    pokeDetail.sprites.front_default;

  pokemon.weight = pokeDetail.weight / 10;
  pokemon.height = pokeDetail.height / 10;

  pokemon.stats = {};
  pokeDetail.stats.forEach((statSlot) => {
    pokemon.stats[mapStatName(statSlot.stat.name)] = statSlot.base_stat;
  });

  return pokemon;
}

pokeApi.getPokemonDetail = (pokemon) => {
  return fetch(pokemon.url)
    .then((response) => response.json())
    .then(convertPokeApiDetailToPokemon);
};

pokeApi.getPokemons = (offset = 0, limit = 151) => {
  // Alterado para buscar todos de uma vez
  const url = `https://pokeapi.co/api/v2/pokemon?offset=${offset}&limit=${limit}`;

  return fetch(url)
    .then((response) => response.json())
    .then((jsonBody) => jsonBody.results)
    .then((pokemons) => pokemons.map(pokeApi.getPokemonDetail))
    .then((detailRequests) => Promise.all(detailRequests));
};

pokeApi.getPokemonCuriosity = (pokemonNumber) => {
  const speciesUrl = `https://pokeapi.co/api/v2/pokemon-species/${pokemonNumber}/`;

  return fetch(speciesUrl)
    .then((res) => res.json())
    .then((speciesDetail) => {
      let curiosityText = speciesDetail.flavor_text_entries.find(
        (entry) => entry.language.name === "pt-BR",
      );

      if (curiosityText) {
        return curiosityText.flavor_text.replace(/[\n\f]/g, " ");
      }

      const curiosityEn = speciesDetail.flavor_text_entries.find(
        (entry) => entry.language.name === "en",
      );
      const englishText = curiosityEn
        ? curiosityEn.flavor_text.replace(/[\n\f]/g, " ")
        : "Sem descrição.";

      const translationUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText)}&langpair=en|pt`;

      return fetch(translationUrl)
        .then((res) => res.json())
        .then((translationData) => {
          // SEGREDO AQUI: Intercepta o aviso de limite da API ou erro 429
          if (
            translationData.responseStatus === 429 ||
            translationData.responseData.translatedText.includes("MYMEMORY")
          ) {
            return englishText; // Cai suavemente para o inglês
          }
          return translationData.responseData.translatedText;
        })
        .catch(() => englishText);
    });
};
