import { ArrowUpRight } from "lucide-react";
import PageBlocks from "@/components/pages/PageBlocks";
import Roll from "@/components/ui/Roll";

export default function NotFound() {
  return (
    <main id="main" tabIndex={-1} className="not-found" data-blocks="">
      <PageBlocks loose />
      <div className="not-found-frame" data-blocks-frame="" />
      <div className="shell not-found-inner">
        <p className="figure caption text-muted">404</p>
        <h1 className="h1">This page is not part of the system.</h1>
        <p className="lead text-muted">
          The link may be old, or the page moved. Everything else is one click
          away.
        </p>
        <div className="not-found-actions">
          <a href="/" className="btn btn-primary">
            <Roll>Back to home</Roll>
            <span className="btn-icon">
              <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
          <a href="/services" className="btn">
            <Roll>See our services</Roll>
            <span className="btn-icon">
              <ArrowUpRight size={18} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
        </div>
      </div>
    </main>
  );
}
