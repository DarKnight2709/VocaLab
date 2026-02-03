import type { MeResponse } from "@/shared/validations/AuthSchema";

export type ChatViewProps = {
  me: MeResponse | undefined | null;
  embedded?: boolean;
  hideHeader?: boolean;
  hideSidebarSearch?: boolean;
};
