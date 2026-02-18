"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export interface VitalPoint {
  time: string;
  heartRate: number;
  systolic: number;
  diastolic: number;
  temperature: number;
  spo2: number;
  respRate: number;
}

function gaussian(mean: number, variance: number): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return mean + Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v) * variance;
}

function clamp(val: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, val));
}

function formatTime(): string {
  const now = new Date();
  return now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

export function useVitalsSimulator(intervalMs = 2000) {
  const [data, setData] = useState<VitalPoint[]>([]);
  const [current, setCurrent] = useState<VitalPoint | null>(null);
  const baseRef = useRef({
    heartRate: 72,
    systolic: 120,
    diastolic: 80,
    temperature: 98.6,
    spo2: 97,
    respRate: 16,
  });
  const deterioratingRef = useRef(false);

  const generatePoint = useCallback((): VitalPoint => {
    const b = baseRef.current;
    return {
      time: formatTime(),
      heartRate: clamp(Math.round(gaussian(b.heartRate, 4)), 40, 200),
      systolic: clamp(Math.round(gaussian(b.systolic, 6)), 70, 220),
      diastolic: clamp(Math.round(gaussian(b.diastolic, 4)), 40, 140),
      temperature: clamp(parseFloat(gaussian(b.temperature, 0.3).toFixed(1)), 95, 106),
      spo2: clamp(Math.round(gaussian(b.spo2, 1)), 80, 100),
      respRate: clamp(Math.round(gaussian(b.respRate, 1.5)), 8, 40),
    };
  }, []);

  useEffect(() => {
    // Seed initial data
    const initial: VitalPoint[] = [];
    for (let i = 0; i < 15; i++) {
      initial.push(generatePoint());
    }
    setData(initial);
    setCurrent(initial[initial.length - 1]);

    const timer = setInterval(() => {
      // If deteriorating, slowly drift baselines
      if (deterioratingRef.current) {
        const b = baseRef.current;
        b.heartRate = Math.min(b.heartRate + 0.8, 130);
        b.systolic = Math.max(b.systolic - 0.5, 85);
        b.spo2 = Math.max(b.spo2 - 0.3, 88);
        b.temperature = Math.min(b.temperature + 0.05, 103);
        b.respRate = Math.min(b.respRate + 0.3, 30);
      }

      const point = generatePoint();
      setCurrent(point);
      setData((prev) => {
        const next = [...prev, point];
        return next.length > 30 ? next.slice(-30) : next;
      });
    }, intervalMs);

    return () => clearInterval(timer);
  }, [intervalMs, generatePoint]);

  const triggerDeterioration = useCallback(() => {
    deterioratingRef.current = true;
    // Immediate bump
    baseRef.current.heartRate = 95;
    baseRef.current.spo2 = 93;
    baseRef.current.temperature = 100.4;
    baseRef.current.respRate = 22;
  }, []);

  const resetBaselines = useCallback(() => {
    deterioratingRef.current = false;
    baseRef.current = {
      heartRate: 72,
      systolic: 120,
      diastolic: 80,
      temperature: 98.6,
      spo2: 97,
      respRate: 16,
    };
  }, []);

  return { data, current, triggerDeterioration, resetBaselines };
}
