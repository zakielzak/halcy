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
   
        {/* HEADER */}
        {/* <Header/> */}

        <Sidebar />

        {/* CONTENT */}
        <Outlet />

        <Inspector />
      
    </Fragment>
  );
}
