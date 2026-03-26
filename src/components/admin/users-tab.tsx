'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, X, ShieldAlert, ShieldCheck } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const mockUsers = [
  {
    id: 1,
    name: "Maria Garcia",
    email: "maria.garcia@email.com",
    purok: "Purok 1",
    registered: "03/02/2026",
    status: "Pending",
  },
  {
    id: 2,
    name: "Jose Mercado",
    email: "jose.mercado@email.com",
    purok: "Purok 3",
    registered: "03/01/2026",
    status: "Verified",
  },
  {
    id: 3,
    name: "Ana Reyes",
    email: "ana.reyes@email.com",
    purok: "Purok 2",
    registered: "02/28/2026",
    status: "Suspended",
  },
];

export function UsersTab() {
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Resident Verification</CardTitle>
            <Badge variant="secondary">1 Pending</Badge>
          </div>
          <CardDescription>
            Manage user registration and account status
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Purok</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.purok}</TableCell>
                  <TableCell>{user.registered}</TableCell>
                  <TableCell>
                    <Badge 
                      variant={
                        user.status === "Pending" ? "warning" : 
                        user.status === "Verified" ? "success" : "destructive"
                      }
                      className={
                        user.status === "Pending" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100/80" :
                        user.status === "Verified" ? "bg-green-100 text-green-800 hover:bg-green-100/80" :
                        "bg-red-100 text-red-800 hover:bg-red-100/80"
                      }
                    >
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                        {user.status === "Pending" && (
                            <>
                                <Button size="sm" variant="outline" className="h-8 gap-1">
                                    <Check className="h-4 w-4" /> Approve
                                </Button>
                                <Button size="sm" variant="destructive" className="h-8 gap-1">
                                    <X className="h-4 w-4" /> Reject
                                </Button>
                            </>
                        )}
                        {user.status === "Verified" && (
                            <Button size="sm" variant="secondary" className="h-8">
                                Suspend
                            </Button>
                        )}
                        {user.status === "Suspended" && (
                            <Button size="sm" variant="default" className="bg-slate-900 h-8">
                                Reinstate
                            </Button>
                        )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
