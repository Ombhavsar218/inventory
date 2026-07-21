import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { createUserSchema, type CreateUserFormData } from "@/validations/user.schema";
import { useState } from "react";
import { userService } from "@/services/user.service";

export default function AddUser() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateUserFormData>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: CreateUserFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      await userService.create({
        fullName: data.fullName,
        email: data.email,
        password: data.password,
        role: data.role,
      });
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to create user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Add User</h2>
          <p className="text-muted-foreground mt-1">Create a new system user.</p>
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">Full Name</Label>
              <Input
                id="fullName"
                placeholder="Enter full name"
                {...register("fullName")}
                className={errors.fullName ? "border-destructive" : ""}
              />
              {errors.fullName && <p className="text-xs text-destructive">{errors.fullName.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                {...register("email")}
                className={errors.email ? "border-destructive" : ""}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Min 8 characters"
                {...register("password")}
                className={errors.password ? "border-destructive" : ""}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                {...register("role")}
                className={`flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${errors.role ? "border-destructive" : ""}`}
              >
                <option value="">Select a role</option>
                <option value="SUPERADMIN">Super Admin</option>
                <option value="OWNER">Owner</option>
                <option value="MARKETING">Marketing</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <UserPlus className="h-4 w-4 mr-2" />
                Create User
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
