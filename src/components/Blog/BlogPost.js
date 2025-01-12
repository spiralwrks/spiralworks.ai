import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styled from 'styled-components';

const PostContainer = styled.article`
  max-width: 800px;
  margin: 0 auto;
  line-height: 1.6;
  
  h1, h2, h3, h4, h5, h6 {
    color: var(--heading);
    margin-top: 2rem;
    margin-bottom: 1rem;
    line-height: 1.3;
  }

  h1 { font-size: 2.5rem; }
  h2 { font-size: 2rem; }
  h3 { font-size: 1.75rem; }
  h4 { font-size: 1.5rem; }
  h5 { font-size: 1.25rem; }
  h6 { font-size: 1.1rem; }

  p {
    margin-bottom: 1.5rem;
  }

  a {
    color: var(--link);
    text-decoration: none;
    &:hover {
      text-decoration: underline;
    }
  }

  img {
    max-width: 100%;
    height: auto;
    margin: 2rem 0;
    border-radius: 4px;
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
    padding-left: 1rem;
    color: var(--text-muted);
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
  padding: 2rem;
  color: var(--error);
`;

const BlogPost = () => {
  const { slug, '*': restPath } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setError(null);
        // Combine slug and restPath for nested routes
        const fullPath = restPath ? `${slug}/${restPath}` : slug;
        console.log('Attempting to load post:', fullPath);
        
        const response = await fetch(`/content/blog/${fullPath}.json`);
        if (!response.ok) {
          throw new Error(`Post not found (${response.status})`);
        }
        const text = await response.text();
        try {
          const data = JSON.parse(text);
          setPost(data);
        } catch (e) {
          console.error('Invalid JSON:', text);
          throw new Error('Invalid post data');
        }
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError(error.message);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, restPath]);

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!post) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

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
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" />
          ),
          img: ({ node, ...props }) => (
            <img 
              {...props} 
              loading="lazy"
              onError={(e) => {
                // Try to load from assets directory if the original source fails
                if (!e.target.src.startsWith('/content/blog/assets/')) {
                  e.target.src = `/content/blog/assets/${props.src}`;
                }
              }}
            />
          ),
        }}
      >
        {post.content}
      </ReactMarkdown>
    </PostContainer>
  );
};

export default BlogPost; 