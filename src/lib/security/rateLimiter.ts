type RateLimitConfig = {
    capacity?: number;
    refillPerMinute?: number;
};

export type RateLimitResult = {
    allowed: boolean;
    remaining: number;
    retryAfter: number;
};

type BucketState = {
    tokens: number;
    updatedAt: number;
};

export class RateLimiter {
    constructor(private readonly state: DurableObjectState) {}

    async fetch(request: Request): Promise<Response> {
        if (request.method !== "POST") {
            return new Response("Method not allowed", { status: 405 });
        }

        const body = (await request.json().catch(() => ({}))) as RateLimitConfig;

        const capacity = clampInt(body.capacity ?? 12, 1, 60);
        const refillPerMinute = clampInt(body.refillPerMinute ?? 12, 1, 60);

        const now = Date.now();
        const bucket = 
            (await this.state.storage.get<BucketState>("bucket")) ?? {
                tokens: capacity,
                updatedAt: now,
            };
        
        const elapsedMinutes = Math.max(0, (now - bucket.updatedAt) / 60000);
        bucket.tokens = Math.min(capacity, bucket.tokens + elapsedMinutes * refillPerMinute);
        bucket.updatedAt = now;

        const allowed = bucket.tokens >= 1;
        if (allowed) bucket.tokens -= 1;

        await this.state.storage.put("bucket", bucket);

        const retryAfter = allowed
            ? 0
            : Math.max(1, Math.ceil(((1 - bucket.tokens) / refillPerMinute) * 60));

        return Response.json({
            allowed,
            remaining: Math.floor(bucket.tokens),
            retryAfter,
        } satisfies RateLimitResult);
    }
}

function clampInt(value: number, min: number, max: number) {
    return Math.max(min, Math.min(max, Math.floor(value)));
}

function getClientKey(request: Request) {
    const ip =
        request.headers.get("CF-Connecting-IP")?.trim() ||
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
        "anonymous";

    return ip;
}

export async function enforceRateLimit(
    env: Env,
    request: Request,
    options: { capacity?: number; refillPerMinute?: number } = {},
): Promise<RateLimitResult> {
    if (!env.RATE_LIMITER) {
        return { allowed: true, remaining: options.capacity ?? 10, retryAfter: 0 };
    }

    const key = getClientKey(request);
    const id = env.RATE_LIMITER.idFromName(key);
    const stub = env.RATE_LIMITER.get(id);

    const res = await stub.fetch("https://rate-limiter/check", {
        method: "POST",
        body: JSON.stringify({
            capacity: options.capacity ?? 12,
            refillPerMinute: options.refillPerMinute ?? 12,
        }),
    });

    return (await res.json()) as RateLimitResult;
}