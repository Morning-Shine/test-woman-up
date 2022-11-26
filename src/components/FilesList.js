import React from 'react';
import extractFileExtention from '../utils/extractFileExtention';
import './FilesList.scss';

export default function FilesList({ files, setFiles, setFilesIdsToDelete }) {
  return (
    <ul className="files-list">
      {files.map((file) => (
        <li key={file.id}>
          <p>{file.name}</p>
          <svg
            onClick={() => {
              setFiles(files.filter((item) => item.id !== file.id));
              if (setFilesIdsToDelete)
                setFilesIdsToDelete((prev) => [
                  ...prev,
                  `${file.id}${extractFileExtention(file.name)}`,
                ]);
            }}
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 0 24 24"
            width="24px"
            fill={'orangered'}
          >
            <path d="M0 0h24v24H0z" fill="none" />
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
          </svg>
        </li>
      ))}
    </ul>
  );
}
