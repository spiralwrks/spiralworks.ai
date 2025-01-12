import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate, Outlet } from 'react-router-dom';
import styled from 'styled-components';

const BlogContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: var(--background);
  color: var(--text);
`;

const Sidebar = styled.div`
  padding: 1rem;
  border-right: 1px solid var(--border);
  background: var(--background-alt);
  overflow-y: auto;
`;

const Content = styled.div`
  padding: 2rem;
  overflow-y: auto;
`;

const PostList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const PostLink = styled(Link)`
  display: block;
  padding: 0.5rem;
  padding-left: ${props => `${props.$depth * 1}rem`};
  color: var(--text);
  text-decoration: none;
  border-radius: 4px;
  font-size: ${props => props.$isDirectory ? '0.9rem' : '0.85rem'};
  font-weight: ${props => props.$isDirectory ? '600' : '400'};

  &:hover {
    background: var(--hover);
  }

  &.active {
    background: var(--active);
  }
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 0.5rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border);
  border-radius: 4px;
  background: var(--background);
  color: var(--text);
`;

const HomeLink = styled(Link)`
  display: block;
  padding: 1rem;
  margin-bottom: 1rem;
  color: var(--text);
  text-decoration: none;
  font-weight: bold;
  border-bottom: 1px solid var(--border);

  &:hover {
    color: var(--link);
  }
`;

const WelcomeMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
  
  h1 {
    margin-bottom: 1rem;
  }
`;

const BlogLayout = () => {
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const { slug } = useParams();

  useEffect(() => {
    const loadPosts = async () => {
      try {
        const response = await fetch('/content/blog/index.json');
        const data = await response.json();
        // Filter out any posts without a path and sort them
        const validPosts = data.filter(post => post && post.path).sort((a, b) => {
          const pathA = a.path.toLowerCase();
          const pathB = b.path.toLowerCase();
          return pathA.localeCompare(pathB);
        });
        setPosts(validPosts);
      } catch (error) {
        console.error('Error loading blog posts:', error);
      }
    };

    loadPosts();
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.path.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (post.tags && post.tags.some(tag => 
      tag.toLowerCase().includes(searchTerm.toLowerCase())
    ))
  );

  const getDirectoryStructure = (posts) => {
    const structure = {};
    
    posts.forEach(post => {
      const parts = post.path.split('/');
      let current = structure;
      
      parts.forEach((part, index) => {
        if (!current[part]) {
          current[part] = {
            isFile: index === parts.length - 1,
            post: index === parts.length - 1 ? post : null,
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
      
      return (
        <li key={name}>
          {node.isFile ? (
            <PostLink
              to={`/blog/${encodeURIComponent(node.post.path)}`}
              className={decodeURIComponent(slug) === node.post.path ? 'active' : ''}
              $depth={depth}
            >
              {node.post.title || name}
            </PostLink>
          ) : (
            <>
              <PostLink as="div" $depth={depth} $isDirectory>
                {name}
              </PostLink>
              {hasChildren && (
                <PostList>
                  {renderDirectory(node.children, depth + 1)}
                </PostList>
              )}
            </>
          )}
        </li>
      );
    });
  };

  return (
    <BlogContainer>
      <Sidebar>
        <HomeLink to="/">← Back to Home</HomeLink>
        <SearchInput
          type="text"
          placeholder="Search posts..."
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