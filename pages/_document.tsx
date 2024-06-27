import Document, { Head, Html, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="en">
        <Head>
          <link rel="icon" href="https://i.ibb.co/hxGqgZn/f66662eaad87f5ba3cc73e4741623df8.jpg"/>
          <meta
            name="description"
            content="Generate your next bio in seconds."
          />
          <meta property="og:site_name" content="" />
          <meta
            property="og:description"
            content="Generate your next bio in seconds."
          />
          <meta property="og:title" content="Bio Generator" />
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content="Bio Generator" />
          <meta
            name="twitter:description"
            content="Generate your next bio in seconds."
          />
          <meta
            property="og:image"
            content=" "
          />
          <meta
            name="twitter:image"
            content=" "
          />
        </Head>
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export default MyDocument;
