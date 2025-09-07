import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { api } from "@/lib/api";
import { Building, Eye, Camera } from "lucide-react";

export default function CompanyInfo() {
  const { toast } = useToast();

  const { data: companyInfo, isLoading } = useQuery({
    queryKey: ["/api/company-info"],
    queryFn: () => api.getCompanyInfo(),
  });

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    gstNumber: "",
    logo: "",
  });

  // Update form data when company info loads
  useState(() => {
    if (companyInfo) {
      setFormData({
        name: companyInfo.name || "",
        address: companyInfo.address || "",
        phone: companyInfo.phone || "",
        email: companyInfo.email || "",
        gstNumber: companyInfo.gstNumber || "",
        logo: companyInfo.logo || "",
      });
    }
  });

  const updateCompanyInfoMutation = useMutation({
    mutationFn: (data: any) => api.updateCompanyInfo(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/company-info"] });
      toast({
        title: "Success",
        description: "Company information updated successfully!",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update company information. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      toast({
        title: "Error",
        description: "Please enter the hotel/business name.",
        variant: "destructive",
      });
      return;
    }

    updateCompanyInfoMutation.mutate({
      name: formData.name,
      address: formData.address || null,
      phone: formData.phone || null,
      email: formData.email || null,
      gstNumber: formData.gstNumber || null,
      logo: formData.logo || null,
    });
  };

  const handleLogoChange = () => {
    // Placeholder for logo upload functionality
    toast({
      title: "Feature Coming Soon",
      description: "Logo upload functionality will be available soon.",
    });
  };

  if (isLoading) {
    return <div className="text-center py-4">Loading company information...</div>;
  }

  // Set form data if not already set and company info exists
  if (companyInfo && !formData.name && companyInfo.name) {
    setFormData({
      name: companyInfo.name || "",
      address: companyInfo.address || "",
      phone: companyInfo.phone || "",
      email: companyInfo.email || "",
      gstNumber: companyInfo.gstNumber || "",
      logo: companyInfo.logo || "",
    });
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Building className="w-5 h-5 me-2" />
            Company Information
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="text-center mb-4">
              <div className="relative inline-block">
                <img 
                  src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=200&h=200" 
                  alt="Company Logo" 
                  className="rounded-circle mb-2" 
                  style={{width: "100px", height: "100px", objectFit: "cover"}}
                  data-testid="img-company-logo"
                />
              </div>
              <br />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleLogoChange}
                data-testid="button-change-logo"
              >
                <Camera className="w-4 h-4 me-2" />
                Change Logo
              </Button>
            </div>

            <div>
              <Label htmlFor="companyName">Hotel/Business Name *</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="Enter your hotel name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                data-testid="input-company-name"
              />
            </div>
            
            <div>
              <Label htmlFor="companyAddress">Address</Label>
              <Textarea
                id="companyAddress"
                rows={3}
                placeholder="Enter complete address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                data-testid="textarea-company-address"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="companyPhone">Phone</Label>
                <Input
                  id="companyPhone"
                  type="tel"
                  placeholder="Contact number"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  data-testid="input-company-phone"
                />
              </div>
              <div>
                <Label htmlFor="companyEmail">Email</Label>
                <Input
                  id="companyEmail"
                  type="email"
                  placeholder="Email address"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  data-testid="input-company-email"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="gstNumber">GST Number</Label>
              <Input
                id="gstNumber"
                type="text"
                placeholder="GSTIN (if applicable)"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value })}
                data-testid="input-gst-number"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full btn-hotel-primary"
              disabled={updateCompanyInfoMutation.isPending}
              data-testid="button-save-company-info"
            >
              <Building className="w-4 h-4 me-2" />
              {updateCompanyInfoMutation.isPending ? "Saving..." : "Save Information"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Preview Card */}
      <Card>
        <CardHeader className="bg-primary text-white">
          <CardTitle className="flex items-center">
            <Eye className="w-5 h-5 me-2" />
            Invoice Header Preview
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 text-center">
          <img 
            src="https://images.unsplash.com/photo-1564501049412-61c2a3083791?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=80&h=80" 
            alt="Hotel lobby with elegant decor" 
            className="rounded-circle mb-2" 
            style={{width: "60px", height: "60px", objectFit: "cover"}}
            data-testid="img-preview-logo"
          />
          <h5 className="mb-1" data-testid="text-preview-company-name">
            {formData.name || companyInfo?.name || "Your Hotel Name"}
          </h5>
          <p className="text-dark mb-1" data-testid="text-preview-address">
            {formData.address || companyInfo?.address || "Your hotel address will appear here"}
          </p>
          <p className="text-dark mb-0">
            <small data-testid="text-preview-contact">
              {(formData.phone || companyInfo?.phone) && (formData.email || companyInfo?.email) 
                ? `${formData.phone || companyInfo?.phone} | ${formData.email || companyInfo?.email}`
                : (formData.phone || companyInfo?.phone) || (formData.email || companyInfo?.email) || "Contact information will appear here"
              }
            </small>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
