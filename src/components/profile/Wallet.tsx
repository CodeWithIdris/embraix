import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet as WalletIcon, CreditCard, History, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Wallet = () => {
  return (
    <Card className="gradient-card border-border/50">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="font-display text-xl flex items-center gap-2">
          <WalletIcon className="w-5 h-5 text-primary" />
          Wallet
        </CardTitle>
        <Button variant="outline" size="sm" disabled>
          <Plus className="w-4 h-4 mr-2" />
          Add Funds
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Balance Display */}
          <div className="bg-secondary/30 rounded-lg p-4">
            <p className="text-sm text-muted-foreground mb-1">Available Balance</p>
            <p className="text-3xl font-display font-bold text-primary">$0.00</p>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="justify-start" disabled>
              <CreditCard className="w-4 h-4 mr-2" />
              Payment Methods
            </Button>
            <Button variant="outline" size="sm" className="justify-start" disabled>
              <History className="w-4 h-4 mr-2" />
              Transaction History
            </Button>
          </div>

          {/* Coming Soon Notice */}
          <div className="text-center py-4">
            <p className="text-sm text-muted-foreground">
              Wallet functionality coming soon!
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              You'll be able to add funds, make purchases, and track transactions.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
