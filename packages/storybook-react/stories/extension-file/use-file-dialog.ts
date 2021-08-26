export function useFileDialog(
  uploadFiles: (files: File[]) => void,
  accept?: string,
): {
  openFileDialog: () => void;
} {
  const openFileDialog = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;

    if (accept) {
      input.accept = accept;
    }

    input.addEventListener('change', (event: Event) => {
      const { files } = event.target as HTMLInputElement;

      if (files) {
        const fileArray: File[] = [];

        for (const file of files) {
          fileArray.push(file);
        }

        uploadFiles(fileArray);
      }
    });

    input.click();
  };

  return { openFileDialog };
}
