import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Heart, Droplets, Wind, Activity, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Patient, VitalSigns } from "@/data/medicalData";
import { loadPatientVitalsByFilename, getCurrentAlertStatus } from "@/utils/csvLoader";
import { AlertBar } from "@/components/AlertButton";
import { computeSingleAlertColor } from "@/utils/alertDetection";

interface RealtimeVitalsProps {
  patient: Patient;
  onBack: () => void;
}

export function RealtimeVitals({ patient, onBack }: RealtimeVitalsProps) {
  const [patientVitals, setPatientVitals] = useState<VitalSigns[]>(patient.vitals);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());
  const [actualHz, setActualHz] = useState<number>(0);

  // Start with 10% of the data already displayed (changed from 20% to 10%)
  const initialIndex = Math.floor(patientVitals.length * 0.1);
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [isStreaming, setIsStreaming] = useState(false); // Start paused until data loads
  const [displayData, setDisplayData] = useState<VitalSigns[]>(patientVitals.slice(0, initialIndex + 1));

  // Load CSV data on component mount
  useEffect(() => {
    const loadVitalsData = async () => {
      setIsLoading(true);
      try {
        // Use the patient's associated CSV filename if available
        if (patient.csvFilename) {
          const csvVitals = await loadPatientVitalsByFilename(patient.csvFilename);
          if (csvVitals.length > 0) {
            setPatientVitals(csvVitals);
            const newInitialIndex = Math.floor(csvVitals.length * 0.1); // 10% pre-displayed
            setCurrentIndex(newInitialIndex);
            setDisplayData(csvVitals.slice(0, newInitialIndex + 1));
            setIsStreaming(true); // Start streaming after data loads
            console.log(`Loaded ${csvVitals.length} vitals for patient ${patient.name} from ${patient.csvFilename}`);
          }
        } else {
          console.log(`No CSV filename associated with patient ${patient.name}, using default vitals`);
          setIsStreaming(true); // Start streaming with default data
        }
      } catch (error) {
        console.error('Error loading CSV vitals data:', error);
        setIsStreaming(true); // Start streaming even if CSV loading fails
      } finally {
        setIsLoading(false);
      }
    };

    loadVitalsData();
  }, [patient.id, patient.name, patient.csvFilename]);

  useEffect(() => {
    if (!isStreaming || isLoading || patientVitals.length === 0) return;

    console.log('Starting streaming...', { isStreaming, isLoading, patientVitalsLength: patientVitals.length, currentIndex });

    // 10Hz streaming (100ms intervals for 10 samples per second)
    const interval = setInterval(() => {
      const now = Date.now();
      const timeDiff = now - lastUpdateTime;
      const currentHz = timeDiff > 0 ? 1000 / timeDiff : 10; // Default to 10Hz if no previous time
      setActualHz(Math.round(currentHz * 10) / 10); // Round to 1 decimal
      setLastUpdateTime(now);

      setCurrentIndex((prev) => {
        const newIndex = prev + 1;
        console.log('Streaming update:', { prev, newIndex, totalLength: patientVitals.length });
        if (newIndex >= patientVitals.length) {
          console.log('Reached end of data, stopping stream');
          setIsStreaming(false);
          return patientVitals.length - 1;
        }
        return newIndex;
      });
    }, 100); // 100ms = 10Hz (10 samples per second)

    return () => {
      console.log('Cleaning up streaming interval');
      clearInterval(interval);
    };
  }, [isStreaming, isLoading, patientVitals.length]);

  useEffect(() => {
    setDisplayData(patientVitals.slice(0, currentIndex + 1));
  }, [currentIndex, patientVitals]);

  // Memoize current vitals for 10Hz performance
  const currentVitals = useMemo(() => patientVitals[currentIndex], [patientVitals, currentIndex]);

  const getStatusColor = useCallback((status: string) => {
    switch (status) {
      case 'green': return 'bg-status-green';
      case 'yellow': return 'bg-status-yellow';
      case 'red': return 'bg-status-red';
      default: return 'bg-muted';
    }
  }, []);

  // Optimized chart data formatting for 10Hz updates
  const formatChartData = useCallback((data: VitalSigns[]) => {
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
  }, []);

  const chartData = useMemo(() => formatChartData(displayData), [displayData, formatChartData]);

  const resetSimulation = useCallback(() => {
    const initialIndex = Math.floor(patientVitals.length * 0.1); // 10% pre-displayed
    setCurrentIndex(initialIndex);
    setDisplayData(patientVitals.slice(0, initialIndex + 1));
    setIsStreaming(true);
  }, [patientVitals.length]);

  const toggleStreaming = useCallback(() => {
    if (currentIndex >= patientVitals.length - 1) {
      // If at the end, reset to 10% and start streaming
      resetSimulation();
    } else {
      // Otherwise just toggle streaming
      setIsStreaming(!isStreaming);
    }
  }, [currentIndex, patientVitals.length, isStreaming, resetSimulation]);

  // Memoize alert status for 10Hz performance
  const currentVital = useMemo(() => patientVitals[currentIndex], [patientVitals, currentIndex]);
  const currentAlertColor = useMemo(() => currentVital ? currentVital.alert_color : "white", [currentVital]);

  // Map alert colors to UI colors for AlertBar compatibility
  const mappedAlertColor = useMemo(() => {
    switch (currentAlertColor) {
      case 'brown':
      case 'red':
        return 'red' as const;
      case 'orange':
      case 'yellow':
        return 'yellow' as const;
      case 'white':
      default:
        return 'green' as const;
    }
  }, [currentAlertColor]);

  const alerts = useMemo(() => [{
    patientId: patient.id,
    patientName: patient.name,
    alertColor: mappedAlertColor
  }], [patient.id, patient.name, mappedAlertColor]);

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
              <div>
                <h1 className="text-2xl font-bold text-foreground">{patient.name} - Realtime Vitals</h1>
                {patient.csvFilename && (
                  <p className="text-sm text-muted-foreground">Data source: {patient.csvFilename}</p>
                )}
                {isLoading && (
                  <p className="text-sm text-yellow-500">Loading vitals data...</p>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-status-green animate-pulse' : 'bg-muted'}`}></div>
              <span className="text-sm text-muted-foreground">
                {isLoading ? 'Loading data...' :
                 `Target: 10Hz • Actual: ${actualHz}Hz • 10% pre-displayed • ${isStreaming ? 'Streaming' : 'Paused'}`}
              </span>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={toggleStreaming}
                disabled={isLoading}
                className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
              >
                {isStreaming ? <Pause className="w-4 h-4 mr-1" /> : <Play className="w-4 h-4 mr-1" />}
                {isStreaming ? 'Pause' : currentIndex >= patientVitals.length - 1 ? 'Restart' : 'Play'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={resetSimulation}
                disabled={isLoading}
                className="border-accent text-accent hover:bg-accent hover:text-accent-foreground"
              >
                Reset to 10%
              </Button>
            </div>
          </div>
        </div>

        {/* Alert Status Display */}
        {currentVital && (
          <Card className={`mb-6 border-2 ${
            currentVital.alert_color === 'brown' ? 'border-amber-800 bg-amber-50' :
            currentVital.alert_color === 'red' ? 'border-red-500 bg-red-50' :
            currentVital.alert_color === 'orange' ? 'border-orange-500 bg-orange-50' :
            currentVital.alert_color === 'yellow' ? 'border-yellow-500 bg-yellow-50' :
            'border-gray-300 bg-gray-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-6 h-6 rounded-full ${
                    currentVital.alert_color === 'brown' ? 'bg-amber-800 animate-pulse' :
                    currentVital.alert_color === 'red' ? 'bg-red-500 animate-pulse' :
                    currentVital.alert_color === 'orange' ? 'bg-orange-500' :
                    currentVital.alert_color === 'yellow' ? 'bg-yellow-500' :
                    'bg-white border-2 border-gray-300'
                  }`}></div>
                  <div>
                    <h3 className="text-lg font-bold">
                      Alert Status: {currentVital.alert_color.toUpperCase()}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Risk Score: {Math.round(100 - currentVital.health_score)} | Python Algorithm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold">
                    Health: {Math.round(currentVital.health_score)}%
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Trend: {Math.round(currentVital.trend_score)}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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