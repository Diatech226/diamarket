import React, { useState, useEffect, useRef } from "react";
import { 
  Globe, 
  LayoutDashboard, 
  BarChart3, 
  Terminal, 
  ShieldAlert, 
  HelpCircle, 
  Mail,
  Search,
  Command,
  CornerDownLeft,
  X
} from "lucide-react";

type ActiveTab = "checkout" | "dashboard" | "analytics" | "developer" | "disputes" | "support" | "emails";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: ActiveTab) => void;
  activeTab: ActiveTab;
}

export default function CommandPalette({ isOpen, onClose, onSelectTab, activeTab }: CommandPaletteProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const commandItems = [
    { id: "dashboard", label: "Ledger Register & Balances", shortcut: "Alt+1", icon: LayoutDashboard, desc: "Audit double-entry ledger journals and system balances" },
    { id: "checkout", label: "Checkout Simulator", shortcut: "Alt+2", icon: Globe, desc: "Test mobile operator pushes and checkout payment card flows" },
    { id: "analytics", label: "Analytics & Stats", shortcut: "Alt+3", icon: BarChart3, desc: "Monitor transaction clearance rates and network delays" },
    { id: "developer", label: "Developer Console", shortcut: "Alt+4", icon: Terminal, desc: "Configure webhooks, API keys, and regional SLA limits" },
    { id: "disputes", label: "Disputes Desk", shortcut: "Alt+5", icon: ShieldAlert, desc: "Manage chargeback claims, evidence, and clear held payouts" },
    { id: "support", label: "Payer Support", shortcut: "Alt+6", icon: HelpCircle, desc: "Search historic checkout receipts or report carrier downtime" },
    { id: "emails", label: "Mailer Hub", shortcut: "Alt+7", icon: Mail, desc: "Preview transactional receipts and webhook dispatch emails" },
  ] as const;

  // Filter items based on search query
  const filteredItems = commandItems.filter(item => 
    item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Focus input when palette opens
  useEffect(() => {
    if (isOpen) {
      setSearchQuery("");
      setSelectedIndex(0);
      // Short timeout to ensure the DOM has updated
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Keep selected index in bounds when filtering
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery]);

  // Handle keyboard interaction within the palette
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev + 1) % filteredItems.length));
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex(prev => (filteredItems.length === 0 ? 0 : (prev - 1 + filteredItems.length) % filteredItems.length));
      } else if (e.key === "Enter") {
        e.preventDefault();
        if (filteredItems[selectedIndex]) {
          onSelectTab(filteredItems[selectedIndex].id);
          onClose();
        }
      } else if (e.key === "Escape") {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, filteredItems, selectedIndex, onSelectTab, onClose]);

  // Scroll selected item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector("[data-active='true']");
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div 
      id="command-palette-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-start justify-center pt-[12vh] p-4 transition-all duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div 
        id="command-palette-modal"
        className="bg-white w-full max-w-xl rounded-2xl border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[480px] animate-in fade-in zoom-in-95 duration-150 text-left"
      >
        {/* Search Input Area */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
          <Search className="text-slate-400 shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a tab name or command to navigate..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full text-sm text-slate-800 bg-transparent placeholder-slate-400 focus:outline-none border-none outline-none font-medium"
          />
          <div className="flex items-center gap-1.5 shrink-0 select-none">
            <kbd className="px-1.5 py-0.5 bg-slate-100 border border-slate-200 rounded text-[9px] font-bold font-mono text-slate-500 shadow-3xs uppercase">
              esc
            </kbd>
          </div>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600 transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* List of matching commands */}
        <div 
          ref={listRef}
          className="flex-1 overflow-y-auto p-2 space-y-1 divide-y divide-transparent max-h-[350px]"
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              const isActiveRoute = activeTab === item.id;
              
              return (
                <button
                  key={item.id}
                  id={`command-item-${item.id}`}
                  data-active={isSelected}
                  onClick={() => {
                    onSelectTab(item.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition duration-75 group cursor-pointer ${
                    isSelected 
                      ? "bg-indigo-600 text-white" 
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className={`p-2 rounded-lg shrink-0 ${
                      isSelected 
                        ? "bg-indigo-500 text-white" 
                        : "bg-slate-100 text-slate-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    } transition`}>
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0 text-left">
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-bold tracking-tight ${isSelected ? "text-white" : "text-slate-800"}`}>
                          {item.label}
                        </span>
                        {isActiveRoute && (
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                            isSelected 
                              ? "bg-indigo-700/60 text-indigo-100" 
                              : "bg-indigo-50 text-indigo-700 border border-indigo-100"
                          }`}>
                            Active
                          </span>
                        )}
                      </div>
                      <p className={`text-[11px] truncate mt-0.5 ${isSelected ? "text-indigo-100" : "text-slate-400"}`}>
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {isSelected && (
                      <CornerDownLeft size={12} className="opacity-70 animate-pulse text-indigo-200" />
                    )}
                    <kbd className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono tracking-wide shadow-3xs uppercase ${
                      isSelected 
                        ? "bg-indigo-700 text-indigo-100 border border-indigo-500" 
                        : "bg-slate-50 border border-slate-200 text-slate-500"
                    }`}>
                      {item.shortcut}
                    </kbd>
                  </div>
                </button>
              );
            })
          ) : (
            <div className="py-8 px-4 text-center space-y-2 select-none">
              <Command size={24} className="mx-auto text-slate-300 animate-bounce" />
              <p className="text-xs font-semibold text-slate-500">No matching tabs or actions found</p>
              <p className="text-[10px] text-slate-400">Try searching for "ledger", "payout", "developer" or "disputes".</p>
            </div>
          )}
        </div>

        {/* Footer info bar */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-[10px] text-slate-400 font-medium select-none">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-slate-200 rounded shadow-3xs font-mono text-[9px]">↑↓</kbd> Navigate
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1 bg-white border border-slate-200 rounded shadow-3xs font-mono text-[9px]">Enter</kbd> Select
            </span>
          </div>
          <span className="font-mono text-slate-500 bg-slate-200/50 px-1.5 py-0.5 rounded text-[9px] font-bold">
            ⌥ + [1-7] Direct Switch
          </span>
        </div>
      </div>
    </div>
  );
}
