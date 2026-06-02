import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/shared/components/ui/dialog";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { useTranslation } from "@/shared/hooks/useTranslation";
import { useCreateReminderMutation, useUpdateReminderMutation } from "../api/settingService";
import { cn } from "@/shared/lib/utils";
import { Loader2 } from "lucide-react";
import { ReminderType } from "@/shared/enums/ReminderType.enum";
import type { Reminder } from "@/shared/validations/SettingSchema";

interface AddReminderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: Reminder | null;
}

export function AddReminderDialog({ open, onOpenChange, initialData }: AddReminderDialogProps) {
  const { t } = useTranslation();
  const createMutation = useCreateReminderMutation();
  const updateMutation = useUpdateReminderMutation();

  const [title, setTitle] = useState("");
  const [type, setType] = useState<ReminderType>(ReminderType.ON_THE_HOUR);
  const [triggerTime, setTriggerTime] = useState("08:00");
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("20:00");
  const [daysOfWeek, setDaysOfWeek] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const isEdit = !!initialData;

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setType(initialData.type as ReminderType);
      setTriggerTime(minutesToTime(initialData.triggerTime));
      setStartTime(minutesToTime(initialData.startTime));
      setEndTime(minutesToTime(initialData.endTime));
      setDaysOfWeek(initialData.daysOfWeek);
    } else {
      reset();
    }
  }, [initialData, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const data = {
      title,
      type,
      triggerTime: timeToMinutes(triggerTime),
      startTime: timeToMinutes(startTime),
      endTime: timeToMinutes(endTime),
      daysOfWeek,
    };

    if (isEdit) {
      await updateMutation.mutateAsync({ id: initialData.id, ...data });
    } else {
      await createMutation.mutateAsync(data);
    }
    
    onOpenChange(false);
  };

  const reset = () => {
    setTitle("");
    setType(ReminderType.ON_THE_HOUR);
    setTriggerTime("08:00");
    setStartTime("08:00");
    setEndTime("20:00");
    setDaysOfWeek([0, 1, 2, 3, 4, 5, 6]);
  };

  const toggleDay = (day: number) => {
    setDaysOfWeek((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const isPeriodic = type !== ReminderType.ON_THE_HOUR;
  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {isEdit ? t("settings.reminder.editReminder") : t("settings.reminder.addReminder")}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title" className="font-normal text-muted-foreground">{t("settings.reminder.title")}</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Daily Practice"
                required
              />
            </div>
            
            <div className="grid gap-2">
              <Label className="font-normal text-muted-foreground">{t("settings.reminder.type")}</Label>
              <Select value={type} onValueChange={(val) => setType(val as ReminderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="max-h-[200px]">
                  {Object.values(ReminderType).map((typeVal) => (
                    <SelectItem key={typeVal} value={typeVal}>
                      {t(`settings.reminder.types.${typeVal}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {!isPeriodic ? (
              <div className="grid gap-2">
                <Label htmlFor="triggerTime" className="font-normal text-muted-foreground">{t("settings.reminder.triggerTime")}</Label>
                <Input
                  id="triggerTime"
                  type="time"
                  value={triggerTime}
                  onChange={(e) => setTriggerTime(e.target.value)}
                  required
                />
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="startTime" className="font-normal text-muted-foreground">{t("settings.reminder.startTime")}</Label>
                  <Input
                    id="startTime"
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="endTime" className="font-normal text-muted-foreground">{t("settings.reminder.endTime")}</Label>
                  <Input
                    id="endTime"
                    type="time"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            <div className="grid gap-2">
              <Label className="font-normal text-muted-foreground">{t("settings.reminder.days")}</Label>
              <div className="flex flex-wrap gap-2 pt-1">
                {[0, 1, 2, 3, 4, 5, 6].map((day) => {
                  const dayNames = t("settings.reminder.daysShort", { returnObjects: true }) as string[];
                  const isSelected = daysOfWeek.includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={cn(
                        "h-8 w-8 rounded-full border text-xs font-medium transition-all focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        isSelected
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-muted-foreground hover:border-primary/50"
                      )}
                    >
                      {dayNames[day]}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isPending} className="w-full sm:w-auto">
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? t("settings.reminder.update") : t("settings.reminder.create")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function timeToMinutes(time: string) {
  const [hours, mins] = time.split(":").map(Number);
  return hours * 60 + mins;
}

function minutesToTime(minutes: number | null) {
  if (minutes === null) return "08:00";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
