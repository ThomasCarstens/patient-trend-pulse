import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

interface AlertButtonProps {
  alertColor: "green" | "yellow" | "red";
  patientName?: string;
  onClick?: () => void;
}

export function AlertButton({ alertColor, patientName, onClick }: AlertButtonProps) {
  const [isBlinking, setIsBlinking] = useState(false);

  // Blink for red alerts
  useEffect(() => {
    if (alertColor === "red") {
      const interval = setInterval(() => {
        setIsBlinking(prev => !prev);
      }, 500);
      return () => clearInterval(interval);
    } else {
      setIsBlinking(false);
    }
  }, [alertColor]);

  const getAlertConfig = () => {
    switch (alertColor) {
      case "red":
        return {
          bgColor: isBlinking ? "bg-red-600" : "bg-red-700",
          textColor: "text-white",
          borderColor: "border-red-500",
          icon: <AlertTriangle className="w-4 h-4" />,
          label: "CRITICAL ALERT",
          description: "Immediate attention required"
        };
      case "yellow":
        return {
          bgColor: "bg-yellow-500",
          textColor: "text-black",
          borderColor: "border-yellow-400",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "WARNING",
          description: "Monitor closely"
        };
      case "green":
      default:
        return {
          bgColor: "bg-green-600",
          textColor: "text-white",
          borderColor: "border-green-500",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "STABLE",
          description: "Normal parameters"
        };
    }
  };

  const config = getAlertConfig();

  return (
    <Button
      onClick={onClick}
      className={`
        ${config.bgColor} ${config.textColor} ${config.borderColor}
        border-2 shadow-lg transition-all duration-200 hover:scale-105
        ${alertColor === "red" ? "animate-pulse" : ""}
      `}
      size="lg"
    >
      <div className="flex items-center gap-2">
        {config.icon}
        <div className="flex flex-col items-start">
          <div className="font-bold text-sm">{config.label}</div>
          {patientName && (
            <div className="text-xs opacity-90">{patientName}</div>
          )}
          <div className="text-xs opacity-75">{config.description}</div>
        </div>
      </div>
    </Button>
  );
}

interface AlertBarProps {
  alerts: Array<{
    patientId: string;
    patientName: string;
    alertColor: "green" | "yellow" | "red";
  }>;
  onAlertClick?: (patientId: string) => void;
}

export function AlertBar({ alerts, onAlertClick }: AlertBarProps) {
  // Sort alerts by priority (red first, then yellow, then green)
  const sortedAlerts = [...alerts].sort((a, b) => {
    const priority = { red: 0, yellow: 1, green: 2 };
    return priority[a.alertColor] - priority[b.alertColor];
  });

  // Get the highest priority alert for the main display
  const primaryAlert = sortedAlerts[0];
  const criticalCount = alerts.filter(a => a.alertColor === "red").length;
  const warningCount = alerts.filter(a => a.alertColor === "yellow").length;

  if (!primaryAlert) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <div className="flex items-center gap-4 bg-black/80 backdrop-blur-sm rounded-lg p-3 border border-gray-600">
        <AlertButton
          alertColor={primaryAlert.alertColor}
          patientName={primaryAlert.patientName}
          onClick={() => onAlertClick?.(primaryAlert.patientId)}
        />
        
        {alerts.length > 1 && (
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <Badge variant="destructive" className="bg-red-600 text-white">
                {criticalCount} Critical
              </Badge>
            )}
            {warningCount > 0 && (
              <Badge variant="secondary" className="bg-yellow-500 text-black">
                {warningCount} Warning
              </Badge>
            )}
            <div className="text-white text-sm">
              {alerts.length} Total Alerts
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
