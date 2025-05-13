import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import rehypeRaw from 'rehype-raw';
import 'katex/dist/katex.min.css';
import styled from 'styled-components';

const PostContainer = styled.article`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  padding: 0 1rem;
  font-size: 0.95rem;
  
  h1, h2, h3, h4, h5, h6 {
    color: var(--primary-color);
    margin-top: 2rem;
    margin-bottom: 1rem;
    line-height: 1.3;
    font-weight: 700;
  }

  h1 { font-size: 2.2rem; }
  h2 { font-size: 1.8rem; }
  h3 { font-size: 1.5rem; }
  h4 { font-size: 1.3rem; }
  h5 { font-size: 1.1rem; }
  h6 { font-size: 1rem; }

  p {
    margin-bottom: 1.5rem;
  }

  a {
    color: var(--primary-color);
    text-decoration: underline;
    &:hover {
      text-decoration: none;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem auto;
    border-radius: 4px;
    display: block;
  }

  pre {
    background: var(--code-bg);
    padding: 1rem;
    border-radius: 4px;
    overflow-x: auto;
    margin: 1.5rem 0;
  }

  code {
    font-family: 'Fira Code', monospace;
    background: var(--code-bg);
    padding: 0.2rem 0.4rem;
    border-radius: 3px;
    font-size: 0.9em;
  }

  blockquote {
    border-left: 4px solid var(--border);
    margin: 1.5rem 0;
    padding: 1rem;
    padding-right: 0;
    background: var(--background-alt);
    color: var(--text-muted);
    font-style: italic;
  }

  ul, ol {
    margin: 1rem 0;
    padding-left: 2rem;
  }

  li {
    margin: 0.5rem 0;
  }

  table {
    width: 100%;
    border-collapse: collapse;
    margin: 1.5rem 0;
    
    th, td {
      border: 1px solid var(--border);
      padding: 0.75rem;
    }
    
    th {
      background: var(--background-alt);
      font-weight: 600;
    }

    tr:nth-child(even) {
      background: var(--background-alt);
    }
  }
`;

const ImageWrapper = styled.div`
  margin: 2rem auto;
  text-align: center;
  
  img {
    max-width: 100%;
    height: auto;
    border-radius: 4px;
    margin: 0 auto;
  }
  
  .caption {
    margin-top: 0.5rem;
    color: var(--text-muted);
    font-size: 0.9em;
    font-style: italic;
  }
`;

const Meta = styled.div`
  margin-bottom: 2rem;
  color: var(--text-muted);
  font-size: 0.9rem;
`;

const Tags = styled.div`
  margin-top: 0.5rem;
  
  span {
    display: inline-block;
    background: var(--tag-bg);
    color: var(--tag-text);
    padding: 0.2rem 0.5rem;
    border-radius: 3px;
    margin-right: 0.5rem;
    font-size: 0.85rem;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 1rem;
  margin: 1rem 0;
  color: var(--error);
  background: var(--error-bg);
  border-radius: 4px;
  border: 1px solid var(--error-border);
`;

const ImageComponent = ({ alt, src, ...props }) => {
  // Use a smaller default width for images to avoid them being too large
  let width = '60%';
  let altText = alt || '';

  // If the alt text is actually a filename, clean it up for the caption
  if (altText.match(/\.(png|jpg|jpeg|gif|svg)$/i)) {
    // Remove file extension and convert kebab/snake case to title case
    altText = altText
      .replace(/\.(png|jpg|jpeg|gif|svg)$/i, '')
      .replace(/-|_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase());

    // Handle apostrophes in names that end with 's' followed by another word
    altText = altText.replace(/\b(\w+?)s\b(?=\s+[A-Z])/g, '$1\'s');
  }

  return (
    <ImageWrapper>
      <img
        src={src}
        alt={altText}
        loading="lazy"
        style={{
          maxWidth: width,
          height: 'auto',
          margin: '2rem auto',
          borderRadius: '4px',
          display: 'block'
        }}
        {...props}
      />
      {altText && (
        <div className="caption">
          {altText}
        </div>
      )}
    </ImageWrapper>
  );
};

const BlogPost = () => {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // Try direct path from decoded slug
        const decodedSlug = decodeURIComponent(slug);
        try {
          // Check if it looks like a path
          if (decodedSlug.includes('/')) {
            const pathParts = decodedSlug.split('/');
            const category = pathParts[0];
            const filename = pathParts[pathParts.length - 1];
            const postResponse = await fetch(`/content/blog/${category}/${filename}.json`);
            if (postResponse.ok) {
              const data = await postResponse.json();
              setPost(data);
              return;
            }
          }
        } catch (err) {
          console.error('Error fetching from direct path:', err);
          // Continue to try other methods
        }
        
        // Try by direct path
        try {
          const pathResponse = await fetch(`/content/blog/${decodeURIComponent(slug)}.json`);
          if (pathResponse.ok) {
            const data = await pathResponse.json();
            setPost(data);
            return;
          }
        } catch (err) {
          console.error('Error fetching from slug path:', err);
          // Continue to try other methods
        }

        // Get the index to look up the post
        const indexResponse = await fetch('/content/blog/index.json');
        if (!indexResponse.ok) throw new Error('Failed to load blog index');
        const posts = await indexResponse.json();
        
        // First try to match the slug directly
        let postInfo = posts.find(p => p.slug === slug);
        
        // If not found, try to match with the decoded path
        if (!postInfo) {
          const decodedSlug = decodeURIComponent(slug);
          postInfo = posts.find(p =>
            p.path === decodedSlug ||
            p.path.toLowerCase() === decodedSlug.toLowerCase()
          );
        }
        
        if (!postInfo) throw new Error('Post not found');
        
        // Fetch the post content
        const postResponse = await fetch(`/content/blog/${postInfo.category}/${postInfo.slug}.json`);
        if (!postResponse.ok) throw new Error('Failed to load post content');
        const data = await postResponse.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
        console.error('Error in blog post loading:', err);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    } else {
      setError('No post selected');
      setLoading(false);
    }
  }, [slug]);

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;
  if (!post) return <ErrorMessage>Post not found</ErrorMessage>;

  const components = {
    img: ImageComponent
  };

  // Custom preprocessing to handle special image syntax like ![[file.png|300]]
  const preprocessContent = (content) => {
    // Replace ![[filename.png|300]] with ![Custom caption](path/to/filename.png)
    let processed = content.replace(/!\[\[(.*?)\|(.*?)\]\]/g, (match, filename, width) => {
      // Extract just the filename without any path
      const baseName = filename.split('/').pop();

      // Create a proper caption, especially for the Gallais spiral image
      let caption = baseName.includes('gallais-evolutionary-spiral')
                    ? "Gallais's evolutionary spiral"
                    : baseName.replace(/\.(png|jpg|jpeg|gif|svg)$/i, '')
                            .replace(/-|_/g, ' ')
                            .replace(/\b\w/g, l => l.toUpperCase());

      return `![${caption}](/content/blog/assets/${baseName})`;
    });

    // Also handle ![[filename.png]] without width
    processed = processed.replace(/!\[\[(.*?)\]\]/g, (match, filename) => {
      const baseName = filename.split('/').pop();
      return `![${baseName}](/content/blog/assets/${baseName})`;
    });

    return processed;
  };

  return (
    <PostContainer>
      <h1>{post.title}</h1>
      <Meta>
        <time>{new Date(post.date).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</time>
        {post.tags && post.tags.length > 0 && (
          <Tags>
            {post.tags.map((tag, index) => (
              <span key={index}>{tag}</span>
            ))}
          </Tags>
        )}
      </Meta>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath]}
        rehypePlugins={[rehypeKatex, rehypeRaw]}
        components={components}
      >
        {preprocessContent(post.content)}
      </ReactMarkdown>
    </PostContainer>
  );
};

export default BlogPost;