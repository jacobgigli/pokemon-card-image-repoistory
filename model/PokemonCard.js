const mongoose = require("mongoose");

const pokemonCardSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: String, required: true },
  productImage: { type: String, required: true },
  user: { type: String, required: true },
  description: { type: String, required: true },
  dateAcquired: { type: Date, required: true, default: Date.now },
});

module.exports = mongoose.model("PokemonCard", pokemonCardSchema);
