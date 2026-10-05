import type { Platform, TopPost } from "../../data/socialReport";

const fmt = (v: number) => new Intl.NumberFormat("de-DE").format(v);

export function TopPostsList({ posts, platforms }: { posts: TopPost[]; platforms: Platform[] }) {
  const byId = Object.fromEntries(platforms.map((p) => [p.id, p]));

  return (
    <div className="rounded-md border border-navy/8 bg-white p-6 sm:p-7">
      <h3 className="subheading text-[15px] text-navy">Top-Beiträge</h3>
      <div className="mt-5 flex flex-col divide-y divide-line">
        {posts.map((post) => {
          const platform = byId[post.platform];
          return (
            <div key={post.id} className="flex flex-col gap-2 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
              <div className="flex items-start gap-2.5">
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: platform.color }}
                  aria-hidden="true"
                />
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.08em] text-fog">{platform.name}</span>
                  <p className="mt-0.5 text-[13.5px] leading-snug text-navy">{post.excerpt}</p>
                </div>
              </div>
              <div className="flex shrink-0 gap-5 pl-4 text-[12px] [font-variant-numeric:tabular-nums] sm:pl-0 sm:text-right">
                <div>
                  <div className="font-bold text-navy">{fmt(post.reach)}</div>
                  <div className="text-[10.5px] text-muted">Reichweite</div>
                </div>
                <div>
                  <div className="font-bold text-navy">{post.engagementRate.toLocaleString("de-DE")} %</div>
                  <div className="text-[10.5px] text-muted">Engagement</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
