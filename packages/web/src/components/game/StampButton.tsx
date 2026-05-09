"use client";

import { type FC, useState } from "react";

const STAMPS = ["😊", "😲", "❓", "❗", "❤️"];

interface StampButtonProps {
  onSend: (stampId: string) => void;
}

export const StampButton: FC<StampButtonProps> = ({ onSend }) => {
  const [open, setOpen] = useState(false);

  const handleStamp = (stamp: string) => {
    onSend(stamp);
    setOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 flex flex-col items-end gap-2">
      {open && (
        <div className="flex flex-col items-end gap-1">
          {STAMPS.map((stamp) => (
            <button
              key={stamp}
              onClick={() => handleStamp(stamp)}
              className="text-2xl bg-white rounded-full w-12 h-12 flex items-center justify-center shadow-md hover:scale-110 transition-transform"
            >
              {stamp}
            </button>
          ))}
        </div>
      )}
      <button
        onClick={() => setOpen((v) => !v)}
        className="text-2xl bg-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
      >
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
};
