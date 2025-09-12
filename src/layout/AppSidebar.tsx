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
    subItems?: {
      name: string;
      path: string;
      pro?: boolean;
      new?: boolean;
      permission?: boolean;
    }[];
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
      name: t("navigation.sidebar.main.case_management.title"),
      permission: permissions.hasAnyPermission([
        "case.create", "case.assign", "case.view_history",
      ]),
      subItems: [
        {
          name: t("navigation.sidebar.main.case_management.nested.case_creation"),
          path: "/case/creation",
          permission: permissions.hasPermission("case.create"),
        },
        {
          name: t("navigation.sidebar.main.case_management.nested.creation_schedule_date"),
          path: "/case/creation_schedule_date",
          permission: permissions.hasPermission("case.create"),
        },
        {
          name: t("navigation.sidebar.main.case_management.nested.case_assignment"),
          path: "/case/assignment",
          permission: permissions.hasPermission("case.assign"),
        },
        {
          name: t("navigation.sidebar.main.case_management.nested.case_history.title"),
          path: "/case/history",
          permission: permissions.hasPermission("case.view_history"),
        },
      ],
    },
    {
      icon: <PieChartIcon />,
      name: t("navigation.sidebar.main.dashboard.title"),
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
        // {
        //   name: t("navigation.sidebar.main.dashboard.nested.analytics"),
        //   path: "/dashboard/analytics",
        //   permission: permissions.hasPermission("dashboard.view"),
        // }, // Mockup
        // {
        //   name: t("navigation.sidebar.main.dashboard.nested.call_center"),
        //   path: "/dashboard/callcenter",
        //   permission: permissions.hasPermission("dashboard.view"),
        // }, // Mockup
        // {
        //   name: t("navigation.sidebar.main.dashboard.nested.agent_status"),
        //   path: "/dashboard/agent-status",
        //   permission: permissions.hasPermission("dashboard.view"),
        // }, // Mockup
        {
          name: t("navigation.sidebar.main.dashboard.nested.service.title"),
          path: "/dashboard/service",
          permission: permissions.hasPermission("dashboard.view"),
        }, // Mockup
      ],
    },
    {
      icon: <FileIcon />,
      name: t("navigation.sidebar.main.report.title"),
      permission: permissions.hasAnyPermission([
        "report.view", "report.generate", "report.export", "report.schedule", "report.delete",
      ]),
      subItems: [
      
      ],
    },
    {
      icon: <ListIcon />,
      name: t("navigation.sidebar.main.form_builder.title"),
      permission: permissions.hasAnyPermission([
        "form.view", "form.create",
      ]),
      subItems: [
        {
          name: t("navigation.sidebar.main.form_builder.nested.form_management"),
          path: "/form-management",
          permission: permissions.hasPermission("form.view"),
        },
        {
          name: t("navigation.sidebar.main.form_builder.nested.form_builder"),
          path:"/dynamic-form",
          permission: permissions.hasPermission("form.create"),
        },
      ],
    },
    {
      icon: <BoxIcon />,
      name: t("navigation.sidebar.main.workflow.title"),
      permission: permissions.hasAnyPermission([
        "workflow.view", "workflow.create",
      ]),
      subItems: [
        {
          name: t("navigation.sidebar.main.workflow.nested.workflow_management"),
          path: "/workflow/list",
          permission: permissions.hasPermission("workflow.view"),
        },
        {
          name: t("navigation.sidebar.main.workflow.nested.workflow_builder"),
          path: "/workflow/editor/v2",
          permission: permissions.hasPermission("workflow.create"),
        },
      ],
    },
    {
      icon: <UserCircleIcon />,
      name: t("navigation.sidebar.main.user_management.title"),
      permission: permissions.hasAnyPermission([
        "user.view", "role.view", "organization.view", "auditlog.view",
      ]),
      subItems: [
        {
          name: t("navigation.sidebar.main.user_management.nested.user"),
          path: "/user",
          permission: permissions.hasPermission("user.view"),
        },
        {
          name: t("navigation.sidebar.main.user_management.nested.role_privilege"),
          path: "/role-privilege",
          permission: permissions.hasPermission("role.view"),
        },
        {
          name: t("navigation.sidebar.main.user_management.nested.organization"),
          path: "/organization",
          permission: permissions.hasPermission("organization.view"),
        },
        {
          name: t("navigation.sidebar.main.user_management.nested.audit_log"),
          path: "/auditlog",
          permission: permissions.hasPermission("auditlog.view"),
        },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: t("navigation.sidebar.main.system_configuration.title"),
      permission: permissions.hasAnyPermission([
        "service.view", "unit.view", "user.view",
      ]),
      subItems: [
        {
          name: t("navigation.sidebar.main.system_configuration.nested.service_management"),
          path: "/service",
          permission: permissions.hasPermission("service.view"),
          // subItems: [
          //   {
          //     name: "Case Types",
          //     path: "/service/case-types",
          //     permission: permissions.hasPermission("service.view"),
          //   },
          //   {
          //     name: "Case Sub-Types",
          //     path: "/service/case-sub-types",
          //     permission: permissions.hasPermission("service.view"),
          //   },
          // ]
        },
        {
          name: t("navigation.sidebar.main.system_configuration.nested.unit_management.title"),
          path: "/unit",
          permission: permissions.hasPermission("unit.view"),
        },
        {
          name: t("navigation.sidebar.main.system_configuration.nested.skill_management"),
          path: "/skill",
          permission: permissions.hasPermission("user.view"),
        },
        {
          name: t("navigation.sidebar.main.system_configuration.nested.property_management"),
          path: "/property",
          permission: permissions.hasPermission("unit.view"),
        },
        {
          name: t("navigation.sidebar.main.system_configuration.nested.area_management"),
          path: "/area",
          permission: permissions.hasPermission("service.view"),
        },
      ],
    },
  ], [permissions, t]);

  // Menu
  const navItems: NavItem[] = useMemo(() => [
    {
      icon: <GridIcon />,
      name: t("navigation.sidebar.menu.dashboard.title"),
      subItems: [
        { name: t("navigation.sidebar.menu.dashboard.nested.ecommerce"), path: "/", },
        { name: t("navigation.sidebar.menu.dashboard.nested.dashboard_framework"), path: "/dashboard", },
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
      icon: <ListIcon />,
      name: t("navigation.sidebar.menu.forms.title"),
      subItems: [
        { name: t("navigation.sidebar.menu.forms.nested.form_elements"), path: "/form-elements", },
      ],
    },
    {
      icon: <TableIcon />,
      name: t("navigation.sidebar.menu.tables.title"),
      subItems: [
        { name: t("navigation.sidebar.menu.tables.nested.basic_tables"), path: "/basic-tables", }
      ],
    },
    {
      icon: <PageIcon />,
      name: t("navigation.sidebar.menu.pages.title"),
      subItems: [
        { name: t("navigation.sidebar.menu.pages.nested.blank_page"), path: "/blank", },
        { name: t("navigation.sidebar.menu.pages.nested.404_error"), path: "/error-404", },
      ],
    },
  ], [t]);

  // Others
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
        { name: t("navigation.sidebar.other.ui_elements.nested.buttons_customize"), path: "/buttons-customize", },
        { name: t("navigation.sidebar.other.ui_elements.nested.images"), path: "/images", },
        { name: t("navigation.sidebar.other.ui_elements.nested.tabs"), path: "/tabs", },
        { name: t("navigation.sidebar.other.ui_elements.nested.videos"), path: "/videos", },
      ],
    },
    {
      icon: <PlugInIcon />,
      name: t("navigation.sidebar.other.authentication.title"),
      subItems: [
        { name: t("navigation.sidebar.other.authentication.nested.sign_in"), path: "/signin", },
        { name: t("navigation.sidebar.other.authentication.nested.sign_up"), path: "/signup", },
        { name: t("navigation.sidebar.other.authentication.nested.authenticate_inspector"), path: "/authenticate", },
      ],
    },
    {
      icon: <LockIcon />,
      name: t("navigation.sidebar.other.security.title"),
      subItems: [
        { name: t("navigation.sidebar.other.security.nested.error_boundaries"), path: "/security/error-boundaries", },
        { name: t("navigation.sidebar.other.security.nested.loading"), path: "/security/loading-system", },
        { name: t("navigation.sidebar.other.security.nested.security_alert"), path: "/security/security-alerts", },
        { name: t("navigation.sidebar.other.security.nested.offline"), path: "/security/offline-state", },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: t("navigation.sidebar.other.theme_debugger.title"),
      path: "/theme-debugger",
    },
  ], [t]);

  // Archives
  const archivesItems: NavItem[] = [
    {
      icon: <BoxCubeIcon />,
      name: t("navigation.sidebar.archives.case_management.title"),
      subItems: [
        { name: t("navigation.sidebar.archives.case_management.nested.case_history"), path: "/kanban", },
      ],
    },
    {
      icon: <BoxCubeIcon />,
      name: t("navigation.sidebar.archives.workflow.title"),
      subItems: [
        { name: t("navigation.sidebar.archives.workflow.nested.workflow_builder_v1"), path: "/workflow/editor/v1", },
      ],
    },
  ];

  const { isExpanded, isMobileOpen, isHovered, setIsHovered } = useSidebar();
  const location = useLocation();

  const [openSubmenu, setOpenSubmenu] = useState<{
    type: "main" | "menu" | "others" | "archives";
    index: number;
    subIndex?: number;
  } | null>(null);

  const [subMenuHeight, setSubMenuHeight] = useState<Record<string, number>>({});
  const subMenuRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const isActive = useCallback(
    // (path: string) => location.pathname === path,
    // (path: string) => location.pathname.startsWith(path),
    (path: string) => new RegExp(`^${path}(/|$)`).test(location.pathname),
    [location.pathname]
  );

  useEffect(() => {
    let submenuMatched = false;
    ["main", "menu", "others", "archives"].forEach((menuType) => {
      const items = menuType === "main" ?  mainItems : menuType === "menu" ? navItems : menuType === "others" ? othersItems : archivesItems;
      items.forEach((nav, index) => {
        if (nav.subItems) {
          nav.subItems.forEach((
            subItem,
            subIndex
          ) => {
            if (
              subItem.path && 
              isActive(subItem.path)
            ) {
              setOpenSubmenu({
                type: menuType as "main" | "menu" | "others" | "archives",
                index,
              });
              submenuMatched = true;
            }
            else if (subItem.subItems) {
              subItem.subItems.forEach((subSubItem) => {
                if (isActive(subSubItem.path)) {
                  setOpenSubmenu({
                    type: menuType as "main" | "menu" | "others" | "archives",
                    index,
                    subIndex,
                  });
                  submenuMatched = true;
                }
              });
            }
          });
        }
      });
    });

    if (!submenuMatched) {
      setOpenSubmenu(null);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    location,
    // mainItems,
    // navItems,
    // othersItems,
    // archivesItems,
    isActive
  ]);

  useEffect(() => {
    if (openSubmenu !== null) {
      const key = `${openSubmenu.type}-${openSubmenu.index}`;
      const subKey = openSubmenu.subIndex !== undefined ? `${key}-${openSubmenu.subIndex}` : null;

      if (subMenuRefs.current[key]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [key]: subMenuRefs.current[key]?.scrollHeight || 0,
        }));
      }

      if (subKey && subMenuRefs.current[subKey]) {
        setSubMenuHeight((prevHeights) => ({
          ...prevHeights,
          [subKey]: subMenuRefs.current[subKey]?.scrollHeight || 0,
        }));
      }
    }
  }, [openSubmenu]);

  const handleSubmenuToggle = (
    index: number,
    menuType: "main" | "menu" | "others" | "archives",
    subIndex?: number
  ) => {
    setOpenSubmenu((prevOpenSubmenu) => {
      if (
        prevOpenSubmenu
        && prevOpenSubmenu.type === menuType
        && prevOpenSubmenu.index === index
        && prevOpenSubmenu.subIndex === subIndex
      ) {
        // return null;
        if (subIndex === undefined) {
          return null;
        }
        else {
          return { type: menuType, index };
        }
      }
      return {
        type: menuType,
        index,
        subIndex
      };
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
                  {nav.subItems.map((
                    subItem,
                    subIndex
                  ) => (
                    (subItem.permission || isSystemAdmin) && (
                      <li key={subItem.name}>
                        {subItem.subItems ? (
                          <>
                            <button
                              onClick={() => handleSubmenuToggle(index, menuType, subIndex)}
                              className={`menu-dropdown-item cursor-pointer flex items-center justify-between w-full ${
                                openSubmenu?.type === menuType && 
                                openSubmenu?.index === index && 
                                openSubmenu?.subIndex === subIndex
                                  ? "menu-dropdown-item-active"
                                  : "menu-dropdown-item-inactive"
                              }`}
                            >
                              <span>{subItem.name}</span>
                              <div className="flex items-center gap-1">
                                <span className="flex items-center gap-1">
                                  {subItem.new && (
                                    <span
                                      className={`${
                                        openSubmenu?.type === menuType && 
                                        openSubmenu?.index === index && 
                                        openSubmenu?.subIndex === subIndex
                                          ? "menu-dropdown-badge-active"
                                          : "menu-dropdown-badge-inactive"
                                      } menu-dropdown-badge`}
                                    >
                                      new
                                    </span>
                                  )}
                                  {subItem.pro && (
                                    <span
                                      className={`${
                                        openSubmenu?.type === menuType && 
                                        openSubmenu?.index === index && 
                                        openSubmenu?.subIndex === subIndex
                                          ? "menu-dropdown-badge-active"
                                          : "menu-dropdown-badge-inactive"
                                      } menu-dropdown-badge`}
                                    >
                                      pro
                                    </span>
                                  )}
                                </span>
                                <ChevronDownIcon
                                  className={`w-4 h-4 transition-transform duration-200 ${
                                    openSubmenu?.type === menuType &&
                                    openSubmenu?.index === index &&
                                    openSubmenu?.subIndex === subIndex
                                      ? "rotate-180 text-brand-500"
                                      : ""
                                  }`}
                                />
                              </div>
                            </button>
                            
                            {/* Third Level Menu */}
                            <div
                              ref={(el) => {
                                subMenuRefs.current[`${menuType}-${index}-${subIndex}`] = el;
                              }}
                              className="overflow-hidden transition-all duration-300"
                              style={{
                                height:
                                  openSubmenu?.type === menuType && 
                                  openSubmenu?.index === index && 
                                  openSubmenu?.subIndex === subIndex
                                    ? `${subMenuHeight[`${menuType}-${index}-${subIndex}`]}px`
                                    : "0px",
                              }}
                            >
                              <ul className="mt-1 space-y-1 ml-4 border-gray-200 dark:border-gray-700 pl-4">
                                {subItem.subItems.map((subSubItem) => (
                                  (subSubItem.permission || isSystemAdmin) && (
                                    <li key={subSubItem.name}>
                                      <Link
                                        to={subSubItem.path}
                                        className={`block px-3 py-2 text-sm rounded-md transition-colors ${
                                          isActive(subSubItem.path)
                                            ? "bg-brand-100 text-brand-600 dark:bg-brand-900 dark:text-brand-300"
                                            : "text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"
                                        }`}
                                      >
                                        <span className="flex items-center justify-between">
                                          {subSubItem.name}
                                          <span className="flex items-center gap-1">
                                            {subSubItem.new && (
                                              <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                                  isActive(subSubItem.path)
                                                    ? "bg-brand-200 text-brand-700 dark:bg-brand-800 dark:text-brand-200"
                                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                }`}
                                              >
                                                new
                                              </span>
                                            )}
                                            {subSubItem.pro && (
                                              <span
                                                className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${
                                                  isActive(subSubItem.path)
                                                    ? "bg-brand-200 text-brand-700 dark:bg-brand-800 dark:text-brand-200"
                                                    : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-300"
                                                }`}
                                              >
                                                pro
                                              </span>
                                            )}
                                          </span>
                                        </span>
                                      </Link>
                                    </li>
                                  )
                                ))}
                              </ul>
                            </div>
                          </>
                        ) : (
                          subItem.path && (
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
                          )
                        )}

                        {/*
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
                        */}
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
                src="/images/logo/logo-dark.png"
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
