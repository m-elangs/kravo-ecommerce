import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function CustomerLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-kravo-cream text-kravo-dark selection:bg-kravo-orange selection:text-white">
      <Navbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
