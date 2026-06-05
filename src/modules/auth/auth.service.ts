import { UserRepository } from "./auth.repository.js";
import { comparePassword, getHashedPassword } from "./utils/bcrypt.js";
import { sign } from "./utils/jwt.js";

export class AuthService {
  // private userRepo=new UserRepository();

  //   async register(data: { name: string; email: string; password: string }) {
  //     const existingUser = await this.userRepo.findByEmail(data.email);
  //     if (existingUser) throw new ConflictException('Email already registered');

  //     const hashedPassword = await bcrypt.hash(data.password, 12);
  //     const user = await this.userRepo.create({ ...data, password: hashedPassword });

  //     const tokens = this.generateTokens({ id: user.id, email: user.email, role: user.role });
  //     return { user, ...tokens };
  //   }

  private userRepo = new UserRepository();

  async register(data: any) {
    const existingUser = await this.userRepo.findUserByEmail(data.email);
    if (existingUser) throw new Error("Email already exist");

    const hashedPassword = await getHashedPassword(data.password);

    const user = await this.userRepo.createUser(data.email, hashedPassword);

    await this.userRepo.createPatient(
      user.user_id,
      data.firstName,
      data.lastName,
      data.countryCode,
      data.mobile,
      data.dob,
      data.gender,
    );

    const token = sign({
      id: user.user_id,
      email: user.email,
      role: user.role,
    });
    return { user, token };
  }

  async login(data: any) {
    const user = await this.userRepo.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password");
    }
    const isPasswordValid = await comparePassword(
      data.password,
      user.password_hash,
    );

    if (!isPasswordValid) {
      throw new Error("Invalid email or password");
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
}
