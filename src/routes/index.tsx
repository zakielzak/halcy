import ImagesGallery from '@/components/layout/ImagesGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Filter, Grid, Grid2X2, Layout, Minus, Plus, Zap } from 'lucide-react';

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="main bg-neutral-900  w-full ">
      <div
        className="px-3.5 h-13 flex gap-1 items-center justify-between "
        data-tauri-drag-region
      >
        <div className="flex pb-1 items-center">
          <div className="flex gap-1">
            <Button variant="ghost" size="icon">
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight size={18} />
            </Button>
          </div>

          <span className="text-xs font-medium">Folder</span>
        </div>

        <div className="flex w-[130px] gap-1.5">
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
          <Input className="h-7" />
        </div>
      </div>

      <ImagesGallery />
    </div>
  ); 
}
