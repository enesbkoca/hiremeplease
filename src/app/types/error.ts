export interface BasicError {
    response?: {
        status?: number;
        data?: {
            error?: string;
            message?: string;
            description?: string;
        };
        headers?: {
            [key: string]: string | string[] | undefined;
        };
    };
    message?: string;
}