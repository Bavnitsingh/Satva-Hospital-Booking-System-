import { UserRepository } from "../auth/auth.repository.js";
import { comparePassword, getHashedPassword } from "../auth/utils/bcrypt.js";
import { sign } from "../auth/utils/jwt.js";
import { SuperAdminRepository } from "./super.admin.repository.js";

export class SuperAdminService {
  private superAdminRepo = new SuperAdminRepository();

  private userRepo = new UserRepository();
  async registerAdmin(data: any) {
    const existingUser = await this.userRepo.findUserByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists", {
        cause: {
          status: 400,
        },
      });
    }

    const hashedPassword = await getHashedPassword(data.password);

    const user = await this.userRepo.createUser(
      data.email,
      hashedPassword,
      "ADMIN",
    );

    await this.userRepo.createAdmin({
      user_id: user.user_id,
      hospital_id: data.hospitalId,
      first_name: data.firstName,
      last_name: data.lastName,
    });

    const accessToken = sign({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user,
    };
  }

  async login(data: any) {
    const user = await this.userRepo.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password", {
        cause: {
          status: 404,
        },
      });
    }

    const isPasswordValid = await comparePassword(
      data.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password", {
        cause: {
          status: 400,
        },
      });
    }

    await this.userRepo.updateLastLogin(user.user_id);

    const accessToken = sign({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user,
    };
  }

  async seed(data: any) {
    const existingUser = await this.userRepo.findUserByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists", {
        cause: {
          status: 400,
        },
      });
    }

    const hashedPassword = await getHashedPassword(data.password);

    const user = await this.userRepo.createUser(
      data.email,
      hashedPassword,
      "SUPER_ADMIN",
    );

    const accessToken = sign({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });

    return {
      accessToken,
      user,
    };
  }
}
