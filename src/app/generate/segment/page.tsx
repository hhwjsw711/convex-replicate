"use client";

import { Smartphone, Monitor, ChevronRight } from 'lucide-react';
import { useState } from 'react';

export default function SegmentBySegment() {
  const [selectedOrientation, setSelectedOrientation] = useState<'vertical' | 'horizontal'>('vertical');

  return (
    <div className="container mx-auto">
      <div className="w-full max-w-3xl mx-auto space-y-8 relative z-10 py-32">
        <h1 className="text-center text-4xl sm:text-xl md:text-2xl lg:text-4xl mb-12 font-dancing">
          Segment by Segment
        </h1>
        <StepIndicator />
        <div className="rounded-xl border text-card-foreground w-full bg-white shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="tracking-tight text-2xl font-normal text-gray-800">Enter Your Script</h3>
          </div>
          <div className="p-6 pt-0">
            <div className="w-full space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <OrientationButton 
                  Icon={Smartphone} 
                  text="Vertical (9:16)" 
                  isSelected={selectedOrientation === 'vertical'}
                  onClick={() => setSelectedOrientation('vertical')}
                />
                <OrientationButton 
                  Icon={Monitor} 
                  text="Horizontal (16:9)" 
                  isSelected={selectedOrientation === 'horizontal'}
                  onClick={() => setSelectedOrientation('horizontal')}
                />
              </div>
              <button 
                className="items-center whitespace-nowrap rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 py-2 flex gap-2 justify-center px-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-300"
                type="submit"
              >
                Start Writing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="mb-8 hidden md:block max-w-xl mx-auto">
      <div className="flex justify-center items-center gap-12 mb-8">
        <StepItem number={1} text="Select Mode" status="completed" />
        <ChevronRight className="w-6 h-6 text-blue-500" />
        <StepItem number={2} text="Options" status="active" />
        <ChevronRight className="w-6 h-6 text-gray-600" />
        <StepItem number={3} text="Customize" status="upcoming" />
      </div>
    </div>
  );
}

type StepStatus = 'completed' | 'active' | 'upcoming';

interface StepItemProps {
  number: number;
  text: string;
  status: StepStatus;
}

function StepItem({ number, text, status }: StepItemProps) {
  const bgColor = 
    status === 'completed' ? "bg-blue-500" :
    status === 'active' ? "border border-blue-500" :
    "border border-gray-600";

  const textColor = status === 'active' ? "border-blue-400 font-medium" : "text-gray-600";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${bgColor} ${status !== 'upcoming' ? "text-white" : "text-gray-800"}`}
      >
        {number}
      </div>
      <span className={`mt-2 text-sm whitespace-nowrap ${textColor}`}>
        {text}
      </span>
    </div>
  );
}

interface OrientationButtonProps {
  Icon: React.ElementType;
  text: string;
  isSelected: boolean;
  onClick: () => void;
}

function OrientationButton({ Icon, text, isSelected, onClick }: OrientationButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`relative transition duration-300 text-lg px-8 py-12 rounded-xl flex flex-col items-center justify-center h-full border border-blue-300 text-gray-600 hover:border-blue-500 ${isSelected ? 'bg-blue-50' : 'bg-white'}`}
    >
      <Icon className="mb-4 h-8 w-8" />
      {text}
    </button>
  );
}