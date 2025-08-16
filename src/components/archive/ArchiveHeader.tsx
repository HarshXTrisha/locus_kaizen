import React from 'react';
import { Search, Plus } from 'lucide-react';

export function ArchiveHeader() {
  return (
    <header className="bg-white px-6 py-4 flex items-center justify-between">
      <h1 className="text-2xl font-bold text-gray-800">Test Archive</h1>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input 
            className="pl-10 pr-4 py-2 border-b-2 border-gray-200 focus:border-green-500 focus:outline-none transition-colors w-64" 
            placeholder="Search tests..." 
            type="text"
          />
        </div>
        <button className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-lg flex items-center gap-2 transition-colors">
          <Plus size={20} />
          New Test
        </button>
      </div>
    </header>
  );
}
