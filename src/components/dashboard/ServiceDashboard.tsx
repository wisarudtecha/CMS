// src/components/ServiceDashboard.tsx
import React, { useState } from 'react';
import { Settings, RotateCcw, Phone, Info, Ticket } from 'lucide-react';

interface ServiceData {
  month: string;
  informationService: number;
  ticketingService: number;
  onProcess: number;
}

const ServiceDashboard: React.FC = () => {
  const [serviceData] = useState<ServiceData[]>([
    { month: 'Jul', informationService: 1200, ticketingService: 500, onProcess: 50 },
    { month: 'Aug', informationService: 900, ticketingService: 600, onProcess: 25 },
    { month: 'Sep', informationService: 350, ticketingService: 250, onProcess: 75 },
    { month: 'Oct', informationService: 0, ticketingService: 0, onProcess: 0 },
    { month: 'Nov', informationService: 0, ticketingService: 0, onProcess: 0 },
    { month: 'Dec', informationService: 0, ticketingService: 0, onProcess: 0 }
  ]);

  const statusCounts = {
    informationService: 6,
    ticketClosed: 3,
    onProcess: 1
  };

  const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  const PieChart = () => {
    const informationPercentage = (statusCounts.informationService / total) * 100;
    const ticketClosedPercentage = (statusCounts.ticketClosed / total) * 100;
    
    return (
      <div className="relative w-32 h-32">
        <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="#3b82f6"
            strokeWidth="3"
            strokeDasharray={`${informationPercentage} ${100 - informationPercentage}`}
            strokeDashoffset="0"
          />
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="#10b981"
            strokeWidth="3"
            strokeDasharray={`${ticketClosedPercentage} ${100 - ticketClosedPercentage}`}
            strokeDashoffset={`-${informationPercentage}`}
          />
          <circle
            cx="21"
            cy="21"
            r="15.915"
            fill="transparent"
            stroke="#eab308"
            strokeWidth="3"
            strokeDasharray={`${(statusCounts.onProcess / total) * 100} ${100 - (statusCounts.onProcess / total) * 100}`}
            strokeDashoffset={`-${informationPercentage + ticketClosedPercentage}`}
          />
        </svg>
      </div>
    );
  };

  const BarChart = () => {
    const maxValue = Math.max(
      ...serviceData.map(d => Math.max(d.informationService, d.ticketingService, d.onProcess))
    );
    
    return (
      <div className="dark:bg-gray-700 rounded-lg p-6">
        <div className="flex items-end justify-between gap-4">
          {serviceData.map((item, index) => (
            <div key={index} className="flex flex-col items-center gap-2">
              <div className="flex flex-col items-center gap-1">
                {/* Information Service Bar */}
                <div 
                  className="bg-blue-400 dark:bg-blue-500 rounded-t w-16 transition-all duration-300 hover:bg-blue-500 dark:hover:bg-blue-400"
                  style={{ 
                    height: `${(item.informationService / maxValue) * 250}px`,
                    minHeight: item.informationService > 0 ? '8px' : '0px'
                  }}
                ></div>
                {/* Ticketing Service Bar */}
                <div 
                  className="bg-green-400 dark:bg-green-500 w-16 transition-all duration-300 hover:bg-green-500 dark:hover:bg-green-400"
                  style={{ 
                    height: `${(item.ticketingService / maxValue) * 250}px`,
                    minHeight: item.ticketingService > 0 ? '8px' : '0px'
                  }}
                ></div>
                {/* On Process Bar */}
                <div 
                  className="bg-yellow-400 dark:bg-yellow-500 rounded-b w-16 transition-all duration-300 hover:bg-yellow-500 dark:hover:bg-yellow-400"
                  style={{ 
                    height: `${(item.onProcess / maxValue) * 250}px`,
                    minHeight: item.onProcess > 0 ? '8px' : '0px'
                  }}
                ></div>
              </div>
              <span className="text-sm dark:text-gray-400 mt-2">{item.month}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-700 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold dark:text-white">Service Dashboard</h1>
        <div className="flex gap-2">
          <button className="p-2 dark:text-gray-300 dark:hover:bg-gray-700 rounded border dark:border-gray-600">
            <Settings size={20} />
          </button>
          <button className="p-2 dark:text-gray-300 dark:hover:bg-gray-700 rounded border dark:border-gray-600">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Top Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-300 dark:bg-gray-600 rounded-lg p-6 flex items-center gap-4">
              <Phone className="dark:text-blue-400" size={24} />
              <div>
                <div className="text-sm dark:text-gray-400">Incoming Call</div>
                <div className="text-3xl font-bold dark:text-gray-300">750</div>
                <div className="text-sm dark:text-gray-400 mt-1">All Ticket</div>
              </div>
            </div>

            <div className="bg-blue-400 dark:bg-blue-500 rounded-lg p-6 flex items-center gap-4">
              <Info className="dark:text-white" size={24} />
              <div>
                <div className="text-sm dark:text-blue-100">Information Service</div>
                <div className="text-3xl font-bold dark:text-white">500</div>
                <div className="text-sm dark:text-blue-100 mt-1">Ask for Information / Other</div>
              </div>
            </div>

            <div className="bg-green-400 dark:bg-green-500 rounded-lg p-6 flex items-center gap-4">
              <Ticket className="dark:text-white" size={24} />
              <div>
                <div className="text-sm dark:text-green-100">Ticketing Service</div>
                <div className="text-3xl font-bold dark:text-white">250</div>
                <div className="text-sm dark:text-green-100 mt-1">Ticket</div>
              </div>
            </div>
          </div>

          {/* Bar Chart */}
          <BarChart />
        </div>

        {/* Right Sidebar */}
        <div className="space-y-6">
          {/* Pie Chart */}
          <div className="dark:bg-gray-700 rounded-lg p-6">
            <div className="flex justify-center mb-6">
              <PieChart />
            </div>
          </div>

          {/* Status Cards */}
          <div className="space-y-4">
            <div className="bg-green-400 dark:bg-green-500 rounded-lg p-4">
              <div className="text-sm dark:text-green-100">Closed</div>
              <div className="text-2xl font-bold dark:text-white">200</div>
            </div>

            <div className="bg-yellow-400 dark:bg-yellow-500 rounded-lg p-4">
              <div className="text-sm dark:text-yellow-100">On Process</div>
              <div className="text-2xl font-bold dark:text-white">50</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="dark:bg-gray-700 rounded-lg p-6 space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Information Service</span>
                <span className="text-sm font-semibold">50 %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-blue-400 dark:bg-blue-500 h-2 rounded-full" style={{ width: '50%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Ticket Closed</span>
                <span className="text-sm font-semibold">30 %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-green-400 dark:bg-green-500 h-2 rounded-full" style={{ width: '30%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">On Process</span>
                <span className="text-sm font-semibold">10 %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-yellow-400 dark:bg-yellow-500 h-2 rounded-full" style={{ width: '10%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
