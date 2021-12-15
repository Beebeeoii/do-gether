export function register(username: string, password: string) {
    return new Promise<{success: boolean }>((resolve) =>
        setTimeout(() => resolve({success: true}), 500)
    );
}

export function authenticate(username: string, password: string) {
    return new Promise<{
        success: boolean,
        error?: string,
        data?: {
            authorised: boolean
        }
    }>((resolve) => {
        setTimeout(() => resolve({
            success: true,
            data: {
                authorised: true
            }
        }), 500)
    });
}