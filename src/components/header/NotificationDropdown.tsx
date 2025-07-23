import { useEffect, useState, useRef } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { useTranslation } from "../../hooks/useTranslation";
import axios, { AxiosError } from "axios";
import { Menu } from "@headlessui/react";

interface Data {
  key: string;
  value: string;
}

interface Recipient {
  type: string;
  value: string;
}

interface Notification {
  id: string;
  tenantId: string;
  senderType: string;
  senderPhoto: string;
  sender: string;
  message: string;
  eventType: string;
  redirectURL: string;
  createdAt: string;
  read: boolean;
  data: Data[];
  recipients: Recipient[];
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
  const [filterType, setFilterType] = useState<string>("All Types");
 
  const API = import.meta.env.VITE_API_BASE_URL;
  const WEBSOCKET = import.meta.env.VITE_WEBSOCKET_BASE_URL;

  // Get profile from localStorage
  const getProfile = () => {
    const profile = localStorage.getItem("profile");
    if (profile) {
      try {
        return JSON.parse(profile);
      } catch (err) {
        console.error("Failed to parse profile:", err);
        return null;
      }
    }
    return null;
  };

  // Get auth token from localStorage
  const getAuthToken = () => {
    const token = localStorage.getItem("access_token");
    console.log("🔍 Token from localStorage:", token ? token.substring(0, 50) + "..." : "Not found");
    return token;
  };

  // Get auth headers
  const getAuthHeaders = () => {
    const token = getAuthToken();
    console.log("🔑 Getting auth headers, token exists:", !!token);
    return token ? { 
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    } : {
      'Content-Type': 'application/json'
    };
  };



  const toggleDropdown = () => {
    setIsOpen((prev) => {
      setNotifying(false);
      return !prev;
    });
  };

  const toggleExpand = (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
    }
  };

  // function getNotiTypeIcon(type: string) {
  //   switch (type.toLowerCase()) {
  //     case "boardcast":
  //     case "broadcast":
  //       return "🔊";
  //     case "caseevent":
  //     case "case_event":
  //       return "📋";
  //     case "new_case":
  //       return "📋";
  //     case "info":
  //       return "ℹ️";
  //     case "cancel dispatch":
  //       return "❌";
  //     case "canceled":
  //       return "🚫";
  //     case "assigned":
  //       return "📌";
  //     case "pending":
  //       return "⏳";
  //     case "dispatched":
  //       return "🚓";
  //     case "accepted":
  //       return "✅";
  //     case "en route":
  //       return "🚗";
  //     case "arrived":
  //       return "📍";
  //     case "closed":
  //       return "🔒";
  //     case "delayed":
  //       return "⏰";
  //     case "delay dispatch":
  //       return "🐢";
  //     case "delay arrival":
  //       return "🐌";
  //     case "delay ack":
  //       return "🕒";
  //     case "delay close":
  //       return "⌛";
  //     default:
  //       return "🔔";
  //   }
  // }
  const getPreferences = () => {
        // ค่าเริ่มต้นหากไม่มีการตั้งค่า
        const defaultPreferences = {
          autoDelete: false,
          autoDeleteDays: 7,
          hideRead: false,
          popupEnabled: true,
          pushEnabled: true,
          soundEnabled: true,
          sound: "default",
        };
    
        const saved = localStorage.getItem("notificationPreferences");
        if (saved) {
          try {
            return { ...defaultPreferences, ...JSON.parse(saved) };
          } catch (err) {
            console.error("Failed to parse notification preferences:", err);
          }
        }
        return defaultPreferences;
      };
  const handleMarkAllRead = () => {
        const profile = getProfile();
        if (!profile) return;
    
        const updatedNotifications = notifications.map((n) => ({ ...n, read: true }));
        setNotifications(updatedNotifications);
    
        const key = `notifications_${profile.username}`;
        localStorage.setItem(key, JSON.stringify(updatedNotifications));
      };
    
      const handleMarkAsRead = (id: string) => {
        const profile = getProfile();
        if (!profile) return;
    
        const updatedNotifications = notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        );
    
        setNotifications(updatedNotifications);
    
        const key = `notifications_${profile.username}`;
        localStorage.setItem(key, JSON.stringify(updatedNotifications));
      };
  const profile = getProfile();

  useEffect(() => {
    if (!profile) return;
    const filteredUnread = notifications.filter((noti) => !noti.read);
    setUnread(filteredUnread.length);
  }, [notifications, profile]);

  // Generate unique event types for the filter dropdown
  const uniqueEventTypes = ["All Types", ...Array.from(new Set(notifications.map(n => n.eventType)))];

  //กรองความถูกต้อง
  const isUserRecipient = (_noti: Notification) => {
    return true; // ให้ทุก notification ผ่าน
  };
  useEffect(() => {
    const prefs = getPreferences();
    // ✅ เพิ่มเงื่อนไข: ถ้าปิดการใช้งาน push ให้หยุดทำงาน
    if (!prefs.pushEnabled) {
      console.log("Push notifications (WebSocket) are disabled by user preference.");
      return;
    }

    if (socketRef.current || !profile?.username || !profile?.orgId || isConnectingRef.current) return;
    // ... โค้ดที่เหลือของ useEffect ...
  }, [profile?.username, profile?.orgId]);
  useEffect(() => {
      const prefs = getPreferences();
  
      // ทำงานเมื่อเปิดใช้ Auto Delete เท่านั้น
      if (!prefs.autoDelete) {
        return;
      }
  
      const autoDeleteDays = prefs.autoDeleteDays;
      const now = new Date().getTime();
  
      const filtered = notifications.filter(noti => {
        const notiDate = new Date(noti.createdAt).getTime();
        const daysDifference = (now - notiDate) / (1000 * 60 * 60 * 24);
        return daysDifference < autoDeleteDays;
      });
  
      // ถ้ามีรายการที่ถูกลบ ให้ทำการอัปเดต State และ Local Storage
      if (filtered.length < notifications.length) {
        console.log(`Auto-deleted ${notifications.length - filtered.length} notifications older than ${autoDeleteDays} days.`);
        setNotifications(filtered);
        if (profile) {
          localStorage.setItem(`notifications_${profile.username}`, JSON.stringify(filtered));
        }
      }
  
    }, [notifications, profile]); // ทำงานทุกครั้งที่ notifications หรือ profile เปลี่ยน
  // Updated filtering logic
  
  const filteredNotifications = notifications.filter((n) => {
  const prefs = getPreferences();

  // ✅ เพิ่มเงื่อนไข: ถ้าเปิดใช้ hideRead และ notification ถูกอ่านแล้ว ให้ซ่อน
  if (prefs.hideRead && n.read) {
      return false;
  }

    // Check if user is recipient (โค้ดเดิม)
    if (!isUserRecipient(n)) return false;
    
    // Filter by the selected event type (โค้ดเดิม)
    if (filterType !== "All Types" && n.eventType.toLowerCase() !== filterType.toLowerCase()) {
      return false;
    }

    // Filter by search term (โค้ดเดิม)
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const caseId = n.data.find(d => d.key === "caseId")?.value || "";
    
    return (
      caseId.toLowerCase().includes(term) ||
      n.sender.toLowerCase().includes(term) ||
      n.eventType.toLowerCase().includes(term) ||
      n.message.toLowerCase().includes(term)
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
  }, [filteredNotifications, expandedId]);

  // const updateNotification = async (updated: Notification) => {
  //   try {
  //     await axios.put(
  //       `${API}/api/v1/notifications/${updated.id}`,
  //       updated,
  //       { headers: getAuthHeaders() }
  //     );

  //     setNotifications((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));

  //     if (profile) {
  //       const key = `notifications_${profile.username}`;
  //       const current = localStorage.getItem(key);
  //       if (current) {
  //         const parsed = JSON.parse(current);
  //         const newList = parsed.map((n: Notification) => (n.id === updated.id ? updated : n));
  //         localStorage.setItem(key, JSON.stringify(newList));
  //       }
  //     }
  //   } catch (err) {
  //     console.error("❌ Error updating notification:", err);
  //     if (err instanceof AxiosError) {
  //       console.error("📄 Update error response:", err.response?.data);
  //     }
  //   }
  // };

  useEffect(() => {
    if (!hasInitialized.current) {
      hasInitialized.current = true;
      return;
    }

    if (profile) {
      const key = `notifications_${profile.username}`;
      const existing = localStorage.getItem(key);
      if (existing === null) {
        localStorage.setItem(key, JSON.stringify(notifications));
      }
    }
  }, [notifications, profile]);

  const [popupNotification, setPopupNotification] = useState<Notification | null>(null);
  const [showPopup, setShowPopup] = useState(false);
  const popupTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Read notification preferences from localStorage
 

  const isConnectingRef = useRef(false);
  useEffect(() => {

    if (socketRef.current || !profile?.username || !profile?.orgId || isConnectingRef.current) return;
  
    isConnectingRef.current = true;
  
    console.log("🔌 Connecting to WebSocket...");
    const ws = new WebSocket(`${WEBSOCKET}/api/v1/notifications/register`);
  
    ws.onopen = () => {
      console.log("✅ WebSocket connected");
      const payload = {
        orgId: profile.orgId,
        username: profile.username,
      };
      ws.send(JSON.stringify(payload));
      isConnectingRef.current = false;
    };
  
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        const prefs = getPreferences(); // ✅ ดึงค่า settings จาก Local Storage
    
        console.log("📥 WebSocket message received:", event.data);
    
        // ตรวจสอบว่าเป็น Notification จริงหรือไม่
        if (data.eventType && data.message) {
          console.log("✅ Valid notification, processing...");
    
          // ✅ เพิ่มเงื่อนไข: จัดการการแสดงผล Popup ต่อเมื่อ popupEnabled เป็น true
          if (prefs.popupEnabled) {
            if (showPopup) {
              setShowPopup(false);
              setTimeout(() => {
                setPopupNotification(data);
                setShowPopup(true);
                if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
                popupTimerRef.current = setTimeout(() => {
                  setShowPopup(false);
                  setTimeout(() => setPopupNotification(null), 500);
                }, 5000);
              }, 500);
            } else {
              setPopupNotification(data);
              setShowPopup(true);
              if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
              popupTimerRef.current = setTimeout(() => {
                setShowPopup(false);
                setTimeout(() => setPopupNotification(null), 500);
              }, 5000);
            }
          }
    
          // --- อัปเดต State และ Local Storage ---
          setNotifications((prev) => {
            if (prev.some((n) => n.id === data.id)) {
              return prev; // ป้องกันการเพิ่มข้อมูลซ้ำ
            }
            const updated = [{ ...data, read: false }, ...prev];
            if (profile) {
              localStorage.setItem(
                `notifications_${profile.username}`,
                JSON.stringify(updated)
              );
            }
            return updated;
          });
    
          setNotifying(true);
    
          // ✅ แก้ไขเงื่อนไข: เล่นเสียงต่อเมื่อ soundEnabled เป็น true
          if (prefs.soundEnabled && audioRef.current) {
            let soundFile = `/sounds/${prefs.sound}.mp3`;
            audioRef.current.src = soundFile;
            audioRef.current.currentTime = 0;
            audioRef.current
              .play()
              .catch((e) => console.error("🔇 Play sound failed:", e));
          }
        } else {
          // ถ้าไม่ใช่ Notification (เช่นข้อมูลของระบบ) ให้แค่ log แต่ไม่นำไป render
          console.log("ℹ️ System message received (ignored):", data);
        }
      } catch (err) {
        console.error(
          "❌ Failed to parse WebSocket message or process notification:",
          event.data,
          err
        );
      }
    };
  
    ws.onclose = (event) => {
      console.log("🔌 WebSocket closed:", event.code, event.reason);
      socketRef.current = null;
      isConnectingRef.current = false;
    };
  
    socketRef.current = ws;
  
    return () => {
      console.log("🧹 Cleaning up WebSocket");
      ws.close();
      socketRef.current = null;
      isConnectingRef.current = false;
      if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
    };
  }, [profile?.username, profile?.orgId]);

  useEffect(() => {
    const loadNotifications = async () => {
      const profile = getProfile();
      const token = getAuthToken();
  
      console.log("🔍 Profile:", profile);
      console.log("🔑 Token:", token ? "Present" : "Missing");
  
      if (!profile || !profile.username || !profile.orgId) {
        console.warn("⚠️ Missing profile data");
        return;
      }
      
      // --- START of MODIFICATION ---
  
      const key = `notifications_${profile.username}`;
      const saved = localStorage.getItem(key);
  
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            console.log("✅ Loaded notifications from localStorage.");
            setNotifications(parsed);
            setUnread(parsed.filter((n) => !n.read).length); // Also set unread count
            return; // Exit the function to prevent API call
          } else {
             console.warn("⚠️ Invalid format in localStorage. Fetching from API.");
          }
        } catch (err) {
          console.error("❌ Failed to parse localStorage notifications. Fetching from API.", err);
        }
      }
  
      // --- END of MODIFICATION ---
  
      if (!token) {
        console.warn("⚠️ Missing auth token");
        return;
      }
  
      try {
        const url = `${API}/api/v1/notifications/${profile.orgId}/${profile.username}`;
        const headers = getAuthHeaders();
      
        console.log("🌐 Fetching from API:", url);
        console.log("📋 Headers:", headers);
      
        const res = await axios.get(url, { headers });
      
        console.log("📥 API Response:", res.status, res.data);
      
        if (Array.isArray(res.data)) {
          // แก้ไขตรงนี้: map ข้อมูลทั้งหมดแล้วกำหนดให้ read: true โดยอัตโนมัติ
          const notificationsAsRead = res.data.map(noti => ({
            ...noti,
            read: true, // ตั้งค่า read เป็น true สำหรับทุกรายการที่ดึงมาใหม่
          }));
          
          setNotifications(notificationsAsRead);
          localStorage.setItem(key, JSON.stringify(notificationsAsRead)); // บันทึกข้อมูลที่แก้ไขแล้ว
          setUnread(0); // เนื่องจากทุกรายการถูกตั้งเป็น read: true แล้ว จึงไม่มีรายการที่ยังไม่อ่าน
          console.log("✅ Fetched from API, marked all as read, and saved to localStorage");
      
        } else {
          console.warn("⚠️ API response is not an array:", res.data);
        }
      } catch (err) {
        console.error("❌ Fetch error:", err);
        if (err instanceof AxiosError) {
          console.error("📄 Response data:", err.response?.data);
          console.error("📊 Response status:", err.response?.status);
          console.error("📋 Response headers:", err.response?.headers);
        }
      }
    };
  
    loadNotifications();
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

  const [showAll, setShowAll] = useState(false);
  const visibleNotifications = showAll ? filteredNotifications : filteredNotifications.slice(0, 5);

  const getNotificationId = (noti?: Notification | null) => {
    return noti?.id || "";
  };
  
  return (
    <div className="relative" ref={dropdownRef}>
      {/* Pop up notification modal */}
      <audio ref={audioRef} src="/sound/defalut.mp3" preload="auto" />
      <div
        className={`fixed bottom-8 right-8 z-[9999] w-[360px] shadow-2xl rounded-2xl bg-white dark:bg-gray-900 border-2 border-blue-500 dark:border-blue-400 transition-transform duration-500 ease-in-out ${showPopup ? 'translate-x-0 opacity-100' : 'translate-x-[400px] opacity-0'}`}
        style={{
          pointerEvents: showPopup ? 'auto' : 'none',
        }}
      >
        {popupNotification && (
          <button
            className="absolute top-2 right-2 text-gray-400 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white bg-white dark:bg-gray-900 rounded-full p-1 border border-gray-200 dark:border-gray-700 shadow"
            aria-label="Close notification popup"
            onClick={() => {
              setShowPopup(false);
              setTimeout(() => setPopupNotification(null), 500);
              if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
            }}
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none">
              <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        )}
        {showPopup && popupNotification && (
        <div
        className="cursor-pointer max-w-sm w-full"
        onClick={() => {
          if (popupNotification.redirectURL) {
            window.location.href = popupNotification.redirectURL;
          }
          setShowPopup(false);
          setTimeout(() => setPopupNotification(null), 500);
          if (popupTimerRef.current) clearTimeout(popupTimerRef.current);
        }}
      >
        <DropdownItem
          className={`relative flex gap-2 p-2 px-3 py-2 rounded-xl ${
            popupNotification.read ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"
          } group-hover:shadow-sm transition-all duration-200 border border-gray-200 dark:border-gray-700 shadow-md`}
        >
          <div className="flex items-start gap-2 w-full">
          <img
  src={
    popupNotification.senderPhoto && popupNotification.senderPhoto.trim() !== ""
      ? popupNotification.senderPhoto
      : "/images/notification/user.jpg"
  }
  alt="Sender"
  className="h-8 w-8 rounded-full border border-gray-300 object-cover dark:border-gray-600 mt-1"
/>


            <div className="flex flex-col w-full">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full">
                  {popupNotification.eventType}
                </span>
                <span className="text-[10px] text-gray-500 dark:text-gray-400">
                  {timeAgo(popupNotification.createdAt)}
                </span>
              </div>
              <div className="text-[12px] font-medium text-gray-900 dark:text-gray-100 leading-snug line-clamp-2">
                <span className="text-indigo-600 dark:text-indigo-400 font-semibold">{popupNotification.sender}</span>{" "}
                <span className="text-blue-600 dark:text-blue-400 font-semibold">ส่งถึงคุณ</span>{" "}
                <span className="text-gray-900 dark:text-gray-100">{popupNotification.message}</span>
              </div>
              {getNotificationId(popupNotification) && (
                <div className="text-[10px] text-gray-500 dark:text-gray-400 truncate mt-1">
                
                  
                </div>
              )}
            </div>
          </div>
      
          {!popupNotification.read && (
            <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 opacity-20 pointer-events-none rounded-2xl transition-all duration-200" />
          )}
        </DropdownItem>
      </div>
        )}
      </div>

      {/* Bell Icon */}
      <button
        onClick={toggleDropdown}
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        aria-label="Toggle notifications"
        type="button"
      >
        {notifying && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-orange-400">
            <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 z-20 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-xs font-bold text-white">
            {unread}
          </span>
        )}
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
        className="absolute -right-[240px] mt-[17px] flex h-[500px] w-[360px] flex-col rounded-2xl p-4 bg-white dark:bg-gray-900 shadow-2xl border border-gray-200 dark:border-gray-800"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-200 dark:border-gray-700">
          <h5 className="text-lg font-bold text-gray-900 dark:text-gray-100">
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
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Mark All as Read
                    </button>
                  )}
                </Menu.Item>
              </div>
            </Menu.Items>
          </Menu>
        </div>

        {/* Search and Filter Controls */}
        <div className="flex flex-col gap-2 pb-2">
          {searchMode && (
            <input
              type="text"
              placeholder="🔍 Search notifications..."
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          )}
          <div className="relative">
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full appearance-none rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              {uniqueEventTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-400">
              <svg className="h-4 w-4 fill-current" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
              </svg>
            </div>
          </div>
        </div>

        <ul className="flex flex-1 flex-col overflow-y-auto custom-scrollbar gap-0 -mx-1 pr-1">
          {visibleNotifications.length === 0 && (
            <li className="p-5 text-center text-gray-500 dark:text-gray-400 italic select-none">
              {t("navigation.topbar.settings.notification.no_notifications")}
            </li>
          )}

{visibleNotifications.map((noti, index) => (
  <li
    key={noti.id}
    className="relative cursor-pointer group"
    onClick={(e) => {
      e.preventDefault();
      if (!noti.read) {
        handleMarkAsRead(noti.id);
      }
      if (noti.redirectURL) {
        setTimeout(() => {
          window.location.href = noti.redirectURL;
        }, 100);
      }
    }}
  >
    <DropdownItem
      className={`relative flex gap-2 p-2 px-3 py-2 rounded-xl
        ${noti.read ? "bg-white dark:bg-gray-900" : "bg-gray-50 dark:bg-gray-800"}
        ${noti.eventType.toLowerCase() === 'broadcast' ? 'border-l-4 border-teal-500 dark:border-teal-400' : ''}
        hover:bg-gray-100 dark:hover:bg-white/5
        group-hover:shadow-sm transition-all duration-200
        ${index !== filteredNotifications.length - 1 ? "border-b border-gray-100 dark:border-gray-800 group-hover:border-transparent" : ""}
      `}
    >
      <div className="flex items-start gap-3 w-full">
      <div className="relative flex-shrink-0 mt-6">
  <img
    src={noti.senderPhoto && noti.senderPhoto.trim() !== "" ? noti.senderPhoto : "/images/notification/user.jpg"}
    alt="Sender"
    className="h-12 w-12 rounded-full border border-gray-300 object-cover dark:border-gray-600"
  />
</div>

        <div className="flex flex-col w-full gap-1">
          <div className="flex justify-between items-center">
            <span
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium 
                ${noti.eventType.toLowerCase() === 'broadcast' 
                  ? 'bg-teal-100 dark:bg-teal-900 text-teal-700 dark:text-teal-300' 
                  : 'bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300'
                }`}
            >
              {noti.eventType}
            </span>
          </div>

          <div className="text-xs font-medium text-gray-900 dark:text-gray-100 leading-relaxed relative">
            <p
              ref={(el) => { textRefs.current[noti.id] = el; }}
              style={{
                display: expandedId === noti.id ? "block" : "-webkit-box",
                WebkitLineClamp: expandedId === noti.id ? "unset" : 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                textOverflow: "ellipsis",
                marginBottom: 0,
              }}
            >
              <span className={`font-semibold ${
                noti.eventType.toLowerCase() === 'broadcast' 
                ? 'text-teal-600 dark:text-teal-400'
                : 'text-indigo-600 dark:text-indigo-400'
              }`}>
                {noti.sender}
              </span>{" "}
              <span className="text-blue-600 dark:text-blue-400 font-semibold">ส่งถึงคุณ</span>{" "}
              <span className="text-gray-900 dark:text-gray-100">{noti.message}</span>
            </p>

            {(isOverflow[noti.id] || expandedId === noti.id) && (
              <button
                onClick={(e) => { e.stopPropagation(); toggleExpand(noti.id); }}
                className={`mt-1 ${ expandedId === noti.id ? "text-red-500 dark:text-red-300" : "text-blue-500 dark:text-blue-300" } bg-white dark:bg-gray-900 px-1 rounded text-[10px]`}
              >
                {expandedId === noti.id ? "แสดงน้อยลง" : "แสดงทั้งหมด"}
              </button>
            )}
          </div>

          <div className="flex flex-col text-[10px] text-gray-500 dark:text-gray-400 mt-1">
            {getNotificationId(noti) && (
              <span className="truncate max-w-full">
                {/* Content was empty here */}
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

      {!noti.read && (
        <div className="absolute inset-0 bg-gray-300 dark:bg-gray-700 opacity-20 pointer-events-none rounded-2xl transition-all duration-200" />
      )}
    </DropdownItem>
  </li>
))}
        </ul>
        <button
          className="block mt-4 rounded-lg border border-gray-300 bg-white px-4 py-2 text-center text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 w-full"
          onClick={() => setShowAll((prev) => !prev)}
        >
          {showAll ? "Hide" : t("navigation.topbar.settings.notification.view_all_notifications")}
        </button>
      </Dropdown>
    </div>
  );
}
