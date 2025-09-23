import React from "react";
import {
  Home,
  Users,
  ShieldAlert,
  BarChart3,
  Settings,
  LogOut,
} from "lucide-react";
import "./Slidebar.css";

const Slidebar: React.FC = () => {
  return (
    <div className="slidebar">
      {/* LOGO */}
      <div className="slidebar-logo">
        <ShieldAlert size={28} />
        <h2>Fraude Admin</h2>
      </div>

      {/* NAVIGATION */}
      <nav className="slidebar-nav">
        <a href="#" className="active">
          <Home size={20} />
          <span>Dashboard</span>
        </a>
        <a href="#">
          <Users size={20} />
          <span>Agentes</span>
        </a>
        <a href="#">
          <BarChart3 size={20} />
          <span>Reportes</span>
        </a>
        <a href="#">
          <ShieldAlert size={20} />
          <span>Alertas</span>
        </a>
        <a href="#">
          <Settings size={20} />
          <span>Configuración</span>
        </a>
      </nav>

      {/* FOOTER */}
      <div className="slidebar-footer">
        <a href="#">
          <LogOut size={20} />
          <span>Salir</span>
        </a>
      </div>
    </div>
  );
};

export default Slidebar;
