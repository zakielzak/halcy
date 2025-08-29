import "@/App.css";
import { Fragment } from "react/jsx-runtime";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
import Inspector from "@/components/layout/Inspector";


export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {


  return (
    <Fragment>
      <main className="layout select-none antialiased /*bg-[#fafafc]*/ bg-gray-700 h-screen w-screen font-outfit overflow-hidden text-white">
        {/* HEADER */}
        {/* <Header/> */}

        <Sidebar/>

        {/* CONTENT */}
        <Outlet/>

        <Inspector/>
        
      </main>
    </Fragment>
  );
}
