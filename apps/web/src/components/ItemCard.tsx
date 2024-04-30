'use client'
import EditableTitle from "./EditableTitle";
import { TrashIcon } from "./Icons";
import { Button } from "./ui/Button";
import { Card, CardDescription, CardFooter, CardHeader } from "./ui/Card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./ui/Tooltip";

export default function ItemCard() {
  return (
    <Card className="group">
      <CardHeader className="flex flex-col gap-1">
        <EditableTitle title="My Title" />

        <CardDescription>
          I guess we put a summary in here?
        </CardDescription>
      </CardHeader>
      <CardFooter className="flex justify-between items-center">
        <div className="text-xs leading-none text-gray-500 dark:text-gray-600">
          Created&nbsp;
          <time dateTime="2023-10-26T00:00:00Z">1 day ago</time>
        </div>

        <TooltipProvider delayDuration={0}>
          <Tooltip>
            <TooltipTrigger>
              <Button size="sm" variant="destructive">
                <TrashIcon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Delete</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardFooter>
    </Card>
  )
}
