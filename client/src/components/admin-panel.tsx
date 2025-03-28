import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { MEDAL_OPTIONS } from "@/lib/constants";
import { useToast } from "@/hooks/use-toast";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function AdminPanel() {
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [selectedMedal, setSelectedMedal] = useState<string>("");
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  
  const { data: categoriesWithEvents } = useQuery({
    queryKey: ["/api/categories"],
  });
  
  const { data: teams } = useQuery({
    queryKey: ["/api/teams"],
  });
  
  const queryClient = useQueryClient();
  const { toast } = useToast();
  
  const updateScoreMutation = useMutation({
    mutationFn: async ({ teamId, eventId, medal }: { teamId: number; eventId: number; medal: string }) => {
      return apiRequest("POST", "/api/results/update", { teamId, eventId, medal });
    },
    onSuccess: async (data) => {
      const result = await data.json();
      queryClient.invalidateQueries({ queryKey: ["/api/standings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      
      setUpdateSuccess(true);
      setTimeout(() => setUpdateSuccess(false), 3000);
      
      toast({
        title: "Score Updated",
        description: "The score has been updated successfully.",
        variant: "default",
      });
      
      // Clear validation message if there was one
      setValidationMessage(null);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update score. Please try again.",
        variant: "destructive",
      });
      
      if (error.message && error.message.includes("already assigned")) {
        setValidationMessage(error.message);
      }
    }
  });
  
  const handleUpdateScore = () => {
    if (!selectedEvent || !selectedTeam || !selectedMedal) {
      toast({
        title: "Incomplete Form",
        description: "Please select an event, team, and medal before updating the score.",
        variant: "destructive",
      });
      return;
    }
    
    // Parse IDs from the selected values
    const eventId = parseInt(selectedEvent);
    const teamId = parseInt(selectedTeam);
    
    // Validate that the medal allocation is allowed
    if (["gold", "silver", "bronze"].includes(selectedMedal)) {
      // Check if this medal is already allocated to another team for this event
      const event = categoriesWithEvents
        ?.flatMap(({ events }) => events)
        .find(e => e.id === eventId);
      
      if (event) {
        // Get the event results to check existing medals
        queryClient.fetchQuery({
          queryKey: [`/api/events/${eventId}/results`],
        }).then((eventResults: any) => {
          let canUpdate = true;
          let message = null;
          
          if (selectedMedal === "gold" && eventResults.gold && eventResults.gold.teamId !== teamId) {
            canUpdate = false;
            message = `Gold medal is already assigned to ${eventResults.gold.teamName} for this event`;
          } else if (selectedMedal === "silver" && eventResults.silver && eventResults.silver.teamId !== teamId) {
            canUpdate = false;
            message = `Silver medal is already assigned to ${eventResults.silver.teamName} for this event`;
          } else if (selectedMedal === "bronze" && eventResults.bronze && eventResults.bronze.teamId !== teamId) {
            canUpdate = false;
            message = `Bronze medal is already assigned to ${eventResults.bronze.teamName} for this event`;
          }
          
          if (!canUpdate) {
            setValidationMessage(message);
            toast({
              title: "Validation Error",
              description: message,
              variant: "destructive",
            });
            return;
          }
          
          // If we get here, the update is allowed
          updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
        });
      } else {
        updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
      }
    } else {
      // Non-medal updates don't need validation
      updateScoreMutation.mutate({ teamId, eventId, medal: selectedMedal });
    }
  };
  
  return (
    <section className="bg-white rounded-lg shadow-md overflow-hidden mb-10">
      <CardHeader className="px-6 py-4 bg-gray-50 border-b border-gray-200">
        <CardTitle className="text-xl font-bold text-gray-800">Admin Control Panel</CardTitle>
      </CardHeader>
      <CardContent className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Quick Score Update</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Event</label>
              <Select value={selectedEvent} onValueChange={setSelectedEvent}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select an event" />
                </SelectTrigger>
                <SelectContent>
                  {categoriesWithEvents?.map(({ category, events }) => (
                    <SelectGroup key={category.id}>
                      <SelectLabel>{category.name}</SelectLabel>
                      {events.map(event => (
                        <SelectItem key={event.id} value={event.id.toString()}>
                          {event.name}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Team</label>
              <Select value={selectedTeam} onValueChange={setSelectedTeam}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a team" />
                </SelectTrigger>
                <SelectContent>
                  {teams?.map(team => (
                    <SelectItem key={team.id} value={team.id.toString()}>
                      {team.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Select Medal</label>
              <Select value={selectedMedal} onValueChange={setSelectedMedal}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select a medal" />
                </SelectTrigger>
                <SelectContent>
                  {MEDAL_OPTIONS.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 flex items-center">
            <Button 
              onClick={handleUpdateScore}
              disabled={!selectedEvent || !selectedTeam || !selectedMedal || updateScoreMutation.isPending}
              className="px-4 py-2 bg-[#2563eb] text-white rounded-md hover:bg-blue-700"
            >
              {updateScoreMutation.isPending ? "Updating..." : "Update Score"}
            </Button>
            
            {updateSuccess && (
              <div className="flex items-center ml-4 text-sm font-medium text-green-600">
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Score updated successfully!
              </div>
            )}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold mb-4">Medal Validation</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <p className="text-sm text-gray-600 mb-2">
              The system will automatically validate that only one Gold, one Silver, and one Bronze medal can be awarded per event.
            </p>
            
            {validationMessage && (
              <Alert variant="destructive" className="mt-2 text-sm">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Validation Error</AlertTitle>
                <AlertDescription>{validationMessage}</AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </CardContent>
    </section>
  );
}
