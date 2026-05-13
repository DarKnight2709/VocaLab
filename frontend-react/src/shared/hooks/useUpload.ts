import { useMutation } from "@tanstack/react-query";
import { api, getErrorMessage } from "@/shared/lib/api";
import API_ROUTES from "@/shared/lib/api-routes";
import { toast } from "sonner";
import { useTranslation } from "@/shared/hooks/useTranslation";

export interface UploadResponse {
  url: string;
  type: string;
  name: string;
  size: number;
  mimeType: string;
}

export const uploadFileRequest = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);
  const res = await api.post<UploadResponse>(API_ROUTES.UPLOAD.FILE, formData);
  return res.data;
};

export const useUploadFilesMutation = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: async (files: File[]) => {
      const uploaded = await Promise.all(files.map(uploadFileRequest));
      return uploaded;
    },
    onError: (err) => toast.error(getErrorMessage(err, t("upload.uploadFailed"))),
  });
};

export const useUploadImageMutation = () => {
  const { t } = useTranslation();
  return useMutation({
    mutationFn: uploadFileRequest,
    onError: (err) => toast.error(getErrorMessage(err, t("upload.uploadImageFailed"))),
  });
};
