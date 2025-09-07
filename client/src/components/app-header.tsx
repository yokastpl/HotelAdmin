import { Link } from "wouter";
import { Building, Wifi, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AppHeader() {
  return (
    <nav className="bg-white shadow-sm p-4">
      <div className="flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center no-underline">
          <Building className="w-6 h-6 inline-block mr-2 text-primary" />
          <span className="font-bold text-primary">HotelMax</span>
        </Link>
        <div className="flex items-center">
          <Badge variant="secondary" className="mr-2 bg-success text-white">
            <Wifi className="w-3 h-3 mr-1" />
            Online
          </Badge>
          <Link href="/company-info">
            <Button variant="outline" size="sm" data-testid="button-settings">
              <Settings className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
