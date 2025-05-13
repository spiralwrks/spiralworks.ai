import React, { useState, useEffect } from 'react';
import { Link, useParams, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const BlogContainer = styled.div`
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  background: var(--background);
  color: var(--text);
  margin: 0;
  width: 100%;
  position: relative;
  z-index: 1;
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
  font-family: 'Montserrat', sans-serif;

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
  padding: 1.5rem;
  box-sizing: border-box;
  min-height: calc(100vh - 160px);
  position: relative;
  z-index: 1;
  width: 100%;
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

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem 0;
  margin-bottom: 1rem;
  border: none;
  border-bottom: 1px solid var(--nav-text-color);
  background: transparent;
  color: var(--nav-text-color);
  box-sizing: border-box;
  font-size: 0.75rem;
  transition: all var(--theme-transition-duration) ease;
  outline: none;

  &:focus {
    border-color: var(--primary-color);
  }

  &::placeholder {
    color: var(--nav-text-color);
    opacity: 0.7;
  }
`;

const HomeLink = styled(Link)`
  display: none; /* Hide the back button since we have the navbar */
`;

const BlogPostsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
  width: 85%;
  max-width: 1000px;
`;

const BlogPostCard = styled.div`
  background: var(--background-alt);
  border-radius: 6px;
  overflow: hidden;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid var(--border);
  height: 100%;
  display: flex;
  flex-direction: column;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
  }
`;

const BlogPostContent = styled.div`
  padding: 1rem;
  flex: 1;
  display: flex;
  flex-direction: column;
`;

const BlogPostTitle = styled.h3`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--primary-color);
  font-weight: 600;
`;

const BlogPostMeta = styled.div`
  font-size: 0.7rem;
  color: var(--text-muted);
  margin-bottom: 0.5rem;
`;

const BlogPostExcerpt = styled.p`
  font-size: 0.8rem;
  color: var(--text);
  margin-bottom: 0.75rem;
  flex: 1;
`;

const BlogPostTags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: auto;
  
  span {
    background: var(--tag-bg);
    color: var(--tag-text);
    padding: 0.1rem 0.4rem;
    border-radius: 3px;
    font-size: 0.65rem;
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
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDirs, setExpandedDirs] = useState(new Set());
  const { slug } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/content/blog/index.json');
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

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

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
      <Sidebar>
        <HomeLink to="/">← Back to Home</HomeLink>
        <SidebarContent>
          <SearchInput
            type="text"
            placeholder="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <PostList>
            {posts.length > 0 ? (
              renderDirectory(getDirectoryStructure(filteredPosts))
            ) : (
              <li>Loading posts...</li>
            )}
          </PostList>
        </SidebarContent>
      </Sidebar>
      <Content>
        <Outlet />
        {!slug && (
          <>
            <h1 style={{ color: 'var(--primary-color)', marginBottom: '1.5rem', marginTop: '0', textAlign: 'left', width: '85%', maxWidth: '1000px', paddingLeft: '1.5rem' }}>Blog Posts</h1>
            <BlogPostsGrid>
              {posts.length > 0 ? (
                posts.map((post, index) => (
                  <BlogPostCard key={index}>
                    <BlogPostLink to={`/blog/${encodeURIComponent(post.path)}`}>
                      <BlogPostContent>
                        <BlogPostTitle>{post.title.replace(" Manifesto", "\u00A0Manifesto")}</BlogPostTitle>
                        <BlogPostMeta>
                          {post.date && new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </BlogPostMeta>
                        <BlogPostExcerpt>
                          {post.excerpt || (post.content ? `${post.content.substring(0, 120)}...` : 'Read more...')}
                        </BlogPostExcerpt>
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