"use client";

import React, { useState, useEffect, useRef } from "react";

const BicycleGame = () => {
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(10);
  const [circles, setCircles] = useState<
    { x: number; y: number; targetX?: number; targetY?: number }[]
  >([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas: HTMLCanvasElement | null = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animationFrameId: number;
    const drawRoad = () => {
      if (ctx) {
        ctx.fillStyle = "blue";
        ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
      }
    };
    const drawBicycles = () => {
      if (ctx) {
        ctx.fillStyle = "#fff";
        for (let x = 0; x < canvas.width; x += 100) {
          ctx.beginPath();
          ctx.arc(x, canvas.height / 2, 10, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };
    const drawCircles = () => {
      if (ctx) {
        ctx.fillStyle = "red";
        circles.forEach((circle) => {
          if (
            typeof circle.targetX === "undefined" ||
            typeof circle.targetY === "undefined"
          ) {
            circle.targetX = Math.random() * canvas.width;
            circle.targetY = Math.random() * canvas.height;
          }

          // Move circle towards its target point
          const dx = circle.targetX - circle.x;
          const dy = circle.targetY - circle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance > 1) {
            circle.x += dx / distance;
            circle.y += dy / distance;
          } else {
            // Circle reached its target, generate a new one
            circle.targetX = Math.random() * canvas.width;
            circle.targetY = Math.random() * canvas.height;
          }

          // Keep circles within canvas bounds
          circle.x = Math.max(15, Math.min(circle.x, canvas.width - 15));
          circle.y = Math.max(15, Math.min(circle.y, canvas.height - 15));

          // Check if circle entered the road
          if (
            circle.y >= canvas.height / 2 - 40 &&
            circle.y <= canvas.height / 2 + 40
          ) {
            // Remove the circle that entered the road
            circles.splice(circles.indexOf(circle), 1);
            setLives((prevLives: number) => Math.max(0, prevLives - 1));

            if (lives - 1 === 0) {
              alert("Game Over! Click OK to restart.");
              setScore(0);
              setLives(10);
              setCircles([]);
            }
            return;
          }

          ctx.beginPath();
          ctx.arc(circle.x, circle.y, 16, 0, Math.PI * 2);
          ctx.fill();
        });
      }
    };

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      drawRoad();
      drawBicycles();
      drawCircles();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [circles]);

  useEffect(() => {
    const addCircle = () => {
      if (canvasRef.current && circles.length < 10) {
        let newX, newY;
        do {
          newX = Math.random() * canvasRef.current.width;
          newY = Math.random() * canvasRef.current.height;
        } while (
          newY > canvasRef.current.height / 2 - 40 &&
          newY < canvasRef.current.height / 2 + 40
        );
        const newCircle = { x: newX, y: newY };
        setCircles((prevCircles) => [...prevCircles, newCircle]);
      }
    };

    const intervalId = setInterval(addCircle, 1000);

    return () => clearInterval(intervalId);
  }, [circles]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    setCircles((prevCircles) =>
      prevCircles.filter((circle) => {
        const distance = Math.sqrt((circle.x - x) ** 2 + (circle.y - y) ** 2);
        if (distance <= 15) {
          setScore((prevScore) => prevScore + 1);
          return false;
        }
        return true;
      })
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground">
      <h1 className="text-2xl font-bold mb-4">Bicycle Road Game</h1>
      <p className="mb-2">Score: {score}</p>
      <p className="mb-4">Lives: {lives}</p>
      <canvas
        ref={canvasRef}
        width={800}
        height={400}
        onClick={handleCanvasClick}
        className="border bg-slate-300"
      />
      <p className="mt-4 text-center">
        Click on the red circles to remove them and score points! <br />
        <a
          href="https://twitter.com/yasinelbuz"
          target="_blank"
          className="text-blue-500"
        >
          @yasinelbuz
        </a>
      </p>
      {lives === 0 && <p className="text-red-500 font-bold mt-2">Game Over!</p>}
    </div>
  );
};

export default BicycleGame;
