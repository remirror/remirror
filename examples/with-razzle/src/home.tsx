import styled from '@emotion/styled';
import React from 'react';
import logo from './logo.svg';

class Home extends React.Component {
  public render() {
    return (
      <StyledWrapper>
        <div className='Home'>
          <div className='Home-header'>
            <img src={logo} className='Home-logo' alt='logo' />
            <h2>Welcome to Razzles / Remirror</h2>
          </div>
          <p className='Home-intro'>
            To get started, edit <code>src/App.tsx</code> or <code>src/Home.tsx</code> and save to reload.
          </p>
          <ul className='Home-resources'>
            <li>
              <a href='/editors/wysiwyg'>wysiwyg</a>
            </li>
            <li>
              <a href='/editors/social'>social</a>
            </li>
          </ul>
        </div>
      </StyledWrapper>
    );
  }
}

const StyledWrapper = styled.div`
  .Home {
    text-align: center;
  }

  .Home-logo {
    height: 80px;
  }

  .Home-header {
    background-color: #222;
    height: 150px;
    padding: 20px;
    color: white;
  }

  .Home-intro {
    font-size: large;
  }

  .Home-resources {
    list-style: none;
  }

  .Home-resources > li {
    display: inline-block;
    padding: 1rem;
  }
`;

export default Home;
