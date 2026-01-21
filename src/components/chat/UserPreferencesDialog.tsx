import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Settings, Loader2, Save } from "lucide-react";

interface UserPreferences {
  location: string;
  home_size: string;
  budget_range: string;
  energy_goals: string[];
  current_setup: string;
  household_size: number | null;
  property_type: string;
  grid_reliability: string;
  additional_notes: string;
}

const ENERGY_GOALS = [
  { id: "reduce_bills", label: "Reduce electricity bills" },
  { id: "backup_power", label: "Backup power during outages" },
  { id: "go_green", label: "Go fully green/sustainable" },
  { id: "off_grid", label: "Go completely off-grid" },
  { id: "ev_charging", label: "Charge electric vehicle" },
  { id: "business_power", label: "Power my business" },
];

const PROPERTY_TYPES = [
  { value: "apartment", label: "Apartment/Flat" },
  { value: "bungalow", label: "Bungalow" },
  { value: "duplex", label: "Duplex" },
  { value: "detached", label: "Detached House" },
  { value: "commercial", label: "Commercial Building" },
  { value: "industrial", label: "Industrial Facility" },
];

const BUDGET_RANGES = [
  { value: "under_500k", label: "Under ₦500,000" },
  { value: "500k_1m", label: "₦500,000 - ₦1,000,000" },
  { value: "1m_3m", label: "₦1,000,000 - ₦3,000,000" },
  { value: "3m_5m", label: "₦3,000,000 - ₦5,000,000" },
  { value: "5m_10m", label: "₦5,000,000 - ₦10,000,000" },
  { value: "above_10m", label: "Above ₦10,000,000" },
  { value: "flexible", label: "Flexible / Not sure yet" },
];

const GRID_RELIABILITY = [
  { value: "very_poor", label: "Very Poor (0-4 hrs/day)" },
  { value: "poor", label: "Poor (4-8 hrs/day)" },
  { value: "moderate", label: "Moderate (8-16 hrs/day)" },
  { value: "good", label: "Good (16-20 hrs/day)" },
  { value: "excellent", label: "Excellent (20-24 hrs/day)" },
];

interface Props {
  userId: string;
}

export default function UserPreferencesDialog({ userId }: Props) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<UserPreferences>({
    location: "",
    home_size: "",
    budget_range: "",
    energy_goals: [],
    current_setup: "",
    household_size: null,
    property_type: "",
    grid_reliability: "",
    additional_notes: "",
  });

  useEffect(() => {
    if (open) {
      loadPreferences();
    }
  }, [open, userId]);

  const loadPreferences = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("user_ai_preferences")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setPreferences({
          location: data.location || "",
          home_size: data.home_size || "",
          budget_range: data.budget_range || "",
          energy_goals: data.energy_goals || [],
          current_setup: data.current_setup || "",
          household_size: data.household_size,
          property_type: data.property_type || "",
          grid_reliability: data.grid_reliability || "",
          additional_notes: data.additional_notes || "",
        });
      }
    } catch (err) {
      console.error("Failed to load preferences:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from("user_ai_preferences")
        .upsert({
          user_id: userId,
          ...preferences,
        }, { onConflict: "user_id" });

      if (error) throw error;

      toast.success("Preferences saved! The AI will now personalize responses for you.");
      setOpen(false);
    } catch (err) {
      console.error("Failed to save preferences:", err);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const toggleGoal = (goalId: string) => {
    setPreferences(prev => ({
      ...prev,
      energy_goals: prev.energy_goals.includes(goalId)
        ? prev.energy_goals.filter(g => g !== goalId)
        : [...prev.energy_goals, goalId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" title="AI Preferences">
          <Settings className="w-5 h-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Personalize Your AI Experience</DialogTitle>
          <DialogDescription>
            Help the AI give you better recommendations by sharing some details about your situation.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-6 py-4">
            {/* Location */}
            <div className="space-y-2">
              <Label htmlFor="location">Location (City/State)</Label>
              <Input
                id="location"
                placeholder="e.g., Lagos, Victoria Island"
                value={preferences.location}
                onChange={(e) => setPreferences(prev => ({ ...prev, location: e.target.value }))}
              />
            </div>

            {/* Property Type */}
            <div className="space-y-2">
              <Label>Property Type</Label>
              <Select
                value={preferences.property_type}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, property_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select property type" />
                </SelectTrigger>
                <SelectContent>
                  {PROPERTY_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Home Size */}
            <div className="space-y-2">
              <Label htmlFor="home_size">Home/Building Size</Label>
              <Input
                id="home_size"
                placeholder="e.g., 3 bedroom, 200 sqm"
                value={preferences.home_size}
                onChange={(e) => setPreferences(prev => ({ ...prev, home_size: e.target.value }))}
              />
            </div>

            {/* Household Size */}
            <div className="space-y-2">
              <Label htmlFor="household_size">Number of Occupants</Label>
              <Input
                id="household_size"
                type="number"
                min="1"
                placeholder="e.g., 4"
                value={preferences.household_size || ""}
                onChange={(e) => setPreferences(prev => ({ 
                  ...prev, 
                  household_size: e.target.value ? parseInt(e.target.value) : null 
                }))}
              />
            </div>

            {/* Budget Range */}
            <div className="space-y-2">
              <Label>Budget Range</Label>
              <Select
                value={preferences.budget_range}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, budget_range: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select budget range" />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_RANGES.map(range => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Grid Reliability */}
            <div className="space-y-2">
              <Label>Grid Power Reliability</Label>
              <Select
                value={preferences.grid_reliability}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, grid_reliability: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="How reliable is your grid power?" />
                </SelectTrigger>
                <SelectContent>
                  {GRID_RELIABILITY.map(level => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Current Setup */}
            <div className="space-y-2">
              <Label htmlFor="current_setup">Current Energy Setup</Label>
              <Input
                id="current_setup"
                placeholder="e.g., Generator only, Small inverter, None"
                value={preferences.current_setup}
                onChange={(e) => setPreferences(prev => ({ ...prev, current_setup: e.target.value }))}
              />
            </div>

            {/* Energy Goals */}
            <div className="space-y-3">
              <Label>Energy Goals (select all that apply)</Label>
              <div className="grid grid-cols-1 gap-2">
                {ENERGY_GOALS.map(goal => (
                  <div key={goal.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={goal.id}
                      checked={preferences.energy_goals.includes(goal.id)}
                      onCheckedChange={() => toggleGoal(goal.id)}
                    />
                    <label
                      htmlFor={goal.id}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {goal.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Additional Notes */}
            <div className="space-y-2">
              <Label htmlFor="additional_notes">Additional Notes</Label>
              <Textarea
                id="additional_notes"
                placeholder="Any other details that might help (e.g., specific appliances, future plans, concerns)..."
                value={preferences.additional_notes}
                onChange={(e) => setPreferences(prev => ({ ...prev, additional_notes: e.target.value }))}
                rows={3}
              />
            </div>

            <Button onClick={handleSave} disabled={saving} className="w-full">
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Preferences
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}