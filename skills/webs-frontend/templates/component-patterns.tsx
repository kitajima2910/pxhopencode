// Polymorphic component
interface BoxProps<T extends React.ElementType = "div"> {
  as?: T;
  children?: React.ReactNode;
  className?: string;
}

export function Box<T extends React.ElementType = "div">({
  as,
  children,
  className,
  ...props
}: BoxProps<T> & React.ComponentPropsWithoutRef<T>) {
  const Component = as || "div";
  return <Component className={className} {...props}>{children}</Component>;
}

// Compound component pattern
interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const TabsContext = createContext<TabsContextType | null>(null);

function Tabs({ children, defaultTab }: { children: React.ReactNode; defaultTab: string }) {
  const [activeTab, setActiveTab] = useState(defaultTab);
  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className="tabs">{children}</div>
    </TabsContext.Provider>
  );
}

Tabs.List = function TabsList({ children }: { children: React.ReactNode }) {
  return <div className="tabs-list flex gap-2 border-b" role="tablist">{children}</div>;
};

Tabs.Tab = function TabsTab({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  return (
    <button
      role="tab"
      aria-selected={ctx.activeTab === value}
      className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
        ctx.activeTab === value ? "border-blue-500 text-blue-600" : "border-transparent"
      }`}
      onClick={() => ctx.setActiveTab(value)}
    >
      {children}
    </button>
  );
};

Tabs.Panel = function TabsPanel({ value, children }: { value: string; children: React.ReactNode }) {
  const ctx = useContext(TabsContext)!;
  if (ctx.activeTab !== value) return null;
  return <div role="tabpanel" className="pt-4">{children}</div>;
};
