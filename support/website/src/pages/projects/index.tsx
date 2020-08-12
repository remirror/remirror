import { useEffect } from 'react';

const ProjectRedirectPage = () => {
  useEffect(() => {
    window.location.replace('https://github.com/orgs/remirror/projects');
  }, []);

  return null;
};

export default ProjectRedirectPage;
