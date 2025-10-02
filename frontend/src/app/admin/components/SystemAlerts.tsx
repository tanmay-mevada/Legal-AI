"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/lib/firebase";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Bell,
  BellOff,
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface SystemAlert {
  id: string;
  type: "info" | "warning" | "critical";
  title: string;
  message: string;
  timestamp: string;
}

interface AlertsResponse {
  alerts: SystemAlert[];
  total: number;
  timestamp: string;
}

export default function SystemAlerts() {
  const [user] = useAuthState(auth);
  const [alerts, setAlerts] = useState<SystemAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  const API_BASE = "https://legal-ai-backend-63563783552.us-central1.run.app/api";

  const fetchAlerts = useCallback(async () => {
    try {
      setLoading(true);
      const token = await user?.getIdToken();
      const response = await fetch(`${API_BASE}/monitoring/alerts`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Alerts API error: ${response.status}`);
      }

      const data: AlertsResponse = await response.json();
      setAlerts(data.alerts);
      setError(null);
    } catch (err) {
      console.error("Error fetching alerts:", err);
      setError("Failed to fetch system alerts");
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      fetchAlerts();
      // Refresh alerts every 60 seconds
      const interval = setInterval(fetchAlerts, 60000);
      return () => clearInterval(interval);
    }
  }, [user, fetchAlerts]);

  const getAlertIcon = (type: string) => {
    switch (type) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-500" />;
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case "info":
        return <CheckCircle className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertColor = (type: string) => {
    switch (type) {
      case "critical":
        return "border-red-200 bg-red-50";
      case "warning":
        return "border-yellow-200 bg-yellow-50";
      case "info":
        return "border-blue-200 bg-blue-50";
      default:
        return "border-gray-200 bg-gray-50";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const criticalAlerts = alerts.filter(alert => alert.type === "critical");
  const warningAlerts = alerts.filter(alert => alert.type === "warning");
  const infoAlerts = alerts.filter(alert => alert.type === "info");

  if (loading && alerts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            System Alerts
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-3">Loading alerts...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            <CardTitle>System Alerts</CardTitle>
            {alerts.length > 0 && (
              <Badge variant={criticalAlerts.length > 0 ? "destructive" : warningAlerts.length > 0 ? "default" : "secondary"}>
                {alerts.length}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setNotificationsEnabled(!notificationsEnabled)}
            >
              {notificationsEnabled ? (
                <Bell className="h-4 w-4" />
              ) : (
                <BellOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="ghost" size="sm" onClick={fetchAlerts}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardDescription>
          Real-time system status and alerts
        </CardDescription>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {alerts.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-green-700">All Systems Healthy</h3>
            <p className="text-gray-600">No active alerts or warnings</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Critical Alerts */}
            {criticalAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-red-700 mb-2 flex items-center gap-2">
                  <XCircle className="h-4 w-4" />
                  Critical ({criticalAlerts.length})
                </h4>
                {criticalAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border mb-2 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h5 className="font-medium">{alert.title}</h5>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Warning Alerts */}
            {warningAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-yellow-700 mb-2 flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  Warnings ({warningAlerts.length})
                </h4>
                {warningAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border mb-2 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h5 className="font-medium">{alert.title}</h5>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Info Alerts */}
            {infoAlerts.length > 0 && (
              <div>
                <h4 className="font-semibold text-blue-700 mb-2 flex items-center gap-2">
                  <CheckCircle className="h-4 w-4" />
                  Information ({infoAlerts.length})
                </h4>
                {infoAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3 rounded-lg border mb-2 ${getAlertColor(alert.type)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getAlertIcon(alert.type)}
                        <div>
                          <h5 className="font-medium">{alert.title}</h5>
                          <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDate(alert.timestamp)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}