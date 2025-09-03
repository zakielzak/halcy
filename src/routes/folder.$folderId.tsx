import ImagesGallery from '@/components/layout/ImagesGallery';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useImages } from '@/hooks/useImages';
import { useLibrary } from '@/hooks/useLibrary';
import { createFileRoute } from '@tanstack/react-router'
import { ChevronLeft, ChevronRight, Filter, Layout, Minus, Plus, Zap } from 'lucide-react';
import { useEffect } from 'react';

export const Route = createFileRoute('/folder/$folderId')({
  component: RouteComponent,
})

function RouteComponent() {

  const { folderId } = Route.useParams();
  const { rootDir } = useLibrary();

   const { images, isLoading, isError } = useImages(
      `${rootDir}/library.db`,
      folderId
    );

    useEffect(() => {
      console.log(images);
    }, [images])


  return (
    <div className="main flex flex-col bg-[#18191c]  ">
      <div
        className="px-3.5 h-15 flex gap-1 items-center justify-between "
        data-tauri-drag-region
      >
        <div className="flex pb-1 items-center">
          <div className="flex ">
            <Button variant="ghost" size="icon">
              <ChevronLeft size={18} />
            </Button>
            <Button variant="ghost" size="icon">
              <ChevronRight size={18} />
            </Button>
          </div>

          <span className="text-xs font-medium">Folder</span>
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
      </div>

      <ImagesGallery images={images} />
    </div>
  );
}
