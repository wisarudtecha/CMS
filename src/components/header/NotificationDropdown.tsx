import { useEffect, useState, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
// import { Trans } from "@lingui/react/macro";
import { useTranslation } from "../../hooks/useTranslation";
import axios from "axios";
import { Menu } from "@headlessui/react";

interface Notification {
  id: string;
  caseId: string;
  caseType: string;
  caseDetail: string;
  recipient: string;
  sender: string;
  message: string;
  eventType: string;
  createdAt: string;
  read: boolean;
  senderImg: string;
  notificationType: string;
  redirectURL: string;
}

function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function NotificationDropdown() {
  const { t } = useTranslation();

  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [searchMode, setSearchMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const socketRef = useRef<WebSocket | null>(null);
  const [unread, setUnread] = useState(0);
  const hasInitialized = useRef(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isOverflow, setIsOverflow] = useState<{ [key: string]: boolean }>({});
  const textRefs = useRef<{ [key: string]: HTMLParagraphElement | null }>({});
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const API_BASE_URL = "https://cmsapi-production-7239.up.railway.app";
   const WEBSOCKET_BASE_URL = "ws://cmsapi-production-7239.up.railway.app";
  // const API_BASE_URL = "http://localhost:8080"; 
  // const WEBSOCKET_BASE_URL = "ws://localhost:8080"; 

  useEffect(() => {
    const loadNotifications = async () => {
      const key = "notifications";
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            setNotifications(parsed);
            console.log("✅ Loaded from localStorage");
          } else {
            console.warn("⚠️ Invalid format in localStorage.notifications");
          }
        } catch (err) {
          console.error("❌ Failed to parse localStorage.notifications", err);
        }
        return;
      }

      try {
        const username = localStorage.getItem("username");
        if (!username) return;

        const res = await axios.get(
          `${API_BASE_URL}/api/v1/notifications/recipient/${username}`
        );
        if (Array.isArray(res.data)) {
          setNotifications(res.data);
          localStorage.setItem(key, JSON.stringify(res.data));
          setUnread(res.data.filter((n) => !n.read).length);
          console.log("🌐 Fetched and saved to localStorage");
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
      }
    };

    loadNotifications();
  }, []);

  const toggleDropdown = () => {
    setIsOpen((prev) => {
      setNotifying(false);
      return !prev;
    });
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null); // ปิด ถ้าเปิดอยู่แล้ว
    } else {
      setExpandedId(id); // เปิดรายการใหม่
    }
  };

  function getNotiTypeIcon(type: string) {
    switch (type.toLowerCase()) {
      case "broadcast":
        return "🔊";
      case "cancel dispatch":
        return "❌";
      case "canceled":
        return "🚫";
      case "assigned":
        return "📌";
      case "pending":
        return "⏳";
      case "dispatched":
        return "🚓";
      case "accepted":
        return "✅";
      case "en route":
        return "🚗";
      case "arrived":
        return "📍";
      case "closed":
        return "🔒";
      case "delayed":
        return "⏰";
      case "delay dispatch":
        return "🐢";
      case "delay arrival":
        return "🐌";
      case "delay ack":
        return "🕒";
      case "delay close":
        return "⌛";
      default:
        return "🔔";
    }
  }
  
  const handleMarkAllRead = async () => {
    const updated = notifications.map((n) => ({ ...n, read: true }));
    setNotifications(updated);

    for (const noti of updated) {
      await updateNotification(noti);
    }
  };

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => {
        if (n.id === id) {
          const updated = { ...n, read: true };
          updateNotification(updated);
          return updated;
        }
        return n;
      })
    );
  };

  // const handleDeleteNotification = async (id: string) => {
  //   try {
  //     await axios.delete(`${API_BASE_URL}/api/v1/notifications/delete/${id}`);

  //     setNotifications((prev) => {
  //       const newList = prev.filter((n) => n.id !== id);
  //       localStorage.setItem("notifications", JSON.stringify(newList));
  //       return newList;
  //     });
  //   } catch (err) {
  //     console.error("❌ Failed to delete notification:", err);
  //   }
  // };

  const username = localStorage.getItem("username") || "";

  useEffect(() => {
    const filteredUnread = notifications.filter(
      (noti) => noti.recipient.toLowerCase() === username.toLowerCase() && !noti.read
    );
    setUnread(filteredUnread.length);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notifications]);

  const filteredNotifications = notifications.filter((n) => {
    if (n.recipient.toLowerCase() !== username.toLowerCase()) return false;
    if (n.sender.toLowerCase() === username.toLowerCase()) return false;
    if (!searchTerm) return true;

    const term = searchTerm.toLowerCase();
    return (
      n.caseId.toLowerCase().includes(term) ||
      n.sender.toLowerCase().includes(term) ||
      n.eventType.toLowerCase().includes(term)
    );
  });

  useEffect(() => {
    const newIsOverflow: { [key: string]: boolean } = {};
  
    filteredNotifications.forEach((noti) => {
      const el = textRefs.current[noti.id];
      if (el) {
        newIsOverflow[noti.id] = el.scrollHeight > el.clientHeight + 1;
      }
    });
  
    const isDifferent = Object.keys(newIsOverflow).some(
      (key) => newIsOverflow[key] !== isOverflow[key]
    );
  
    if (isDifferent) {
      setIsOverflow(newIsOverflow);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredNotifications, expandedId]);
  
  const updateNotification = async (updated: Notification) => {
    try {
      await axios.put(`${API_BASE_URL}/api/v1/notifications/edit/${updated.id}`, updated);
  
      // 🛠 ใช้ setState แบบแยก ไม่เซฟ localStorage ซ้ำ
      setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
      
      // 💾 แยกการเซฟไว้ข้างนอก useEffect
      const current = localStorage.getItem("notifications");
      if (current) {
        const parsed = JSON.parse(current);
        const newList = parsed.map((n: Notification) => (n.id === updated.id ? updated : n));
        localStorage.setItem("notifications", JSON.stringify(newList));
      }
    }
    catch (err) {
      console.error("❌ Error updating notification:", err);
    }
  };

  // const handleItemClick = (noti:Notification) => {
  //   if (!noti.read) {
  //     handleMarkAsRead(noti.id);
  //   }
  
  //   if (noti.redirectURL) {
  //     window.location.href = noti.redirectURL;
  //   }
  // };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }
  
    const key = "notifications";
    const existing = localStorage.getItem(key);
    if (existing === null) {
      localStorage.setItem(key, JSON.stringify(notifications));
    }
  }, [notifications]);
  
  useEffect(() => {
    if (socketRef.current) return;

    const ws = new WebSocket(`${WEBSOCKET_BASE_URL}/api/v1/notifications/ws`);

    ws.onopen = () => {
      const username = localStorage.getItem("username") || "";
      if (username) ws.send(username);
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setNotifications((prev) => {
        if (prev.some((n) => n.id === data.id)) return prev;

        const updated = [{ ...data, read: false }, ...prev];
        localStorage.setItem("notifications", JSON.stringify(updated));

        return updated;
      });
      setNotifying(true);
      // Play ring.mp3 sound on new notification
      if (audioRef.current) {
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch((e) => console.error("🔇 Play sound failed:", e));
      }
    };

    // ws.onerror = (e) => console.error("WS error:", e);
    ws.onclose = () => console.log("WS closed");
    socketRef.current = ws;

    return () => {
      ws.close();
      socketRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div className="relative" ref={dropdownRef}>
       <audio ref={audioRef} src="/sounds/ring.mp3" preload="auto" />
      {/* Bell Icon */}
      <button
      onClick={toggleDropdown}
      className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
      aria-label="Toggle notifications"
      type="button"
    >
      {/* วงกลมสีส้มแจ้งเตือนใหม่ */}
      {notifying && (
        <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
      )}

      {/* วงกลมสีน้ำเงินแสดงจำนวน unread notifications */}
      {unread > 0 && (

    <span
      className="absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white"
    >
      {unread}
    </span>
  )}
  

      {/* ไอคอนระฆัง */}
      <svg className="fill-current" width="20" height="20" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
        />
      </svg>
    </button>


      {/* Dropdown */}
<Dropdown
  isOpen={isOpen}
  onClose={() => setIsOpen(true)}
  className="absolute -right-[240px] mt-[17px] flex h-[500px] w-[360px] flex-col rounded-2xl ..."

>
  {/* Header */}
  <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
  <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100 pl-3">
  {t("Notifications")}
</h5>


    <Menu as="div" className="relative inline-block text-left">
    <Menu.Button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white text-xl font-bold mr-2">
  ⋯
</Menu.Button>
      <Menu.Items className="absolute right-0 mt-2 w-52 origin-top-right rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-50 dark:bg-gray-800">
        <div className="px-1 py-1">
          <Menu.Item>
            {({ active }) => (
              <button
                onClick={() => setSearchMode(!searchMode)}
                className={`${
                  active ? "bg-gray-100 dark:bg-gray-700" : ""
                } group flex w-full items-center rounded-md px-3 py-2 text-sm text-gray-700 dark:text-white`}
              >
                🔍 Search
              </button>
            )}
          </Menu.Item>
          <Menu.Item>
            {({ active }) => (
              <button
              onClick={handleMarkAllRead}
              className={`${
                active ? "bg-indigo-50 dark:bg-indigo-900/50" : ""
              } flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-indigo-700 dark:text-indigo-300 rounded-md transition-colors`}
            >
              <svg
                className="w-3 h-3"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
              Mark All as Read
            </button>
            
            )}
          </Menu.Item>
        </div>
      </Menu.Items>
    </Menu>
  </div>

  {/* Search Input */}
  {searchMode && (
    <input
      type="text"
      placeholder="🔍 Search by EventType, action, CaseId, Sender"
      className="mb-3 w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
    />
  )}

<ul className="flex flex-col overflow-y-auto custom-scrollbar gap-0 px-1">
  {filteredNotifications.length === 0 && (
    <li className="p-5 text-center text-gray-500 dark:text-gray-400 italic select-none">
      {t("navigation.topbar.settings.notification.no_notifications")}
    </li>
  )}

  {filteredNotifications.map((noti, index) => (
   <li
   key={noti.id}
   className="relative cursor-pointer group"
   onClick={async (e) => {
     e.preventDefault();
     if (!noti.read) {
       await handleMarkAsRead(noti.id);
     }
     if (noti.redirectURL) {
       setTimeout(() => {
         window.location.href = noti.redirectURL;
       }, 100); // Give time for marking as read
     }
   }}
 >
   <DropdownItem
  className={`relative flex gap-2 p-2 px-3 py-2 rounded-xl
    ${
      noti.read
        ? "bg-white dark:bg-gray-900"
        : "bg-gray-50 dark:bg-gray-800"
    }
    hover:bg-gray-100 dark:hover:bg-white/5
    group-hover:shadow-sm transition-all duration-200
    ${
      index !== filteredNotifications.length - 1
        ? "border-b border-gray-100 dark:border-gray-800 group-hover:border-transparent"
        : ""
    }
  `}
>
  <div className="flex items-start gap-3 w-full">
    {/* รูปโปรไฟล์ */}
    <div className="relative flex-shrink-0 mt-6">
      <img
        src={
          noti.eventType === "broadcast"
            ? "/images/notification/system.svg"
            : noti.sender === "system"
            ? "/images/notification/system.svg"
            : noti.sender === "responder"
            ? "/images/notification/responder.jpg"
            : noti.sender === "dispatcher"
            ? "/images/notification/dispatch.png"
            : "/images/notification/system.svg"
        }
        alt={noti.eventType === "broadcast" ? "System" : noti.sender}
        className="h-12 w-12 rounded-full border border-gray-300 object-cover dark:border-gray-600"
      />
      <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-white dark:border-gray-900" />
    </div>

    {/* กล่องข้อความ */}
    <div className="flex flex-col w-full gap-1">
      {/* eventType Badge (ด้านบนสุด แยกจาก sender) */}
      <div className="flex justify-between items-center">
        <span
          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
            noti.eventType === "broadcast"
              ? "bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300"
              : "bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300"
          }`}
        >
          {getNotiTypeIcon(noti.eventType)}
          <span className="truncate max-w-[80px]" title={noti.eventType}>
            {noti.eventType}
          </span>
        </span>
      </div>
  {/* Dropdown menu */}
              {/* <Menu as="div" className="relative flex-shrink-0">
                <Menu.Button
                  onClick={(e) => e.stopPropagation()}
                  className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                  </svg>
                </Menu.Button>
                <Menu.Items className="absolute right-0 mt-1 w-40 rounded-lg bg-white dark:bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 z-50 border border-gray-200 dark:border-gray-700">
                  <div className="p-1">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(noti.id);
                          }}
                          className={`${
                            active ? "bg-gray-100 dark:bg-gray-700" : ""
                          } flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-gray-700 dark:text-gray-300 rounded-md`}
                        >
                          ✔️ Mark as Read
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(noti.id);
                          }}
                          className={`${
                            active ? "bg-red-100 dark:bg-red-700" : ""
                          } flex items-center gap-2 w-full px-3 py-1.5 text-xs text-left text-red-600 dark:text-red-400 rounded-md`}
                        >
                          🗑️ Delete
                        </button>
                      )}
                    </Menu.Item>
                  </div>
                </Menu.Items>
              </Menu> */}
{/* Action Text */}

      {/* noti.sender + noti.message */}
      <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-relaxed relative">
        <p
          ref={(el) => {
            textRefs.current[noti.id] = el;
          }}
          style={{
            display: expandedId === noti.id ? "block" : "-webkit-box",
            WebkitLineClamp: expandedId === noti.id ? "unset" : 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginBottom: 0,
          }}
        >
          {noti.eventType === "broadcast" ? (
            <>
              <span className="text-blue-600 dark:text-blue-400 font-semibold">คุณได้รับ</span>{" "}
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {noti.sender}
              </span>{" "}
              <span className="text-gray-900 dark:text-gray-100">{noti.message}</span>
            </>
          ) : (
            <>
              <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                {noti.sender}
              </span>{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">ส่งถึงคุณ</span>{" "}
              <span className="text-gray-900 dark:text-gray-100">{noti.message}</span>
            </>
          )}
        </p>

        {/* ปุ่มแสดงทั้งหมด */}
        {(isOverflow[noti.id] || expandedId === noti.id) && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand(noti.id);
            }}
            className={`mt-1 ${
              expandedId === noti.id
                ? "text-red-500 dark:text-red-300"
                : "text-blue-500 dark:text-blue-300"
            } bg-white dark:bg-gray-900 px-1 rounded text-[10px]`}
          >
            {expandedId === noti.id ? "แสดงน้อยลง" : "แสดงทั้งหมด"}
          </button>
        )}
      </div>

      {/* Footer */}
      <div className="flex flex-col text-[10px] text-gray-500 dark:text-gray-400 mt-1">
        {noti.eventType !== "broadcast" && (
          <span className="truncate max-w-full">
            CaseID:{" "}
            <span className="font-mono text-gray-700 dark:text-gray-300">
              {noti.caseId}
            </span>
          </span>
        )}
        <div className="flex justify-end items-center gap-1 mt-0.5">
          <span className="font-mono text-gray-400 dark:text-gray-500">
            {timeAgo(noti.createdAt)}
          </span>
        </div>
      </div>
    </div>
  </div>

  {/* Overlay */}
  {!noti.read && (
    <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 opacity-20 pointer-events-none rounded-2xl transition-all duration-200" />
  )}
</DropdownItem>
  </li>
))}

</ul>
  <Link
    to="/"
    className="block mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
  >
    {t("navigation.topbar.settings.notification.view_all_notifications")}
  </Link>
</Dropdown>

    </div>
  );
}
