import { GuidedGenerationForm } from "./guided-generation-form";

export default function GuidedGeneration() {
  return (
    <div className="container mx-auto">
      <div className="w-full max-w-3xl mx-auto space-y-8 relative z-10 py-32">
        <h1 className="text-center text-4xl sm:text-xl md:text-2xl lg:text-4xl mb-12 font-dancing">
          Guided Story Creation
        </h1>
        <StepIndicator />
        <div className="rounded-xl border text-card-foreground w-full bg-white shadow-lg">
          <GuidedGenerationForm />
        </div>
      </div>
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="mb-8 hidden md:block max-w-xl mx-auto">
      <div className="flex justify-center items-center gap-12 mb-8">
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold bg-blue-500 text-white">
            1
          </div>
          <span className="mt-2 text-sm whitespace-nowrap text-gray-600">
            Select Mode
          </span>
        </div>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right w-6 h-6 text-blue-500"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border border-blue-500 text-gray-800">
            2
          </div>
          <span className="mt-2 text-sm whitespace-nowrap border-blue-400 font-medium">
            Prompt
          </span>
        </div>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right w-6 h-6 text-gray-600"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border border-gray-600 text-gray-800">
            3
          </div>
          <span className="mt-2 text-sm whitespace-nowrap text-gray-600">
            Refine
          </span>
        </div>
        <div className="flex items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-chevron-right w-6 h-6 text-gray-600"
          >
            <path d="m9 18 6-6-6-6"></path>
          </svg>
        </div>
        <div className="flex flex-col items-center">
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border border-gray-600 text-gray-800">
            4
          </div>
          <span className="mt-2 text-sm whitespace-nowrap text-gray-600">
            Customize
          </span>
        </div>
      </div>
    </div>
  );
}
