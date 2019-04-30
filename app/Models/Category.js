"use strict";

/** @type {typeof import('@adonisjs/lucid/src/Lucid/Model')} */
const Model = use("Model");

class Category extends Model {
  static get hidden() {
    return ["created_at", "updated_at"];
  }
  pokemon() {
    return this.hasMany("App/Models/Pokemon");
  }
}

module.exports = Category;
