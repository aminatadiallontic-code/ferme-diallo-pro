import { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface SidebarContextType {
  isOpen: boolean;
  toggle: () => void;
  close: () => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function MobileSidebarProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  const toggle = useCallback(() => setIsOpen(prev => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);

  return (
    <SidebarContext.Provider value={{ isOpen, toggle, close }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useMobileSidebar() {
  const context = useContext(SidebarContext);
  // Return no-op defaults if not inside provider (e.g., Login page)
  if (!context) {
    return { isOpen: false, toggle: () => {}, close: () => {} };
  }
  return context;
}
