// /src/hooks/index.ts
/**
 * Custom Hooks Library
 */

// Redux Hooks
export { useAppDispatch, useAppSelector } from "@/hooks/redux";

// Authentication Hooks
export { useAuth } from "@/hooks/useAuth";
// export { usePermissions } from "@/hooks/usePermissions";

// Data Hooks
// export { useTickets } from "@/hooks/useTickets";
// export { useWorkflows } from "@/hooks/useWorkflows";
// export { useNotifications } from "@/hooks/useNotifications";

// UI Hooks
// export { useTheme } from "@/hooks/useTheme";
export { useModal } from "@/hooks/useModal";
export { useToast } from "@/hooks/useToast";
// export { useLocalStorage } from "@/hooks/useLocalStorage";
// export { useDebounce } from "@/hooks/useDebounce";
// export { useClickOutside } from "@/hooks/useClickOutside";

// Form Hooks
// export { useForm } from "@/hooks/useForm";
// export { useFormValidation } from "@/hooks/useFormValidation";

// Utility Hooks
// export { useAsyncEffect } from "@/hooks/useAsyncEffect";
// export { usePrevious } from "@/hooks/usePrevious";
// export { useInterval } from "@/hooks/useInterval";
// export { useWebSocket } from "@/hooks/useWebSocket";
// export { useGeolocation } from "@/hooks/useGeolocation";
