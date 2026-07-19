import React, { useState, useEffect } from "react";
import "./App.css";

const LatestNews = () => {
  const [posts, setPosts] = useState([]);
  const [visiblePosts, setVisiblePosts] = useState(5);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("https://tailwindcss.com/feeds/feed.xml");
        const xmlText = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(xmlText, "text/xml");
        const items = xml.querySelectorAll("item");

        const fetchedPosts = Array.from(items).map((item) => {
          const titleElement = item.querySelector("guid");
          const title = titleElement?.textContent || "";

          const pubDate = new Date(
            item.querySelector("pubDate")?.textContent || "",
          ).toLocaleString();

          const link = item.querySelector("link")?.textContent || "";

          const enclosureElement = item.querySelector("enclosure");
          const heroImage = enclosureElement?.getAttribute("url") || "";

          const description =
            (item.querySelector("description")?.textContent || "")
              .replace(/(<([^>]+)>)/gi, "")
              .slice(0, 200) + "...";

          return { title, pubDate, link, heroImage, description };
        });

        setPosts(fetchedPosts);
      } catch (error) {
        console.error("Error fetching RSS:", error);
      }
    };

    fetchData();
  }, []);

  const loadMorePosts = () => {
    setVisiblePosts(visiblePosts + 5);
  };

  return (
    <div className="container">
      <h1>🌟 Latest News from Tailwind CSS</h1>
      {posts.slice(0, visiblePosts).map((post, index) => (
        <a key={index} href={post.link} className="post-preview">
          <img src={post.heroImage} alt="Hero" className="hero-image" />
          <div className="post-details">
            <h3 className="title">{post.title}</h3>
            <p className="published-date">Published Date: {post.pubDate}</p>
            <p className="description">{post.description}</p>
          </div>
        </a>
      ))}
      {visiblePosts < posts.length && (
        <button className="load-more-btn" onClick={loadMorePosts}>
          Load more
        </button>
      )}
    </div>
  );
};

export default LatestNews;
