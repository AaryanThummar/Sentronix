import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  Plus, LayoutDashboard, Shield, FileText, Settings, 
  Search, Bell, User 
} from 'lucide-react'
import DashboardPage from './pages/DashboardPage'
import ScansPage from './pages/ScansPage'
import ReportsPage from './pages/ReportsPage'
import SettingsPage from './pages/SettingsPage'

// A small wrapper for the nav links to handle active state styling
function NavLink({ to, icon: Icon, label }) {
  const location = useLocation()
  const isActive = location.pathname === to

  if (isActive) {
    return (
      <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-primary font-bold border-r-2 border-primary bg-accent-soft hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98]">
        <Icon size={20} />
        <span className="font-label-md text-label-md">{label}</span>
      </Link>
    )
  }

  return (
    <Link to={to} className="flex items-center gap-3 px-3 py-2 rounded-lg text-on-surface-variant hover:text-primary hover:bg-surface-hover transition-colors duration-200 active:scale-[0.98]">
      <Icon size={20} />
      <span className="font-label-md text-label-md">{label}</span>
    </Link>
  )
}

function AppLayout() {
  return (
    <div className="bg-background text-on-background font-body-md min-h-screen flex antialiased">
      {/* SideNavBar */}
      <nav className="hidden md:flex flex-col h-full py-6 px-4 bg-surface fixed left-0 top-0 h-screen w-64 border-r-[0.5px] border-outline-variant z-50">
        <div className="mb-8 px-2 flex items-center gap-3">
          <img alt="Sentronix Shield Logo" className="w-12 h-12 rounded-lg object-contain" src="/loooogo2.png" />
          <div>
            <h1 className="font-headline-md text-headline-md font-bold text-primary tracking-tight">SENTRONIX</h1>
            <p className="font-label-md text-label-md text-text-muted">Purple Team AI</p>
          </div>
        </div>
        
        <button className="mb-8 w-full bg-primary-container text-on-primary py-2 px-4 rounded-lg font-label-md text-label-md flex items-center justify-center gap-2 hover:bg-surface-tint transition-colors">
          <Plus size={18} />
          New Scan
        </button>
        
        <ul className="flex flex-col gap-1 w-full flex-grow">
          <li><NavLink to="/" icon={LayoutDashboard} label="Dashboard" /></li>
          <li><NavLink to="/scans" icon={Shield} label="Scans & Workers" /></li>
          <li><NavLink to="/reports" icon={FileText} label="Reports" /></li>
          <li><NavLink to="/settings" icon={Settings} label="Settings" /></li>
        </ul>
      </nav>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col md:ml-64 w-full">
        {/* TopAppBar */}
        <header className="sticky top-0 z-40 w-full bg-surface/80 backdrop-blur-md border-b-[0.5px] border-outline-variant flex items-center justify-between px-8 h-16">
          <div className="flex items-center gap-4 w-1/3">
            <h2 className="font-headline-sm text-headline-sm font-bold text-primary md:hidden">Sentronix</h2>
            <div className="hidden md:flex items-center border-[0.5px] border-outline-variant rounded-full px-3 py-1.5 bg-surface-bright focus-within:ring-2 focus-within:ring-primary/20 transition-all w-full max-w-sm">
              <Search className="text-text-muted" size={18} />
              <input className="bg-transparent border-none focus:outline-none ml-2 text-body-md text-on-surface w-full" placeholder="Search telemetry..." type="text"/>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-1">
              <Bell size={20} />
            </button>
            <button className="text-on-surface-variant hover:text-primary transition-colors focus:ring-2 focus:ring-primary/20 rounded-full p-1">
              <User size={20} />
            </button>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/scans" element={<ScansPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </div>
  )
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  )
}

export default App
