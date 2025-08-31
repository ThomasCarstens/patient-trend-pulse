import { FC, useRef, useEffect } from "react";
import { useTCCCContext } from "@/contexts/TCCCContext";

interface InjuryDiagramProps {}

interface TourniquetField {
  id: string;
  label: string;
  position: { 
    top?: string; 
    left?: string; 
    right?: string; 
    bottom?: string; 
  };
  values: string[];
}

const InjuryDiagram: FC<InjuryDiagramProps> = () => {
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  
  const { 
    patientData, 
    updateInjuryDrawing, 
    updateTourniquetField 
  } = useTCCCContext();

  // Tourniquet fields configuration
  const tourniquetFields: TourniquetField[] = [
    {
      id: "rightArm",
      label: "Right Arm",
      position: { top: "20%", right: "10px" },
      values: patientData.tourniquets?.rightArm || ["", ""]
    },
    {
      id: "leftArm", 
      label: "Left Arm",
      position: { top: "20%", left: "10px" },
      values: patientData.tourniquets?.leftArm || ["", ""]
    },
    {
      id: "rightLeg",
      label: "Right Leg", 
      position: { bottom: "20%", right: "10px" },
      values: patientData.tourniquets?.rightLeg || ["", ""]
    },
    {
      id: "leftLeg",
      label: "Left Leg",
      position: { bottom: "20%", left: "10px" },
      values: patientData.tourniquets?.leftLeg || ["", ""]
    }
  ];

  const handleFieldChange = (limbId: string, index: number, value: string) => {
    updateTourniquetField(limbId, index, value);
  };

  // Initialize canvas
  useEffect(() => {
    const frontCanvas = frontCanvasRef.current;
    const backCanvas = backCanvasRef.current;
    
    if (frontCanvas && backCanvas) {
      const frontCtx = frontCanvas.getContext('2d');
      const backCtx = backCanvas.getContext('2d');
      
      if (frontCtx && backCtx) {
        // Set canvas size
        const resizeCanvas = () => {
          const parentWidth = frontCanvas.parentElement?.clientWidth || 300;
          const height = parentWidth * 1.5;
          
          frontCanvas.width = parentWidth;
          frontCanvas.height = height;
          backCanvas.width = parentWidth;
          backCanvas.height = height;
          
          // Set drawing style
          frontCtx.strokeStyle = 'red';
          frontCtx.lineWidth = 3;
          frontCtx.lineCap = 'round';
          backCtx.strokeStyle = 'red';
          backCtx.lineWidth = 3;
          backCtx.lineCap = 'round';
          
          // Load existing drawings if available
          if (patientData.injuryDrawings?.front) {
            const frontImg = new Image();
            frontImg.onload = () => frontCtx.drawImage(frontImg, 0, 0, frontCanvas.width, frontCanvas.height);
            frontImg.src = patientData.injuryDrawings.front;
          }
          
          if (patientData.injuryDrawings?.back) {
            const backImg = new Image();
            backImg.onload = () => backCtx.drawImage(backImg, 0, 0, backCanvas.width, backCanvas.height);
            backImg.src = patientData.injuryDrawings.back;
          }
        };
        
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        
        return () => {
          window.removeEventListener('resize', resizeCanvas);
        };
      }
    }
  }, [patientData.injuryDrawings]);

  // Draw X at position
  const drawX = (canvasRef: React.RefObject<HTMLCanvasElement>, x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const size = 10;
    ctx.beginPath();
    ctx.moveTo(x - size, y - size);
    ctx.lineTo(x + size, y + size);
    ctx.moveTo(x + size, y - size);
    ctx.lineTo(x - size, y + size);
    ctx.stroke();
  };
  
  const handleCanvasClick = (e: React.MouseEvent | React.TouchEvent, canvasRef: React.RefObject<HTMLCanvasElement>, side: 'front' | 'back') => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    
    // Draw X at click position
    drawX(canvasRef, x, y);
    
    // Save the canvas after drawing
    setTimeout(() => {
      if (canvas) {
        const dataUrl = canvas.toDataURL('image/png');
        updateInjuryDrawing(side, dataUrl);
      }
    }, 50);
  };

  return (
    <div className="flex flex-col mt-2">
      <div className="flex flex-row items-center gap-4">
        {/* Front View */}
        <div className="w-1/2 relative">
          <div className="relative">
            {/* Simple body outline as background */}
            <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center rounded relative border-2 border-border">
              <div className="text-muted-foreground text-sm">Front View</div>
              <canvas
                ref={frontCanvasRef}
                className="absolute inset-0 z-10 touch-none cursor-crosshair"
                onClick={(e) => handleCanvasClick(e, frontCanvasRef, 'front')}
                onTouchStart={(e) => handleCanvasClick(e, frontCanvasRef, 'front')}
              />
            </div>
            
            {/* Tourniquet fields for arms */}
            {tourniquetFields.slice(0, 2).map((field) => (
              <div 
                key={field.id}
                className="absolute bg-card p-2 rounded border border-border w-[100px] shadow-lg"
                style={{ 
                  top: field.position.top, 
                  left: field.position.left,
                  right: field.position.right
                }}
              >
                <p className="text-xs font-medium mb-1 text-card-foreground">{field.label}</p>
                <input 
                  type="text" 
                  placeholder="Type" 
                  className="w-full bg-input text-foreground rounded p-1 text-sm mb-1 border border-border"
                  value={field.values[0]}
                  onChange={(e) => handleFieldChange(field.id, 0, e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Time" 
                  className="w-full bg-input text-foreground rounded p-1 text-sm border border-border"
                  value={field.values[1]}
                  onChange={(e) => handleFieldChange(field.id, 1, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
        
        {/* Back View */}
        <div className="w-1/2 relative">
          <div className="relative">
            {/* Simple body outline as background */}
            <div className="w-full aspect-[2/3] bg-muted flex items-center justify-center rounded relative border-2 border-border">
              <div className="text-muted-foreground text-sm">Back View</div>
              <canvas
                ref={backCanvasRef}
                className="absolute inset-0 z-10 touch-none cursor-crosshair"
                onClick={(e) => handleCanvasClick(e, backCanvasRef, 'back')}
                onTouchStart={(e) => handleCanvasClick(e, backCanvasRef, 'back')}
              />
            </div>
            
            {/* Tourniquet fields for legs */}
            {tourniquetFields.slice(2, 4).map((field) => (
              <div 
                key={field.id}
                className="absolute bg-card p-2 rounded border border-border w-[100px] shadow-lg"
                style={{ 
                  bottom: field.position.bottom, 
                  left: field.position.left,
                  right: field.position.right
                }}
              >
                <p className="text-xs font-medium mb-1 text-card-foreground">{field.label}</p>
                <input 
                  type="text" 
                  placeholder="Type" 
                  className="w-full bg-input text-foreground rounded p-1 text-sm mb-1 border border-border"
                  value={field.values[0]}
                  onChange={(e) => handleFieldChange(field.id, 0, e.target.value)}
                />
                <input 
                  type="text" 
                  placeholder="Time" 
                  className="w-full bg-input text-foreground rounded p-1 text-sm border border-border"
                  value={field.values[1]}
                  onChange={(e) => handleFieldChange(field.id, 1, e.target.value)}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="text-center mt-3 text-xs text-muted-foreground">
        Click on the diagrams to mark injuries with an X
      </div>
    </div>
  );
};

export default InjuryDiagram;
