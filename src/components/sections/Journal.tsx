import { ArrowUpRight } from "lucide-react";
import PostCard from "@/components/pages/PostCard";
import Roll from "@/components/ui/Roll";
import SectionHeader from "@/components/ui/SectionHeader";
import { posts } from "@/content/posts";

/** The latest writing, three posts and the way to the rest. */
export default function Journal() {
  const latest = [...posts]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3);
  return (
    <section id="blog" aria-labelledby="journal-title" className="section">
      <div className="shell">
        <SectionHeader
          id="journal-title"
          title={["Notes from", "the studio."]}
          description="Practical writing on building websites, apps, automation and growth that work together."
        />
        <div className="blog-grid blog-grid--home">
          {latest.map((post, i) => (
            <PostCard key={post.slug} post={post} featured={i === 0} />
          ))}
        </div>
        <div className="journal-more" data-reveal="up">
          <a href="/blog" className="btn">
            <Roll>All posts</Roll>
            <span className="btn-icon">
              <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </section>
  );
}
