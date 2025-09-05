import { ReactNode, useState } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Plus, Minus, Zap, Layout, Filter, ArrowDown, ArrowUp } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";
import { updateFolder } from "@/lib/db";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useLibrary } from "@/hooks/useLibrary";
import { useFolders } from "@/hooks/useFolders";

type Props = {
  title: string;
  children: ReactNode;
  folderId: string | undefined;
};

export const GalleryLayout = ({ title, children, folderId }: Props) => {
  const { rootDir } = useLibrary();
  const dbPath = `${rootDir}/library.db`;
  const queryClient = useQueryClient();
  const { data: folderTree } = useFolders(dbPath);
  // Obtiene los valores de ordenamiento iniciales de la carpeta
  const initialOrderBy =
    (folderId && folderTree?.[folderId]?.order_by) || "imported_date";
  const initialIsAscending =
    folderId && typeof folderTree?.[folderId]?.is_ascending === "number"
      ? folderTree[folderId].is_ascending === 1
      : true;

  // Usa el estado local para rastrear el orden actual
  const [currentOrderBy, setCurrentOrderBy] = useState(initialOrderBy);
  const [isAscending, setIsAscending] = useState(initialIsAscending);

  const mutation = useMutation({
    mutationFn: (variables: { orderBy: string; isAscending: boolean }) =>
      updateFolder(
        dbPath,
        folderId as string,
        variables.orderBy,
        variables.isAscending
      ),
    onSuccess: () => {
      // Invalida la caché de imágenes para que se re-ejecuten todas las consultas.
      queryClient.invalidateQueries({ queryKey: ["images"] });
      // Invalida la caché de carpetas para que refleje el nuevo orden guardado.
      queryClient.invalidateQueries({ queryKey: ["folders"] });
    },
  });

  const handleSortChange = (newOrderBy: string) => {
    if (!folderId) return;
    setCurrentOrderBy(newOrderBy);
    mutation.mutate({ orderBy: newOrderBy, isAscending });
    console.log("Sort change:", newOrderBy);
  };

  const handleDirectionChange = (newIsAscending: boolean) => {
    if (!folderId) return;
    setIsAscending(newIsAscending);
    mutation.mutate({ orderBy: currentOrderBy, isAscending: newIsAscending });
    console.log("Direction change:", newIsAscending);
  };

  // Seccion de ordenamiento en el Popover
  const renderSortControls = () => {
    // Si es un filtro de sistema, deshabilita el ordenamiento persistente
    const isDisabled = !folderId;

    return (
      <>
        <div className="flex justify-between items-center">
          <div>Order by</div>
          <Select onValueChange={handleSortChange} disabled={isDisabled}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Date Added" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="imported_date">Date Added</SelectItem>
                <SelectItem value="modified_date">Date Modified</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="extension">Extension</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div className="flex justify-between items-center mt-2">
          <div>Direction</div>
          <div className="flex gap-1">
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleDirectionChange(true)}
              disabled={isDisabled}
            >
              <ArrowUp size={16} />
            </Button>
            <Button
              size="icon"
              variant="outline"
              onClick={() => handleDirectionChange(false)}
              disabled={isDisabled}
            >
              <ArrowDown size={16} />
            </Button>
          </div>
        </div>
      </>
    );
  };

  return (
    <>
      <header
        className="px-3.5 h-13 flex items-center justify-between"
        data-tauri-drag-region
      >
        <div className="flex items-center h-full">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/8 hover:text-white"
          >
            <ChevronLeft size={22} strokeWidth={1.5} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/8 hover:text-white"
            disabled
          >
            <ChevronRight size={22} strokeWidth={1.5} />
          </Button>
          <span className="text-xs font-medium ml-1">{title}</span>
        </div>

        <div className="flex w-[160px] gap-1.5 h-full items-center">
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/8 hover:text-white text-neutral-500"
          >
            <Minus size={13} />
          </Button>
          <Slider defaultValue={[0]} max={100} step={1} />
          <Button
            variant="ghost"
            size="icon"
            className="hover:bg-white/8 hover:text-white text-neutral-500"
          >
            <Plus size={13} />
          </Button>
        </div>

        <div className="flex gap-2 items-center">
          <div className="flex gap-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Layout size={16} />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[200px] p-2">
                <div className="flex flex-col gap-2">
                 
                  <Separator />
                  {renderSortControls()}
                </div>
              </PopoverContent>
            </Popover>
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
};

/* type Props = { title: string; children: ReactNode}

export const GalleryLayout = ({ title, children }: Props) => (
  <>
    <header
      className="px-3.5 h-13 flex items-center justify-between "
      data-tauri-drag-region
    >
      <div className="flex items-center h-full">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/8 hover:text-white"
        >
          <ChevronLeft size={22} strokeWidth={1.5} />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/8 hover:text-white"
          disabled
        >
          <ChevronRight size={22} strokeWidth={1.5} />
        </Button>
        <span className="text-xs font-medium ml-1">{title}</span>
      </div>

      <div className="flex w-[160px] gap-1.5 h-full items-center">
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/8 hover:text-white text-neutral-500"
        >
          <Minus size={13} />
        </Button>
        <Slider defaultValue={[0]} max={100} step={1} />
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-white/8 hover:text-white text-neutral-500"
        >
          <Plus size={13} />
        </Button>
      </div>

      <div className="flex gap-2 items-center">
        <div className="flex gap-1">
       
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Zap size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div>Actions</div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon">
                <Layout size={16} />
              </Button>
            </PopoverTrigger>
            <PopoverContent>
              <div className="flex justify-between items-center">
                <div>Layout</div>
                <select name="" id="">
                  <option value="grid">Grid</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <div>Thumbnail</div>
                <select name="" id="">
                  <option value="speed">Speed</option>
                </select>
              </div>
              <Separator className="w-full" />
              <Select>
                <div className="flex justify-between items-center">
                  <div>Order by</div>
                  <SelectTrigger>
                    <SelectValue placeholder="Date Added" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="apple">Date Modified</SelectItem>
                      <SelectItem value="banana">Date Created</SelectItem>
                      <SelectItem value="blueberry">Title</SelectItem>
                      <SelectItem value="grapes">Extension</SelectItem>
                      <SelectItem value="pineapple">Dimensions</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </div>
              </Select>

              <Separator className="w-full" />
              <div className="flex justify-between items-center">
                <div>Order by</div>
                <select name="" id="">
                  <option value="Date Added">Date Added</option>
                </select>
              </div>
              <div className="flex justify-between items-center">
                <div>Order by</div>
                <select name="" id="">
                  <option value="Date Added">Date Added</option>
                </select>
              </div>
              <Button className="w-full mt-2" variant="outline">
                Refresh
              </Button>
            </PopoverContent>
          </Popover>

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
); */