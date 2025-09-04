import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ChevronLeft, ChevronRight, Plus, Minus, Zap, Layout, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Popover, PopoverTrigger, PopoverContent } from "../ui/popover";
import { Separator } from "../ui/separator";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "../ui/select";

type Props = { title: string; children: ReactNode}

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
          {/* ACTIONS */}
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
);