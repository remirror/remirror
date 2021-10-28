const CommandMenu = () => {
  return (
    <div>
      <p>
        <strong>navigator.userAgent</strong>: {navigator?.userAgent}
      </p>
      <p>
        <strong>navigator.platform</strong>: {navigator?.platform}
      </p>
      <p>
        <strong>navigator.userAgentData.platform</strong>:{' '}
        {(navigator as any)?.userAgentData.platform}
      </p>
    </div>
  );
};

const Basic = (): JSX.Element => {
  return <CommandMenu />;
};

export default Basic;
