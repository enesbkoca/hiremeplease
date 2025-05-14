import axios from 'axios';
import {supabase} from "@/utils/supabase";

const apiClient = axios.create();

apiClient.interceptors.request.use(
    async (config) => {
        config.headers = config.headers || {};

        try {
            const { data: { session }, error: sessionError } = await supabase.auth.getSession();

            if (sessionError) {
                console.error("Error getting Supabase session for API Request: ", sessionError.message);

                return Promise.reject(sessionError);
            }

            if (session?.access_token) {
                config.headers.Authorization = `Bearer ${session.access_token}`;
            } else {
                console.error("No access token found in Supabase session.");
            }

        } catch (e) {
            console.error("Error getting Supabase session for Axios interceptor: ", e);
            return Promise.reject(e);
        }

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default apiClient;