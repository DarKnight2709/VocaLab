  import { useState } from "react";
  import {
    Bell,
    Plus,
    Trash2,
    ChevronDown,
    Loader2,
    Clock,
    Calendar,
    Goal,
    AlertCircle,
    Info,
  } from "lucide-react";
  import { useTranslation } from "@/shared/hooks/useTranslation";
  import { cn } from "@/shared/lib/utils";
  import { Switch } from "@/shared/components/ui/switch";
  import { Button } from "@/shared/components/ui/button";
  import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/shared/components/ui/select";
  import {
    useRemindersQuery,
    useToggleReminderMutation,
    useDeleteReminderMutation,
    useDailyGoalQuery,
    useUpdateDailyGoalMutation,
  } from "../../api/settingService";
  import type { Reminder } from "@/shared/validations/SettingSchema";
  import { AddReminderDialog } from "../AddReminderDialog";
  import { ReminderType } from "@/shared/enums/ReminderType.enum";
  import { useFcmStore } from "@/features/notification/hooks/usePushNotifications";

  export default function LearningSettingTab() {
    const { t } = useTranslation();
    const [showReminders, setShowReminders] = useState(true);
    const [addOpen, setAddOpen] = useState(false);
    const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);

    const { data, isLoading } = useRemindersQuery();
    const reminders = data?.reminders || [];

    const toggleMutation = useToggleReminderMutation();
    const deleteMutation = useDeleteReminderMutation();

    const { data: dailyGoalData, isLoading: dailyGoalLoading } = useDailyGoalQuery();
    const updateDailyGoalMutation = useUpdateDailyGoalMutation();

    const fcmToken = useFcmStore((state) => state.fcmToken);

    const handleDelete = (id: string, e: React.MouseEvent) => {
      e.preventDefault();

      e.stopPropagation();
      deleteMutation.mutate(id);
    };

    const handleEdit = (reminder: Reminder) => {
      if (!fcmToken) return;
      setEditingReminder(reminder);
      setAddOpen(true);
    };

    const handleAdd = () => {
      if (!fcmToken) return;
      setEditingReminder(null);
      setAddOpen(true);
    };

    return (
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
        {/* Learning Title */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 pb-2 border-b">
            <Goal className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">
              {t("settings.learningTitle")}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">
            {t("settings.learningDescription")}
          </p>
        </div>

        {/* Daily Goal Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between p-4 rounded-xl border bg-card shadow-sm">
            <div className="space-y-0.5">
              <h3 className="text-sm font-medium leading-none">
                {t("settings.dailyGoal.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("settings.dailyGoal.description")}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <Select
                value={dailyGoalData?.dailyGoalMinutes?.toString() || "15"}
                onValueChange={(val) => updateDailyGoalMutation.mutate(parseInt(val))}
                disabled={dailyGoalLoading || updateDailyGoalMutation.isPending}
              >
                <SelectTrigger className="w-[140px] h-9">
                  <SelectValue placeholder={t("settings.dailyGoal.select")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="15">15 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="30">30 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="60">60 {t("settings.dailyGoal.minutes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Push Notification Guidance */}
        <div
          className={cn(
            "p-4 rounded-xl border flex items-start gap-3 transition-all",
            fcmToken
              ? "bg-primary/5 border-primary/20 text-primary/80"
              : "bg-destructive/5 border-destructive/20 text-destructive/80",
          )}
        >
          <div className="mt-0.5">
            {fcmToken ? (
              <Info className="h-5 w-5" />
            ) : (
              <AlertCircle className="h-5 w-5" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium leading-relaxed">
              {fcmToken
                ? t("settings.reminder.desktopNotificationRemind")
                : t("settings.reminder.allowBrowserNotifications")}
            </p>
          </div>
        </div>

        {/* Reminders Section */}
        <section className={cn("space-y-4", !fcmToken && "opacity-50 select-none")}>
          <div className="flex items-center justify-between pb-2 border-b">
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-semibold">
                {t("settings.reminder.reminders")}
              </h2>
            </div>
            <Button
              size="sm"
              className="gap-2"
              onClick={handleAdd}
              disabled={!fcmToken}
            >
              <Plus className="h-4 w-4" />
              {t("settings.reminder.addReminder")}
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col rounded-lg border bg-muted/30 overflow-hidden">
              <div className="flex items-center justify-between p-4">
                <div>
                  <p className="font-normal text-foreground">
                    {t("settings.reminder.reminders")}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {t("settings.reminder.reminderDescription")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReminders(!showReminders)}
                  className="gap-2"
                  disabled={!fcmToken}
                >
                  {showReminders ? t("common.cancel") : t("common.view")}
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      showReminders && "rotate-180",
                    )}
                  />
                </Button>
              </div>

              {showReminders && fcmToken && (
                <div className="p-4 pt-0 space-y-4 border-t bg-card/50 animate-in slide-in-from-top-2 duration-300">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                    </div>
                  ) : !Array.isArray(reminders) || reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-3 rounded-md border border-dashed bg-muted/10 mt-4">
                      <Bell size={24} className="text-muted-foreground/50" />
                      <p className="text-sm text-muted-foreground font-normal">
                        {t("settings.reminder.noReminders")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-100 overflow-y-auto pr-2 mt-4 custom-scrollbar">
                      {reminders.map((reminder: Reminder) => (
                        <div
                          key={reminder.id}
                          onClick={() => handleEdit(reminder)}
                          className="flex items-center gap-4 p-4 rounded-xl border bg-background hover:shadow-md hover:border-primary/50 transition-all group cursor-pointer"
                        >
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-primary" />
                          </div>

                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-foreground truncate">
                              {reminder.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {reminder.description}
                            </p>
                            <div className="flex flex-col gap-1.5 mt-1.5">
                              <div className="flex items-center gap-2">
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-primary/10 text-primary">
                                  {t(`settings.reminder.types.${reminder.type}`)}
                                </span>
                                <span className="text-xs text-muted-foreground flex items-center gap-1">
                                  <Clock
                                    size={12}
                                    className="text-muted-foreground/70"
                                  />
                                  {reminder.type === ReminderType.ON_THE_HOUR
                                    ? formatTime(reminder.triggerTime)
                                    : `${formatTime(reminder.startTime)} - ${formatTime(reminder.endTime)}`}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Calendar
                                  size={12}
                                  className="text-muted-foreground/70"
                                />
                                <span>{formatDays(reminder.daysOfWeek, t)}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Switch
                              checked={reminder.isEnabled}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() =>
                                  fcmToken && toggleMutation.mutate(reminder.id)
                              }
                              disabled={toggleMutation.isPending || !fcmToken}
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDelete(reminder.id, e)}
                              disabled={deleteMutation.isPending || !fcmToken}
                              className="h-8 w-8 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </section>

        <AddReminderDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          initialData={editingReminder}
        />
      </div>
    );
  }

  function formatTime(minutes: number | null) {
    if (minutes === null) return "--:--";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    const period = hours >= 12 ? "PM" : "AM";
    const h12 = hours % 12 || 12;
    return `${h12}:${mins.toString().padStart(2, "0")} ${period}`;
  }

  function formatDays(days: number[], t: any) {
    if (!days || days.length === 0) return t("settings.reminder.never");
    if (days.length === 7) return t("settings.reminder.daily");
    const dayNames = t("settings.reminder.daysShort", {
      returnObjects: true,
    }) as string[];
    return days
      .slice()
      .sort((a, b) => a - b)
      .map((d) => dayNames[d])
      .join(", ");
  }
