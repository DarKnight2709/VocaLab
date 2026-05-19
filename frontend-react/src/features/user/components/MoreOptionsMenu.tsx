import { Ban, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { Button } from "@/shared/components/ui/button";
import { DropdownMenuArrow } from "@radix-ui/react-dropdown-menu";

interface MoreOptionsMenuProps {
  onBlockUser: () => void;
  isBlocking?: boolean;
}

export function MoreOptionsMenu({ onBlockUser, isBlocking }: MoreOptionsMenuProps) {
  const { t } = useTranslation();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="group relative h-11 w-11 items-center justify-center rounded-full p-0 font-semibold text-neutral-700 dark:text-neutral-300 ring-1 ring-neutral-200 dark:ring-neutral-800 bg-white dark:bg-neutral-950 hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all duration-300 active:scale-95 shadow-sm hover:shadow-md"
        >
          <MoreHorizontal className="h-5 w-5 text-neutral-500 group-hover:text-neutral-800 dark:group-hover:text-neutral-100 transition-colors duration-300" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        sideOffset={10}
        // Changed w-85 to a standard size or explicit pixel width (e.g., w-48 is 192px)
        className="w-48 rounded-xl p-1 bg-white dark:bg-neutral-950 shadow-lg border border-neutral-100 dark:border-neutral-800"
      >
        <DropdownMenuItem
          onClick={onBlockUser}
          className="flex items-center gap-2 px-4 py-3 text-base text-red-500 dark:text-red-400 cursor-pointer rounded-lg focus:bg-red-50 dark:focus:bg-red-950/30"
        >
          <Ban className="h-5 w-5 text-red-500 dark:text-red-400" />
          {t(isBlocking ? "profile.unblock" : "profile.block")}
        </DropdownMenuItem>

        <DropdownMenuArrow
          className="fill-white dark:fill-neutral-950"
          width={12}
          height={6}
        />
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
