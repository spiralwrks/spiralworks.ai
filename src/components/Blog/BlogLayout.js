import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const BlogContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  background: var(--background);
  color: var(--text);
  margin: 0 auto;
  max-width: 1200px;
  width: 100%;
  padding: 0 1rem;
  position: relative;
  z-index: 1;
`;

const Sidebar = styled.div`
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--border);
  background: transparent;
  overflow: hidden;
  height: calc(100vh - 180px);
  position: sticky;
  top: 120px;
  z-index: 2;
`;

const SidebarContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
  
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
  padding: 2rem;
  box-sizing: border-box;
  min-height: calc(100vh - 180px);
  position: relative;
  z-index: 1;
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PostLink = styled(Link)`
  display: flex;
  align-items: center;
  padding: 0.5rem 0;
  padding-left: ${props => `${props.$depth * 1}rem`};
  color: var(--nav-text-color);
  text-decoration: none;
  font-size: ${props => props.$isDirectory ? '0.9rem' : '0.85rem'};
  font-weight: ${props => props.$isDirectory ? '600' : '400'};
  width: 100%;
  position: relative;
  z-index: 3;
  transition: color var(--theme-transition-duration) ease;

  &:hover {
    color: var(--primary-color);
    background: transparent;
  }

  &.active {
    color: var(--primary-color);
    background: transparent;
    font-weight: 600;
  }
`;

const TreeIcon = styled.span`
  display: inline-flex;
  width: 16px;
  height: 16px;
  align-items: center;
  justify-content: center;
  margin-right: 8px;
  font-size: 8px;
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
  padding: 0.75rem 0;
  margin-bottom: 1.5rem;
  border: none;
  border-bottom: 1px solid var(--nav-text-color);
  background: transparent;
  color: var(--nav-text-color);
  box-sizing: border-box;
  font-size: 0.9rem;
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

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  background: var(--background);
  border-radius: 8px;
  margin-top: 2rem;
  
  h1 {
    margin-bottom: 1rem;
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
          <WelcomeMessage>
            <h1>Welcome to the Blog</h1>
            <p>Select a post from the sidebar to start reading</p>
          </WelcomeMessage>
        )}
      </Content>
    </BlogContainer>
  );
};

export default BlogLayout; 