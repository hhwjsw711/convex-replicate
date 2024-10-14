"use client";

import React, { useState } from "react";
import { Smartphone, Monitor, ChevronRight } from "lucide-react";

export default function ScriptGeneration() {
  const [title, setTitle] = useState("");
  const [script, setScript] = useState("");
  const [customContext, setCustomContext] = useState("");
  const [useCustomContext, setUseCustomContext] = useState(true);
  const [videoFormat, setVideoFormat] = useState("horizontal");

  const premadeContexts = {
    "Photo-Realistic":
      "High-quality, realistic images with sharp details, vibrant colors, and natural lighting, photo realistic",
    Scary:
      "Dark and eerie atmosphere, shadowy figures, ominous lighting, fog or mist, abandoned locations, horror elements",
    Fantasy:
      "Magical landscapes, mythical creatures, enchanted forests, castles in the sky, glowing artifacts",
    Scifi:
      "Futuristic cityscapes, advanced technology, alien worlds, space stations, holographic interfaces",
    Nature:
      "Lush forests, serene lakes, majestic mountains, vibrant wildlife, breathtaking landscapes",
    Urban:
      "Bustling city streets, skyscrapers, neon lights, diverse crowds, urban architecture",
    Historical:
      "Ancient civilizations, period-accurate costumes, historical landmarks, vintage aesthetics",
    Underwater:
      "Vibrant coral reefs, exotic sea creatures, sunken ships, bioluminescent organisms, deep ocean trenches",
    Steampunk:
      "Victorian-era technology, brass and copper machinery, airships, clockwork devices, steam-powered inventions",
    Cyberpunk:
      "Neon-lit streets, cybernetic implants, virtual reality, dystopian megacities, high-tech low-life",
    Fairytale:
      "Whimsical cottages, talking animals, enchanted objects, magical forests, storybook aesthetics",
    "Post apocalyptic":
      "Ruined cities, overgrown vegetation, survival gear, makeshift settlements, desolate landscapes",
    Space:
      "Distant galaxies, colorful nebulae, alien planets, futuristic spaceships, astronauts exploring new worlds",
  };

  return (
    <div className="container mx-auto">
      <div className="w-full max-w-3xl mx-auto space-y-8 relative z-10 py-32">
        <h1 className="text-center text-4xl sm:text-xl md:text-2xl lg:text-4xl mb-12 font-dancing">
          Enter Your Script
        </h1>

        <StepIndicator />

        <div className="rounded-xl border text-card-foreground w-full bg-white shadow-lg">
          <div className="flex flex-col space-y-1.5 p-6">
            <h3 className="tracking-tight text-2xl font-normal text-gray-800">
              Enter Your Script
            </h3>
          </div>
          <div className="p-6 pt-0">
            <form className="space-y-6">
              <InputField
                label="Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter your story title"
              />

              <div className="space-y-2">
                <label
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                  htmlFor="script"
                >
                  Script
                </label>
                <textarea
                  id="script"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="flex min-h-[60px] w-full rounded-md px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-64 bg-gray-50 border border-gray-300 text-gray-900"
                  placeholder="Write your script here..."
                />
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{script.length}/10000 characters</span>
                  <span>
                    Estimated video length:{" "}
                    {Math.max(1, Math.ceil(script.length / 10))} second
                    {script.length !== 10 ? "s" : ""}
                  </span>
                </div>
              </div>

              <CustomContextSection
                useCustomContext={useCustomContext}
                setUseCustomContext={setUseCustomContext}
                customContext={customContext}
                setCustomContext={setCustomContext}
                premadeContexts={premadeContexts}
              />

              <VideoFormatSelector
                videoFormat={videoFormat}
                setVideoFormat={setVideoFormat}
              />

              <CreditUsageEstimate script={script} />

              <SubmitButton script={script} />
            </form>
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
        <Step number={1} text="Select Mode" completed />
        <ChevronRight className="w-6 h-6 text-blue-500" />
        <Step number={2} text="Enter Script" active />
        <ChevronRight className="w-6 h-6 text-gray-600" />
        <Step number={3} text="Customize" />
      </div>
    </div>
  );
}

function Step({ number, text, active = false, completed = false }) {
  const bgColor = completed
    ? "bg-blue-500"
    : active
      ? "border border-blue-500"
      : "border border-gray-600";
  const textColor = active ? "border-blue-400 font-medium" : "text-gray-600";

  return (
    <div className="flex flex-col items-center">
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold ${bgColor} ${completed ? "text-white" : "text-gray-800"}`}
      >
        {number}
      </div>
      <span className={`mt-2 text-sm whitespace-nowrap ${textColor}`}>
        {text}
      </span>
    </div>
  );
}

function InputField({ label, value, onChange, placeholder }) {
  return (
    <div className="space-y-2">
      <label
        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
        htmlFor={label.toLowerCase()}
      >
        {label}
      </label>
      <input
        id={label.toLowerCase()}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="flex h-9 w-full rounded-md px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 bg-gray-50 border border-gray-300 text-gray-900"
      />
    </div>
  );
}

function CustomContextSection({
  useCustomContext,
  setUseCustomContext,
  customContext,
  setCustomContext,
  premadeContexts,
}) {
  return (
    <div className="rounded-xl bg-card text-card-foreground shadow border p-4">
      <div className="space-y-4">
        <div className="space-y-2 flex flex-row items-center justify-between">
          <div className="space-y-0.5">
            <label className="font-medium peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-base">
              Use Custom Image Context
            </label>
            <p className="text-[0.8rem] text-muted-foreground">
              Toggle to provide your own image prompt context
            </p>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={useCustomContext}
            onClick={() => setUseCustomContext(!useCustomContext)}
            className={`peer inline-flex h-5 w-9 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 ${
              useCustomContext ? "bg-gray-900" : "bg-gray-300"
            }`}
          >
            <span
              className={`pointer-events-none block h-4 w-4 rounded-full bg-white shadow-lg ring-0 transition-transform ${
                useCustomContext ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
        {useCustomContext && (
          <>
            <div className="space-y-2">
              <label
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700"
                htmlFor="customContext"
              >
                Custom Image Context
              </label>
              <textarea
                id="customContext"
                value={customContext}
                onChange={(e) => setCustomContext(e.target.value)}
                className="flex min-h-[60px] w-full rounded-md px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 h-32 bg-gray-50 border border-gray-300 text-gray-900"
                placeholder="Enter your custom image prompt context..."
              />
              <p className="text-[0.8rem] text-muted-foreground">
                If you leave this blank, we will use our auto AI-generated
                context.
              </p>
            </div>
            <div>
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700 mb-2 block">
                Premade Contexts
              </label>
              <div className="flex flex-wrap gap-2">
                {Object.entries(premadeContexts).map(([key, value]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setCustomContext(value)}
                    className="inline-flex items-center justify-center whitespace-nowrap font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground h-8 rounded-md px-3 text-xs"
                  >
                    {key}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function VideoFormatSelector({ videoFormat, setVideoFormat }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-gray-700">
        Video Format
      </label>
      <div className="flex space-x-4">
        <button
          type="button"
          onClick={() => setVideoFormat("vertical")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 flex-1 ${videoFormat === "vertical" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
        >
          <Smartphone className="w-4 h-4 mr-2" />
          Vertical
        </button>
        <button
          type="button"
          onClick={() => setVideoFormat("horizontal")}
          className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 px-4 py-2 flex-1 ${videoFormat === "horizontal" ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-gray-100 hover:bg-gray-200 text-gray-800"}`}
        >
          <Monitor className="w-4 h-4 mr-2" />
          Horizontal
        </button>
      </div>
    </div>
  );
}

function CreditUsageEstimate({ script }) {
  const imageCredits = 10;
  const textCredits = Math.ceil(script.length / 100);
  const totalCredits = imageCredits + textCredits;

  return (
    <div className="text-sm text-gray-700">
      <h4 className="font-semibold mb-2">Estimated Credit Usage:</h4>
      <div className="relative w-full overflow-auto">
        <table className="w-full caption-bottom text-sm">
          <thead className="[&_tr]:border-b">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <th className="h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                Item
              </th>
              <th className="h-10 px-2 align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-right">
                Credits
              </th>
            </tr>
          </thead>
          <tbody className="[&_tr:last-child]:border-0">
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                Image Generation
              </td>
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-right">
                {imageCredits}
              </td>
            </tr>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]">
                Text Tokens
              </td>
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-right">
                {textCredits}
              </td>
            </tr>
            <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] font-semibold">
                Total
              </td>
              <td className="p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px] text-right font-semibold">
                {totalCredits}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SubmitButton({ script }) {
  const totalCredits = 10 + Math.ceil(script.length / 100);

  return (
    <button
      type="submit"
      className="items-center whitespace-nowrap rounded-md text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow h-9 py-2 flex gap-2 justify-center px-3 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors duration-300"
    >
      <svg
        width="15"
        height="15"
        viewBox="0 0 15 15"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-4 h-4 mr-2"
      >
        <path
          d="M13.9 0.499976C13.9 0.279062 13.7209 0.0999756 13.5 0.0999756C13.2791 0.0999756 13.1 0.279062 13.1 0.499976V1.09998H12.5C12.2791 1.09998 12.1 1.27906 12.1 1.49998C12.1 1.72089 12.2791 1.89998 12.5 1.89998H13.1V2.49998C13.1 2.72089 13.2791 2.89998 13.5 2.89998C13.7209 2.89998 13.9 2.72089 13.9 2.49998V1.89998H14.5C14.7209 1.89998 14.9 1.72089 14.9 1.49998C14.9 1.27906 14.7209 1.09998 14.5 1.09998H13.9V0.499976ZM11.8536 3.14642C12.0488 3.34168 12.0488 3.65826 11.8536 3.85353L10.8536 4.85353C10.6583 5.04879 10.3417 5.04879 10.1465 4.85353C9.9512 4.65827 9.9512 4.34169 10.1465 4.14642L11.1464 3.14643C11.3417 2.95116 11.6583 2.95116 11.8536 3.14642ZM9.85357 5.14642C10.0488 5.34168 10.0488 5.65827 9.85357 5.85353L2.85355 12.8535C2.65829 13.0488 2.34171 13.0488 2.14645 12.8535C1.95118 12.6583 1.95118 12.3417 2.14645 12.1464L9.14646 5.14642C9.34172 4.95116 9.65831 4.95116 9.85357 5.14642ZM13.5 5.09998C13.7209 5.09998 13.9 5.27906 13.9 5.49998V6.09998H14.5C14.7209 6.09998 14.9 6.27906 14.9 6.49998C14.9 6.72089 14.7209 6.89998 14.5 6.89998H13.9V7.49998C13.9 7.72089 13.7209 7.89998 13.5 7.89998C13.2791 7.89998 13.1 7.72089 13.1 7.49998V6.89998H12.5C12.2791 6.89998 12.1 6.72089 12.1 6.49998C12.1 6.27906 12.2791 6.09998 12.5 6.09998H13.1V5.49998C13.1 5.27906 13.2791 5.09998 13.5 5.09998ZM8.90002 0.499976C8.90002 0.279062 8.72093 0.0999756 8.50002 0.0999756C8.2791 0.0999756 8.10002 0.279062 8.10002 0.499976V1.09998H7.50002C7.2791 1.09998 7.10002 1.27906 7.10002 1.49998C7.10002 1.72089 7.2791 1.89998 7.50002 1.89998H8.10002V2.49998C8.10002 2.72089 8.2791 2.89998 8.50002 2.89998C8.72093 2.89998 8.90002 2.72089 8.90002 2.49998V1.89998H9.50002C9.72093 1.89998 9.90002 1.72089 9.90002 1.49998C9.90002 1.27906 9.72093 1.09998 9.50002 1.09998H8.90002V0.499976Z"
          fill="currentColor"
          fillRule="evenodd"
          clipRule="evenodd"
        />
      </svg>
      Generate Images & Review ({totalCredits} credits)
    </button>
  );
}
