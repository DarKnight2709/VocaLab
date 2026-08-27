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
      <div className="space-y-8 animate-in fade-in duration-300">
        {/* Learning Title */}
        <div className="space-y-1 pb-2 border-b border-border/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Goal className="h-4 w-4" />
            </div>
            <h2 className="text-base font-extrabold text-foreground">
              {t("settings.learningTitle")}
            </h2>
          </div>
          <p className="text-xs text-muted-foreground ml-10.5">
            {t("settings.learningDescription")}
          </p>
        </div>

        {/* Daily Goal Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between p-4 sm:p-4.5 rounded-2xl border border-border/70 bg-card hover:border-primary/30 transition-all shadow-xs gap-4">
            <div className="space-y-0.5 flex-1 min-w-0">
              <h3 className="text-sm font-bold text-foreground">
                {t("settings.dailyGoal.title")}
              </h3>
              <p className="text-xs text-muted-foreground">
                {t("settings.dailyGoal.description")}
              </p>
            </div>

            <div className="w-[140px] sm:w-[160px] shrink-0">
              <Select
                value={dailyGoalData?.dailyGoalMinutes?.toString() || "15"}
                onValueChange={(val) => updateDailyGoalMutation.mutate(parseInt(val))}
                disabled={dailyGoalLoading || updateDailyGoalMutation.isPending}
              >
                <SelectTrigger className="h-9 rounded-xl border-border/80 bg-background text-xs font-bold shadow-xs">
                  <SelectValue placeholder={t("settings.dailyGoal.select")} />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-border/80 shadow-md">
                  <SelectItem value="5" className="text-xs font-semibold rounded-xl">5 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="15" className="text-xs font-semibold rounded-xl">15 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="30" className="text-xs font-semibold rounded-xl">30 {t("settings.dailyGoal.minutes")}</SelectItem>
                  <SelectItem value="60" className="text-xs font-semibold rounded-xl">60 {t("settings.dailyGoal.minutes")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* Push Notification Guidance */}
        <div
          className={cn(
            "p-4 sm:p-4.5 rounded-2xl border flex items-start gap-3 transition-all shadow-xs",
            fcmToken
              ? "bg-primary/5 border-primary/20 text-primary/80"
              : "bg-destructive/5 border-destructive/20 text-destructive/80",
          )}
        >
          <div className="mt-0.5 shrink-0">
            {fcmToken ? (
              <Info className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
          </div>
          <div className="flex-1">
            <p className="text-xs font-semibold leading-relaxed">
              {fcmToken
                ? t("settings.reminder.desktopNotificationRemind")
                : t("settings.reminder.allowBrowserNotifications")}
            </p>
          </div>
        </div>

        {/* Reminders Section */}
        <section className={cn("space-y-4", !fcmToken && "opacity-50 select-none")}>
          <div className="flex items-center justify-between pb-2 border-b border-border/80">
            <div className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Bell className="h-4 w-4" />
              </div>
              <h2 className="text-base font-extrabold text-foreground">
                {t("settings.reminder.reminders")}
              </h2>
            </div>
            <Button
              size="sm"
              className="h-8.5 rounded-xl px-3.5 text-xs font-bold shadow-xs cursor-pointer gap-1.5"
              onClick={handleAdd}
              disabled={!fcmToken}
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{t("settings.reminder.addReminder")}</span>
            </Button>
          </div>

          <div className="grid gap-4">
            <div className="flex flex-col rounded-2xl border border-border/70 bg-card shadow-xs overflow-hidden">
              <div className="flex items-center justify-between p-4 sm:p-4.5 gap-4">
                <div className="space-y-0.5 flex-1 min-w-0">
                  <p className="text-sm font-bold text-foreground">
                    {t("settings.reminder.reminders")}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t("settings.reminder.reminderDescription")}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowReminders(!showReminders)}
                  className="h-8.5 rounded-xl border-border/80 px-3.5 text-xs font-bold shadow-xs hover:bg-muted cursor-pointer shrink-0 gap-1.5"
                  disabled={!fcmToken}
                >
                  <span>{showReminders ? t("common.cancel") : t("common.view")}</span>
                  <ChevronDown
                    className={cn(
                      "h-3.5 w-3.5 transition-transform",
                      showReminders && "rotate-180",
                    )}
                  />
                </Button>
              </div>

              {showReminders && fcmToken && (
                <div className="p-4 sm:p-5 pt-0 space-y-4 border-t border-border/70 bg-muted/20 animate-in slide-in-from-top-2 duration-300">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                    </div>
                  ) : !Array.isArray(reminders) || reminders.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 gap-2.5 rounded-xl bg-card border border-dashed border-border/80 mt-4">
                      <Bell size={22} className="text-muted-foreground/40" />
                      <p className="text-xs text-muted-foreground font-semibold">
                        {t("settings.reminder.noReminders")}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-100 overflow-y-auto pr-1 mt-4">
                      {reminders.map((reminder: Reminder) => (
                        <div
                          key={reminder.id}
                          onClick={() => handleEdit(reminder)}
                          className="flex items-center gap-3.5 p-4 rounded-2xl border border-border/70 bg-card hover:shadow-md hover:border-primary/40 transition-all group cursor-pointer shadow-xs"
                        >
                          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                            <Clock size={18} className="text-primary" />
                          </div>

                          <div className="flex-1 min-w-0 space-y-1">
                            <h3 className="text-sm font-bold text-foreground truncate">
                              {reminder.title}
                            </h3>
                            <p className="text-xs text-muted-foreground truncate">
                              {reminder.description}
                            </p>
                            <div className="flex flex-wrap items-center gap-2 pt-0.5">
                              <span className="inline-flex items-center px-2 py-0.5 rounded-lg text-[10px] font-extrabold uppercase tracking-wider bg-primary/10 text-primary">
                                {t(`settings.reminder.types.${reminder.type}`)}
                              </span>
                              <span className="text-xs font-semibold text-muted-foreground flex items-center gap-1">
                                <Clock size={11} className="text-muted-foreground/70" />
                                <span>
                                  {reminder.type === ReminderType.ON_THE_HOUR
                                    ? formatTime(reminder.triggerTime)
                                    : `${formatTime(reminder.startTime)} - ${formatTime(reminder.endTime)}`}
                                </span>
                              </span>
                              <span className="text-xs text-muted-foreground flex items-center gap-1 font-medium">
                                <Calendar size={11} className="text-muted-foreground/70" />
                                <span>{formatDays(reminder.daysOfWeek, t)}</span>
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <Switch
                              checked={reminder.isEnabled}
                              onClick={(e) => e.stopPropagation()}
                              onCheckedChange={() =>
                                  fcmToken && toggleMutation.mutate(reminder.id)
                              }
                              disabled={toggleMutation.isPending || !fcmToken}
                              className="cursor-pointer"
                            />
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={(e) => handleDelete(reminder.id, e)}
                              disabled={deleteMutation.isPending || !fcmToken}
                              className="h-8 w-8 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
                            >
                              <Trash2 size={15} />
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
