import {CookieOptions, Response, Request} from "express"
import { TRPCContext } from "../context"

const ONE_MINUTE = 60*1000
const ONE_HOUR = 60 * ONE_MINUTE
const ONE_DAY = 24 * ONE_HOUR
const ONE_MONTH = 30*ONE_DAY
const ONE_YEAR = 12* ONE_MONTH

const isProduction = process.env.NODE_ENV === "prod"

const deafultCookieOptions : CookieOptions = {
    path:"/",
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "strict" : "lax",
    maxAge: Number(process.env.SESSION_DURATION_MS) || ONE_YEAR,
    domain: process.env.COOKIE_DOMAIN || undefined,
}

export function createCookieFactory(res:Response){
    return function createCookie(name:string, value:string, opts:CookieOptions = deafultCookieOptions) {
        res.cookie(name ,value, opts)
    }
}

export function getCookieFactory(req: Request){
    return function getCookie(name: string){
        return req.cookies?.[name]
    }
}

export function clearCookieFactory (res:Response){
    return function clearCookie(name:string){
        res.clearCookie(name)
    }
}

const AUTHENTICATION_COOKIE_NAME = process.env.AUTH_COOKIE_NAME || "accessToken"

export function setAuthenticationCookie(ctx:TRPCContext, accessToken:string){
    ctx.createCookie(AUTHENTICATION_COOKIE_NAME, accessToken)
}

export function getAuthenticationCookie(ctx:TRPCContext){
    return ctx.getCookie(AUTHENTICATION_COOKIE_NAME)
}
export function clearAuthenticationCookie(ctx:TRPCContext, ){
    ctx.clearCookie(AUTHENTICATION_COOKIE_NAME)
}