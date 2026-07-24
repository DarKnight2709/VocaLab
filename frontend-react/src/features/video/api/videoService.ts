import { useMutation } from "@tanstack/react-query";
import { api, fetchWithSchema, getErrorMessage } from "@/shared/lib/api";
import { 
  ExtractVideoResponseSchema, 
  type ExtractVideoPayloadType 
} from "@/shared/validations/VideoSchema";
import { t } from "i18next";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";

export const useExtractVideo = () => {
  return useMutation({
    mutationFn: (payload: ExtractVideoPayloadType) =>
      fetchWithSchema(
        api.post(API_ROUTES.VIDEO.EXTRACT, payload),
        ExtractVideoResponseSchema
      ),
    onSuccess: () => {
      // toast.success(t("video.extractSuccess"));
    },
    onError: (error: any) => {
      toast.error(getErrorMessage(error, t("video.extractFailed")));
    },
  });
};
