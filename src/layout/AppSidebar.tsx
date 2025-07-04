// /src/layout/AppSidebar.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useMemo
} from "react";
import { Link, useLocation } from "react-router";

// Assume these icons are imported from an icon library
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  FileIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
} from "../icons";
import { useSidebar } from "../context/SidebarContext";
// import SidebarWidget from "./SidebarWidget";
import Button from "@/components/ui/button/Button";

import { useTranslation } from "../hooks/useTranslation";
import
  {
    BoxIcon,
    Ticket,
    // PencilIcon
  }
from "lucide-react";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { name: string; path: string; pro?: boolean; new?: boolean }[];
};

const AppSidebar: React.FC = () => {
  const [menuDisplay, setMenuDisplay] = useState("hidden");

  const { t } = useTranslation();

  const mainItems: NavItem[] = useMemo(() => [
    {
      icon: <TaskIcon />,
      name: "Case Management",
      subItems: [
        { name: "Case Creation", path: "/case-creation", pro: false },
        { name: "Case Assignment", path: "/case-assignment", pro: false },
        { name: "Case History", path: "/kanban", pro: false },
      ],
    },
    {
      icon: <PieChartIcon />,
      name: "Dashboard & Analytics",
      subItems: [
        { name: "Overview SLA", path: "/", pro: false },
        { name: "Ticket Summary", path: "/ticket-summary", pro: false },
        { name: "Ticket Details", path: "/ticket-details", pro: false },
        { name: "Transaction Summary", path: "/transaction-summary", pro: false },
        { name: "Transaction Details", path: "/transaction-details", pro: false },
        { name: "Responder Performance", path: "/responder-performance", pro: false },
      ],
    },
    {
      icon: <FileIcon />,
      name: "Report",
      path: "/report",
    },
    {
      icon: <ListIcon />,
      name: "Form Builder",
      subItems: [
        { name: "Forms Management", path: "/load-dynamic-form", pro: false },
        { name: "Form Builder", path:"/dynamic-form", pro:false }
      ],
    },
    {
      icon: <Ticket />,
      name: "Ticket Management",
      subItems: [
        { name: "Ticket Management", path: "/ticket", pro: false },
      ],
    },
    {
      icon: <BoxIcon />,
      name: "Workflow",
      subItems: [
        { name: "Workflow Management", path: "/workflow/list", pro: false },
        { name: "Workflow Builder", path: "/workflow/editor/v2", pro: false },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "System Configuration",
      subItems: [
        { name: "User Management", path: "/user", pro: false },
        { name: "Roles & Privileges", path: "/role", pro: false },
        { name: "Organization Management", path: "/organization", pro: false },
        { name: "Unit Management", path: "/unit", pro: false },
        { name: "Service Management", path: "/service", pro: false },
      ],
    },
  ], []);

  const navItems: NavItem[] = useMemo(() => [
    {
      icon: <GridIcon />,
      name: t("navigation.sidebar.menu.dashboard.title"),
      subItems: [{ name: t("navigation.sidebar.menu.dashboard.nested.ecommerce"), path: "/", pro: false }],
    },
    {
      icon: <CalenderIcon />,
      name: t("navigation.sidebar.menu.calendar"),
      path: "/calendar",
    },
    {
      icon: <UserCircleIcon />,
      name: t("navigation.sidebar.menu.user_profile"),
      path: "/profile",
    },
    {
      name: t("navigation.sidebar.menu.forms.title"),
      icon: <ListIcon />,
      subItems: [
        { name: t("navigation.sidebar.menu.forms.nested.form_elements"), path: "/form-elements", pro: false },
      ],
    },
    {
      name: t("navigation.sidebar.menu.tables.title"),
      icon: <TableIcon />,
      subItems: [{ name: t("navigation.sidebar.menu.tables.nested.basic_tables"), path: "/basic-tables", pro: false }],
    },
    {
      name: t("navigation.sidebar.menu.pages.title"),
      icon: <PageIcon />,
      subItems: [
        { name: t("navigation.sidebar.menu.pages.nested.blank_page"), path: "/blank", pro: false },
        { name: t("navigation.sidebar.menu.pages.nested.404_error"), path: "/error-404", pro: false },
      ],
    },
  ], [t]);

  const othersItems: NavItem[] = useMemo(() => [
    {
      icon: <PieChartIcon />,
      name: t("navigation.sidebar.other.charts.title"),
      subItems: [
        { name: t("navigation.sidebar.other.charts.nested.line_chart"), path: "/line-chart", pro: false },
        { name: t("navigation.sidebar.other.charts.nested.bar_chart"), path: "/bar-chart", pro: false },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: t("navigation.sidebar.other.ui_elements.title"),
      subItems: [
        { name: t("navigation.sidebar.other.ui_elements.nested.alerts"), path: "/alerts", pro: false },
        { name: t("navigation.sidebar.other.ui_elements.nested.avatar"), path: "/avatars", pro: false },
        { name: t("navigation.sidebar.other.ui_elements.nested.badge"), path: "/badge", pro: false },
        { name: t("navigation.sidebar.other.ui_elements.nested.buttons"), path: "/buttons", pro: false },
        { name: "Buttons Customize", path: "/buttons-customize", pro: false },
        { name: t("navigation.sidebar.other.ui_elements.nested.images"), path: "/images", pro: false },
        { name: t("navigation.sidebar.other.ui_elements.nested.videos"), path: "/videos", pro: false },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: t("navigation.sidebar.other.authentication.title"),
      subItems: [
        { name: t("navigation.sidebar.other.authentication.nested.sign_in"), path: "/signin", pro: false },
        { name: t("navigation.sidebar.other.authentication.nested.sing_up"), path: "/signup", pro: false },
      ],
    },
  ], [t]);

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "menu" | "others";
    index: number;
  } | null>(null);
  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>(
    {}
  );
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "menu", "others"].forEach((menuType) => {
      const items = menuType === "main" ?  mainItems : menuType === "menu" ? navItems : othersItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "menu" | "others",
                index,
              });
              submenuMatched = true;
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location, isActive]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (index: number, menuType: "main" | "menu" | "others") => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu &&
        prevOpenSubmenu.type === menuType &&
        prevOpenSubmenu.index === index
      ) {
        return null;
      }
      return { type: menuType, index };
    });
  };

  const handleMenuDisplay = () => {
    if (menuDisplay === "hidden") {
      setMenuDisplay("");
    }
    else {
      setMenuDisplay("hidden");
    }
  }

  const renderMenuItems = (items: NavItem[], menuType: "main" | "menu" | "others") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        <li key={nav.name}>
          {nav.subItems ? (
            <button
              onClick={() => handleSubmenuToggle(index, menuType)}
              className={`menu-item group ${
                openSubmenu?.type === menuType && openSubmenu?.index === index
                  ? "menu-item-active"
                  : "menu-item-inactive"
              } cursor-pointer ${
                !isExpanded && !isHovered
                  ? "lg:justify-center"
                  : "lg:justify-start"
              }`}
            >
              <span
                className={`menu-item-icon-size  ${
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? "menu-item-icon-active"
                    : "menu-item-icon-inactive"
                }`}
              >
                {nav.icon}
              </span>
              {(isExpanded || isHovered || isMobileOpen) && (
                <span className="menu-item-text">{nav.name}</span>
              )}
              {(isExpanded || isHovered || isMobileOpen) && (
                <ChevronDownIcon
                  className={`ml-auto w-5 h-5 transition-transform duration-200 ${
                    openSubmenu?.type === menuType &&
                    openSubmenu?.index === index
                      ? "rotate-180 text-brand-500"
                      : ""
                  }`}
                />
              )}
            </button>
          ) : (
            nav.path && (
              <Link
                to={nav.path}
                className={`menu-item group ${
                  isActive(nav.path) ? "menu-item-active" : "menu-item-inactive"
                }`}
              >
                <span
                  className={`menu-item-icon-size ${
                    isActive(nav.path)
                      ? "menu-item-icon-active"
                      : "menu-item-icon-inactive"
                  }`}
                >
                  {nav.icon}
                </span>
                {(isExpanded || isHovered || isMobileOpen) && (
                  <span className="menu-item-text">{nav.name}</span>
                )}
              </Link>
            )
          )}
          {nav.subItems && (isExpanded || isHovered || isMobileOpen) && (
            <div
              ref={(el) => {
                subMenuRefs.current[`${menuType}-${index}`] = el;
              }}
              className="overflow-hidden transition-all duration-300"
              style={{
                height:
                  openSubmenu?.type === menuType && openSubmenu?.index === index
                    ? `${subMenuHeight[`${menuType}-${index}`]}px`
                    : "0px",
              }}
            >
              <ul className="mt-2 space-y-1 ml-9">
                {nav.subItems.map((subItem) => (
                  <li key={subItem.name}>
                    <Link
                      to={subItem.path}
                      className={`menu-dropdown-item ${
                        isActive(subItem.path)
                          ? "menu-dropdown-item-active"
                          : "menu-dropdown-item-inactive"
                      }`}
                    >
                      {subItem.name}
                      <span className="flex items-center gap-1 ml-auto">
                        {subItem.new && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            new
                          </span>
                        )}
                        {subItem.pro && (
                          <span
                            className={`ml-auto ${
                              isActive(subItem.path)
                                ? "menu-dropdown-badge-active"
                                : "menu-dropdown-badge-inactive"
                            } menu-dropdown-badge`}
                          >
                            pro
                          </span>
                        )}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
      ))}
    </ul>
  );

  return (
    <aside
      className={`fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        ${
          isExpanded || isMobileOpen
            ? "w-[290px]"
            : isHovered
            ? "w-[290px]"
            : "w-[90px]"
        }
        ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0`}
      onMouseEnter={() => !isExpanded && setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        className={`py-8 flex ${
          !isExpanded && !isHovered ? "lg:justify-center" : "justify-start"
        }`}
      >
        <Link to="/">
          {isExpanded || isHovered || isMobileOpen ? (
            <>
              {/*
              <img
                className="dark:hidden"
                src="/images/logo/logo.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo-dark.svg"
                alt="Logo"
                width={150}
                height={40}
              />
              */}

              <img
                className="dark:hidden"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
              <img
                className="hidden dark:block"
                src="/images/logo/logo.png"
                alt="Logo"
                width={150}
                height={40}
              />
            </>
          ) : (
            ""
            // <img
            //   src="/images/logo/logo-icon.svg"
            //   alt="Logo"
            //   width={32}
            //   height={32}
            // />
          )}
        </Link>
      </div>
      <div className="flex flex-col overflow-y-auto duration-300 ease-linear no-scrollbar">
        <nav className="mb-6">
          <div className="flex flex-col gap-4">
            <div className={`mb-6`}>
              {renderMenuItems(mainItems, "main")}
            </div>
            {isExpanded || isHovered || isMobileOpen ? (
              <div className={`mb-6`}>
                <Button onClick={() => handleMenuDisplay()}>Show / Hide Template Menu</Button>
              </div>
            ) : null}
            <div className={`mb-6 ${menuDisplay}`}>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  // "Menu"
                  t("navigation.sidebar.menu.title")
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(navItems, "menu")}
            </div>
            <div className={`mb-6 ${menuDisplay}`}>
              <h2
                className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                  !isExpanded && !isHovered
                    ? "lg:justify-center"
                    : "justify-start"
                }`}
              >
                {isExpanded || isHovered || isMobileOpen ? (
                  // "Others"
                  t("navigation.sidebar.other.title")
                ) : (
                  <HorizontaLDots />
                )}
              </h2>
              {renderMenuItems(othersItems, "others")}
            </div>
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
