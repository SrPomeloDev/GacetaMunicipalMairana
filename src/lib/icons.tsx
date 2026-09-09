"use client"

import { type ComponentType, forwardRef } from "react"
import type { IconProps as PhosphorIconProps } from "@phosphor-icons/react"
import {
  Scroll,
  ShieldCheck as PhShieldCheck,
  ClipboardText,
  ChatTeardropDots,
  MapPin as PhMapPin,
  ArrowRight as PhArrowRight,
  ArrowLeft as PhArrowLeft,
  Buildings,
  Thermometer as PhThermometer,
  UsersThree,
  CaretRight,
  BookOpen as PhBookOpen,
  Phone as PhPhone,
  EnvelopeSimple,
  CalendarBlank,
  Bank,
  Gavel as PhGavel,
  List,
  Clock as PhClock,
  LockSimple,
  Sun as PhSun,
  Moon as PhMoon,
  Scales,
  SealCheck,
  ArrowSquareOut,
  Code,
  Newspaper as PhNewspaper,
  Megaphone as PhMegaphone,
  Camera as PhCamera,
  Images as PhImages,
  FolderOpen as PhFolderOpen,
  Eye as PhEye,
  DownloadSimple,
  MagnifyingGlass,
  PaperPlaneTilt,
  Robot,
  User as PhUser,
  ChatCircle as PhChatCircle,
  CheckCircle as PhCheckCircle,
  CurrencyDollar,
  ShareNetwork,
  Target as PhTarget,
  Chat,
  Headset as PhHeadset,
  ShieldWarning,
  Warning as PhWarning,
  House,
  Bell as PhBell,
  Printer as PhPrinter,
  Hash as PhHash,
  QrCode as PhQrCode,
  Funnel,
  Sliders,
  Shield as PhShield,
  Users as PhUsers,
  X as PhX,
  FileText as PhFileText,
  Image as PhImage,
} from "@phosphor-icons/react"

type IconComponent = ComponentType<PhosphorIconProps>

function duo(Icon: IconComponent, name: string): IconComponent {
  const Wrapped = forwardRef<SVGSVGElement, PhosphorIconProps>((props, ref) => (
    <Icon ref={ref} {...props} weight="duotone" />
  ))
  Wrapped.displayName = name
  return Wrapped as unknown as IconComponent
}

export const ScrollText = duo(Scroll, "ScrollText")
export const ShieldCheck = duo(PhShieldCheck, "ShieldCheck")
export const MessagesSquare = duo(ChatTeardropDots, "MessagesSquare")
export const MapPin = duo(PhMapPin, "MapPin")
export const ArrowRight = duo(PhArrowRight, "ArrowRight")
export const ArrowLeft = duo(PhArrowLeft, "ArrowLeft")
export const Building2 = duo(Buildings, "Building2")
export const Thermometer = duo(PhThermometer, "Thermometer")
export const UsersRound = duo(UsersThree, "UsersRound")
export const ChevronRight = duo(CaretRight, "ChevronRight")
export const BookOpen = duo(PhBookOpen, "BookOpen")
export const Phone = duo(PhPhone, "Phone")
export const Mail = duo(EnvelopeSimple, "Mail")
export const Calendar = duo(CalendarBlank, "Calendar")
export const Landmark = duo(Bank, "Landmark")
export const ImageIcon = duo(PhImage, "ImageIcon")
export const Gavel = duo(PhGavel, "Gavel")
export const Menu = duo(List, "Menu")
export const Clock = duo(PhClock, "Clock")
export const Lock = duo(LockSimple, "Lock")
export const Sun = duo(PhSun, "Sun")
export const Moon = duo(PhMoon, "Moon")
export const Scale = duo(Scales, "Scale")
export const FileCheck2 = duo(SealCheck, "FileCheck2")
export const ExternalLink = duo(ArrowSquareOut, "ExternalLink")
export const Code2 = duo(Code, "Code2")
export const Newspaper = duo(PhNewspaper, "Newspaper")
export const Megaphone = duo(PhMegaphone, "Megaphone")
export const Camera = duo(PhCamera, "Camera")
export const Images = duo(PhImages, "Images")
export const FolderOpen = duo(PhFolderOpen, "FolderOpen")
export const Eye = duo(PhEye, "Eye")
export const Download = duo(DownloadSimple, "Download")
export const Search = duo(MagnifyingGlass, "Search")
export const Send = duo(PaperPlaneTilt, "Send")
export const Bot = duo(Robot, "Bot")
export const User = duo(PhUser, "User")
export const MessageCircle = duo(PhChatCircle, "MessageCircle")
export const CheckCircle = duo(PhCheckCircle, "CheckCircle")
export const DollarSign = duo(CurrencyDollar, "DollarSign")
export const ClipboardList = duo(ClipboardText, "ClipboardList")
export const Share2 = duo(ShareNetwork, "Share2")
export const Target = duo(PhTarget, "Target")
export const MessageSquare = duo(Chat, "MessageSquare")
export const Headset = duo(PhHeadset, "Headset")
export const ShieldAlert = duo(ShieldWarning, "ShieldAlert")
export const AlertTriangle = duo(PhWarning, "AlertTriangle")
export const Home = duo(House, "Home")
export const Bell = duo(PhBell, "Bell")
export const Printer = duo(PhPrinter, "Printer")
export const Hash = duo(PhHash, "Hash")
export const QrCode = duo(PhQrCode, "QrCode")
export const Filter = duo(Funnel, "Filter")
export const SlidersHorizontal = duo(Sliders, "SlidersHorizontal")
export const Shield = duo(PhShield, "Shield")
export const Users = duo(PhUsers, "Users")
export const X = duo(PhX, "X")
export const FileText = duo(PhFileText, "FileText")
