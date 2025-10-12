import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { HttpService } from '@nestjs/axios';

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number; // Unix timestamp in milliseconds
}

export interface IRateLimitStrategy {
  checkLimit(userId: string, plan: string, window: string): Promise<boolean>;
  getRemaining(userId: string, window: string): Promise<number>;
  getRateLimitInfo(userId: string, plan: string, window: string): Promise<RateLimitInfo>;
}

export interface PlanLimits {
  minute: number;
  hour: number;
}

export const PLAN_LIMITS: Record<string, PlanLimits> = {
  free: { minute: 10, hour: 100 },
  pro: { minute: 60, hour: 1000 },
  enterprise: { minute: 200, hour: 5000 },
};

export function getLimitsByPlan(plan: string): PlanLimits {
  return PLAN_LIMITS[plan] || PLAN_LIMITS.free;
}

export function getWindowSeconds(window: string): number {
  return window === 'minute' ? 60 : 3600;
}

