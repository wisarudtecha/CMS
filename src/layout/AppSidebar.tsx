// /src/layout/AppSidebar.tsx
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { Link, useLocation } from "react-router";
import {
  BoxCubeIcon,
  CalenderIcon,
  ChevronDownIcon,
  GridIcon,
  FileIcon,
  HorizontaLDots,
  ListIcon,
  PageIcon,
  PencilIcon,
  PieChartIcon,
  PlugInIcon,
  TableIcon,
  TaskIcon,
  UserCircleIcon,
  LockIcon
} from "@/icons";
import { BoxIcon } from "lucide-react";
import { useSidebar } from "@/context/SidebarContext";
import { usePermissions } from "@/hooks/usePermissions";
import { useTranslation } from "@/hooks/useTranslation";
import { AuthService } from "@/utils/authService";
// import Button from "@/components/ui/button/Button";
// import SidebarWidget from "@/layout/SidebarWidget";

type NavItem = {
  name: string;
  icon: React.ReactNode;
  path?: string;
  permission?: boolean;
  subItems?: {
    name: string;
    path: string;
    pro?: boolean;
    new?: boolean;
    permission?: boolean;
  }[];
};

const AppSidebar: React.FC = () => {
  const [isSystemAdmin, setIsSystemAdmin] = useState(false);
  useEffect(() => {
    const fetchSystemAdminStatus = async () => {
      setIsSystemAdmin(await AuthService.isSystemAdmin());
    }
    fetchSystemAdminStatus();
  }, [isSystemAdmin]);

  const [menuDisplay, setMenuDisplay] = useState("hidden");

  const permissions = usePermissions();
  const { t } = useTranslation();

  // Main Menu
  const mainItems: NavItem[] = useMemo(() => [
    {
      icon: <TaskIcon />,
      name: "Case Management",
      permission: permissions.hasAnyPermission([
        "case.create", "case.assign", "case.view_history",
      ]),
      subItems: [
        {
          name: "Case Creation",
          path: "/case/creation",
          permission: permissions.hasPermission("case.create"),
        },
        {
          name: "Case Assignment",
          path: "/case/assignment",
          permission: permissions.hasPermission("case.assign"),
        },
        {
          name: "Case History",
          path: "/case/history",
          permission: permissions.hasPermission("case.view_history"),
        },
      ],
    },
    {
      icon: <PieChartIcon />,
      name: "Dashboard & Analytics",
      permission: permissions.hasAnyPermission([
        "dashboard.view",
      ]),
      subItems: [
        // { name: "Overview SLA", path: "/overview-sla", permission: permissions.hasPermission("dashboard.view"), },
        // { name: "Ticket Summary", path: "/ticket-summary", permission: permissions.hasPermission("dashboard.view"), },
        // { name: "Ticket Details", path: "/ticket-details", permission: permissions.hasPermission("dashboard.view"), },
        // { name: "Transaction Summary", path: "/transaction-summary", permission: permissions.hasPermission("dashboard.view"), },
        // { name: "Transaction Details", path: "/transaction-details", permission: permissions.hasPermission("dashboard.view"), },
        // { name: "Responder Performance", path: "/responder-performance", permission: permissions.hasPermission("dashboard.view"), },
        {
          name: "Analytics",
          path: "/dashboard/analytics",
          permission: permissions.hasPermission("dashboard.view"),
        }, // Mockup
        {
          name: "Call Center",
          path: "/dashboard/callcenter",
          permission: permissions.hasPermission("dashboard.view"),
        }, // Mockup
        {
          name: "Agent Status",
          path: "/dashboard/agent-status",
          permission: permissions.hasPermission("dashboard.view"),
        }, // Mockup
        {
          name: "Service",
          path: "/dashboard/service",
          permission: permissions.hasPermission("dashboard.view"),
        }, // Mockup
      ],
    },
    {
      icon: <FileIcon />,
      name: "Report",
      path: "/report",
      permission: permissions.hasAnyPermission([
        "report.view", "report.generate", "report.export", "report.schedule", "report.delete",
      ]),
    },
    {
      icon: <ListIcon />,
      name: "Form Builder",
      permission: permissions.hasAnyPermission([
        "form.view", "form.create",
      ]),
      subItems: [
        {
          name: "Form Management",
          path: "/form-management",
          permission: permissions.hasPermission("form.view"),
        },
        {
          name: "Form Builder",
          path:"/dynamic-form",
          permission: permissions.hasPermission("form.create"),
        },
      ],
    },
    {
      icon: <BoxIcon />,
      name: "Workflow",
      permission: permissions.hasAnyPermission([
        "workflow.view", "workflow.create",
      ]),
      subItems: [
        {
          name: "Workflow Management",
          path: "/workflow/list",
          permission: permissions.hasPermission("workflow.view"),
        },
        {
          name: "Workflow Builder",
          path: "/workflow/editor/v2",
          permission: permissions.hasPermission("workflow.create"),
        },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: "System Configuration",
      permission: permissions.hasAnyPermission([
        "user.view", "role.view", "organization.view", "unit.view", "service.view",
      ]),
      subItems: [
        {
          name: "User Management",
          path: "/users",
          permission: permissions.hasPermission("user.view"),
        },
        {
          name: "Roles & Privileges",
          path: "/roles",
          permission: permissions.hasPermission("role.view"),
        },
        {
          name: "Organization Management",
          path: "/organization",
          permission: permissions.hasPermission("organization.view"),
        },
        {
          name: "Unit Management",
          path: "/unit",
          permission: permissions.hasPermission("unit.view"),
        },
        {
          name: "Service Management",
          path: "/service",
          permission: permissions.hasPermission("service.view"),
        },
      ],
    },
  ], [permissions]);

  const navItems: NavItem[] = useMemo(() => [
    {
      icon: <GridIcon />,
      name: t("navigation.sidebar.menu.dashboard.title"),
      subItems: [
        { name: t("navigation.sidebar.menu.dashboard.nested.ecommerce"), path: "/", },
        { name: "Dashboard Framework", path: "/dashboard", },
      ],
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
        { name: t("navigation.sidebar.menu.forms.nested.form_elements"), path: "/form-elements", },
      ],
    },
    {
      name: t("navigation.sidebar.menu.tables.title"),
      icon: <TableIcon />,
      subItems: [{ name: t("navigation.sidebar.menu.tables.nested.basic_tables"), path: "/basic-tables", }],
    },
    {
      name: t("navigation.sidebar.menu.pages.title"),
      icon: <PageIcon />,
      subItems: [
        { name: t("navigation.sidebar.menu.pages.nested.blank_page"), path: "/blank", },
        { name: t("navigation.sidebar.menu.pages.nested.404_error"), path: "/error-404", },
      ],
    },
  ], [t]);

  const othersItems: NavItem[] = useMemo(() => [
    {
      icon: <PieChartIcon />,
      name: t("navigation.sidebar.other.charts.title"),
      subItems: [
        { name: t("navigation.sidebar.other.charts.nested.line_chart"), path: "/line-chart", },
        { name: t("navigation.sidebar.other.charts.nested.bar_chart"), path: "/bar-chart", },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: t("navigation.sidebar.other.ui_elements.title"),
      subItems: [
        { name: t("navigation.sidebar.other.ui_elements.nested.alerts"), path: "/alerts", },
        { name: t("navigation.sidebar.other.ui_elements.nested.avatar"), path: "/avatars", },
        { name: t("navigation.sidebar.other.ui_elements.nested.badge"), path: "/badge", },
        { name: t("navigation.sidebar.other.ui_elements.nested.buttons"), path: "/buttons", },
        { name: "Buttons Customize", path: "/buttons-customize", },
        { name: t("navigation.sidebar.other.ui_elements.nested.images"), path: "/images", },
        { name: t("navigation.sidebar.other.ui_elements.nested.videos"), path: "/videos", },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: t("navigation.sidebar.other.authentication.title"),
      subItems: [
        { name: t("navigation.sidebar.other.authentication.nested.sign_in"), path: "/signin", },
        { name: t("navigation.sidebar.other.authentication.nested.sing_up"), path: "/signup", },
        { name: "Authenticate Inspector", path: "/authenticate", },
      ],
    },
    {
      icon: <LockIcon />,
      name: "Security & Error",
      subItems: [
        { name: "Error Boundaries", path: "/security/error-boundaries", },
        { name: "Loading & Skeletons", path: "/security/loading-system", },
        { name: "Security Alert", path: "/security/security-alerts", },
        { name: "Offline Handling", path: "/security/offline-state", },
      ],
    },
  ], [t]);

  const archivesItems: NavItem[] = [
    {
      icon: <BoxCubeIcon />,
      name: "Case Management",
      subItems: [
        { name: "Case History", path: "/kanban", },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: "Workflow",
      subItems: [
        { name: "Workflow Builder v0.1.0", path: "/workflow/editor/v1", },
      ],
    },
  ];

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "menu" | "others" | "archives";
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
    ["main", "menu", "others", "archives"].forEach((menuType) => {
      const items = menuType === "main" ?  mainItems : menuType === "menu" ? navItems : menuType === "others" ? othersItems : archivesItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((subItem) => {
            if (isActive(subItem.path)) {
              setOpenSubmenu({
                type: menuType as "main" | "menu" | "others" | "archives",
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

  const handleSubmenuToggle = (index: number, menuType: "main" | "menu" | "others" | "archives") => {
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

  const renderMenuItems = (items: NavItem[], menuType: "main" | "menu" | "others" | "archives") => (
    <ul className="flex flex-col gap-4">
      {items.map((nav, index) => (
        (nav.permission || isSystemAdmin) && (
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
                    (subItem.permission || isSystemAdmin) && (
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
                    )
                  ))}
                </ul>
              </div>
            )}
          </li>
        )
      ))}
    </ul>
  );

  return (
    <aside
      className={`
        fixed mt-16 flex flex-col lg:mt-0 top-0 px-5 left-0 bg-white dark:bg-gray-900 dark:border-gray-800 text-gray-900 h-screen transition-all duration-300 ease-in-out z-50 border-r border-gray-200 
        pb-38 lg:pb-24
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
      {(isExpanded || isHovered || isMobileOpen) && isSystemAdmin ? (
        <div className="absolute bottom-16 lg:bottom-0 left-0 p-6 w-full bg-white dark:bg-gray-900 z-100">
          <button
            onClick={() => handleMenuDisplay()}
            className="rounded-full p-3 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-900"
            title="Show / Hide Template Menu"
          >
            <PencilIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}
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
            {isSystemAdmin && (
              <>
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
                <div className={`mb-6 ${menuDisplay}`}>
                  <h2
                    className={`mb-4 text-xs uppercase flex leading-[20px] text-gray-400 ${
                      !isExpanded && !isHovered
                        ? "lg:justify-center"
                        : "justify-start"
                    }`}
                  >
                    {isExpanded || isHovered || isMobileOpen ? (
                      // "Archives"
                      "Archives"
                    ) : (
                      <HorizontaLDots />
                    )}
                  </h2>
                  {renderMenuItems(archivesItems, "archives")}
                </div>
              </>
            )}
          </div>
        </nav>
        {/* {isExpanded || isHovered || isMobileOpen ? <SidebarWidget /> : null} */}
      </div>
    </aside>
  );
};

export default AppSidebar;
