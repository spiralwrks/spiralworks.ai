import React, { useState, useEffect } from 'react';
import { Link, useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';
import StarryBackground from '../StarryBackground';

const BlogContainer = styled.div`
  display: block;
  background: var(--background);
  color: var(--text);
  margin: 0;
  width: 100%;
  position: relative;
  z-index: 1;
  min-height: 100vh;
  overflow-x: hidden;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: transparent;
  overflow: hidden;
  height: calc(100vh - 160px);
  position: sticky;
  top: 80px;
  z-index: 2;
`;

const SidebarContent = styled.div`
  padding: 1rem;
  overflow-y: auto;
  flex: 1;
  font-family: 'Chillax Variable', 'Chillax', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Hide scrollbar for Chrome, Safari and Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Hide scrollbar for IE, Edge and Firefox */
  -ms-overflow-style: none;  /* IE and Edge */
  scrollbar-width: none;  /* Firefox */
`;

const Content = styled.div`
  overflow-y: auto;
  padding: 60px 20px 60px;
  box-sizing: border-box;
  min-height: 100vh;
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PostLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.35rem 0;
  padding-left: ${props => `${props.$depth * 0.75}rem`};
  color: var(--nav-text-color);
  text-decoration: ${props => props.$isDirectory ? 'none' : 'underline'};
  text-decoration-color: ${props => props.$isDirectory ? 'transparent' : 'var(--primary-color)'};
  font-size: ${props => props.$isDirectory ? '0.8rem' : '0.75rem'};
  font-weight: ${props => props.$isDirectory ? '600' : '400'};
  width: 100%;
  position: relative;
  z-index: 3;
  transition: color var(--theme-transition-duration) ease;

  &:hover {
    color: var(--primary-color);
    background: transparent;
    text-decoration: none;
  }

  &.active {
    color: var(--primary-color);
    background: transparent;
    font-weight: 700;
  }
`;

const TreeIcon = styled.span`
  display: inline-flex;
  width: 12px;
  height: 12px;
  align-items: center;
  justify-content: center;
  margin-right: 6px;
  font-size: 7px;
  color: var(--nav-text-color);
  transition: color var(--theme-transition-duration) ease;

  ${PostLink}:hover & {
    color: var(--primary-color);
  }
`;

const DirectoryItem = styled.div`
  cursor: pointer;
  user-select: none;
`;


const HomeLink = styled(Link)`
  display: none; /* Hide the back button since we have the navbar */
`;

const BlogHeader = styled.div`
  text-align: center;
  margin-bottom: 40px;
  max-width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  h1 {
    font-size: clamp(3rem, 8vw, 5rem);
    font-weight: 400;
    margin-bottom: 1.5rem;
    background: linear-gradient(135deg, var(--text-color) 0%, var(--primary-color) 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    letter-spacing: -0.02em;
    font-family: 'Chillax Variable', 'Chillax', -apple-system, BlinkMacSystemFont, sans-serif;
  }

  .subtitle {
    font-size: clamp(1.2rem, 4vw, 1.8rem);
    color: var(--text-muted);
    margin-bottom: 3rem;
    font-weight: 400;
    line-height: 1.3;
    opacity: 0.8;
    max-width: 600px;
  }
`;

const BlogPostsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  gap: 1.5rem;
  width: 100%;
`;

const BlogPostCard = styled.div`
  background: var(--form-background);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 16px;
  overflow: hidden;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 2px solid rgba(134, 34, 201, 0.2);
  width: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 40px rgba(134, 34, 201, 0.15);
    border-color: rgba(134, 34, 201, 0.4);
  }
`;

const BlogPostContent = styled.div`
  padding: 20px 25px;
  flex: 1;
  display: flex;
  flex-direction: column;
  text-align: center;
`;

const BlogPostTitle = styled.h3`
  margin: 0 0 0.25rem;
  font-size: 1.75rem;
  color: var(--text-color);
  font-weight: 400;
  font-family: 'Chillax Variable', 'Chillax', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const BlogPostMeta = styled.div`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 0;
  opacity: 0.8;
`;

const BlogPostExcerpt = styled.p`
  font-size: 1rem;
  color: var(--text-color);
  margin: 0.25rem 0 0.75rem 0;
  flex: 1;
  line-height: 1.5;
  opacity: 0.9;
`;

const BlogPostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  justify-content: center;
  
  span {
    background: var(--tag-bg);
    color: var(--tag-text);
    padding: 0.3rem 0.8rem;
    border-radius: 6px;
    font-size: 0.9rem;
    border: 1px solid rgba(134, 34, 201, 0.2);
  }
`;

const BlogPostLink = styled(Link)`
  text-decoration: none;
  color: inherit;
  display: block;
  height: 100%;
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 1.5rem;
  color: var(--text-muted);
  background: var(--background);
  border-radius: 6px;
  margin-top: 1.5rem;
  font-size: 0.9rem;

  h1 {
    margin-bottom: 0.75rem;
    font-size: 1.8rem;
    color: var(--primary-color);
    font-weight: 700;
  }
`;

const BlogLayout = () => {
  const [posts, setPosts] = useState([]);
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const { slug } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch(`${process.env.PUBLIC_URL}/content/blog/index.json`);
        const data = await response.json();
        const validPosts = data.filter(post => post && post.path).sort((a, b) => {
          // First sort by date if available (newest first)
          if (a.date && b.date) {
            return new Date(b.date) - new Date(a.date);
          }
          // Then fallback to alphabetical by path
          const pathA = a.path.toLowerCase();
          const pathB = b.path.toLowerCase();
          return pathA.localeCompare(pathB);
        });
        setPosts(validPosts);
        
        // Expand all directories by default
        const allDirs = new Set();
        validPosts.forEach(post => {
          const parts = post.path.split('/');
          let path = '';
          parts.forEach((part, index) => {
            if (index < parts.length - 1) {
              path = path ? `${path}/${part}` : part;
              allDirs.add(path);
            }
          });
        });
        setExpandedDirs(allDirs);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      }
    };

    loadPosts();
  }, []); // Remove slug from dependencies since we want to maintain expansion state

  const filteredPosts = posts;

  const toggleDirectory = (path) => {
    setExpandedDirs(prev => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const getDirectoryStructure = (posts) => {
    const structure = {};
    
    posts.forEach(post => {
      const parts = post.path.split('/');
      let current = structure;
      let currentPath = '';
      
      parts.forEach((part, index) => {
        currentPath = currentPath ? `${currentPath}/${part}` : part;
        if (!current[part]) {
          current[part] = {
            isFile: index === parts.length - 1,
            post: index === parts.length - 1 ? post : null,
            path: currentPath,
            children: {}
          };
        }
        current = current[part].children;
      });
    });
    
    return structure;
  };

  const renderDirectory = (structure, depth = 0) => {
    return Object.entries(structure).map(([name, node]) => {
      const hasChildren = Object.keys(node.children).length > 0;
      const isExpanded = expandedDirs.has(node.path);
      
      if (node.isFile) {
        return (
          <li key={name}>
            <PostLink
              to={`/blog/${encodeURIComponent(node.post.path)}`}
              className={slug && decodeURIComponent(slug) === node.post.path ? 'active' : ''}
              $depth={depth}
            >
              {node.post.title || name}
            </PostLink>
          </li>
        );
      }
      
      return (
        <li key={name}>
          <DirectoryItem>
            <PostLink
              as="div"
              $depth={depth}
              $isDirectory
              onClick={() => toggleDirectory(node.path)}
              style={{ cursor: 'pointer' }}
            >
              <TreeIcon>{isExpanded ? '▼' : '▶'}</TreeIcon>
              {name}
            </PostLink>
          </DirectoryItem>
          {hasChildren && isExpanded && (
            <PostList>
              {renderDirectory(node.children, depth + 1)}
            </PostList>
          )}
        </li>
      );
    });
  };

  return (
    <BlogContainer>
      <StarryBackground />
      <Content>
        <Outlet />
        {!slug && (
          <>
            <BlogHeader>
              <h1>Blog</h1>
              <div className="subtitle">
                Insights on AI, Humanity, & the Future of Creative Scientific Discovery
              </div>
            </BlogHeader>
            <BlogPostsGrid>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <BlogPostCard key={index}>
                    <BlogPostLink to={`/blog/${encodeURIComponent(post.path)}`}>
                      <BlogPostContent>
                        <BlogPostTitle>{post.title.replace(" Manifesto", "\u00A0Manifesto")}</BlogPostTitle>
                        <BlogPostExcerpt>
                          {post.preview || 'Read more...'}
                        </BlogPostExcerpt>
                        <BlogPostMeta>
                          {post.author && <span>{post.author} • </span>}
                          {post.date && new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </BlogPostMeta>
                        {post.tags && post.tags.length > 0 && (
                          <BlogPostTags>
                            {post.tags.slice(0, 3).map((tag, idx) => (
                              <span key={idx}>{tag}</span>
                            ))}
                          </BlogPostTags>
                        )}
                      </BlogPostContent>
                    </BlogPostLink>
                  </BlogPostCard>
                ))
              ) : (
                <WelcomeMessage>
                  <h1>Welcome to the Blog</h1>
                  <p>Loading posts...</p>
                </WelcomeMessage>
              )}
            </BlogPostsGrid>
          </>
        )}
      </Content>
    </BlogContainer>
  );
};

export default BlogLayout; 