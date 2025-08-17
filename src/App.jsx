import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

// --- Utilities ---
const fmtTime = (ts) => new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
const fmtDate = (ts) => new Date(ts).toLocaleDateString([], { weekday: "short", month: "short", day: "numeric" });

const WEATHER_CODE = {
  0: { label: "Clear sky", icon: "☀️" },
  1: { label: "Mainly clear", icon: "🌤️" },
  2: { label: "Partly cloudy", icon: "⛅" },
  3: { label: "Overcast", icon: "☁️" },
  45: { label: "Fog", icon: "🌫️" },
  48: { label: "Rime fog", icon: "🌫️" },
  51: { label: "Light drizzle", icon: "🌦️" },
  53: { label: "Drizzle", icon: "🌦️" },
  55: { label: "Heavy drizzle", icon: "🌧️" },
  56: { label: "Freezing drizzle", icon: "🌧️" },
  57: { label: "Heavy freezing drizzle", icon: "🌧️" },
  61: { label: "Light rain", icon: "🌧️" },
  63: { label: "Rain", icon: "🌧️" },
  65: { label: "Heavy rain", icon: "🌧️" },
  66: { label: "Freezing rain", icon: "🌧️" },
  67: { label: "Heavy freezing rain", icon: "🌧️" },
  71: { label: "Light snow", icon: "🌨️" },
  73: { label: "Snow", icon: "🌨️" },
  75: { label: "Heavy snow", icon: "❄️" },
  77: { label: "Snow grains", icon: "🌨️" },
  80: { label: "Light showers", icon: "🌦️" },
  81: { label: "Showers", icon: "🌦️" },
  82: { label: "Heavy showers", icon: "🌧️" },
  85: { label: "Snow showers", icon: "🌨️" },
  86: { label: "Heavy snow showers", icon: "❄️" },
  95: { label: "Thunderstorm", icon: "⛈️" },
  96: { label: "Thunder w/ hail", icon: "⛈️" },
  99: { label: "Severe thunder", icon: "⛈️" },
};

const BACKEND_URL = "https://weather-ag2d.onrender.com";

async function searchPlaces(q) {
  if (!q?.trim()) return [];
  const res = await fetch(
    `${BACKEND_URL}/api/search?q=${encodeURIComponent(q)}`,
    {
      headers: {
        "Accept-Language": "en",
      },
    }
  );
  if (!res.ok) return [];
  const data = await res.json();
  return data.map((d) => ({
    name: d.display_name,
    lat: parseFloat(d.lat),
    lon: parseFloat(d.lon),
  }));
}

async function reverseGeocode(lat, lon) {
  try {
    const res = await fetch(
      `${BACKEND_URL}/api/reverse?lat=${lat}&lon=${lon}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data?.display_name || null;
  // eslint-disable-next-line no-unused-vars
  } catch (e) {
    return null;
  }
}

async function fetchWeather(lat, lon, tz = "auto") {
  if (!lat || !lon) throw new Error("Invalid coordinates");

   const url = new URL(`${BACKEND_URL}/weather?lat=${lat}&lon=${lon}&tz=${tz}`);

  const res = await fetch(url.toString());
  if (!res.ok) throw new Error(`Weather fetch failed (${res.status})`);
  return res.json();
}


function useInterval(callback, delay) {
  const savedRef = useRef();
  useEffect(() => {
    savedRef.current = callback;
  }, [callback]);
  useEffect(() => {
    if (delay == null) return;
    const id = setInterval(() => savedRef.current?.(), delay);
    return () => clearInterval(id);
  }, [delay]);
}

function UnitToggle({ unit, onChange }) {
  return (
    <div className="inline-flex rounded-2xl overflow-hidden shadow">
      <button
        className={`px-3 py-1 text-sm font-medium ${
          unit === "C" ? "bg-black/80 text-white" : "bg-white/70 backdrop-blur"
        }`}
        onClick={() => onChange("C")}
      >
        °C
      </button>
      <button
        className={`px-3 py-1 text-sm font-medium ${
          unit === "F" ? "bg-black/80 text-white" : "bg-white/70 backdrop-blur"
        }`}
        onClick={() => onChange("F")}
      >
        °F
      </button>
    </div>
  );
}

function SearchBar({ onSelect }) {
  const [q, setQ] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef(null);

  useEffect(() => {
    if (!q) {
      setResults([]);
      return;
    }
    setLoading(true);
    if (controllerRef.current) controllerRef.current.abort();
    const ctl = new AbortController();
    controllerRef.current = ctl;
    const t = setTimeout(async () => {
      try {
        const items = await searchPlaces(q);
        setResults(items);
      } finally {
        setLoading(false);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [q]);

  return (
    <div className="relative w-full md:w-96">
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search city or place…"
        className="w-full rounded-2xl border border-black/10 bg-white/80 px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-black/20"
      />
      {loading && (
        <div className="absolute right-3 top-2.5 text-sm animate-pulse">…</div>
      )}
      {results.length > 0 && (
        <div className="absolute z-20 mt-2 w-full rounded-2xl border border-black/10 bg-white/95 shadow-lg backdrop-blur">
          {results.map((r, idx) => (
            <button
              key={idx}
              className="block w-full text-left px-4 py-2 hover:bg-black/5"
              onClick={() => {
                onSelect(r);
                setQ("");
                setResults([]);
              }}
            >
              {r.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, sub }) {
  return (
    <div className="p-4 rounded-2xl bg-white/70 backdrop-blur border border-black/10 shadow-sm">
      <div className="text-xs uppercase tracking-wide text-black/60">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
      {sub ? <div className="text-xs text-black/60 mt-1">{sub}</div> : null}
    </div>
  );
}

export default function WeatherApp() {
  const [coords, setCoords] = useState({ lat: 28.6139, lon: 77.209 }); // New Delhi default
  const [place, setPlace] = useState("Detecting location…");
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [unit, setUnit] = useState("C");
  const [lastUpdated, setLastUpdated] = useState(null);
  const [tracking, setTracking] = useState(true);
  const watchIdRef = useRef(null);

  // Detect & watch location
  useEffect(() => {
    if (!("geolocation" in navigator)) {
      setPlace("Location unavailable – using default (New Delhi)");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        setCoords({ lat: latitude, lon: longitude });
        const name = await reverseGeocode(latitude, longitude);
        setPlace(name || `${latitude.toFixed(3)}, ${longitude.toFixed(3)}`);
      },
      () => setPlace("Permission denied – using default (New Delhi)"),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    watchIdRef.current = navigator.geolocation.watchPosition(
      async (pos) => {
        if (!tracking) return;
        const { latitude, longitude } = pos.coords;
        setCoords((prev) => {
          // update only if moved over ~200m
          const moved =
            Math.hypot(latitude - prev.lat, longitude - prev.lon) > 0.0018; // ~200m in degrees
          return moved ? { lat: latitude, lon: longitude } : prev;
        });
      },
      () => {},
      { enableHighAccuracy: true, maximumAge: 20000, timeout: 20000 }
    );

    return () => {
      if (watchIdRef.current && navigator.geolocation.clearWatch) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [tracking]);

  // Fetch weather when coords change
  useEffect(() => {
    let mounted = true;
    setError(null);
    (async () => {
      try {
        const json = await fetchWeather(coords.lat, coords.lon, Intl.DateTimeFormat().resolvedOptions().timeZone);
        if (!mounted) return;
        console.log("Weather API raw response:", json);
        setData(json);
        setLastUpdated(Date.now());
        if (!place || place.includes("Detecting") || place.includes("default")) {
          const name = await reverseGeocode(coords.lat, coords.lon);
          if (name) setPlace(name);
        }
      } catch (e) {
        if (mounted) setError(e.message || "Failed to load weather");
      }
    })();
    return () => (mounted = false);
  }, [coords.lat, coords.lon, place]);

  // Auto refresh every 5 minutes
  useInterval(() => {
    if (!coords) return;
    fetchWeather(coords.lat, coords.lon, Intl.DateTimeFormat().resolvedOptions().timeZone)
      .then((json) => {
        console.log("Weather API raw response:", json);
        setData(json);
        setLastUpdated(Date.now());
      })
      .catch(() => {});
  }, 5 * 60 * 1000);

  const hourly = useMemo(() => {
    if (!data?.hourly) return [];
    const { time, temperature_2m, precipitation, wind_speed_10m } = data.hourly;
    return time.map((t, i) => ({
      time: fmtTime(t),
      tempC: temperature_2m[i],
      tempF: temperature_2m[i] * 9/5 + 32,
      precip: precipitation[i],
      wind: wind_speed_10m[i],
      rawTime: t,
    }));
  }, [data]);

  const next24 = useMemo(() => hourly.slice(0, 24), [hourly]);

  const daily = useMemo(() => {
    if (!data?.daily) return [];
    const {
      time,
      temperature_2m_max,
      temperature_2m_min,
      uv_index_max,
      precipitation_sum,
      sunrise,
      sunset,
    } = data.daily;
    return time.map((t, i) => ({
      date: fmtDate(t),
      tmaxC: temperature_2m_max?.[i] ?? null,
      tminC: temperature_2m_min?.[i] ?? null,
      tmaxF: (temperature_2m_max?.[i] ?? null) * 9/5 + 32,
      tminF: (temperature_2m_min?.[i] ?? null) * 9/5 + 32,
      uv: uv_index_max[i],
      rain: precipitation_sum[i],
      sunrise: fmtTime(sunrise[i]),
      sunset: fmtTime(sunset[i]),
    }));
  }, [data]);

  const current = data?.current;
  const code = current?.weather_code ?? null;
  const codeMeta = code != null ? WEATHER_CODE[code] || { label: "—", icon: "❔" } : null;
  const temp = current ? (unit === "C" ? current.temperature_2m : current.temperature_2m * 9/5 + 32) : null;
  const appTemp = current ? (unit === "C" ? current.apparent_temperature : current.apparent_temperature * 9/5 + 32) : null;

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-sky-200 via-indigo-100 to-white text-black">
      <div className="mx-auto max-w-screen p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center gap-3 md:gap-6 justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">🌦️</div>
            <div>
              <div className="text-2xl md:text-3xl font-bold">Weather Now</div>
              <div className="text-sm text-black/70">Real-time, location-aware forecast</div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <SearchBar
              onSelect={(r) => {
                setCoords({ lat: r.lat, lon: r.lon });
                setPlace(r.name);
              }}
            />
            <UnitToggle unit={unit} onChange={setUnit} />
            <button
              className="rounded-2xl border border-black/10 bg-white/70 px-3 py-2 shadow hover:bg-white"
              onClick={() => {
                if (coords) {
                  fetchWeather(coords.lat, coords.lon, Intl.DateTimeFormat().resolvedOptions().timeZone)
                    .then((json) => {
                      setData(json);
                      setLastUpdated(Date.now());
                    })
                    .catch((e) => setError(e.message));
                }
              }}
              title="Refresh"
            >
              ⟳
            </button>
            <button
              className={`rounded-2xl border border-black/10 px-3 py-2 shadow ${
                tracking ? "bg-emerald-600 text-white" : "bg-white/70"
              }`}
              onClick={() => setTracking((v) => !v)}
              title={tracking ? "Stop following my GPS" : "Follow my GPS"}
            >
              {tracking ? "Following" : "Follow"}
            </button>
          </div>
        </div>

        {/* Location + Now */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-screen">
          <div className="lg:col-span-2 p-6 rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow">
            <div className="flex items-center gap-3">
              <div className="text-3xl">{codeMeta?.icon}</div>
              <div className="flex-1">
                <div className="text-lg font-semibold truncate w-[50%]" title={place}>{place}</div>
                <div className="text-sm text-black/60">
                  {new Date().toLocaleString()} · {lastUpdated ? `Updated ${new Date(lastUpdated).toLocaleTimeString()}` : "Loading…"}
                </div>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
              <Stat label="Temperature" value={current ? `${temp?.toFixed(1)}°${unit}` : "—"} sub={codeMeta?.label} />
              <Stat label="Feels like" value={current ? `${appTemp?.toFixed(1)}°${unit}` : "—"} sub={current ? `Clouds ${current.cloud_cover}%` : ""} />
              <Stat label="Humidity" value={current ? `${current.relative_humidity_2m}%` : "—"} sub={current ? `Pressure ${current.surface_pressure} hPa` : ""} />
              <Stat label="Wind" value={current ? `${current.wind_speed_10m} m/s` : "—"} sub={current ? `${current.wind_direction_10m}°` : ""} />
            </div>

            <div className="mt-6">
              <div className="text-sm font-medium mb-2">Next 24 hours</div>
              <div className="h-56 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={next24} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                    <defs>
                      <linearGradient id="temp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="currentColor" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="currentColor" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" interval={2} />
                    <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickFormatter={(v) => `${v}°`} />
                    <Tooltip formatter={(v, n) => (n === "tempC" || n === "tempF" ? `${v.toFixed(1)}°${unit}` : v)} />
                    <Area type="monotone" dataKey={unit === "C" ? "tempC" : "tempF"} stroke="currentColor" fill="url(#temp)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow">
              <div className="text-sm font-semibold mb-3">7-day forecast</div>
              <div className="space-y-3">
                {daily.map((d, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <div className="w-28">{d.date}</div>
                    <div className="flex-1">
                      <div className="h-2 w-full bg-black/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-black/40"
                          style={{ width: `${Math.min(100, Math.max(5, (d.uv / 11) * 100))}%` }}
                          title={`UV max ${d.uv}`}
                        />
                      </div>
                    </div>
                    <div className="w-36 text-right">
                      <span className="font-medium">
                        {unit === "C" ? `${d.tmaxC.toFixed(0)}°` : `${d.tmaxF.toFixed(0)}°`}
                      </span>
                      <span className="mx-1 text-black/50">/</span>
                      <span className="text-black/70">
                        {unit === "C" ? `${d.tminC.toFixed(0)}°` : `${d.tminF.toFixed(0)}°`}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow">
              <div className="text-sm font-semibold mb-3">Sunrise & Sunset</div>
              <div className="grid grid-cols-2 gap-3 text-sm">
                {daily[0] ? (
                  <>
                    <Stat label="Sunrise" value={daily[0].sunrise} />
                    <Stat label="Sunset" value={daily[0].sunset} />
                  </>
                ) : (
                  <div className="col-span-2 text-black/60">Loading…</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Hourly details */}
        <div className="mt-6 p-6 rounded-3xl bg-white/70 backdrop-blur border border-black/10 shadow">
          <div className="text-sm font-semibold mb-3">Hourly details (next 24h)</div>
          <div className="overflow-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-black/60">
                  <th className="py-2 pr-4">Time</th>
                  <th className="py-2 pr-4">Temp</th>
                  <th className="py-2 pr-4">Precip (mm)</th>
                  <th className="py-2 pr-4">Wind (m/s)</th>
                </tr>
              </thead>
              <tbody>
                {next24.map((h, i) => (
                  <tr key={i} className="border-t border-black/10">
                    <td className="py-2 pr-4 whitespace-nowrap">{h.time}</td>
                    <td className="py-2 pr-4">{unit === "C" ? `${h.tempC.toFixed(1)}°C` : `${h.tempF.toFixed(1)}°F`}</td>
                    <td className="py-2 pr-4">{h.precip}</td>
                    <td className="py-2 pr-4">{h.wind}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
            {error}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-xs text-black/60">
          Data by Open‑Meteo & OpenStreetMap/Nominatim · This auto-refreshes every 5 minutes and follows your GPS when enabled.
        </div>
      </div>
    </div>
  );
}
