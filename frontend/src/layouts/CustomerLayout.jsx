import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from '../components/common/Navbar'
import Footer from '../components/common/Footer'

export default function CustomerLayout() {
  return (
    <div className="min-h-[100dvh] w-full max-w-full overflow-x-clip flex flex-col bg-kravo-cream text-kravo-dark selection:bg-kravo-orange selection:text-white">
      <Navbar />
      <main className="flex-1 w-full min-w-0">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
