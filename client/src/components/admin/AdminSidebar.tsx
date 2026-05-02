import { NavLink } from "react-router-dom";

type NavItem = {
  label: string;
  path: string;
  icon?: string;
};

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/admin/dashboard" },
  { label: "Create Staff", path: "/admin/staff/create" },
  { label: "Manage Staff", path: "/admin/staff" },
  { label: "Application List", path: "/admin/applications" },
  { label: "Users", path: "/admin/users" },
];

export default function AdminSidebar() {
  return (
    <aside className="w-full border-b border-gray-200 bg-white shadow-sm lg:fixed lg:left-0 lg:top-0 lg:min-h-screen lg:w-64 lg:border-b-0 lg:border-r lg:pt-16">
      <div className="p-4">
        <div className="mb-4 px-3 lg:mb-8">
          <h2 className="text-xl font-extrabold text-gray-900">Admin Panel</h2>
          <p className="text-sm text-gray-500 mt-1">Jeevan 108</p>
        </div>
        <nav className="flex gap-2 overflow-x-auto lg:block lg:space-y-1">
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `flex shrink-0 items-center px-4 py-3 rounded-lg transition-colors ${
                  isActive
                    ? "bg-teal-50 text-teal-700 font-semibold border-l-4 border-teal-500"
                    : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <span className="text-sm">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
