import { AuthData } from "../../interfaces/auth/Auth";
import { sendGet } from "../adapter";

export function fetchUserInfo(authData: AuthData, userId: string) {
    let headers = {
        "Authorization": `Bearer ${authData.token}`,
        "id": authData.id
    }

    return sendGet(`/user/${userId}`, undefined, headers)
}