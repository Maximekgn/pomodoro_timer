import { useState } from 'react';
import { Save } from 'lucide-react';
import { motion } from 'framer-motion';

interface SettingsProps {
  onClose: () => void;
}

export default function Settings({ onClose }: SettingsProps) {
  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [breakTime, setBreakTime] = useState(5);

  const handleSave = () => {
    localStorage.setItem('pomodoroSettings', JSON.stringify({
      pomodoroTime,
      breakTime,
    }));
    onClose();
  };

  return (
    <div className="p-6 bg-white rounded-2xl shadow-xl">
      <h2 className="text-2xl font-bold text-black mb-6">Settings</h2>
      
      <div className="space-y-6">
        {/* Timer Settings */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Work Duration (minutes)
            </label>
            <input
              type="number"
              value={pomodoroTime}
              onChange={(e) => setPomodoroTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
              min="1"
              max="60"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Break Duration (minutes)
            </label>
            <input
              type="number"
              value={breakTime}
              onChange={(e) => setBreakTime(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white text-black"
              min="1"
              max="30"
            />
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 text-black hover:bg-gray-100 rounded-md transition-colors"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleSave}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-900 transition-colors flex items-center space-x-2"
          >
            <Save className="w-4 h-4" />
            <span>Save Settings</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
} 