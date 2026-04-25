import React from 'react';
import './PageLayout.css';

const PageLayout = ({ children }) => {
    return (
        <main className="page-layout">
            {children}
        </main>
    );
};

export default PageLayout;
