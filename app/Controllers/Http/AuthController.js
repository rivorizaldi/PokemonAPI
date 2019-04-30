"use strict";

const User = use("App/Models/User");
const { validate } = use("Validator");

class AuthController {
  async register({ request, auth, response }) {
    try {
      const rules = {
        username: "required|string|unique:users",
        email: "required|email|unique:users",
        password: "required"
      };

      const validation = await validate(request.all(), rules);

      if (validation.fails()) {
        return response
          .status(400)
          .json({ status: 0, message: validation.messages() });
      }

      const username = request.input("username");
      const email = request.input("email");
      const password = request.input("password");

      const user = new User();

      user.username = username;
      user.email = email;
      user.password = password;
      await user.save();

      const token = await auth.withRefreshToken().generate(user);

      return response.json({
        user,
        access_token: token
      });
    } catch (err) {
      console.log(err);
    }
  }

  async login({ auth, request, response }) {
    try {
      const rules = {
        email: "required|email",
        password: "required|string"
      };

      const validation = await validate(request.all(), rules);

      if (validation.fails()) {
        return response
          .status(400)
          .json({ status: 0, message: validation.messages() });
      }

      const email = request.input("email");
      const password = request.input("password");

      try {
        if (await auth.attempt(email, password)) {
          let user = await User.findBy("email", email);
          let accessToken = await auth.withRefreshToken().generate(user);

          return response.json({ user: user, access_token: accessToken });
        }
      } catch (e) {
        return response.json({
          status: 0,
          message: "you first need to register"
        });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getUser({ params, request, response }) {
    try {
      const user = await User.find(params.id);
      //   const userTokens = await user.tokens().fetch();

      return response.json({
        message: "User successfuly fetched",
        data: user
      });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = AuthController;
