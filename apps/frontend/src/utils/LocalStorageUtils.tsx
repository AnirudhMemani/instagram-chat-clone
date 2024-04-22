import { AxiosResponse } from "axios";

export class LocalStorageUtils {
    setLoginResponse = (response: AxiosResponse) => {
        const token = response.data.token as string;
        this.setToken(token);
    };

    setToken(token: string) {
        return localStorage.setItem(LocalStorageKeys.Token, token);
    }

    getToken(): string {
        return localStorage.getItem(LocalStorageKeys.Token) as string;
    }

    clearStore() {
        return localStorage.clear();
    }
}

export const localStorageUtils = new LocalStorageUtils();

export const LocalStorageKeys = {
    Token: "@token",
} as const;
