"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';

export default function Videos() {
  return (
    <div className="py-24 text-white min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-white font-dancing">Your Videos</h1>
        </div>
        <div className="w-full flex justify-center items-center">
          <div className="w-[400px] h-[400px]">
            <Link href="/generate" className="contents h-full">
              <div className="flex flex-col items-center justify-center p-6 rounded-lg cursor-pointer h-full bg-white border-2 border-gray-200 text-gray-600 transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-md">
                <Plus className="w-12 h-12 mb-4 text-blue-500" />
                <p className="text-lg font-semibold text-center">Create New Video</p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}