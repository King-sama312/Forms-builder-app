import { randomBytes, createHmac, BinaryLike } from "node:crypto";
import {
  type CreateUserWithEmailAndPasswordInputType,
  GenerateUserTokenPayloadType,
  SignInUserWithEmailAndPasswordInputType,
  createUserWithEmailAndPasswordInput,
  generateUserTokenPayload,
  signInUserWithEmailAndPasswordInput,
} from "./model";
import { db, eq } from "@repo/database";
import { usersTable } from "@repo/database/models/user";
import * as JWT from "jsonwebtoken";
import { env } from "../env";

class UserService {
  private async generateUserToken(payload: GenerateUserTokenPayloadType) {
    const { id } = await generateUserTokenPayload.parseAsync(payload);
    const token = JWT.sign({ id }, env.JWT_SECRET);
    return { token };
  }

  private async getUserByEmail(email: string) {
    const result = await db.select().from(usersTable).where(eq(usersTable.email, email));
    if (!result || result.length === 0) return null;
    return result[0];
  }

  private async generateHash(salt: string, password: string) {
    return createHmac("sha256", salt).update(password).digest("hex");
  }

  public async createUserWithEmailAndPassword(payload: CreateUserWithEmailAndPasswordInputType) {
    const { fullName, email, password } =
      await createUserWithEmailAndPasswordInput.parseAsync(payload);

    // Check if user already exists
    const existing = await this.getUserByEmail(email);

    if (existing) throw new Error(`User with email ${email} already exists`);

    // Create salt and calculate hash
    const salt = randomBytes(16).toString("hex");
    const hash = await this.generateHash(salt, password);

    //Create user in DB
    const userInsertResult = await db
      .insert(usersTable)
      .values({ fullName, email, password: hash })
      .returning({ id: usersTable.id });

    if (!userInsertResult || userInsertResult.length === 0 || !userInsertResult[0]?.id)
      throw new Error(`Something went wrong while creating user`);

    const userID = userInsertResult[0].id;

    const { token } = await this.generateUserToken({ id: userID });

    return { id: userID, token };
  }

  public async signInUserWithEmailAndPassword(payload: SignInUserWithEmailAndPasswordInputType) {
    const { email, password } = await signInUserWithEmailAndPasswordInput.parseAsync(payload);
    // Check if user exists or not
    const existingUser = await this.getUserByEmail(email);

    if (!existingUser) throw new Error(`User with email:${email} does not exist`);

    if (!existingUser.salt || !existingUser.password)
      throw new Error(`Invalid authentication method`);

    // Check password correct or not
    const hash = await this.generateHash(existingUser.salt, password);
    const isCorrectPassword = hash === existingUser.password;

    if (!isCorrectPassword) throw new Error("Invalid email or password");

    const { token } = await this.generateUserToken({ id: existingUser.id });

    return {
      id:existingUser.id,
      token,
    };
  }
}

export default UserService;
