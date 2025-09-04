import "@/App.css";
import { Fragment } from "react/jsx-runtime";
import { Outlet, createRootRoute } from "@tanstack/react-router";

import Sidebar from "@/components/layout/Sidebar";
import Inspector from "@/components/layout/Inspector";


export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {


  return (
    <Fragment>
      {/* HEADER */}
      {/* <Header/> */}

      <Sidebar />

      {/* CONTENT */}
      <main className="main flex flex-col bg-[#18191c]">
        <Outlet />
      </main>

      <Inspector />
    </Fragment>
  );
}
