import React from 'react';

const Sidebar = () => {
  return (
    <div className="w-64 h-screen bg-gray-800 text-white flex flex-col">
      <div className="p-4 text-xl font-bold">Admin Dashboard</div>
      <nav className="flex-grow">
        <ul>
          <li className="p-4 hover:bg-gray-700"><a href="#">Home</a></li>
          <li className="p-4 hover:bg-gray-700"><a href="#">Users</a></li>
          <li className="p-4 hover:bg-gray-700"><a href="#">Settings</a></li>
        </ul>
      </nav>
    </div>
  );
};

export default Sidebar;
