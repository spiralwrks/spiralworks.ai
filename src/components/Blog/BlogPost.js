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

const ImageErrorMessage = styled(ErrorMessage)`
  font-size: 0.9rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
`;

const BlogPost = () => {
  const { slug, '*': restPath } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadPost = async () => {
      try {
        setError(null);
        const fullPath = restPath ? `${slug}/${restPath}` : slug;
        const decodedPath = decodeURIComponent(fullPath);
        
        const response = await fetch(`/content/blog/${decodedPath}.json`);
        if (!response.ok) {
          throw new Error(`Post not found (${response.status})`);
        }
        const data = await response.json();
        setPost(data);
      } catch (error) {
        console.error('Error loading blog post:', error);
        setError(error.message);
      }
    };

    if (slug) {
      loadPost();
    }
  }, [slug, restPath]);

  const processContent = (content) => {
    // First replace image markdown with HTML
    const withImages = content.replace(
      /!\[(.*?)\]\((.*?)\)/g,
      (match, alt, src) => {
        const imagePath = src.startsWith('/') ? src.slice(1) : src;
        return `<img src="/content/blog/${imagePath}" alt="${alt || ''}" />`;
      }
    );
    return withImages;
  };

  if (error) {
    return <ErrorMessage>Error: {error}</ErrorMessage>;
  }

  if (!post) {
    return <LoadingMessage>Loading...</LoadingMessage>;
  }

  const processedContent = processContent(post.content);

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
      >
        {processedContent}
      </ReactMarkdown>
    </PostContainer>
  );
};

export default BlogPost; 