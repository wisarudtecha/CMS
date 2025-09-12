// src/components/ServiceDashboard.tsx
import React
  // , { useState}
from "react";
import { ApexOptions } from "apexcharts";
import { Cctv, Info, LayoutGrid, OctagonMinus, RotateCcw, Settings } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";
import Chart from "react-apexcharts";

// interface ServiceData {
//   month: string;
//   informationService: number;
//   ticketingService: number;
//   onProcess: number;
// }

const ServiceDashboard: React.FC = () => {
  const { t, language } = useTranslation();

  const categoriesEn = [
    "Apr 2025",
    "May 2025",
    "Jun 2025",
    "Jul 2025",
    "Aug 2025",
    "Sep 2025"
  ];

  const categoriesTh = [
    "เม.ย. 2568",
    "พ.ค. 2568",
    "มิ.ย. 2568",
    "ก.ค. 2568",
    "ส.ค. 2568",
    "ก.ย. 2568"
  ];

  const colors = ["#05df72", "#51a2ff", "#fdc700"];
  const colorsReverse = ["#fdc700", "#51a2ff", "#05df72"];
  
  const labels = {
    new: language === "th" ? "งานใหม่" : "New",
    inProgress: language === "th" ? "กำลังดำเนินการ" : "In Progress",
    complete: language === "th" ? "เสร็จสิ้น" : "Complete"
  }

  const seriesBarChart = [
    {
      name: labels.complete,
      data: [35, 29, 306, 164, 57, 85],
    },
    {
      name: labels.inProgress,
      data: [86, 201, 10, 21, 133, 212],
    },
    {
      name: labels.new,
      data: [267, 129, 132, 77, 58, 79],
    }
  ];
  const seriesPieChart = [86, 112, 48];
  const seriesCustom = [48, 112];
  
  const optionsBarChart: ApexOptions = {
    colors: colors,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "bar",
      height: 500,
      toolbar: {
        show: false,
      },
      stacked: true,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "39%",
        borderRadius: 0,
        borderRadiusApplication: "end",
      },
    },
    dataLabels: {
      enabled: true,
    },
    stroke: {
      show: true,
      width: 0,
      colors: ["transparent"],
    },
    xaxis: {
      categories: language === "th" ? categoriesTh : categoriesEn,
      axisBorder: {
        show: false,
      },
      axisTicks: {
        show: false,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "left",
      fontFamily: "Outfit",
    },
    yaxis: {
      title: {
        text: undefined,
      },
    },
    grid: {
      yaxis: {
        lines: {
          show: false,
        },
      },
    },
    fill: {
      opacity: 1,
    },
    tooltip: {
      x: {
        show: false,
      },
      y: {
        formatter: (val: number) => `${val}`,
      },
    },
  };

  const optionsPieChart: ApexOptions = {
    colors: colorsReverse,
    chart: {
      fontFamily: "Outfit, sans-serif",
      type: "donut",
      sparkline: {
        enabled: true,
      },
    },
    plotOptions: {
      pie: {
        donut: {
          labels: {
            show: true,
            total: {
              show: true,
              label: language === "th" ? "รวม" : "Total"
            }
          }
        }
      }
    },
    fill: {
      type: "solid",
      colors: colorsReverse,
    },
    stroke: {
      show: false,
      lineCap: "round",
    },
    labels: [
      labels.new,
      labels.inProgress,
      labels.complete
    ],
    legend: {
      show: true
    },
  };

  // const [serviceData] = useState<ServiceData[]>([
  //   { month: "Jul", informationService: 1200, ticketingService: 500, onProcess: 50 },
  //   { month: "Aug", informationService: 900, ticketingService: 600, onProcess: 25 },
  //   { month: "Sep", informationService: 350, ticketingService: 250, onProcess: 75 },
  //   { month: "Oct", informationService: 0, ticketingService: 0, onProcess: 0 },
  //   { month: "Nov", informationService: 0, ticketingService: 0, onProcess: 0 },
  //   { month: "Dec", informationService: 0, ticketingService: 0, onProcess: 0 }
  // ]);

  // const statusCounts = {
  //   informationService: 6,
  //   ticketClosed: 3,
  //   onProcess: 1
  // };

  // const total = Object.values(statusCounts).reduce((sum, count) => sum + count, 0);

  // const PieChart = () => {
  //   const informationPercentage = (statusCounts.informationService / total) * 100;
  //   const ticketClosedPercentage = (statusCounts.ticketClosed / total) * 100;
  //   return (
  //     <div className="relative w-32 h-32">
  //       <svg viewBox="0 0 42 42" className="w-full h-full transform -rotate-90">
  //         <circle
  //           cx="21"
  //           cy="21"
  //           r="15.915"
  //           fill="transparent"
  //           stroke="#3b82f6"
  //           strokeWidth="6"
  //           strokeDasharray={`${informationPercentage} ${100 - informationPercentage}`}
  //           strokeDashoffset="0"
  //         />
  //         <circle
  //           cx="21"
  //           cy="21"
  //           r="15.915"
  //           fill="transparent"
  //           stroke="#10b981"
  //           strokeWidth="6"
  //           strokeDasharray={`${ticketClosedPercentage} ${100 - ticketClosedPercentage}`}
  //           strokeDashoffset={`-${informationPercentage}`}
  //         />
  //         <circle
  //           cx="21"
  //           cy="21"
  //           r="15.915"
  //           fill="transparent"
  //           stroke="#eab308"
  //           strokeWidth="6"
  //           strokeDasharray={`${(statusCounts.onProcess / total) * 100} ${100 - (statusCounts.onProcess / total) * 100}`}
  //           strokeDashoffset={`-${informationPercentage + ticketClosedPercentage}`}
  //         />
  //       </svg>
  //     </div>
  //   );
  // };

  // const BarChart = () => {
  //   const maxValue = Math.max(
  //     ...serviceData.map(d => Math.max(d.informationService, d.ticketingService, d.onProcess))
  //   );
  //   return (
  //     <div className="dark:bg-gray-700 rounded-lg h-full flex flex-col">
  //       <div className="flex items-end justify-between gap-4 flex-1">
  //         {serviceData.map((item, index) => (
  //           <div key={index} className="flex flex-col items-center gap-2 h-full">
  //             <div className="flex flex-col items-center gap-1 flex-1 justify-end">
  //               {/* Information Service Bar */}
  //               <div 
  //                 className="bg-blue-400 dark:bg-blue-500 rounded-t w-16 transition-all duration-300 hover:bg-blue-500 dark:hover:bg-blue-400"
  //                 style={{ 
  //                   height: `${(item.informationService / maxValue) * 100}%`,
  //                   minHeight: item.informationService > 0 ? "8px" : "0px",
  //                   maxHeight: "30%" // Adjust this percentage as needed
  //                 }}
  //               ></div>
  //               {/* Ticketing Service Bar */}
  //               <div 
  //                 className="bg-green-400 dark:bg-green-500 w-16 transition-all duration-300 hover:bg-green-500 dark:hover:bg-green-400"
  //                 style={{ 
  //                   height: `${(item.ticketingService / maxValue) * 100}%`,
  //                   minHeight: item.ticketingService > 0 ? "8px" : "0px",
  //                   maxHeight: "30%" // Adjust this percentage as needed
  //                 }}
  //               ></div>
  //               {/* On Process Bar */}
  //               <div 
  //                 className="bg-yellow-400 dark:bg-yellow-500 rounded-b w-16 transition-all duration-300 hover:bg-yellow-500 dark:hover:bg-yellow-400"
  //                 style={{ 
  //                   height: `${(item.onProcess / maxValue) * 100}%`,
  //                   minHeight: item.onProcess > 0 ? "8px" : "0px",
  //                   maxHeight: "30%" // Adjust this percentage as needed
  //                 }}
  //               ></div>
  //             </div>
  //             <span className="text-sm text-gray-900 dark:text-white mt-2">{item.month}</span>
  //           </div>
  //         ))}
  //       </div>
  //     </div>
  //   );
  // };

  return (
    <div className="bg-gray-50 dark:bg-gray-900 cursor-default">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">{t("navigation.sidebar.main.dashboard.nested.service.header")}</h1>
        <div className="flex gap-2">
          <button className="p-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600">
            <Settings size={20} />
          </button>
          <button className="p-2 text-gray-600 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded border border-gray-300 dark:border-gray-600">
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {/* Top Stats Cards */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-500 rounded-lg p-6 flex items-center justify-center gap-4">
            <LayoutGrid className="text-white" size={24} />
            <div>
              <div className="text-sm text-white">{language === "th" ? "ทั้งหมด" : "Total"}</div>
              <div className="text-3xl font-bold text-white">1,000</div>
              {/* <div className="text-sm text-gray-100 mt-1">All Work Orders</div> */}
              <div className="text-sm text-gray-100 mt-1"></div>
            </div>
          </div>

          <div className="bg-blue-400 rounded-lg p-6 flex items-center justify-center gap-4">
            <Info className="text-white" size={24} />
            <div>
              <div className="text-sm text-white">{language === "th" ? "เซ็นเซอร์" : "Sensor"}</div>
              <div className="text-3xl font-bold text-white">500</div>
              <div className="text-sm text-gray-100 mt-1"></div>
            </div>
          </div>

          <div className="bg-green-400 rounded-lg p-6 flex items-center justify-center gap-4">
            <Cctv className="text-white" size={24} />
            <div>
              <div className="text-sm text-white">{language === "th" ? "กล้อง" : "Camera"}</div>
              <div className="text-3xl font-bold text-white">250</div>
              <div className="text-sm text-gray-100 mt-1"></div>
            </div>
          </div>

          <div className="bg-red-400 rounded-lg p-6 flex items-center justify-center gap-4">
            <OctagonMinus className="text-white" size={24} />
            <div>
              <div className="text-sm text-white">{language === "th" ? "การจราจร" : "Traffic"}</div>
              <div className="text-3xl font-bold text-white">250</div>
              <div className="text-sm text-gray-100 mt-1"></div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="col-span-3 h-full">
          <Chart options={optionsBarChart} series={seriesBarChart} type="bar" height={500} />
          {/* <BarChart /> */}
        </div>

        <div className="col-span-1 h-full flex flex-col gap-6">
          {/* Pie Chart */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg">
            <div className="flex justify-center">
              <Chart options={optionsPieChart} series={seriesPieChart} type="donut" />
              {/* <PieChart /> */}
            </div>
          </div>

          {/* Status Cards */}
          <div className="flex flex-col gap-6">
            <div className="bg-green-400 rounded-lg p-4">
              <div className="text-sm text-white">{labels.complete}</div>
              <div className="text-2xl font-bold text-white">{seriesCustom[0]}</div>
            </div>

            <div className="bg-blue-400 rounded-lg p-4">
              <div className="text-sm text-white">{labels.inProgress}</div>
              <div className="text-2xl font-bold text-white">{seriesCustom[1]}</div>
            </div>
          </div>

          {/* Progress Bars */}
          <div className="bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4 flex-1">
            {/*
            <div>
              <div className="flex justify-between items-center mb-2 text-gray-900 dark:text-white">
                <span className="text-sm">Information Service</span>
                <span className="text-sm font-semibold">50 %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: "50%" }}></div>
              </div>
            </div>
            */}

            <div>
              <div className="flex justify-between items-center mb-2 text-gray-900 dark:text-white">
                <span className="text-sm">{labels.complete}</span>
                <span className="text-sm font-semibold">{parseInt(((seriesCustom[0] / seriesPieChart.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) * 100).toString())} %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-green-400 h-2 rounded-full" style={{ width: `${(seriesCustom[0] / seriesPieChart.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) * 100}%` }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2 text-gray-900 dark:text-white">
                <span className="text-sm">{labels.inProgress}</span>
                <span className="text-sm font-semibold">{parseInt(((seriesCustom[1] / seriesPieChart.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) * 100).toString())} %</span>
              </div>
              <div className="w-full bg-gray-300 dark:bg-gray-600 rounded-full h-2">
                <div className="bg-blue-400 h-2 rounded-full" style={{ width: `${(seriesCustom[1] / seriesPieChart.reduce((accumulator, currentValue) => accumulator + currentValue, 0)) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
