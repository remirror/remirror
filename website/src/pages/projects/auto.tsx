import { useEffect } from 'react';

const ProjectRedirectPage = () => {
  useEffect(() => {
    window.location.replace('https://github.com/orgs/remirror/projects/5');
  }, []);

  return null;
};

export default ProjectRedirectPage;
