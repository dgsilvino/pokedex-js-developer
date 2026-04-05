class Pokemon {
  number;
  name;
  type;
  types = [];
  photo;

  // --- Novos Campos para o Modal ---
  weight;
  height;
  stats = {
    hp: 0,
    atk: 0,
    def: 0,
    spAtk: 0,
    spDef: 0,
    speed: 0,
  };
  curiosity = ""; // Guardará o flavor text em português
}
