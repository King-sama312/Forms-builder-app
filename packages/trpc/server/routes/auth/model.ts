import { email, z } from "zod";


export const createUserWithEmailAndPasswordInputModel = z.object({
  fullName: z.string().describe("Full name of the user"),
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user"),
});

export const createUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("id of the user created"),
});

export const signInUserWithEmailAndPasswordInputModel = z.object({
  email: z.email().describe("Email of the user"),
  password: z.string().describe("Password of the user")
})

export const signInUserWithEmailAndPasswordOutputModel = z.object({
  id: z.string().describe("uuid of the user"),
})

export const getLoggedInUserInfoInputModel = z.undefined()

export const getLoggedInUserInfoOutputModel = z.object({
id: z.string().describe("uuid of the user"),
  email: z.email().describe("Email of the user"),
  fullName: z.string().describe("Full name of the user"),
profileImageUrl: z.string().describe("User's profile image url").optional().nullable()
})

export const signOutInputModel = z.undefined()

export const signOutOutputModel = z.object({
  message: z.string().describe("Sign out status message"),
})