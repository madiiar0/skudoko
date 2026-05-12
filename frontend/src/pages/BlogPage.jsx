import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Eye, LockKeyhole, Newspaper } from 'lucide-react'

import PageTopbar from '../components/PageTopbar'
import { blogs } from '../data/blogs'
import { useAuth } from '../hooks/useAuth'

function LockedBlogModal({ onCancel, onUpgrade }) {
  return (
    <div className="modal-backdrop">
      <div className="history-modal blog-lock-modal">
        <h2>This article is available with Pro.</h2>
        <p>Upgrade to Pro to unlock advanced Sudoku lessons and premium content.</p>
        <div className="history-modal-actions">
          <button type="button" className="history-modal-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button type="button" className="history-action" onClick={onUpgrade}>
            Upgrade to Pro
          </button>
        </div>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [lockedBlog, setLockedBlog] = useState(null)

  function handleBlogClick(blog) {
    if (blog.isProOnly && !user?.isPro) {
      setLockedBlog(blog)
      return
    }

    navigate(`/blogs/${blog.slug}`)
  }

  return (
    <div className="blog-page">
      <PageTopbar
        title="Blogs"
        subtitle="Static Sudoku lessons and strategy notes for learning the game."
      />

      <section className="blog-grid">
        {blogs.map(blog => {
          const locked = blog.isProOnly && !user?.isPro

          return (
            <button
              key={blog.slug}
              type="button"
              className={`blog-card ${locked ? 'blog-card-locked' : ''}`}
              onClick={() => handleBlogClick(blog)}
            >
              <div className="blog-card-topline">
                <span className="blog-card-icon">
                  <Newspaper size={18} />
                </span>
                {blog.isProOnly ? (
                  <span className="blog-pro-pill">
                    {locked ? <LockKeyhole size={12} /> : null}
                    Pro
                  </span>
                ) : (
                  <span className="blog-free-pill">Free</span>
                )}
              </div>
              <h2>{blog.title}</h2>
              <p>{blog.excerpt}</p>
              <div className="blog-card-meta">
                <Eye size={15} />
                <span>{blog.fakeViews} views</span>
              </div>
            </button>
          )
        })}
      </section>

      {lockedBlog ? (
        <LockedBlogModal
          onCancel={() => setLockedBlog(null)}
          onUpgrade={() => {
            setLockedBlog(null)
            navigate('/upgrade')
          }}
        />
      ) : null}
    </div>
  )
}
