import { AxiosResponse } from "axios";

class LocalStorageUtils {
    setLoginResponse = (response: AxiosResponse) => {
        const token = response.data.token;
        this.setToken(token);
    };

    setToken(token: string) {
        return localStorage.setItem(LocalStorageKeys.Token, token);
    }

    getToken() {
        return localStorage.getItem(LocalStorageKeys.Token);
    }

    clearStore() {
        return localStorage.clear();
    }
}

export const localStorageUtils = new LocalStorageUtils();

export const LocalStorageKeys = {
    Token: "@token",
    PopupDisabled: "@pop-up-disabled",
} as const;
