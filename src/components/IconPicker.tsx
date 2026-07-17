import {
  KeyRound, Lock, Unlock, Shield, ShieldCheck, ShieldAlert, ShieldOff,
  Code, Code2, Terminal, Bug, GitBranch, GitMerge, Braces, Hash,
  File, FileCode, FileJson, FileText, Folder, FolderOpen, Archive, BookOpen,
  Globe, Network, Link, Link2, Plug, Server, Database, Cloud,
  User, Users, UserCheck, UserCog, Building2,
  Bell, Mail, MessageSquare, Send, Inbox, MessageCircle,
  BarChart2, Activity, TrendingUp, PieChart, DollarSign, Wallet, CreditCard, PiggyBank,
  Copy, Download, Upload, Share2, RefreshCw, Trash2, Pencil, Plus,
  CheckCircle, AlertTriangle, AlertCircle, Info, Star, Heart, Zap, Sparkles, Smile, ThumbsUp,
  Clock, Calendar, Timer, History,
  Settings, Settings2, Filter, Sliders,
  Home, Search, Compass, Map, MapPin, Plane, Navigation,
  Cpu, Layers, Package, Tag, Bookmark, Brain, Bot, FlaskConical, Wrench, Rocket,
  Gamepad2, Dice1, Joystick, Music, Video, Camera, Image, ShoppingCart, ShoppingBag,
  type LucideIcon,
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { useState, useMemo } from 'react';

const ICON_MAP = {
  // Keys & Security
  KeyRound, Lock, Unlock, Shield, ShieldCheck, ShieldAlert, ShieldOff,
  // Code & Development
  Code, Code2, Terminal, Bug, GitBranch, GitMerge, Braces, Hash,
  // Files & Documents
  File, FileCode, FileJson, FileText, Folder, FolderOpen, Archive, BookOpen,
  // Network & API
  Globe, Network, Link, Link2, Plug, Server, Database, Cloud,
  // Users & Identity
  User, Users, UserCheck, UserCog, Building2,
  // Communication & Email
  Bell, Mail, MessageSquare, Send, Inbox, MessageCircle,
  // Finance & Money
  DollarSign, Wallet, CreditCard, PiggyBank, BarChart2, TrendingUp, PieChart, Activity,
  // Games & Entertainment
  Gamepad2, Dice1, Joystick, Music, Video, Camera, Image,
  // Shopping
  ShoppingCart, ShoppingBag,
  // Social & Sharing
  Heart, Smile, ThumbsUp, Share2,
  // Actions
  Copy, Download, Upload, RefreshCw, Trash2, Pencil, Plus,
  // Status & Indicators
  CheckCircle, AlertTriangle, AlertCircle, Info, Star, Zap, Sparkles,
  // Time
  Clock, Calendar, Timer, History,
  // Settings & Config
  Settings, Settings2, Filter, Sliders,
  // Navigation & Travel
  Home, Search, Compass, Map, MapPin, Plane, Navigation,
  // Tech & Creative
  Cpu, Layers, Package, Tag, Bookmark, Brain, Bot, FlaskConical, Wrench, Rocket,
} as const;

export type IconName = keyof typeof ICON_MAP;
export const ICON_NAMES = Object.keys(ICON_MAP) as IconName[];

const ICON_CATEGORIES = {
  'Keys & Security': ['KeyRound', 'Lock', 'Unlock', 'Shield', 'ShieldCheck', 'ShieldAlert', 'ShieldOff'],
  'Code & Development': ['Code', 'Code2', 'Terminal', 'Bug', 'GitBranch', 'GitMerge', 'Braces', 'Hash'],
  'Files & Documents': ['File', 'FileCode', 'FileJson', 'FileText', 'Folder', 'FolderOpen', 'Archive', 'BookOpen'],
  'Network & API': ['Globe', 'Network', 'Link', 'Link2', 'Plug', 'Server', 'Database', 'Cloud'],
  'Users & Identity': ['User', 'Users', 'UserCheck', 'UserCog', 'Building2'],
  'Communication & Email': ['Bell', 'Mail', 'MessageSquare', 'Send', 'Inbox', 'MessageCircle'],
  'Finance & Money': ['DollarSign', 'Wallet', 'CreditCard', 'PiggyBank', 'BarChart2', 'TrendingUp', 'PieChart', 'Activity'],
  'Games & Entertainment': ['Gamepad2', 'Dice1', 'Joystick', 'Music', 'Video', 'Camera', 'Image'],
  'Shopping': ['ShoppingCart', 'ShoppingBag'],
  'Social & Sharing': ['Heart', 'Smile', 'ThumbsUp', 'Share2'],
  'Actions': ['Copy', 'Download', 'Upload', 'RefreshCw', 'Trash2', 'Pencil', 'Plus'],
  'Status & Indicators': ['CheckCircle', 'AlertTriangle', 'AlertCircle', 'Info', 'Star', 'Zap', 'Sparkles'],
  'Time': ['Clock', 'Calendar', 'Timer', 'History'],
  'Navigation & Travel': ['Home', 'Search', 'Compass', 'Map', 'MapPin', 'Plane', 'Navigation'],
  'Tech & Creative': ['Cpu', 'Layers', 'Package', 'Tag', 'Bookmark', 'Brain', 'Bot', 'FlaskConical', 'Wrench', 'Rocket'],
  'Settings & Config': ['Settings', 'Settings2', 'Filter', 'Sliders'],
};

export function getIcon(name: string): LucideIcon | null {
  return (ICON_MAP as Record<string, LucideIcon>)[name] ?? null;
}

interface IconPickerProps {
  value: string;
  onChange: (name: string) => void;
}

export function IconPicker({ value, onChange }: IconPickerProps) {
  const [search, setSearch] = useState('');

  const filteredCategories = useMemo(() => {
    if (!search) return ICON_CATEGORIES;

    const filtered: Record<string, string[]> = {};
    const searchLower = search.toLowerCase();

    for (const [category, icons] of Object.entries(ICON_CATEGORIES)) {
      const filteredIcons = icons.filter(n => n.toLowerCase().includes(searchLower));
      if (filteredIcons.length > 0) {
        filtered[category] = filteredIcons;
      }
    }
    return filtered;
  }, [search]);

  return (
    <div className="flex flex-col gap-2 w-full">
      <div className="relative">
        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        <Input
          placeholder="Search icons..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="h-7 pl-8"
        />
      </div>
      <div className="max-h-40 overflow-y-auto space-y-2 w-full -mx-2 px-2">
        {Object.entries(filteredCategories).map(([category, icons]) => (
          <div key={category}>
            <h4 className="text-xs font-semibold text-muted-foreground mb-1 px-1">{category}</h4>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(2rem, 1fr))' }}>
              {icons.map(name => {
                const Icon = getIcon(name);
                if (!Icon) return null;
                return (
                  <Button
                    key={name}
                    variant={value === name ? 'default' : 'ghost'}
                    size="icon-sm"
                    title={name}
                    onClick={() => onChange(name)}
                  >
                    <Icon className="size-5" />
                  </Button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
