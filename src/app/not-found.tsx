import { HouseIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

export default function NotFound() {
  return (
    <div className="container py-16">
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <HouseIcon />
          </EmptyMedia>
          <EmptyTitle>Page not found</EmptyTitle>
          <EmptyDescription>Like a fake listing — it isn’t really there.</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button render={<Link href="/search" />}>Browse verified homes</Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
