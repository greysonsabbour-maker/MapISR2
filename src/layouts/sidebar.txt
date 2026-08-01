import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard' },
  { to: '/map', label: 'Map' },
  { to: '/trains', label: 'Trains' },
  { to: '/locomotives', label: 'Locomotives' },
  { to: '/timeline', label: 'Timeline' },
  { to: '/settings', label: 'Settings' },
];

export function Sidebar() {
  return (
    <aside className="w-64 shrink-0 border-r border-border bg-card">
      <div className="border-b border-border p-4">
        <h1 className="text-xl font-bold">MapISR</h1>
        <p className="text-sm text-muted-foreground">
          Railroad Operations
        </p>
      </div>

      <nav className="flex flex-col p-2">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            className={({ isActive }) =>
              `rounded-md px-3 py-2 transition ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'hover:bg-muted'
              }`
            }
          >
            {link.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;