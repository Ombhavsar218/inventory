import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { updateUserSchema, type UpdateUserFormData } from "@/validations/user.schema";
import { useEffect, useState } from "react";
import { userService, type User } from "@/services/user.service";

export default function EditUser() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UpdateUserFormData>({
    resolver: zodResolver(updateUserSchema),
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getById(parseInt(id!));
        setUser(data.user);
        reset({
          fullName: data.user.fullName,
          email: data.user.email,
          password: "",
          role: data.user.role,
          isActive: data.user.isActive,
        });
      } catch (err) {
        console.error("Failed to fetch user:", err);
        navigate("/users");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id, reset, navigate]);

  const onSubmit = async (data: UpdateUserFormData) => {
    setIsSubmitting(true);
    setError("");
    try {
      const payload: Record<string, any> = {
        fullName: data.fullName,
        email: data.email,
        role: data.role,
        isActive: data.isActive,
      };
      if (data.password && data.password.trim() !== "") {
        payload.password = data.password;
      }
      await userService.update(parseInt(id!), payload);
      navigate("/users");
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to update user. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="max-w-lg">
      <div className="flex items-center gap-3 mb-6">
        <Button variant="ghost" size="icon" onClick={() => navigate("/users")} className="h-8 w-8">
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-foreground">Edit User</h2>
          <p className="text-muted-foreground mt-1">Update user details for {user.fullName}.</p>
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
              <Label htmlFor="password">Password (leave blank to keep current)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Leave blank to keep current"
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
                <option value="SUPERADMIN">Super Admin</option>
                <option value="OWNER">Owner</option>
                <option value="MARKETING">Marketing</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Status</Label>
              <select
                id="isActive"
                {...register("isActive", { setValueAs: (v) => v === "true" })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => navigate("/users")}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
