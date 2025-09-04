import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Plus, Minus, Zap, Layout, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";

type Props = { title: string; children: ReactNode}

export const GalleryLayout = ({ title, children}: Props) => (
     <>
       <header
         className="px-3.5 h-15 flex items-center justify-between"
         data-tauri-drag-region
       >
         <div className="flex items-center gap-2">
           <Button variant="ghost" size="icon">
             <ChevronLeft size={18} />
           </Button>
           <Button variant="ghost" size="icon">
             <ChevronRight size={18} />
           </Button>
           <span className="text-xs font-medium">{title}</span>
         </div>

         <div className="flex w-[160px] gap-1.5">
           <Button variant="ghost" size="icon">
             <Plus size={13} />
           </Button>
           <Slider defaultValue={[33]} max={100} step={1} />
           <Button variant="ghost" size="icon">
             <Minus size={13} />
           </Button>
         </div>

         <div className="flex gap-2 items-center">
           <div className="flex gap-1">
             <Button variant="ghost" size="icon">
               <Zap size={16} />
             </Button>
             <Button variant="ghost" size="icon">
               <Layout size={16} />
             </Button>
             <Button variant="ghost" size="icon">
               <Filter size={16} />
             </Button>
           </div>
           <Input
             className="h-7 placeholder:font-medium placeholder:text-xs"
             placeholder="Search"
           />
         </div>
       </header>
       {children}
     </>
);