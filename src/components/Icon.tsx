import {
  AlertCircle,
  ArrowLeft,
  ArrowUp,
  Check,
  CheckCircle,
  Copy,
  Download,
  Eye,
  EyeOff,
  History,
  Landmark,
  Lock,
  LogOut,
  Mail,
  Menu,
  MessageCircle,
  MessageSquare,
  Mic,
  Moon,
  Phone,
  RefreshCw,
  Sun,
  UserCircle,
  Wifi,
  WifiOff,
  X,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

function WhatsAppIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
      fill="currentColor"
    >
      <path d="M19.077 4.928C17.187 3.04 14.69 2 12.006 2c-5.2 0-9.436 4.227-9.44 9.43 0 1.663.434 3.29 1.26 4.72L3 22l6.006-1.57c1.376.75 2.926 1.146 4.51 1.147h.004c5.198 0 9.437-4.23 9.44-9.433.002-2.52-.98-4.89-2.883-6.777zM12.007 20.15c-1.404 0-2.784-.377-3.988-1.09l-.286-.17-3.562.934.952-3.47-.186-.297a8.206 8.206 0 0 1-1.26-4.428c.003-4.54 3.698-8.235 8.244-8.235 2.2 0 4.267.858 5.822 2.416a8.183 8.183 0 0 1 2.41 5.826c-.003 4.54-3.698 8.234-8.244 8.234zm4.518-6.164c-.247-.124-1.464-.723-1.69-.806-.228-.082-.394-.124-.56.124-.166.247-.645.806-.79.972-.148.165-.296.186-.543.062-.247-.124-1.044-.385-1.99-1.228-.735-.655-1.23-1.465-1.374-1.713-.145-.248-.015-.382.108-.505.11-.11.248-.29.372-.434.124-.145.166-.248.248-.413.083-.165.041-.31-.02-.434-.062-.124-.56-1.35-.767-1.848-.202-.485-.407-.41-.56-.418-.144-.008-.31-.01-.476-.01s-.434.062-.662.31c-.228.248-.87.85-.87 2.075s.89 2.406 1.015 2.573c.124.165 1.752 2.675 4.245 3.75.593.255 1.056.408 1.417.52.595.186 1.137.16 1.565.098.477-.07 1.464-.6 1.67-1.177.207-.577.207-1.073.145-1.177-.062-.103-.228-.165-.475-.29z" />
    </svg>
  );
}

function GoogleIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      aria-hidden="true"
    >
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

const iconMap: Record<string, LucideIcon | typeof WhatsAppIcon | typeof GoogleIcon> = {
  account_balance: Landmark,
  account_circle: UserCircle,
  arrow_back: ArrowLeft,
  arrow_upward: ArrowUp,
  autorenew: RefreshCw,
  chat_bubble: MessageCircle,
  check: Check,
  check_circle: CheckCircle,
  close: X,
  content_copy: Copy,
  dark_mode: Moon,
  error: AlertCircle,
  forum: MessageSquare,
  google: GoogleIcon,
  history: History,
  install: Download,
  light_mode: Sun,
  lock: Lock,
  logout: LogOut,
  mail: Mail,
  menu: Menu,
  mic: Mic,
  phone: Phone,
  visibility: Eye,
  visibility_off: EyeOff,
  whatsapp: WhatsAppIcon,
  wifi: Wifi,
  wifi_off: WifiOff,
};

export default function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  const Component = iconMap[name];
  if (!Component) return null;
  const size = className.match(/text-(xs|sm|base|lg|xl|2xl|3xl)/)?.[1] || "base";
  const sizeMap: Record<string, number> = {
    xs: 12,
    sm: 14,
    base: 16,
    lg: 20,
    xl: 24,
    "2xl": 28,
    "3xl": 32,
  };
  return (
    <Component
      size={sizeMap[size] || 16}
      className={className}
      aria-hidden="true"
      {...("fill" in Component ? { fill: filled ? "currentColor" : "none" } : {})}
    />
  );
}
