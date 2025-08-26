import * as React from "react";
import "@/App.css";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import ImagesGallery from "@/components/layout/ImagesGallery";
import Inspector from "@/components/layout/Inspector";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {


  return (
    <React.Fragment>
      <main className="layout select-none antialiased /*bg-[#fafafc]*/ bg-gray-700 h-screen w-screen font-outfit overflow-hidden text-white">
        {/* HEADER */}
        <Header/>

        <Sidebar/>

        <div className="main bg-neutral-900 pt-2  w-full ">
            <ImagesGallery />
        </div>

        <Inspector/>
        
      </main>
    </React.Fragment>
  );
}
