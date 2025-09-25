// src/components/MarkdownLink.jsx
import React from 'react';
import styles from './TourModal.module.css'; // We can reuse styles from the modal

const MarkdownLink = ({ text }) => {
  if (!text) {
    return null;
  }

  // Regular expression to find a Markdown link: [text](url)
  const markdownLinkRegex = /\[(.*?)\]\((.*?)\)/;
  const match = text.match(markdownLinkRegex);

  // If a link is found in the text
  if (match && match[1] && match[2]) {
    const linkText = match[1];
    const url = match[2];
    
    // Find text before and after the link to display it all
    const textBefore = text.substring(0, match.index);
    const textAfter = text.substring(match.index + match[0].length);

    return (
      <p>
        {textBefore}
        <a href={url} target="_blank" rel="noopener noreferrer" className={styles.notesLink}>
          {linkText}
        </a>
        {textAfter}
      </p>
    );
  }

  // If no link is found, just render the plain text
  return <p>{text}</p>;
};

export default MarkdownLink;