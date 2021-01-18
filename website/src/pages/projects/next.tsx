import { useEffect } from 'react';

const ProjectRedirectPage = () => {
  useEffect(() => {
    window.location.replace('https://github.com/orgs/remirror/projects/1');
  }, []);

  return null;
};

export default ProjectRedirectPage;
