import { formatDistanceToNow } from "date-fns";
import { NavigateFunction } from "react-router-dom";
import { LocalStorageKeys, localStorageUtils } from "./LocalStorageUtils";

export const NAVIGATION_ROUTES = {
    LOGIN: "/login",
    SIGNUP: "/signup",
    INBOX: "/inbox",
    DM: "/inbox/direct",
    CREATE_NEW_GROUP: "/inbox/group/create",
} as const;

export const getMessageAge = (messageSentAt: Date) => {
    return formatDistanceToNow(messageSentAt, { addSuffix: true });
};

export const env = {
    SERVER_URL: import.meta.env.VITE_PROD_URL || "http://localhost:3000",
    WS_BACKEND_URL: import.meta.env.VITE_WS_BACKEND_URL || "ws://localhost:8080",
} as const;

const attachUrl = (path: string) => {
    return `${env.SERVER_URL}${path}`;
};

export const getPopupStatus = (): Boolean => {
    const popupFlag = localStorage.getItem(LocalStorageKeys.PopupDisabled);
    if (popupFlag === null) {
        return false;
    }
    const parsedPopupFlag = JSON.parse(popupFlag);
    if (parsedPopupFlag === true) {
        return true;
    }
    return false;
};

export const handleUserLogout = (navigate: NavigateFunction) => {
    const isPopupDisabled = getPopupStatus();
    localStorageUtils.clearStore();
    if (isPopupDisabled) {
        localStorage.setItem(LocalStorageKeys.PopupDisabled, JSON.stringify(true));
    }
    navigate(NAVIGATION_ROUTES.LOGIN, { replace: true });
};

export const getAvatarFallback = (name: string) => {
    const parts = name.split(" ");

    if (parts.length > 1) {
        return parts[0].slice(0, 1).toUpperCase() + parts[1].slice(0, 1).toUpperCase();
    }

    return name.slice(0, 2).toUpperCase();
};

export const EndPoints = {
    Login: attachUrl("/user/login"),
    Signup: attachUrl("/user/signup"),
    Auth: attachUrl("/user/auth"),
    GetAllUsers: attachUrl("/user/get-all"),
} as const;

export const StatusCodes = {
    Continue: 100,
    SwitchingProtocols: 101,
    Processing: 102,
    EarlyHints: 103,
    Ok: 200,
    Created: 201,
    Accepted: 202,
    NonAuthoritativeInformation: 203,
    NoContent: 204,
    ResetContent: 205,
    PartialContent: 206,
    MultiStatus: 207,
    AlreadyReported: 208,
    ImUsed: 226,
    MultipleChoices: 300,
    MovedPermanently: 301,
    Found: 302,
    SeeOther: 303,
    NotModified: 304,
    UseProxy: 305,
    Unused: 306,
    TemporaryRedirect: 307,
    PermanentRedirect: 308,
    BadRequest: 400,
    Unauthorized: 401,
    PaymentRequired: 402,
    Forbidden: 403,
    NotFound: 404,
    MethodNotAllowed: 405,
    NotAcceptable: 406,
    ProxyAuthenticationRequired: 407,
    RequestTimeout: 408,
    Conflict: 409,
    Gone: 410,
    LengthRequired: 411,
    PreconditionFailed: 412,
    PayloadTooLarge: 413,
    UriTooLong: 414,
    UnsupportedMediaType: 415,
    RangeNotSatisfiable: 416,
    ExpectationFailed: 417,
    ImATeapot: 418,
    MisdirectedRequest: 421,
    UnprocessableEntity: 422,
    Locked: 423,
    FailedDependency: 424,
    TooEarly: 425,
    UpgradeRequired: 426,
    PreconditionRequired: 428,
    TooManyRequests: 429,
    RequestHeaderFieldsTooLarge: 431,
    UnavailableForLegalReasons: 451,
    InternalServerError: 500,
    NotImplemented: 501,
    BadGateway: 502,
    ServiceUnavailable: 503,
    GatewayTimeout: 504,
    HttpVersionNotSupported: 505,
    VariantAlsoNegotiates: 506,
    InsufficientStorage: 507,
    LoopDetected: 508,
    NotExtended: 510,
    NetworkAuthenticationRequired: 511,
} as const;

export const sleep = async (seconds: number) => {
    await new Promise((resolve) => setTimeout(resolve, seconds * 1000));
};
