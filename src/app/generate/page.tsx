import { Pencil, Wand2, List, Video, LucideIcon, ChevronRight } from "lucide-react";
import Link from "next/link";

export default function Generation() {
  return (
    <div className="min-h-screen flex items-center">
      <div className="container mx-auto flex flex-col items-center justify-center px-4 text-center py-32">
        <h1 className="text-4xl sm:text-xl md:text-2xl lg:text-4xl mb-12 font-dancing">
          Craft Your Video
        </h1>
        <StepIndicator />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 w-full max-w-6xl">
          <Button
            Icon={Pencil}
            text="I have a script ready"
            href="/generate/script"
          />
          <Button
            Icon={Wand2}
            text="Let AI write your story"
            href="/generate/guided"
            popular={true}
          />
          <Button
            Icon={List}
            text="Create story segment by segment"
            href="/generate/segment"
          />
          <Button
            Icon={Video}
            text="Bulk Generate YT Shorts"
            href="/bulk-generate"
            disabled={true}
            comingSoon={true}
          />
        </div>
      </div>
    </div>
  );
}

function StepIndicator() {
  return (
    <div className="mb-8 hidden md:block">
      <div className="flex justify-center items-center gap-12 mb-8">
        <Step number={1} text="Select Mode" active={true} />
        <ChevronRight className="w-6 h-6 text-gray-600" />
        <Step number={2} text="Prompt" />
        <ChevronRight className="w-6 h-6 text-gray-600" />
        <Step number={3} text="Customize" />
      </div>
    </div>
  );
}

interface StepProps {
  number: number;
  text: string;
  active?: boolean;
}

function Step({ number, text, active = false }: StepProps) {
  return (
    <div className="flex flex-col items-center">
      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-base font-semibold border ${active ? 'border-blue-500' : 'border-gray-600'} text-gray-800`}>
        {number}
      </div>
      <span className={`mt-2 text-sm whitespace-nowrap ${active ? 'border-blue-400 font-medium' : 'text-gray-600'}`}>
        {text}
      </span>
    </div>
  );
}

interface ButtonProps {
  Icon: LucideIcon;
  text: string;
  href: string;
  popular?: boolean;
  disabled?: boolean;
  comingSoon?: boolean;
}

function Button({
  Icon,
  text,
  href,
  popular = false,
  disabled = false,
  comingSoon = false,
}: ButtonProps) {
  const buttonContent = (
    <>
      {popular && (
        <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 border border-blue-500 bg-white text-black px-3 py-1 z-10 rounded-full text-sm font-bold">
          Most Popular
        </div>
      )}
      <Icon className="mb-4 size-8" />
      <span className="text-center leading-tight text-wrap">{text}</span>
      {comingSoon && (
        <span className="absolute top-2 right-2 bg-yellow-400 text-black text-xs font-bold px-2 py-1 rounded-full z-10">
          Coming Soon
        </span>
      )}
    </>
  );

  const buttonClasses = `whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 shadow relative bg-white hover:bg-blue-50 transition duration-300 text-lg px-8 py-12 rounded-xl flex flex-col items-center justify-center h-full border border-blue-300 text-gray-600 hover:border-blue-500 ${
    disabled ? "opacity-50 cursor-not-allowed" : ""
  }`;

  if (disabled) {
    return <button className={buttonClasses} disabled>{buttonContent}</button>;
  }

  return (
    <Link href={href} className={buttonClasses}>
      {buttonContent}
    </Link>
  );
}