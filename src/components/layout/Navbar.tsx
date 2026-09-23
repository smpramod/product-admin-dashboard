"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  Package, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  User as UserIcon, 
  Sparkles 
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

export function Navbar() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLoginPage = pathname === "/login";

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/85 backdrop-blur-md transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <Link 
              href="/products" 
              className="flex items-center gap-2.5 font-bold text-slate-900 group transition"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 text-white shadow-md shadow-indigo-500/20 group-hover:scale-105 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-extrabold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent font-display">
                  AdminPulse
                </span>
                <span className="text-[10px] uppercase font-semibold tracking-wider text-indigo-600">
                  Product Manager
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            {!isLoginPage && isAuthenticated && (
              <nav className="hidden md:flex items-center space-x-1 pl-4 border-l border-slate-200">
                <Link
                  href="/products"
                  className={cn(
                    "flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all",
                    pathname.startsWith("/products")
                      ? "bg-indigo-50 text-indigo-700 font-semibold"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  )}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Products
                </Link>
              </nav>
            )}
          </div>

          {/* Right Action Area */}
          <div className="flex items-center gap-3">
            {isLoginPage ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 bg-slate-100/80 px-3 py-1.5 rounded-full border border-slate-200">
                <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                <span>DummyJSON Powered</span>
              </div>
            ) : isAuthenticated && user ? (
              <div className="flex items-center gap-3">
                {/* User Info Capsule */}
                <div className="hidden sm:flex items-center gap-2.5 pr-2 border-r border-slate-200">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.firstName || "User"}
                      className="h-8 w-8 rounded-full border border-indigo-200 object-cover bg-slate-100"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center font-bold text-xs">
                      {user.firstName ? user.firstName[0] : <UserIcon className="h-4 w-4" />}
                    </div>
                  )}
                  <div className="text-left leading-tight">
                    <p className="text-xs font-semibold text-slate-800">
                      {user.firstName ? `${user.firstName} ${user.lastName || ""}` : user.username}
                    </p>
                    <p className="text-[10px] text-slate-500 truncate max-w-[120px]">
                      {user.email || `@${user.username}`}
                    </p>
                  </div>
                </div>

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-600 bg-rose-50 hover:bg-rose-100 active:scale-95 transition-all border border-rose-200/60"
                  title="Sign out of AdminPulse"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Logout</span>
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                  aria-label="Toggle Navigation Menu"
                >
                  {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-indigo-700 transition"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && !isLoginPage && isAuthenticated && (
        <div className="md:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-2 animate-slide-down">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium",
              pathname.startsWith("/products")
                ? "bg-indigo-50 text-indigo-700 font-semibold"
                : "text-slate-600 hover:bg-slate-50"
            )}
          >
            <LayoutDashboard className="h-4 w-4" />
            Products Dashboard
          </Link>
        </div>
      )}
    </header>
  );
}
