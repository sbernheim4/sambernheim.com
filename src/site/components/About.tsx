export const About = () => {
  return (
    <section className="about">
      <svg viewBox="0 0 500 80">
        <polygon points="40, 80 500, 80 500, 0" />
        <text x="380" y="50" fontSize="24px" fill="black">
          About Me
        </text>
      </svg>
      <div>
        <h1>About Me</h1>
        <h2>Hi, I&apos;m Sam</h2>
        <p>I live in New York City and work at Balyasny</p>
        <p>Previously Wunderkind, Twitter and Disney Streaming</p>
      </div>
    </section>
  );
};
