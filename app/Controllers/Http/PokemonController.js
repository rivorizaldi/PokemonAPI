"use strict";

/** @typedef {import('@adonisjs/framework/src/Request')} Request */
/** @typedef {import('@adonisjs/framework/src/Response')} Response */
/** @typedef {import('@adonisjs/framework/src/View')} View */
const Pokemon = use("App/Models/Pokemon");
const { validate } = use("Validator");
const Helpers = use("Helpers");
const fs = require("fs");
/**
 * Resourceful controller for interacting with pokemons
 */
class PokemonController {
  /**
   * Show a list of all pokemons.
   * GET pokemons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async index({ request, response, view }) {
    try {
      const pokemons = await Pokemon.query()
        .with("categories")
        .with("types")
        .fetch();

      return response.json({
        message: "success",
        data: pokemons
      });
    } catch (err) {
      console.log(err);
    }
  }

  /**
   * Create/save a new pokemon.
   * POST pokemons
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async store({ request, response }) {
    try {
      const image = request.file("image_url", {
        types: ["image"],
        size: "2mb",
        extnames: ["png", "jpg"]
      });

      const name = image.clientName;
      const extension = name.split(".")[1];
      const date = new Date().getTime();
      const newFilename = "pokemon_" + date + "." + extension;

      await image.move(Helpers.publicPath("img"), {
        name: newFilename
      });

      if (image.moved()) {
        const pokemonData = {
          name: request.input("name"),
          image_url: `/img/${newFilename}`,
          category_id: request.input("category_id"),
          latitude: request.input("latitude"),
          longitude: request.input("longitude")
        };

        const pokemon = await Pokemon.create(pokemonData);
        await pokemon.types().attach(request.input("types"));
        pokemon.types = await pokemon.types().fetch();

        return response.json({ message: "data successfully added", pokemon });
      } else {
        return response.json({ status: 0, message: image.error() });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Display a single pokemon.
   * GET pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   * @param {View} ctx.view
   */
  async show({ params, request, response, view }) {
    try {
      const pokemon = await Pokemon.query()
        .with("categories")
        .with("types")
        .where("id", params.id)
        .fetch();

      if (pokemon) {
        return response.json({
          message: "success",
          data: pokemon
        });
      } else {
        return response.json({
          message: "failed",
          id
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Update pokemon details.
   * PUT or PATCH pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async update({ params, request, response }) {
    try {
      const name = request.input("name");
      const category = request.input("category_id");
      const latitude = request.input("latitude");
      const longitude = request.input("longitude");
      const types = request.input("types");

      const { id } = params;
      const pokemon = await Pokemon.find(id);

      if (pokemon) {
        pokemon.name = name;
        pokemon.category_id = category;
        pokemon.latitude = latitude;
        pokemon.longitude = longitude;

        const image = request.file("image_url", {
          types: ["image"],
          size: "2mb",
          extnames: ["png", "jpg"]
        });
        if (image === null) {
          await pokemon.save();
        } else {
          const nameImage = image.clientName;
          const extension = nameImage.split(".")[1];
          const date = new Date().getTime();
          const newFilename = "pokemon_" + date + "." + extension;

          await image.move(Helpers.publicPath("img"), {
            name: newFilename,
            overwrite: true
          });

          pokemon.image_url = `/img/${newFilename}`;
          await pokemon.save();
        }

        if (types) {
          await pokemon.types().detach();
          await pokemon.types().attach(types);
          pokemon.types = await pokemon.types().fetch();
        }

        return response.json({
          message: "data updated",
          data: pokemon
        });
      } else {
        return response.json({
          message: "data failed to updated",
          data: id
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  /**
   * Delete a pokemon with id.
   * DELETE pokemons/:id
   *
   * @param {object} ctx
   * @param {Request} ctx.request
   * @param {Response} ctx.response
   */
  async destroy({ params, request, response }) {
    try {
      const { id } = params;
      const pokemon = await Pokemon.find(id);

      if (pokemon) {
        await pokemon.delete();

        return response.json({
          message: "data succesfully deleted",
          id: id
        });
      } else {
        return response.json({
          message: "id not found",
          id: id
        });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = PokemonController;
