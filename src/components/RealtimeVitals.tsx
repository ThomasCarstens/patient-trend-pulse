import { useState, useEffect } from "react";
import { ArrowLeft, Heart, Droplets, Wind, Activity, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Patient, VitalSigns } from "@/data/medicalData";
import { loadAllPatientVitals, getPatientVitals, getCurrentAlertStatus } from "@/utils/csvLoader";
import { AlertBar } from "@/components/AlertButton";

interface RealtimeVitalsProps {
  patient: Patient;
  onBack: () => void;
}

export function RealtimeVitals({ patient, onBack }: RealtimeVitalsProps) {
  const [patientVitals, setPatientVitals] = useState<VitalSigns[]>(patient.vitals);
  const [vitalsMap, setVitalsMap] = useState<Map<string, VitalSigns[]>>(new Map());

  // Start with 20% of the data already displayed
  const initialIndex = Math.floor(patientVitals.length * 0.2);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isStreaming, setIsStreaming] = useState(true);
  const [displayData, setDisplayData] = useState<VitalSigns[]>(patientVitals.slice(0, initialIndex + 1));

  // Load CSV data on component mount
  useEffect(() => {
    const loadVitalsData = async () => {
      try {
        const vitalsMap = await loadAllPatientVitals();
        setVitalsMap(vitalsMap);

        // Get vitals for this specific patient
        const csvVitals = getPatientVitals(patient.id, vitalsMap);
        if (csvVitals.length > 0) {
          setPatientVitals(csvVitals);
          const newInitialIndex = Math.floor(csvVitals.length * 0.2);
          setCurrentIndex(newInitialIndex);
          setDisplayData(csvVitals.slice(0, newInitialIndex + 1));
          console.log(`Loaded ${csvVitals.length} vitals for patient ${patient.name}`);
        }
      } catch (error) {
        console.error('Error loading CSV vitals data:', error);
      }
    };

    loadVitalsData();
  }, [patient.id, patient.name]);

  useEffect(() => {
    if (!isStreaming) return;

    // Faster interval since we have 10x more data points (100ms instead of 1000ms)
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        if (newIndex >= patientVitals.length) {
          setIsStreaming(false);
          return patientVitals.length - 1;
        }
        return newIndex;
      });
    }, 100);

    return () => clearInterval(interval);
  }, [isStreaming, patientVitals.length]);

  useEffect(() => {
    setDisplayData(patientVitals.slice(0, currentIndex + 1));
  }, [currentIndex, patientVitals]);

  const currentVitals = patientVitals[currentIndex];
  
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
    const initialIndex = Math.floor(patientVitals.length * 0.2);
    setCurrentIndex(initialIndex);
    setIsStreaming(true);
  };

  const toggleStreaming = () => {
    if (currentIndex >= patientVitals.length - 1) {
      // If at the end, reset to 20% and start streaming
      resetSimulation();
    } else {
      // Otherwise just toggle streaming
      setIsStreaming(!isStreaming);
    }
  };

  // Get current alert status
  const currentAlertColor = getCurrentAlertStatus(displayData);
  const alerts = [{
    patientId: patient.id,
    patientName: patient.name,
    alertColor: currentAlertColor
  }];

  return (
    <div className="min-h-screen bg-background p-4">
      <AlertBar alerts={alerts} onAlertClick={() => {}} />
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
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStreaming}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {isStreaming ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isStreaming ? 'Pause' : 'Play'}
              </Button>
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="pulse"
                    stroke="#ef4444"
                    strokeWidth={3}
                    dot={false}
                    name="Heart Rate (BPM)"
                  />
                  <Line
                    type="monotone"
                    dataKey="systolic"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={false}
                    name="Systolic BP (mmHg)"
                  />
                  <Line
                    type="monotone"
                    dataKey="diastolic"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={false}
                    name="Diastolic BP (mmHg)"
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="respRate"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={false}
                    name="Respiratory Rate (/min)"
                  />
                  <Line
                    type="monotone"
                    dataKey="spo2"
                    stroke="#10b981"
                    strokeWidth={3}
                    dot={false}
                    name="SpO2 (%)"
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="bloodLoss"
                    stroke="#dc2626"
                    strokeWidth={3}
                    dot={false}
                    name="Blood Loss (%)"
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
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="trendScore"
                    stroke="#6366f1"
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
              <span className="text-sm text-muted-foreground">
                Simulation Progress (10x interpolated data, 100ms intervals)
              </span>
              <span className="text-sm text-muted-foreground">
                {currentIndex + 1} / {patientVitals.length}
                <span className="ml-2 text-xs">
                  ({Math.round(((currentIndex + 1) / patientVitals.length) * 100)}%)
                </span>
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${((currentIndex + 1) / patientVitals.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}