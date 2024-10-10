import { GuidedGenerationForm } from "./guided-generation-form";

export default function GuidedGeneration() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-500 to-purple-600">
      <div className="w-full max-w-3xl space-y-8 relative z-10 py-32">
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white text-center leading-tight font-dancing">
          Guided Story Creation
        </h1>
        <p className="text-xl sm:text-2xl md:text-3xl text-white text-center mb-12 max-w-3xl leading-relaxed">
          Use AI to generate your script for you.
        </p>
        <div className="rounded-xl border text-card-foreground w-full bg-white shadow-lg">
          <GuidedGenerationForm />
        </div>
      </div>
    </div>
  );
}
