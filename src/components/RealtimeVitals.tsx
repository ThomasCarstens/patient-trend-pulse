import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Droplets, Wind, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Patient, VitalSigns } from "@/data/medicalData";

interface RealtimeVitalsProps {
  patient: Patient;
  onBack: () => void;
}

export function RealtimeVitals({ patient, onBack }: RealtimeVitalsProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStreaming, setIsStreaming] = useState(true);
  const [displayData, setDisplayData] = useState<VitalSigns[]>([]);

  useEffect(() => {
    if (!isStreaming) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        if (newIndex >= patient.vitals.length) {
          setIsStreaming(false);
          return patient.vitals.length - 1;
        }
        return newIndex;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isStreaming, patient.vitals.length]);

  useEffect(() => {
    setDisplayData(patient.vitals.slice(0, currentIndex + 1));
  }, [currentIndex, patient.vitals]);

  const currentVitals = patient.vitals[currentIndex];
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-status-green';
      case 'yellow': return 'bg-status-yellow';
      case 'red': return 'bg-status-red';
      default: return 'bg-muted';
    }
  };

  const formatChartData = (data: VitalSigns[]) => {
    return data.map((vital, index) => ({
      time: index,
      pulse: vital.pulse_bpm,
      systolic: vital.systolic_mmHg,
      diastolic: vital.diastolic_mmHg,
      respRate: vital.resp_rate_bpm,
      spo2: vital.SpO2_percent,
      bloodLoss: vital.blood_loss_percent,
      trendScore: vital.trend_score
    }));
  };

  const chartData = formatChartData(displayData);

  const resetSimulation = () => {
    setCurrentIndex(0);
    setIsStreaming(true);
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Roster
            </Button>
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded-full ${getStatusColor(patient.status)}`}></div>
              <h1 className="text-2xl font-bold text-foreground">{patient.name} - Realtime Vitals</h1>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-status-green animate-pulse' : 'bg-muted'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isStreaming ? 'Streaming' : 'Paused'}
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={resetSimulation}
              className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Current Vitals Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Blood Pressure</span>
                <Droplets className="w-4 h-4 text-vital-normal" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                {currentVitals?.systolic_mmHg}/{currentVitals?.diastolic_mmHg}
              </div>
              <div className="text-xs text-muted-foreground">mmHg</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">SpO2</span>
                <Wind className="w-4 h-4 text-vital-normal" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                {currentVitals?.SpO2_percent}
              </div>
              <div className="text-xs text-muted-foreground">%</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Shock Index</span>
                <Activity className="w-4 h-4 text-vital-warning" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                {((currentVitals?.pulse_bpm || 0) / (currentVitals?.systolic_mmHg || 1)).toFixed(2)}
              </div>
              <div className="text-xs text-muted-foreground">ratio</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Heart Rate</span>
                <Heart className="w-4 h-4 text-vital-normal" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                {currentVitals?.pulse_bpm}
              </div>
              <div className="text-xs text-muted-foreground">bpm</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Resp Rate</span>
                <Wind className="w-4 h-4 text-vital-normal" />
              </div>
              <div className="text-2xl font-bold text-card-foreground">
                {currentVitals?.resp_rate_bpm}
              </div>
              <div className="text-xs text-muted-foreground">rpm</div>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-muted-foreground">Blood Loss</span>
                <Droplets className="w-4 h-4 text-vital-critical" />
              </div>
              <div className="text-2xl font-bold text-destructive">
                {currentVitals?.blood_loss_percent}
              </div>
              <div className="text-xs text-muted-foreground">%</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Heart Rate & Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="pulse" 
                    stroke="hsl(var(--status-red))" 
                    strokeWidth={2}
                    dot={false}
                    name="Heart Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="systolic" 
                    stroke="hsl(var(--chart-line))" 
                    strokeWidth={2}
                    dot={false}
                    name="Systolic BP"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="diastolic" 
                    stroke="hsl(var(--status-yellow))" 
                    strokeWidth={2}
                    dot={false}
                    name="Diastolic BP"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Respiratory & Saturation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="respRate" 
                    stroke="hsl(var(--chart-line))" 
                    strokeWidth={2}
                    dot={false}
                    name="Resp Rate"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="spo2" 
                    stroke="hsl(var(--status-green))" 
                    strokeWidth={2}
                    dot={false}
                    name="SpO2"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Blood Loss Dynamics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="bloodLoss" 
                    stroke="hsl(var(--destructive))" 
                    strokeWidth={2}
                    dot={false}
                    name="Blood Loss %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="text-lg text-card-foreground">Trend Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--chart-grid))" />
                  <XAxis 
                    dataKey="time" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="trendScore" 
                    stroke="hsl(var(--chart-trend))" 
                    strokeWidth={4}
                    dot={false}
                    name="Trend Score"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Progress Bar */}
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Simulation Progress</span>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {patient.vitals.length}
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / patient.vitals.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}