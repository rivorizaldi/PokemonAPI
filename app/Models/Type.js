"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Type extends Model {
  static get hidden() {
    return ["created_at", "updated_at"];
  }
  pokemons() {
    return this.belongsToMany("App/Models/Pokemon").pivotTable("type_pokemons");
  }
}

module.exports = Type;
