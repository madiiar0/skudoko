import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, LockKeyhole } from 'lucide-react'

import PageTopbar from '../components/PageTopbar'
import { getBlogBySlug } from '../data/blogs'
import { useAuth } from '../hooks/useAuth'

function BlogNotFound() {
  return (
    <div className="blog-page">
      <PageTopbar title="Article not found" subtitle="That article does not exist yet." />
      <div className="history-empty blog-empty-state">
        <h2>Unknown article</h2>
        <p>The article you opened could not be found.</p>
        <Link className="history-action" to="/blogs">
          Back to Blogs
        </Link>
      </div>
    </div>
  )
}

function LockedArticle() {
  return (
    <div className="blog-page">
      <PageTopbar
        title="Advanced Sudoku Strategies"
        subtitle="This premium article is available with Pro."
      />
      <section className="blog-locked-panel">
        <LockKeyhole size={34} />
        <h2>This article is available only with Pro.</h2>
        <p>
          Upgrade to Pro to unlock advanced Sudoku lessons, premium strategy content,
          and your Pro badge.
        </p>
        <Link className="history-action" to="/upgrade">
          Upgrade to Pro
        </Link>
      </section>
    </div>
  )
}

export default function BlogDetailPage() {
  const { slug } = useParams()
  const { user } = useAuth()
  const blog = getBlogBySlug(slug)

  if (!blog) {
    return <BlogNotFound />
  }

  if (blog.isProOnly && !user?.isPro) {
    return <LockedArticle />
  }

  return (
    <div className="blog-page">
      <PageTopbar
        leftAction={(
          <Link className="blog-back-link blog-back-link-topbar" to="/blogs">
            <ArrowLeft size={15} />
            Back to Blogs
          </Link>
        )}
      />

      <article className="blog-article">
        <header className="blog-article-hero">
          <span>{blog.isProOnly ? 'Pro lesson' : 'Free lesson'}</span>
          <h1>{blog.title}</h1>
          <p>{blog.excerpt}</p>
        </header>

        <blockquote className="blog-callout">
          {blog.callout}
        </blockquote>

        {/*<div className="blog-rule-block">*/}
        {/*  {blog.ruleBlock.map(rule => (*/}
        {/*    <code key={rule}>{rule}</code>*/}
        {/*  ))}*/}
        {/*</div>*/}

        {blog.sections.map(section => (
          <section key={section.heading} className="blog-article-section">
            <h2>{section.heading}</h2>
            <p>{section.body}</p>
            <ul>
              {section.bullets.map(bullet => (
                <li key={bullet}>{bullet}</li>
              ))}
            </ul>
          </section>
        ))}

        <aside className="blog-tip-box">
          <strong>Coach tip</strong>
          <p>{blog.tip}</p>
        </aside>
      </article>
    </div>
  )
}
