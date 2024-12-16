import userModel from "../models/user-model.js";
import bcrypt from "bcrypt";
import { v4 } from "uuid";
import tokenService from "./token-service.js";
import UserDto from "../dtos/user-dto.js";

class UserService {
  async registration(email, password) {
    const candidate = await userModel.findOne({ email });

    if (candidate) {
      throw new Error("User with this email already exist");
    }

    const hashPassword = await bcrypt.hash(password, 3);
    const activationLink = v4();
    const user = await userModel.create({
      email,
      password: hashPassword,
      activationLink,
    });

    const userDto = new UserDto(user);
    const tokens = tokenService.generateTokens({ ...userDto });

    await tokenService.saveToken(userDto.id, tokens.refreshToken);

    return { ...tokens, user: userDto };
  }
}

export default new UserService();
