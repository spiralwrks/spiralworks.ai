import React, { useState, useEffect, useRef } from 'react';
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

const ImageErrorMessage = styled(ErrorMessage)`
  font-size: 0.9rem;
  padding: 0.5rem;
  margin: 0.5rem 0;
`;

const ImageComponent = ({ alt, src, ...props }) => {
  return (
    <ImageWrapper>
      <img
        src={src}
        alt={alt || ''}
        loading="lazy"
        style={{ 
          maxWidth: '100%',
          height: 'auto',
          margin: '2rem auto',
          borderRadius: '4px',
          display: 'block'
        }}
        {...props}
      />
      {alt && (
        <div className="caption">
          {alt}
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
  const [imageStates, setImageStates] = useState({});

  useEffect(() => {
    const fetchPost = async () => {
      try {
        // First fetch the index to find the post's path
        const indexResponse = await fetch('/content/blog/index.json');
        if (!indexResponse.ok) throw new Error('Failed to load blog index');
        const posts = await indexResponse.json();
        
        // Find the post by its path
        const postInfo = posts.find(p => p.path === decodeURIComponent(slug));
        if (!postInfo) throw new Error('Post not found');
        
        // Fetch the actual post using the category directory
        const postResponse = await fetch(`/content/blog/${postInfo.category}/${postInfo.slug}.json`);
        if (!postResponse.ok) throw new Error('Failed to load post content');
        const data = await postResponse.json();
        setPost(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  if (loading) return <LoadingMessage>Loading...</LoadingMessage>;
  if (error) return <ErrorMessage>Error: {error}</ErrorMessage>;
  if (!post) return <ErrorMessage>Post not found</ErrorMessage>;

  const components = {
    img: ImageComponent
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
        {post.content}
      </ReactMarkdown>
    </PostContainer>
  );
};

export default BlogPost; 