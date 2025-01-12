export interface RateLimitConfig {
  keyPrefix: string;
  points: number;
  duration: number;
  blockDuration?: number;
}
