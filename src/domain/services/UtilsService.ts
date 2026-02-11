import { IMGBB_API_KEY } from "@/src/infrastructure/configuration/auth/env";
import axios from "axios";
import { ImgBBResponse } from "../types/ImgBBResponse";

const IMGBB_ENDPOINT = "https://api.imgbb.com/1/upload";


export const uploadImageToImgBB = async (imageBase64: string, expiration = 6, onSuccess?: (url: string) => void): Promise<ImgBBResponse> => {
    try {
        // Strip the header if present (data:image/jpeg;base64,...)
        const cleanBase64 = imageBase64.replace(/^data:image\/\w+;base64,/, "");
        const body = new URLSearchParams();
        body.append('image', cleanBase64);
        const response = await axios.post<ImgBBResponse>(
            `${IMGBB_ENDPOINT}?expiration=${expiration}&key=${IMGBB_API_KEY}`,
            body.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            },
        );
        onSuccess?.(response.data.data.url);
        return response.data;
    } catch (error) {
        console.error("Error uploading to ImgBB:", error);
        if (axios.isAxiosError(error) && error.response) {
            console.error("ImgBB API Response:", error.response.data);
        }
        throw error;
    }
};
