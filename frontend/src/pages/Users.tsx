import { Users as UsersIcon, Plus, Loader2, Trash2, Search, Pencil, ToggleLeft, ToggleRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { useEffect, useState, useMemo } from "react";
import { userService, type User } from "@/services/user.service";

const roleLabels: Record<string, string> = {
  SUPERADMIN: "Super Admin",
  OWNER: "Owner",
  MARKETING: "Marketing",
  API: "API User",
};

const roleBadgeColors: Record<string, string> = {
  SUPERADMIN: "bg-purple-100 text-purple-700",
  OWNER: "bg-blue-100 text-blue-700",
  MARKETING: "bg-emerald-100 text-emerald-700",
  API: "bg-slate-100 text-slate-700",
};

export default function Users() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<User | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await userService.getAll();
      setUsers(data.users);
    } catch (err) {
      console.error("Failed to fetch users:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await userService.delete(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
      setDeleteTarget(null);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete user");
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggleStatus = async (id: number) => {
    setTogglingId(id);
    try {
      const data = await userService.toggleStatus(id);
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? { ...u, isActive: data.user.isActive } : u))
      );
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to toggle status");
    } finally {
      setTogglingId(null);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const q = search.toLowerCase();
    return users.filter(
      (u) =>
        u.fullName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.role.toLowerCase().includes(q)
    );
  }, [users, search]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Users</h2>
          <p className="text-muted-foreground mt-1">Manage system users and their roles.</p>
        </div>
        <Button onClick={() => navigate("/users/new")} className="gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </Button>
      </div>

      <div className="mb-4">
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <Card className="border-0 shadow-md">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Name</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Email</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Status</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-12 text-muted-foreground">
                      <UsersIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                      <p className="text-sm">No users found.</p>
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-primary">
                              {user.fullName.charAt(0)}
                            </span>
                          </div>
                          <span className="text-sm font-medium text-foreground">{user.fullName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">{user.email}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleBadgeColors[user.role] || "bg-gray-100 text-gray-700"}`}>
                          {roleLabels[user.role] || user.role}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {user.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => navigate(`/users/${user.id}/edit`)}
                            title="Edit"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleToggleStatus(user.id)}
                            disabled={togglingId === user.id}
                            title={user.isActive ? "Deactivate" : "Activate"}
                          >
                            {togglingId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : user.isActive ? (
                              <ToggleRight className="h-4 w-4 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-4 w-4 text-red-600" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => setDeleteTarget(user)}
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/40" onClick={() => setDeleteTarget(null)} />
          <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-foreground mb-2">Delete User</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Are you sure you want to delete <strong>{deleteTarget.fullName}</strong>? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDelete(deleteTarget.id)}
                disabled={deletingId === deleteTarget.id}
              >
                {deletingId === deleteTarget.id ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
