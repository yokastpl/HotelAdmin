import { Link } from "wouter";
import { Building, Wifi, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AppHeader() {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm">
      <div className="container-fluid">
        <Link href="/" className="navbar-brand text-decoration-none">
          <Building className="w-6 h-6 inline-block me-2 text-primary" />
          <span className="fw-bold text-primary">HotelMax</span>
        </Link>
        <div className="d-flex align-items-center">
          <Badge variant="secondary" className="me-2 bg-success text-white">
            <Wifi className="w-3 h-3 me-1" />
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
