"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { propertyService } from "@/services/propertyService";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export default function AdminPendingProperties() {

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ["pending-properties"],
    queryFn: propertyService.getPending,
  });

  const approveMutation = useMutation({
    mutationFn: propertyService.approve,
    onSuccess: () => {
      toast.success("Approved");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: propertyService.reject,
    onSuccess: () => {
      toast.success("Rejected");
      queryClient.invalidateQueries({ queryKey: ["pending-properties"] });
    },
  });

  if (isLoading) {
    return <Loader2 className="animate-spin" />;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">Pending Properties</h2>

      {data?.map((p) => (
        <div key={p.property_id} className="border p-4 rounded flex justify-between">
          <div>
            <h3>{p.title}</h3>
            <p>{p.location?.city}</p>
          </div>

          <div className="flex gap-2">
            <Button onClick={() => approveMutation.mutate(p.property_id)}>
              Approve
            </Button>

            <Button variant="destructive" onClick={() => rejectMutation.mutate(p.property_id)}>
              Reject
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}