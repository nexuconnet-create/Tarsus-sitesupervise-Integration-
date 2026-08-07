"use client";

import { use, useState, useEffect, useCallback } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import { useProjectUuid } from "@/lib/hooks/useProjectUuid";
import { useMemberships } from "@/lib/hooks/useMemberships";
import { getErrorMessage } from "@/lib/error";
import {
  getCoords,
  type WeatherData,
  type ForecastDay,
  type HourlySlot,
} from "@/lib/weather";
import {
  weatherService,
  toWeatherData,
  toHourlySlots,
  toForecastDays,
  toTaskImpactItems,
} from "@/lib/services/weatherService";
import type { TaskImpactItem } from "@/lib/mockData/weatherSiteReport";
import EngineerHeader from "../components/EngineerHeader";
import CurrentWeatherPanel from "./components/CurrentWeatherPanel";
import WorkabilityImpact from "./components/WorkabilityImpact";
import TaskImpactMatrix from "./components/TaskImpactMatrix";
import SevenDayForecast from "./components/SevenDayForecast";
import SiteReportForm from "./components/SiteReportForm";
import CommunicationActions from "./components/CommunicationActions";
import HourSelector from "./components/HourSelector";

interface PageProps {
  params: Promise<{ org_slug: string; project_slug: string }>;
}

const ZERO_WEATHER: WeatherData = {
  temperature: 0,
  humidity: 0,
  precipitationProbability: 0,
  windSpeed: 0,
  windDirection: 0,
  weatherCode: 0,
};

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
  const { getProject } = useMemberships();
  const project = getProject(org_slug, project_slug);
  const { data: projectUuid } = useProjectUuid(org_slug, project_slug);
  const projectId = projectUuid ?? undefined;

  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [forecast, setForecast] = useState<ForecastDay[]>([]);
  const [hourlySlots, setHourlySlots] = useState<HourlySlot[]>([]);
  const [taskImpact, setTaskImpact] = useState<TaskImpactItem[]>([]);
  const [weatherNote, setWeatherNote] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [locationMissing, setLocationMissing] = useState(false);
  const [savingLocation, setSavingLocation] = useState(false);
  const [notifying, setNotifying] = useState(false);

  const currentHour = new Date().getHours();
  const [selectedHour, setSelectedHour] = useState<number>(currentHour);

  const load = useCallback(async () => {
    if (!projectId) return;
    try {
      const loc = await weatherService
        .getLocation(projectId)
        .then((r) => r.data)
        .catch(() => null);
      if (!loc || loc.latitude == null || loc.longitude == null) {
        setLocationMissing(true);
        return;
      }
      setLocationMissing(false);

      const [cur, hr, fc, ti] = await Promise.all([
        weatherService.current(projectId).then((r) => r.data).catch(() => null),
        weatherService.hourly(projectId).then((r) => r.data).catch(() => null),
        weatherService.forecast(projectId).then((r) => r.data).catch(() => null),
        weatherService.taskImpact(projectId).then((r) => r.data).catch(() => null),
      ]);

      const slots = hr ? toHourlySlots(hr.hours) : [];
      setHourlySlots(slots);
      setForecast(fc ? toForecastDays(fc.days) : []);
      if (ti) {
        setTaskImpact(toTaskImpactItems(ti.tasks));
        setWeatherNote(ti.summary || "");
      }
      if (cur) {
        const w = toWeatherData(cur.current);
        // `current` has no rain probability — borrow it from the current hour.
        const nowSlot = slots.find((s) => s.hour === currentHour);
        if (nowSlot) w.precipitationProbability = nowSlot.precipitationProbability;
        setWeather(w);
      }
    } finally {
      setLoading(false);
    }
    // currentHour is captured once per render; intentionally excluded.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  const captureLocationFromDevice = async () => {
    if (!projectId) return;
    setSavingLocation(true);
    try {
      const { lat, lon } = await getCoords();
      await weatherService.setLocation(projectId, {
        latitude: lat,
        longitude: lon,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        capture_method: "device_gps",
      });
      toast.success("Site location saved.");
      await load();
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not capture location.");
    } finally {
      setSavingLocation(false);
    }
  };

  const notifyTeam = async () => {
    if (!projectId) return;
    setNotifying(true);
    try {
      const res = await weatherService.notifyTeam(projectId);
      toast.success(
        `Team notified (${res.data?.notifications_created ?? 0} sent).`,
      );
    } catch (e) {
      toast.error(getErrorMessage(e) || "Could not notify the team.");
    } finally {
      setNotifying(false);
    }
  };

  const noop = useCallback(() => {}, []);
  const handleNotifyTeamForm = useCallback(() => {
    notifyTeam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Active weather: viewing a future hour uses that slot; "now" uses current.
  const selectedSlot = hourlySlots.find((s) => s.hour === selectedHour);
  const isViewingNow = selectedHour === currentHour;
  const activeWeather: WeatherData = isViewingNow
    ? weather ?? (selectedSlot ? slotToWeatherData(selectedSlot) : ZERO_WEATHER)
    : selectedSlot
      ? slotToWeatherData(selectedSlot)
      : weather ?? ZERO_WEATHER;

  const reportTaskOptions = taskImpact.map((t) => ({ id: t.id, name: t.name }));
  const autoWeatherNote =
    weatherNote ||
    `${activeWeather.temperature}°C, wind ${activeWeather.windSpeed} km/h, rain probability ${activeWeather.precipitationProbability}%.`;

  const windWarning = activeWeather.windSpeed >= 30;
  const rainWarning = activeWeather.precipitationProbability >= 50;
  const today = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#021422]" />
      </div>
    );
  }

  if (locationMissing) {
    return (
      <div className="bg-[#E3E3E3] min-h-screen">
        <EngineerHeader
          title={project ? (project as { name?: string }).name ?? project_slug : project_slug}
          badge="WEATHER & SITE REPORT"
        />
        <div className="flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-md text-center">
            <MapPin className="mx-auto mb-3 text-[#007AFF]" size={28} />
            <h2 className="text-sm font-bold text-[#021422] mb-1">
              Set your site location
            </h2>
            <p className="text-xs text-gray-500 mb-5">
              Weather forecasts are anchored to the project site. Set the
              location once to enable current conditions, forecasts, and task
              impact.
            </p>
            <button
              onClick={captureLocationFromDevice}
              disabled={savingLocation || !projectId}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#021422] text-white text-xs font-bold uppercase rounded hover:bg-gray-900 transition-colors disabled:opacity-50"
            >
              {savingLocation && <Loader2 size={14} className="animate-spin" />}
              Use my current location
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-[#E3E3E3] min-h-screen">
      <EngineerHeader
        title={project ? (project as { name?: string }).name ?? project_slug : project_slug}
        badge="WEATHER & SITE REPORT"
      />

      <div className="space-y-6 p-4 md:p-8 pt-8 pb-20">
        <HourSelector
          slots={hourlySlots}
          selectedHour={selectedHour}
          currentHour={currentHour}
          onSelect={setSelectedHour}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <CurrentWeatherPanel
            weather={activeWeather}
            forecastLabel={isViewingNow ? undefined : selectedSlot?.label}
          />
          <WorkabilityImpact weather={activeWeather} />
        </div>

        <TaskImpactMatrix
          tasks={taskImpact}
          onReschedule={noop}
          onDelay={noop}
        />

        <SevenDayForecast forecast={forecast} />

        <SiteReportForm
          taskOptions={reportTaskOptions}
          autoWeatherNote={autoWeatherNote}
          date={today}
          onSubmit={noop}
          onSaveDraft={noop}
          onNotifyTeam={handleNotifyTeamForm}
          onGenerateReport={noop}
        />

        <CommunicationActions
          windWarning={windWarning}
          rainWarning={rainWarning}
          onNotifyCrew={notifyTeam}
          onGenerateReport={noop}
          onAdviseClient={notifyTeam}
        />

        {notifying && (
          <p className="text-[11px] text-gray-500">Notifying team…</p>
        )}
      </div>
    </div>
  );
}
