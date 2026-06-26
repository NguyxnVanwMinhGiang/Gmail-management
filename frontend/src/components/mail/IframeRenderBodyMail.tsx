const IframeEmailViewer = ({ htmlContent }: { htmlContent: string }) => {
  return (
    <iframe
      srcDoc={`
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                margin: 0;
                padding: 16px; /* Thêm lề một chút để chữ không dính sát mép */
                background-color: #ffffff; /* Ép nền trắng cho bên trong Iframe */
                word-wrap: break-word;
              }
              img {
                max-width: 100% !important;
                height: auto !important;
              }
              table {
                max-width: 100% !important;
              }
              /* Tránh tràn ngang vỡ layout */
              div, table {
                overflow-x: auto;
              }
            </style>
          </head>
          <body>
            ${htmlContent}
          </body>
        </html>
      `}
      title="Nội dung Email"
      className="w-full min-h-[77vh] h-full border-none" 
      sandbox="allow-popups allow-same-origin"
    />
  );
};

export default IframeEmailViewer;