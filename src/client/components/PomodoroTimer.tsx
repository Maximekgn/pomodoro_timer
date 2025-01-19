import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, RotateCcw, Coffee, Timer } from "lucide-react";

interface TimerSettings {
  pomodoroTime: number;
  breakTime: number;
}

const DEFAULT_SETTINGS: TimerSettings = {
  pomodoroTime: 25,
  breakTime: 5,
};

const PomodoroTimer = () => {
  const [settings, setSettings] = useState<TimerSettings>(() => {
    const savedSettings = localStorage.getItem('pomodoroSettings');
    return savedSettings ? JSON.parse(savedSettings) : DEFAULT_SETTINGS;
  });

  const [time, setTime] = useState(settings.pomodoroTime * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState<"pomodoro" | "break">("pomodoro");
  const [alarmAudio, setAlarmAudio] = useState<HTMLAudioElement | null>(null);

  const timerConfigs = {
    pomodoro: settings.pomodoroTime * 60,
    break: settings.breakTime * 60,
  };

  useEffect(() => {
    const audio = new Audio("/notification.mp3");
    audio.loop = true;
    setAlarmAudio(audio);
    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const handleSettingsChange = () => {
      const savedSettings = localStorage.getItem('pomodoroSettings');
      if (savedSettings) {
        const newSettings = JSON.parse(savedSettings);
        setSettings(newSettings);
        setTime(newSettings[`${timerType}Time`] * 60);
      }
    };

    window.addEventListener('storage', handleSettingsChange);
    return () => window.removeEventListener('storage', handleSettingsChange);
  }, [timerType]);

  useEffect(() => {
    let interval: number | undefined;

    if (isActive && time > 0) {
      interval = window.setInterval(() => {
        setTime((time) => time - 1);
      }, 1000);
    } else if (time === 0) {
      setIsActive(false);
      alarmAudio?.play().catch(() => {});
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, alarmAudio]);

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setTime(timerConfigs[timerType]);
    setIsActive(false);
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  };

  const changeTimerType = (type: "pomodoro" | "break") => {
    setTimerType(type);
    setTime(timerConfigs[type]);
    setIsActive(false);
    if (alarmAudio) {
      alarmAudio.pause();
      alarmAudio.currentTime = 0;
    }
  };

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}\n${remainingSeconds.toString().padStart(2, "0")}`;
  };

  const progress = (time / timerConfigs[timerType]) * 100;

  return (
    <div className="p-6 md:p-8">
      <div className="flex justify-center space-x-2 mb-8">
        <button
          onClick={() => changeTimerType("pomodoro")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            timerType === "pomodoro"
              ? "bg-indigo-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <Timer className="w-4 h-4" />
          <span>Work</span>
        </button>
        <button
          onClick={() => changeTimerType("break")}
          className={`px-4 py-2 rounded-lg transition-colors flex items-center space-x-2 ${
            timerType === "break"
              ? "bg-green-500 text-white"
              : "bg-gray-100 hover:bg-gray-200"
          }`}
        >
          <Coffee className="w-4 h-4" />
          <span>Break</span>
        </button>
      </div>

      <div className="relative w-64 h-64 mx-auto mb-8">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 128 128">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <motion.circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className={`${
              isActive
                ? "text-red-500"
                : "text-green-500"
            }`}
            strokeDasharray={364.425}
            strokeDashoffset={364.425 - (progress * 364.425) / 100}
            initial={false}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.div
            key={time}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex flex-col items-center"
          >
            <span className="text-5xl font-bold text-gray-800">
              {Math.floor(time / 60).toString().padStart(2, "0")}
            </span>
            <span className="text-2xl font-medium text-gray-600">
              {(time % 60).toString().padStart(2, "0")}
            </span>
          </motion.div>
        </div>
      </div>

      <div className="flex justify-center space-x-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={toggleTimer}
          className={`px-8 py-3 rounded-lg font-semibold text-white shadow-lg transition-colors flex items-center space-x-2 ${
            isActive
              ? "bg-red-500 hover:bg-red-600"
              : "bg-green-500 hover:bg-green-600"
          }`}
        >
          {isActive ? (
            <>
              <Pause className="w-5 h-5" />
              <span>Pause</span>
            </>
          ) : (
            <>
              <Play className="w-5 h-5" />
              <span>Start</span>
            </>
          )}
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={resetTimer}
          className="px-8 py-3 rounded-lg font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 shadow-lg transition-colors flex items-center space-x-2"
        >
          <RotateCcw className="w-5 h-5" />
          <span>Reset</span>
        </motion.button>
      </div>
    </div>
  );
};

export default PomodoroTimer; 