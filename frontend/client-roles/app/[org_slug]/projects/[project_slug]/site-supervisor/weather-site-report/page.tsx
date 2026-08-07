"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */

import { use, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { crewManagerService } from "@/lib/services";
import { useMemberships } from "@/lib/hooks/useMemberships";
import {
  fetchCurrentWeather, fetchForecast, fetchHourlyForecast,
  getCoords, WeatherData, ForecastDay, HourlySlot,
} from "@/lib/weather";
import CrewHeader from "../component/CrewHeader";
import CurrentWeatherPanel from "./components/CurrentWeatherPanel";
import WorkabilityImpact from "./components/WorkabilityImpact";
import TaskImpactMatrix from "./components/TaskImpactMatrix";
import SevenDayForecast from "./components/SevenDayForecast";
import SiteReportForm, { ReportFormData } from "./components/SiteReportForm";
import CommunicationActions from "./components/CommunicationActions";
import HourSelector from "./components/HourSelector";
import {
  MOCK_WEATHER,
  MOCK_FORECAST,
  MOCK_HOURLY_SLOTS,
  MOCK_TASK_IMPACT,
  MOCK_REPORT_TASKS,
  MOCK_WEATHER_NOTE,
  TaskImpactItem,
} from "@/lib/mockData/weatherSiteReport";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

function deriveTaskImpact(tasks: any[], weather: WeatherData): TaskImpactItem[] {
  if (!tasks || tasks.length === 0) return MOCK_TASK_IMPACT;
  return tasks.slice(0, 5).map((t: any) => {
    const isConcrete = String(t.title || t.name || "").toLowerCase().includes("concrete");
    const isCrane    = String(t.title || t.name || "").toLowerCase().includes("crane");
    const rainRisk   = weather.precipitationProbability >= 50 && isConcrete;
    const windRisk   = weather.windSpeed >= 30 && isCrane;

    const status: TaskImpactItem["status"] =
      rainRisk ? "At Risk" : windRisk ? "Warning" : "On Track";
    const weatherRisk =
      rainRisk ? `Rain ${weather.precipitationProbability}% at 2PM` :
      windRisk ? `Wind ${weather.windSpeed} km/h` : "None";
    const action: TaskImpactItem["action"] =
      rainRisk ? "reschedule" : windRisk ? "delay" : "continue";

    return {
      id: String(t.id),
      name: t.title || t.name || "Task",
      status,
      weatherRisk,
      action,
      actionLabel: windRisk ? "Delay to 3PM" : undefined,
    };
  });
}

function slotToWeatherData(slot: HourlySlot): WeatherData {
  return {
    temperature: slot.temperature,
    humidity: slot.humidity,
    precipitationProbability: slot.precipitationProbability,
    windSpeed: slot.windSpeed,
    windDirection: slot.windDirection,
    weatherCode: slot.weatherCode,
  };
}

export default function WeatherSiteReportPage({ params }: PageProps) {
  const { org_slug, project_slug } = use(params);
  const router = useRouter();
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const base = `/${org_slug}/projects/${project_slug}/site-supervisor`;

  const [weather, setWeather]         = useState<WeatherData | null>(null);
  const [forecast, setForecast]       = useState<ForecastDay[]>([]);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [tasks, setTasks]             = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  const currentHour = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);

  useEffect(() => {
    const load = async () => {
      try {
        const { lat, lon } = await getCoords();
        const [wx, fc, hourly, tasksRes] = await Promise.all([
          fetchCurrentWeather(lat, lon).catch(() => null),
          fetchForecast(lat, lon).catch(() => []),
          fetchHourlyForecast(lat, lon).catch(() => []),
          crewManagerService.getTasks().catch(() => ({ data: [] })),
        ]);
        setWeather(wx);
        setForecast(fc.length > 0 ? fc : MOCK_FORECAST);
        setHourlySlots(hourly.length > 0 ? hourly : MOCK_HOURLY_SLOTS);
        const taskList = tasksRes.data?.results || (Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setTasks(taskList);
      } catch {
        // fall through to mocks
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Resolve active weather: if viewing a future hour, use that slot's data
  const activeSlots = hourlySlots.length > 0 ? hourlySlots : MOCK_HOURLY_SLOTS;
  const selectedSlot = activeSlots.find((s) => s.hour === selectedHour);
  const isViewingNow = selectedHour === currentHour;

  const activeWeather: WeatherData = isViewingNow
    ? (weather ?? (selectedSlot ? slotToWeatherData(selectedSlot) : MOCK_WEATHER))
    : (selectedSlot ? slotToWeatherData(selectedSlot) : (weather ?? MOCK_WEATHER));

  const selectedSlotLabel = selectedSlot?.label;

  const activeForecast = forecast.length > 0 ? forecast : MOCK_FORECAST;
  const taskImpact = tasks.length > 0 ? deriveTaskImpact(tasks, activeWeather) : MOCK_TASK_IMPACT;

  const reportTaskOptions = tasks.length > 0
    ? tasks.map((t: any) => ({ id: String(t.id), name: t.title || t.name || "Task" }))
    : MOCK_REPORT_TASKS;

  const autoWeatherNote = weather
    ? `${activeWeather.temperature}°C, wind ${activeWeather.windSpeed} km/h, rain probability ${activeWeather.precipitationProbability}%.`
    : MOCK_WEATHER_NOTE;

  const windWarning = activeWeather.windSpeed >= 30;
  const rainWarning = activeWeather.precipitationProbability >= 50;

  const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });

  const handleReschedule = useCallback((_taskId: string) => {
    // router.push(`${base}/task-details`);
  }, []);

  const handleDelay = useCallback((_taskId: string, _label: string) => {
    // no-op until backend ready
  }, []);

  const handleNotifyCrew = useCallback(() => {
    // router.push(`${base}/messages`);
  }, []);

  const handleGenerateReport = useCallback(() => {
    // wire to report generation when backend ready
  }, []);

  const handleAdviseClient = useCallback(() => {
    // router.push(`${base}/messages`);
  }, []);

  const handleSubmit = useCallback((_data: ReportFormData) => {
    // wire to crewManagerService when backend is ready
  }, []);

  const handleSaveDraft = useCallback((_data: ReportFormData) => {
    // wire to crewManagerService when backend is ready
  }, []);

  const handleNotifyTeam = useCallback((_data: ReportFormData) => {
    // wire to crewManagerService when backend is ready
  }, []);

  const handleGenerateReportForm = useCallback((_data: ReportFormData) => {
    // wire to crewManagerService when backend is ready
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]" />
      </div>
    );
  }

  return (
    <div className="bg-[#E3E3E3] min-h-screen">
      <CrewHeader
        title={project ? (project as { name?: string }).name ?? project_slug : project_slug}
        badge="WEATHER & SITE REPORT"
      />

      <div className="space-y-6 p-4 md:p-8 pt-8 pb-20">

        {/* Hour Selector */}
        <HourSelector
          slots={activeSlots}
          selectedHour={selectedHour}
          currentHour={currentHour}
          onSelect={setSelectedHour}
        />

        {/* Row 1 — Current Weather + Workability Impact */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrentWeatherPanel
            weather={activeWeather}
            forecastLabel={isViewingNow ? undefined : selectedSlotLabel}
          />
          <WorkabilityImpact weather={activeWeather} />
        </div>

        {/* Row 2 — Task Impact Matrix */}
        <TaskImpactMatrix
          tasks={taskImpact}
          onReschedule={handleReschedule}
          onDelay={handleDelay}
        />

        {/* Row 3 — 7-Day Forecast */}
        <SevenDayForecast forecast={activeForecast} />

        {/* Row 4 — Site Report Form */}
        <SiteReportForm
          taskOptions={reportTaskOptions}
          autoWeatherNote={autoWeatherNote}
          date={today}
          onSubmit={handleSubmit}
          onSaveDraft={handleSaveDraft}
          onNotifyTeam={handleNotifyTeam}
          onGenerateReport={handleGenerateReportForm}
        />

        {/* Row 5 — Communication Actions */}
        <CommunicationActions
          windWarning={windWarning}
          rainWarning={rainWarning}
          onNotifyCrew={handleNotifyCrew}
          onGenerateReport={handleGenerateReport}
          onAdviseClient={handleAdviseClient}
        />

      </div>
    </div>
  );
}
