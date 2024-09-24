import { env, handleUserLogout } from "@/utils/constants";
import axios, {
    Axios,
    AxiosRequestConfig,
    InternalAxiosRequestConfig,
} from "axios";
import { NavigateFunction } from "react-router-dom";

const API_TIMEOUT = 10 * 1000;

export class APIServices {
    axiosInstance: Axios;
    static TIMEOUT = API_TIMEOUT;
    isTokenRequired: boolean;
    navigate: NavigateFunction;

    constructor(isTokenRequired: boolean, navigate: NavigateFunction) {
        this.axiosInstance = axios.create(this.generateConfig());
        this.isTokenRequired = isTokenRequired;
        this.navigate = navigate;

        if (isTokenRequired) {
            this.useAxiosInterceptor();
        }
    }

    generateConfig = (): AxiosRequestConfig => {
        return {
            baseURL: env.SERVER_URL,
            timeout: APIServices.TIMEOUT,
            responseType: "json",
        };
    };

    useAxiosInterceptor = () => {
        const attachToken = async (config: InternalAxiosRequestConfig) => {
            const token = localStorage.getToken();

            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
                return config;
            }

            handleUserLogout(this.navigate);

            return config;
        };

        this.axiosInstance.interceptors.request.use(attachToken, (error) => {
            console.log("Interceptor Request ERROR:", error);
            return Promise.reject(error);
        });
    };

    get = async (url: string, config?: AxiosRequestConfig<any> | undefined) => {
        return await this.axiosInstance.get(url, config);
    };

    post = async (
        url: string,
        body?: any,
        config?: AxiosRequestConfig<any> | undefined
    ) => {
        return await this.axiosInstance.post(url, body, config);
    };

    delete = async (
        url: string,
        config?: AxiosRequestConfig<any> | undefined
    ) => {
        return await this.axiosInstance.delete(url, config);
    };

    update = async (
        url: string,
        body?: any,
        config?: AxiosRequestConfig<any> | undefined
    ) => {
        return await this.axiosInstance.put(url, body, config);
    };
}
