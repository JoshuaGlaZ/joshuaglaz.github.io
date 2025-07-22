import { Redis } from "@upstash/redis";

class CacheManager {
  private redis: Redis;
  private readonly TTL = {
    VIEWS: 3600, // 1 hour
    PROJECTS: 1800, // 30 minutes
    STATIC_DATA: 86400, // 24 hours
  };

  constructor() {
    this.redis = Redis.fromEnv();
  }

  async getMultipleViews(slugs: string[]): Promise<Record<string, number>> {
    const keys = slugs.map(slug => `pageviews:projects:${slug}`);
    const values: (string | null)[] = await this.redis.mget(...keys);

    return slugs.reduce((acc: Record<string, number>, slug, index) => {
      const value = values[index];
      acc[slug] = (value !== null && value !== undefined) ? parseInt(value, 10) : 0;
      return acc;
    }, {} as Record<string, number>);
  }

  async warmCache(projects: any[]) {
    const pipeline = this.redis.pipeline();

    projects.forEach(project => {
      const key = `project:${project.slug}`;
      pipeline.setex(key, this.TTL.PROJECTS, JSON.stringify(project));
    });

    await pipeline.exec();
  }

  async incrementViewWithDebounce(slug: string, userKey: string) {
    const debounceKey = `debounce:${userKey}:${slug}`;
    const exists = await this.redis.exists(debounceKey);

    if (!exists) {
      await this.redis.setex(debounceKey, 300, "1"); // 5 min debounce
      await this.redis.incr(`pageviews:projects:${slug}`);
      return true;
    }
    return false;
  }
}

export const cacheManager = new CacheManager();