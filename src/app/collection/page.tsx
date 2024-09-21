"use client";
import { api } from "../../../convex/_generated/api";
import { useQuery } from "convex/react";
import Image from 'next/image';

export default function Home() {
  const sketches = useQuery(api.sketches.getSketches);

  const sortedSketches = (sketches ?? []).sort((a, b) => {
    return b._creationTime - a._creationTime;
  });

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h2>Recent Sketches</h2>
      <div className="grid grid-cols-4 gap-4">
        {sortedSketches.map((sketch) => (
          <Image
            key={sketch._id}
            width={256}
            height={256}
            src={sketch.result || ''}
            alt={`Sketch: ${sketch.prompt || 'No description'}`}
          />
        ))}
      </div>
    </main>
  );
}