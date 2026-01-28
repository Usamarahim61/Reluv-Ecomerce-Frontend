// components/Navbar.tsx
import { Search, Camera } from 'lucide-react';

export default function Navbar() {
  return (
    <nav className="w-full  bg-white">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto flex items-center justify-between p-4 gap-4">
        <h1 className="text-2xl font-bold text-[#007782]">Reluv</h1>
        
        {/* Search Bar */}
        <div className="flex-1 flex items-center bg-gray-100 rounded-md px-3 py-2 border focus-within:border-gray-400">
          <Search className="text-gray-400 w-5 h-5" />
          <input 
            type="text" 
            placeholder="Search for items" 
            className="bg-transparent outline-none flex-1 px-2" 
          />
          <Camera className="text-gray-400 w-5 h-5 cursor-pointer" />
        </div>

        <div className="flex gap-4 items-center">
          <button className="text-[#007782] border border-[#007782] px-4 py-1.5 rounded text-sm">Sign up | Log in</button>
          <button className="bg-[#007782] text-white px-4 py-1.5 rounded text-sm">Sell now</button>
        </div>
      </div>

      {/* Sub Navigation */}
      <div className="max-w-7xl mx-auto flex gap-6 px-4 py-2 text-sm text-gray-600 overflow-x-auto whitespace-nowrap">
        {['Women', 'Men', 'Designer', 'Kids', 'Home', 'Electronics'].map(cat => (
          <span key={cat} className="cursor-pointer hover:underline">{cat}</span>
        ))}
      </div>
    </nav>
  );
}