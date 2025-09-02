import { useState, useEffect, useMemo, useCallback } from "react";
import { ArrowLeft, Heart, Droplets, Wind, Activity, Play, Pause } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";

// Mock data types for the component to work standalone
interface VitalSigns {
  pulse_bpm: number;
  systolic_mmHg: number;
  diastolic_mmHg: number;
  resp_rate_bpm: number;
  SpO2_percent: number;
  blood_loss_percent: number;
  trend_score: number;
  health_score: number;
  alert_color: string;
}

interface Patient {
  id: string;
  name: string;
  status: string;
  vitals: VitalSigns[];
  csvFilename?: string;
}

// Mock functions for standalone component
const loadPatientVitalsByFilename = async (filename: string): Promise<VitalSigns[]> => {
  // Generate mock data for demonstration
  const mockData: VitalSigns[] = [];
  for (let i = 0; i < 1000; i++) {
    const severity = Math.min(i / 500, 1); // Gradual deterioration
    mockData.push({
      pulse_bpm: 70 + Math.random() * 30 + severity * 40,
      systolic_mmHg: 120 - severity * 40 + Math.random() * 20,
      diastolic_mmHg: 80 - severity * 20 + Math.random() * 15,
      resp_rate_bpm: 16 + severity * 8 + Math.random() * 4,
      SpO2_percent: Math.max(85, 98 - severity * 13 + Math.random() * 2),
      blood_loss_percent: severity * 25 + Math.random() * 5,
      trend_score: Math.max(0, 85 - severity * 60 + Math.random() * 20),
      health_score: Math.max(20, 95 - severity * 50 + Math.random() * 15),
      alert_color: severity < 0.2 ? 'white' : severity < 0.4 ? 'yellow' : severity < 0.7 ? 'orange' : 'red'
    });
  }
  return mockData;
};

// Mock AlertBar component
const AlertBar = ({ alerts, onAlertClick }: { alerts: any[]; onAlertClick: () => void }) => (
  <div className="mb-4 p-2 bg-card border rounded-lg">
    <div className="flex items-center gap-2">
      {alerts.map((alert, i) => (
        <div key={i} className={`px-3 py-1 rounded-full text-sm font-medium ${
          alert.alertColor === 'red' ? 'bg-red-100 text-red-800' :
          alert.alertColor === 'yellow' ? 'bg-yellow-100 text-yellow-800' :
          'bg-green-100 text-green-800'
        }`}>
          {alert.patientName}: {alert.alertColor.toUpperCase()}
        </div>
      ))}
    </div>
  </div>
);

interface RealtimeVitalsProps {
  patient?: Patient;
  onBack?: () => void;
}

export default function RealtimeVitals({ 
  patient = {
    id: '1',
    name: 'John Doe',
    status: 'yellow',
    csvFilename: 'patient_vitals.csv',
    vitals: []
  },
  onBack = () => console.log('Back clicked')
}: RealtimeVitalsProps) {
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
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  }, []);

  // Helper functions for formatting vital signs with appropriate decimal places
  const formatVital = useCallback((value: number | undefined, type: string): string => {
    if (value === undefined || value === null) return '--';

    switch (type) {
      case 'pulse':
      case 'systolic':
      case 'diastolic':
      case 'respRate':
        return Math.round(value).toString(); // No decimals for whole number vitals
      case 'spo2':
        return value.toFixed(1); // 1 decimal for SpO2
      case 'bloodLoss':
        return value.toFixed(2); // 2 decimals for blood loss percentage
      case 'shockIndex':
        return value.toFixed(3); // 3 decimals for shock index (ratio)
      case 'healthScore':
      case 'trendScore':
        return Math.round(value).toString(); // No decimals for scores
      default:
        return value.toFixed(2); // Default 2 decimals
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
    <div className="min-h-screen bg-gray-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Alert Bar */}
        <AlertBar alerts={alerts} onAlertClick={() => {}} />
        
        {/* Header Section */}
        <Card className="shadow-sm bg-gray-800 border-gray-700">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onBack}
                  className="flex items-center gap-2 hover:bg-gray-700 border-gray-600 text-gray-300 hover:text-white"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back to Roster
                </Button>

                <div className="flex items-center gap-4">
                  <div className={`w-4 h-4 rounded-full ${getStatusColor(patient.status)}`}></div>
                  <div>
                    <h1 className="text-2xl font-bold text-white">{patient.name} - Realtime Vitals</h1>
                    {patient.csvFilename && (
                      <p className="text-sm text-gray-400 mt-1">Data source: {patient.csvFilename}</p>
                    )}
                    {isLoading && (
                      <p className="text-sm text-yellow-400 mt-1 font-medium">Loading vitals data...</p>
                    )}
                  </div>
                </div>
              </div>
              
              {/* Control Panel */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-700 rounded-lg">
                  <div className={`w-3 h-3 rounded-full ${isStreaming ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
                  <span className="text-sm font-medium text-gray-300">
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
                    className="flex items-center gap-2 hover:bg-blue-600 border-blue-500 text-blue-400 hover:text-white"
                  >
                    {isStreaming ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    {isStreaming ? 'Pause' : currentIndex >= patientVitals.length - 1 ? 'Restart' : 'Play'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={resetSimulation}
                    disabled={isLoading}
                    className="hover:bg-orange-600 border-orange-500 text-orange-400 hover:text-white"
                  >
                    Reset to 10%
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alert Status Display */}
        {currentVital && (
          <Card className={`shadow-sm border-2 ${
            currentVital.alert_color === 'brown' ? 'border-amber-600 bg-amber-900/20' :
            currentVital.alert_color === 'red' ? 'border-red-500 bg-red-900/20' :
            currentVital.alert_color === 'orange' ? 'border-orange-500 bg-orange-900/20' :
            currentVital.alert_color === 'yellow' ? 'border-yellow-500 bg-yellow-900/20' :
            'border-gray-600 bg-gray-800'
          }`}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    currentVital.alert_color === 'brown' ? 'bg-amber-600 animate-pulse' :
                    currentVital.alert_color === 'red' ? 'bg-red-500 animate-pulse' :
                    currentVital.alert_color === 'orange' ? 'bg-orange-500' :
                    currentVital.alert_color === 'yellow' ? 'bg-yellow-500' :
                    'bg-white border-2 border-gray-300'
                  }`}></div>
                  <div>
                    <h3 className="text-xl font-bold text-white">
                      Alert Status: {currentVital.alert_color.toUpperCase()}
                    </h3>
                    <p className="text-sm text-gray-300">
                      Risk Score: {Math.round(100 - currentVital.health_score)} | Python Algorithm
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-white">
                    Health: {formatVital(currentVital.health_score, 'healthScore')}%
                  </div>
                  <div className="text-sm text-gray-300 mt-1">
                    Trend: {formatVital(currentVital.trend_score, 'trendScore')}%
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Simulation Progress */}
        <Card className="shadow-sm bg-gray-800 border-gray-700">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-semibold text-white">Simulation Progress</h3>
              <div className="text-sm text-gray-300">
                {currentIndex + 1} / {patientVitals.length} data points
              </div>
            </div>

            <div className="space-y-3">
              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-3">
                <div
                  className="bg-blue-500 h-3 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${((currentIndex + 1) / patientVitals.length) * 100}%` }}
                ></div>
              </div>

              {/* Progress Details */}
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-300">
                  Progress: <span className="font-bold text-white">
                    {Math.round(((currentIndex + 1) / patientVitals.length) * 100)}%
                  </span>
                </div>
                <div className="text-gray-300">
                  Remaining: <span className="font-bold text-white">
                    {patientVitals.length - (currentIndex + 1)} points
                  </span>
                </div>
                <div className="text-gray-300">
                  Time: <span className="font-bold text-white">
                    {currentVitals?.timestamp ? new Date(currentVitals.timestamp).toLocaleTimeString() : '--:--:--'}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Vitals Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Blood Loss</span>
                <Droplets className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-red-400">
                {formatVital(currentVitals?.blood_loss_percent, 'bloodLoss')}
              </div>
              <div className="text-xs text-gray-400 mt-1">%</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Blood Pressure</span>
                <Droplets className="w-5 h-5 text-blue-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatVital(currentVitals?.systolic_mmHg, 'systolic')}/{formatVital(currentVitals?.diastolic_mmHg, 'diastolic')}
              </div>
              <div className="text-xs text-gray-400 mt-1">mmHg</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">SpO2</span>
                <Wind className="w-5 h-5 text-green-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatVital(currentVitals?.SpO2_percent, 'spo2')}
              </div>
              <div className="text-xs text-gray-400 mt-1">%</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Shock Index</span>
                <Activity className="w-5 h-5 text-orange-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatVital((currentVitals?.pulse_bpm || 0) / (currentVitals?.systolic_mmHg || 1), 'shockIndex')}
              </div>
              <div className="text-xs text-gray-400 mt-1">ratio</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Heart Rate</span>
                <Heart className="w-5 h-5 text-red-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatVital(currentVitals?.pulse_bpm, 'pulse')}
              </div>
              <div className="text-xs text-gray-400 mt-1">bpm</div>
            </CardContent>
          </Card>

          <Card className="shadow-sm hover:shadow-md transition-shadow bg-gray-800 border-gray-700">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-300">Resp Rate</span>
                <Wind className="w-5 h-5 text-purple-400" />
              </div>
              <div className="text-2xl font-bold text-white">
                {formatVital(currentVitals?.resp_rate_bpm, 'respRate')}
              </div>
              <div className="text-xs text-gray-400 mt-1">rpm</div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="shadow-sm bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white">Heart Rate & Blood Pressure</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                      color: '#ffffff'
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

          <Card className="shadow-sm bg-gray-800 border-gray-700">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-white">Respiratory & Saturation</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="time"
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <YAxis
                    stroke="#9ca3af"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
                      color: '#ffffff'
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

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Blood Loss Dynamics</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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

          <Card className="shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold text-gray-900">Trend Score</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis 
                    dataKey="time" 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'white',
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
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
        <Card className="shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Simulation Progress (10x interpolated data, 100ms intervals)
              </span>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {currentIndex + 1} / {patientVitals.length}
                </span>
                <Badge variant="outline" className="text-xs">
                  {Math.round(((currentIndex + 1) / patientVitals.length) * 100)}%
                </Badge>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 shadow-sm" 
                style={{ width: `${((currentIndex + 1) / patientVitals.length) * 100}%` }}
              ></div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export { RealtimeVitals };