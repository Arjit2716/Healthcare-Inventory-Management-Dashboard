"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Building2, User, Mail, Phone, MapPin } from "lucide-react";
import { createSupplierSchema, type CreateSupplierInput } from "@/validations/supplier.schema";
import { Button }   from "@/components/ui/button";
import { Input }    from "@/components/ui/input";
import { Label }    from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast }    from "@/hooks/use-toast";
import type { Supplier } from "@/types";

interface SupplierFormProps {
  supplier?: Supplier | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function SupplierForm({ supplier, onSuccess, onCancel }: SupplierFormProps) {
  const isEditing = !!supplier;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateSupplierInput>({
    resolver: zodResolver(createSupplierSchema),
    defaultValues: {
      name:          supplier?.name          ?? "",
      contactPerson: supplier?.contactPerson ?? "",
      email:         supplier?.email         ?? "",
      phone:         supplier?.phone         ?? "",
      address:       supplier?.address       ?? "",
    },
  });

  useEffect(() => {
    if (supplier) {
      reset({
        name:          supplier.name,
        contactPerson: supplier.contactPerson,
        email:         supplier.email,
        phone:         supplier.phone,
        address:       supplier.address,
      });
    }
  }, [supplier, reset]);

  const onSubmit = async (data: CreateSupplierInput) => {
    const url    = isEditing ? `/api/suppliers/${supplier.id}` : "/api/suppliers";
    const method = isEditing ? "PUT" : "POST";

    try {
      const res  = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json();

      if (!res.ok) {
        if (res.status === 409) {
          toast.error("Duplicate email", "A supplier with this email already exists.");
        } else {
          toast.error(
            isEditing ? "Update failed" : "Creation failed",
            json.error ?? "Please check your inputs."
          );
        }
        return;
      }

      toast.success(
        isEditing ? "Supplier updated" : "Supplier created",
        isEditing ? `${data.name} has been updated.` : `${data.name} has been added.`
      );
      onSuccess();
    } catch {
      toast.error("Network error", "Please check your connection.");
    }
  };

  const fields = [
    {
      id: "name",          label: "Company name",      icon: Building2,
      placeholder: "e.g. MedSupply Corp",              type: "text",
      error: errors.name?.message,
    },
    {
      id: "contactPerson", label: "Contact person",    icon: User,
      placeholder: "e.g. Dr. Jane Smith",              type: "text",
      error: errors.contactPerson?.message,
    },
    {
      id: "email",         label: "Email address",     icon: Mail,
      placeholder: "contact@supplier.com",              type: "email",
      error: errors.email?.message,
    },
    {
      id: "phone",         label: "Phone number",      icon: Phone,
      placeholder: "+1 (555) 000-0000",                type: "tel",
      error: errors.phone?.message,
    },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col">
      <div className="max-h-[60vh] overflow-y-auto p-6 space-y-4">
        {fields.map(({ id, label, icon: Icon, placeholder, type, error }) => (
          <div key={id} className="space-y-1.5">
            <Label htmlFor={id}>
              <span className="flex items-center gap-1.5">
                <Icon className="h-3 w-3 text-slate-500" />
                {label} *
              </span>
            </Label>
            <Input
              id={id}
              type={type}
              placeholder={placeholder}
              error={error}
              {...register(id as keyof CreateSupplierInput)}
            />
          </div>
        ))}

        {/* Address textarea */}
        <div className="space-y-1.5">
          <Label htmlFor="address">
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3 w-3 text-slate-500" />
              Address *
            </span>
          </Label>
          <Textarea
            id="address"
            placeholder="123 Medical Drive, Healthcare City, HC 10001"
            rows={3}
            error={errors.address?.message}
            {...register("address")}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 border-t border-white/[0.06] px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting} className="min-w-[140px]">
          {isSubmitting ? (
            <><Loader2 className="h-4 w-4 animate-spin" />
              {isEditing ? "Updating…" : "Creating…"}
            </>
          ) : (
            isEditing ? "Update supplier" : "Add supplier"
          )}
        </Button>
      </div>
    </form>
  );
}
