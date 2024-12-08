"use client";

import { useState } from "react";
import Image from "next/image";
//import { Progress } from "@/components/ui/progress";

export default function GameArea() {
  const [santaDeposits, setSantaDeposits] = useState(0);
  const [grinchDeposits, setGrinchDeposits] = useState(0);

  const handleSantaAction = () => {
    setSantaDeposits((prev) => prev + 0.5);
  };

  const handleGrinchAction = () => {
    setGrinchDeposits((prev) => prev + 0.5);
  };

  const totalDeposits = santaDeposits + grinchDeposits;
  const santaProgress = totalDeposits
    ? (santaDeposits / totalDeposits) * 100
    : 50;

  return (
    <div className="text-center">
      <Image
        src="/santa-vs-grinch-logo.svg"
        alt="Santa vs Grinch"
        width={300}
        height={100}
        className="mx-auto mb-8"
      />
      <div className="flex justify-between items-end mb-8">
        <div className="flex-1">
          <Image
            src="/santa.svg"
            alt="Santa"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <button
            onClick={handleSantaAction}
            className="btn btn-error font-bold py-2 px-4 rounded-full"
          >
            Send elves to save Christmas
          </button>
        </div>
        <div className="flex-1">
          <Image
            src="/grinch.svg"
            alt="Grinch"
            width={200}
            height={200}
            className="mx-auto mb-4"
          />
          <button
            onClick={handleGrinchAction}
            className="btn btn-success font-bold py-2 px-4 rounded-full"
          >
            Call the Grinch&apos;s Heist
          </button>
        </div>
      </div>
      <div className="mb-8">
        <progress
          value={santaProgress}
          className="progress progress-error bg-success h-8"
          max={100}
        />
      </div>
      <div className="text-2xl font-bold mb-4">
        <span className="text-red-500">{santaDeposits.toFixed(1)} SOL</span>
        <span className="mx-2">vs</span>
        <span className="text-green-500">{grinchDeposits.toFixed(1)} SOL</span>
      </div>
    </div>
  );
}
