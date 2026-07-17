import React from 'react';
import { Outlet } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import CategoryNav from './CategoryNav';

export default function Layout() {
  return (
    <div className="app-layout">
      <Header />
      <CategoryNav />
      <main className="main-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
