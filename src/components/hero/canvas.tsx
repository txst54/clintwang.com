import {MutableRefObject, useEffect, useRef} from "react"
import {PathTracer} from "@/components/hero/pathtracer/pathtracer";

export function Canvas() {
  const canvasRef: MutableRefObject<null | HTMLCanvasElement> = useRef(null);
  let pathTracer: PathTracer | null = null;

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (pathTracer) {
        pathTracer.setMouseCoords(e.clientX, e.clientY);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    let canvas;
    if (!canvasRef.current) {
      console.log("Canvas reference is null");
      return;
    } else {
      canvas = canvasRef.current as HTMLCanvasElement;
      pathTracer = new PathTracer(canvas);
      pathTracer.start();
    }
    // canvas.width = canvas.clientWidth;
    // canvas.height = canvas.clientHeight;
    // const gl = canvas.getContext('webgl2');
    //
    // if (!gl) {
    //   alert('WebGL not supported');
    //   return;
    // }
    //
    // // Set viewport and clear color
    // gl.viewport(0, 0, canvas.width, canvas.height);
    // gl.clearColor(0.2, 0.2, 0.2, 1.0);
    // gl.clear(gl.COLOR_BUFFER_BIT);

    // You can now create shaders, buffers, etc...
  }, [pathTracer]);

  return (
    <canvas
      ref={(element) => {
        canvasRef.current = element;
      }}
      className="absolute top-0 left-0 w-screen h-screen"
    />
  );
}